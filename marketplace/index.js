// AffiliationPro Marketplace — Cloudflare Worker
// Serves JSON API on /api/* routes.
// Static files (including / → public/index.html) are served automatically
// via the [assets] configuration in wrangler.toml.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      // ── API Routes ────────────────────────────────────────────

      // GET /api/categories — list active categories
      if (path === '/api/categories' && request.method === 'GET') {
        const categories = await env.DB_AFFILIATION.prepare(
          'SELECT * FROM marketplace_categories WHERE active = 1 ORDER BY sort_order ASC'
        ).all();
        return jsonResponse(categories.results || categories.rows || []);
      }

      // GET /api/products — list products with filtering
      if (path === '/api/products' && request.method === 'GET') {
        return handleListProducts(url, env);
      }

      // GET /api/products/:id — single product detail
      const productMatch = path.match(/^\/api\/products\/(.+)$/);
      if (productMatch && request.method === 'GET') {
        return handleProductDetail(productMatch[1], env);
      }

      // 404 for everything else
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  },
};

// ── Handlers ──────────────────────────────────────────────────────

async function handleListProducts(url, env) {
  const category = url.searchParams.get('category') || '';
  const search = url.searchParams.get('search') || '';
  const sort = url.searchParams.get('sort') || 'newest';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let sql = "SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon FROM marketplace_products p LEFT JOIN marketplace_categories c ON p.category_id = c.id WHERE p.status = 'active'";
  const params = [];

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (p.title LIKE ? OR p.description_short LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      sql += ' ORDER BY p.price ASC';
      break;
    case 'price-desc':
      sql += ' ORDER BY p.price DESC';
      break;
    case 'commission':
      sql += ' ORDER BY p.commission_n1 DESC';
      break;
    case 'popular':
      sql += ' ORDER BY p.sales_count DESC, p.views_count DESC';
      break;
    case 'newest':
    default:
      sql += ' ORDER BY p.created_at DESC';
      break;
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await env.DB_AFFILIATION.prepare(sql).bind(...params).all();
  const products = result.results || result.rows || [];
  return jsonResponse(products);
}

async function handleProductDetail(id, env) {
  // Increment view count
  await env.DB_AFFILIATION.prepare(
    'UPDATE marketplace_products SET views_count = views_count + 1 WHERE id = ?'
  ).bind(id).run();

  const result = await env.DB_AFFILIATION.prepare(
    "SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon FROM marketplace_products p LEFT JOIN marketplace_categories c ON p.category_id = c.id WHERE p.id = ?"
  ).bind(id).first();

  if (!result) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return jsonResponse(result);
}

// ── Helpers ───────────────────────────────────────────────────────

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
