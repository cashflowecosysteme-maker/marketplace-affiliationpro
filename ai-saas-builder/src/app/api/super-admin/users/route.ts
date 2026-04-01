/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server'
import { getDB, generateId, generateUniqueAffiliateCode } from '@/lib/db'
import { getSession, hashPassword } from '@/lib/auth'


// Verify super admin
async function verifySuperAdmin(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return { authorized: false }

  const db = await getDB()
  const profile = await db
    .prepare('SELECT role FROM users WHERE id = ?')
    .bind(session.userId)
    .first()

  if (!profile || profile.role !== 'super_admin') return { authorized: false }

  return { authorized: true, db, userId: session.userId }
}

// CREATE USER
export async function POST(request: NextRequest) {
  try {
    const verification = await verifySuperAdmin(request)
    if (!verification.authorized) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    const { db } = verification

    const { email, password, fullName, role, subdomain, adminId, promoteUserId } = await request.json()

    // ─── PROMOTE BY USER ID (from Teams tab) ───
    if (promoteUserId && role === 'admin') {
      const target = await db
        .prepare('SELECT id, role, email, full_name FROM users WHERE id = ?')
        .bind(promoteUserId)
        .first() as { id: string; role: string; email: string; full_name: string } | null

      if (!target) {
        return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
      }
      if (target.role === 'admin') {
        return NextResponse.json({ error: 'Cet utilisateur est déjà admin' }, { status: 400 })
      }
      if (target.role === 'super_admin') {
        return NextResponse.json({ error: 'Impossible de modifier un super admin' }, { status: 400 })
      }

      const now = new Date().toISOString()
      const webhookSecret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')

      await db.prepare(`UPDATE users SET role = 'admin', admin_id = NULL, webhook_secret = ?, updated_at = ? WHERE id = ?`)
        .bind(webhookSecret, now, target.id)
        .run()

      // Create affiliate record if missing
      const program = await db
        .prepare('SELECT id FROM programs WHERE is_active = ? LIMIT 1')
        .bind(1)
        .first()
      if (program) {
        const existingAffiliate = await db
          .prepare('SELECT id FROM affiliates WHERE user_id = ?')
          .bind(target.id)
          .first()
        if (!existingAffiliate) {
          const affiliateId = generateId()
          const affiliateCode = await generateUniqueAffiliateCode(db)
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://affiliationpro.cashflowecosysteme.com'
          await db
            .prepare('INSERT INTO affiliates (id, program_id, user_id, affiliate_link, status, total_earnings, total_referrals, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(affiliateId, program.id, target.id, `${siteUrl}/r/${affiliateCode}`, 'active', 0, 0, now)
            .run()
        }
      }

      return NextResponse.json({ success: true, userId: target.id, promoted: true })
    }

    // ─── CREATE NEW USER or PROMOTE BY EMAIL ───
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Check if email exists
    const existing = await db
      .prepare('SELECT id, role FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first() as { id: string; role: string } | null
    
    if (existing) {
      // If user exists as affiliate, promote them to admin
      if (existing.role === 'affiliate' && role === 'admin') {
        const now = new Date().toISOString()
        const webhookSecret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')
        
        // Update role to admin, clear parent references, set webhook secret
        await db.prepare(`UPDATE users SET role = 'admin', admin_id = NULL, subdomain = COALESCE(?, subdomain), webhook_secret = ?, updated_at = ? WHERE id = ?`)
          .bind(subdomain || null, webhookSecret, now, existing.id)
          .run()

        // Create affiliate record for the new admin (for their own affiliate program)
        const program = await db
          .prepare('SELECT id FROM programs WHERE is_active = ? LIMIT 1')
          .bind(1)
          .first()
        if (program) {
          const affiliateId = generateId()
          const affiliateCode = await generateUniqueAffiliateCode(db)
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://affiliationpro.cashflowecosysteme.com'
          // Check if affiliate record already exists
          const existingAffiliate = await db
            .prepare('SELECT id FROM affiliates WHERE user_id = ?')
            .bind(existing.id)
            .first()
          if (!existingAffiliate) {
            await db
              .prepare('INSERT INTO affiliates (id, program_id, user_id, affiliate_link, status, total_earnings, total_referrals, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
              .bind(affiliateId, program.id, existing.id, `${siteUrl}/r/${affiliateCode}`, 'active', 0, 0, now)
              .run()
          }
        }

        return NextResponse.json({ success: true, userId: existing.id, promoted: true })
      }
      
      // User already exists with same or higher role
      return NextResponse.json({ error: 'Un compte avec cet email existe déjà' }, { status: 400 })
    }

    // Create user
    const userId = generateId()
    const affiliateCode = await generateUniqueAffiliateCode(db)
    const passwordHash = await hashPassword(password)
    const now = new Date().toISOString()

    // Auto-generate webhook secret for admin clients
    const webhookSecret = role === 'admin'
      ? Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')
      : null

    await db
      .prepare('INSERT INTO users (id, email, password_hash, full_name, role, affiliate_code, subdomain, admin_id, webhook_secret, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(
        userId,
        email.toLowerCase(),
        passwordHash,
        fullName,
        role,
        affiliateCode,
        subdomain || null,
        role === 'affiliate' ? adminId : null,
        webhookSecret,
        now,
        now
      )
      .run()

    // Get default program and create affiliate record for admins
    if (role === 'admin') {
      const program = await db
        .prepare('SELECT id FROM programs WHERE is_active = ? LIMIT 1')
        .bind(1)
        .first()
      if (program) {
        const affiliateId = generateId()
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://affiliationpro.cashflowecosysteme.com'
        await db
          .prepare('INSERT INTO affiliates (id, program_id, user_id, affiliate_link, status, total_earnings, total_referrals, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(
            affiliateId,
            program.id,
            userId,
            `${siteUrl}/r/${affiliateCode}`,
            'active',
            0,
            0,
            now
          )
          .run()
      }
    }

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// UPDATE SUBDOMAIN
export async function PUT(request: NextRequest) {
  try {
    const verification = await verifySuperAdmin(request)
    if (!verification.authorized) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    const { db } = verification

    const { userId, subdomain } = await request.json()

    // Check if subdomain is taken
    if (subdomain) {
      const existing = await db
        .prepare('SELECT id FROM users WHERE subdomain = ? AND id != ?')
        .bind(subdomain.toLowerCase(), userId)
        .first()

      if (existing) {
        return NextResponse.json({ error: 'Ce sous-domaine est déjà utilisé' }, { status: 400 })
      }
    }

    await db
      .prepare('UPDATE users SET subdomain = ? WHERE id = ?')
      .bind(subdomain?.toLowerCase() || null, userId)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update subdomain error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// RESET PASSWORD
export async function PATCH(request: NextRequest) {
  try {
    const verification = await verifySuperAdmin(request)
    if (!verification.authorized) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    const { db } = verification

    const { userId, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Mot de passe trop court' }, { status: 400 })
    }

    const passwordHash = await hashPassword(newPassword)

    await db
      .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .bind(passwordHash, userId)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
