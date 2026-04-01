/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server'
import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth'


// GET /api/marketplace/categories — List all active categories
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Only admin or super_admin can access
    if (session.role !== 'admin' && session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const db = await getDB()

    const result = await db
      .prepare('SELECT id, name, slug, icon, sort_order, active, created_at FROM marketplace_categories WHERE active = 1 ORDER BY sort_order ASC, name ASC')
      .all()

    const categories = result.results || []

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Marketplace categories list error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
