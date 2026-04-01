/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server'
import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth'


// Helper: verify admin or super_admin access
async function verifySellerAccess(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return { authorized: false, error: 'Non autorisé', status: 401 }

  if (session.role !== 'admin' && session.role !== 'super_admin') {
    return { authorized: false, error: 'Accès refusé', status: 403 }
  }

  const db = await getDB()
  return { authorized: true, db, session }
}

// GET /api/marketplace/products — List products
export async function GET(request: NextRequest) {
  try {
    const verification = await verifySellerAccess(request)
    if (!verification.authorized) {
      return NextResponse.json({ error: verification.error }, { status: verification.status })
    }
    const { db, session } = verification

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category') || ''
    const rawSearch = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    // Sanitize search to prevent SQL injection
    const search = rawSearch.replace(/[%'\\]/g, '')

    // Build WHERE clauses
    const conditions: string[] = []
    const values: unknown[] = []

    // Role-based filtering: admin sees only own products, super_admin sees all
    if (session.role === 'admin') {
      conditions.push('p.seller_id = ?')
      values.push(session.userId)
    }

    if (categoryId) {
      conditions.push('p.category_id = ?')
      values.push(Number(categoryId))
    }

    if (status) {
      conditions.push('p.status = ?')
      values.push(status)
    }

    if (search) {
      conditions.push('(p.title LIKE ? OR p.description_short LIKE ?)')
      values.push(`%${search}%`, `%${search}%`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon,
        u.full_name as seller_name,
        u.email as seller_email
      FROM marketplace_products p
      LEFT JOIN marketplace_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `

    const result = await db.prepare(query).bind(...values).all()
    const products = result.results || []

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Marketplace products list error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/marketplace/products — Create product
export async function POST(request: NextRequest) {
  try {
    const verification = await verifySellerAccess(request)
    if (!verification.authorized) {
      return NextResponse.json({ error: verification.error }, { status: verification.status })
    }
    const { db, session } = verification

    const body = await request.json()
    const {
      title,
      description_short,
      description_long,
      category_id,
      price,
      image_url,
      affiliate_link,
      promo_code,
      commission_n1,
      commission_n2,
      commission_n3,
    } = body

    // Validate required fields
    if (!title || !description_short || !category_id || price === undefined) {
      return NextResponse.json(
        { error: 'Champs requis manquants : titre, description courte, catégorie, prix' },
        { status: 400 }
      )
    }

    // Validate price
    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'Le prix doit être un nombre positif' }, { status: 400 })
    }

    // Validate commissions
    const n1 = commission_n1 !== undefined ? Number(commission_n1) : 25
    const n2 = commission_n2 !== undefined ? Number(commission_n2) : 10
    const n3 = commission_n3 !== undefined ? Number(commission_n3) : 5

    if ([n1, n2, n3].some(v => isNaN(v) || v < 0 || v > 100)) {
      return NextResponse.json({ error: 'Les commissions doivent être entre 0 et 100' }, { status: 400 })
    }

    // Validate category exists
    const category = await db
      .prepare('SELECT id FROM marketplace_categories WHERE id = ? AND active = 1')
      .bind(Number(category_id))
      .first()

    if (!category) {
      return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 })
    }

    // Generate ID
    const productId = `mp_${(await db.prepare("SELECT lower(hex(randomblob(8))) as id").first()).id}`

    const now = new Date().toISOString()

    await db.prepare(`
      INSERT INTO marketplace_products (
        id, seller_id, category_id, title, description_short, description_long,
        image_url, price, commission_n1, commission_n2, commission_n3,
        affiliate_link, promo_code, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      productId,
      session.userId,
      Number(category_id),
      title,
      description_short,
      description_long || null,
      image_url || null,
      priceNum,
      n1,
      n2,
      n3,
      affiliate_link || null,
      promo_code || null,
      'draft',
      now,
      now
    ).run()

    return NextResponse.json({ success: true, productId })
  } catch (error) {
    console.error('Marketplace product create error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
