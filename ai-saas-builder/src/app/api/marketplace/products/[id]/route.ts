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

// PUT /api/marketplace/products/[id] — Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verification = await verifySellerAccess(request)
    if (!verification.authorized) {
      return NextResponse.json({ error: verification.error }, { status: verification.status })
    }
    const { db, session } = verification

    const { id } = await params

    // Verify product exists and check ownership
    const product = await db
      .prepare('SELECT id, seller_id FROM marketplace_products WHERE id = ?')
      .bind(id)
      .first()

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Role-based ownership check
    if (session.role === 'admin' && product.seller_id !== session.userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

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
      status,
      featured,
      conversion_rate,
      sales_count,
      views_count,
    } = body

    // Build dynamic update query
    const updates: string[] = []
    const values: unknown[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      values.push(title)
    }

    if (description_short !== undefined) {
      updates.push('description_short = ?')
      values.push(description_short)
    }

    if (description_long !== undefined) {
      updates.push('description_long = ?')
      values.push(description_long)
    }

    if (category_id !== undefined) {
      updates.push('category_id = ?')
      values.push(Number(category_id))
    }

    if (price !== undefined) {
      const priceNum = Number(price)
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json({ error: 'Le prix doit être un nombre positif' }, { status: 400 })
      }
      updates.push('price = ?')
      values.push(priceNum)
    }

    if (image_url !== undefined) {
      updates.push('image_url = ?')
      values.push(image_url)
    }

    if (affiliate_link !== undefined) {
      updates.push('affiliate_link = ?')
      values.push(affiliate_link)
    }

    if (promo_code !== undefined) {
      updates.push('promo_code = ?')
      values.push(promo_code)
    }

    if (commission_n1 !== undefined) {
      const n1 = Number(commission_n1)
      if (isNaN(n1) || n1 < 0 || n1 > 100) {
        return NextResponse.json({ error: 'La commission N1 doit être entre 0 et 100' }, { status: 400 })
      }
      updates.push('commission_n1 = ?')
      values.push(n1)
    }

    if (commission_n2 !== undefined) {
      const n2 = Number(commission_n2)
      if (isNaN(n2) || n2 < 0 || n2 > 100) {
        return NextResponse.json({ error: 'La commission N2 doit être entre 0 et 100' }, { status: 400 })
      }
      updates.push('commission_n2 = ?')
      values.push(n2)
    }

    if (commission_n3 !== undefined) {
      const n3 = Number(commission_n3)
      if (isNaN(n3) || n3 < 0 || n3 > 100) {
        return NextResponse.json({ error: 'La commission N3 doit être entre 0 et 100' }, { status: 400 })
      }
      updates.push('commission_n3 = ?')
      values.push(n3)
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'draft', 'archived']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
      }
      updates.push('status = ?')
      values.push(status)
    }

    if (featured !== undefined) {
      updates.push('featured = ?')
      values.push(featured ? 1 : 0)
    }

    if (conversion_rate !== undefined) {
      updates.push('conversion_rate = ?')
      values.push(Number(conversion_rate) || 0)
    }

    if (sales_count !== undefined) {
      updates.push('sales_count = ?')
      values.push(Number(sales_count) || 0)
    }

    if (views_count !== undefined) {
      updates.push('views_count = ?')
      values.push(Number(views_count) || 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
    }

    // Always update updated_at
    updates.push("updated_at = datetime('now')")

    values.push(id)
    const sql = `UPDATE marketplace_products SET ${updates.join(', ')} WHERE id = ?`

    await db.prepare(sql).bind(...values).run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Marketplace product update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/marketplace/products/[id] — Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verification = await verifySellerAccess(request)
    if (!verification.authorized) {
      return NextResponse.json({ error: verification.error }, { status: verification.status })
    }
    const { db, session } = verification

    const { id } = await params

    // Verify product exists and check ownership
    const product = await db
      .prepare('SELECT id, seller_id FROM marketplace_products WHERE id = ?')
      .bind(id)
      .first()

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Role-based ownership check
    if (session.role === 'admin' && product.seller_id !== session.userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    await db
      .prepare('DELETE FROM marketplace_products WHERE id = ?')
      .bind(id)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Marketplace product delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
