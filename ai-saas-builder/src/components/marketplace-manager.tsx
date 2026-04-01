'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  Store,
  Copy,
  ExternalLink,
  DollarSign,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  slug: string
  icon: string
}

interface Product {
  id: string
  seller_id: string
  seller_name: string | null
  seller_email: string | null
  category_id: number
  category_name: string | null
  category_slug: string | null
  category_icon: string | null
  title: string
  description_short: string
  description_long: string | null
  image_url: string | null
  price: number
  commission_n1: number
  commission_n2: number
  commission_n3: number
  affiliate_link: string | null
  promo_code: string | null
  conversion_rate: number
  sales_count: number
  views_count: number
  status: string
  featured: number
  created_at: string
  updated_at: string
}

interface MarketplaceManagerProps {
  mode: 'admin' | 'super_admin'
}

const emptyProduct = {
  title: '',
  description_short: '',
  description_long: '',
  category_id: '',
  price: '',
  image_url: '',
  affiliate_link: '',
  promo_code: '',
  commission_n1: '25',
  commission_n2: '10',
  commission_n3: '5',
}

export default function MarketplaceManager({ mode }: MarketplaceManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/marketplace/products?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error('Erreur de chargement des produits')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/marketplace/categories')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])
  useEffect(() => { fetchProducts() }, [fetchProducts])

  const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyProduct)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      title: product.title,
      description_short: product.description_short,
      description_long: product.description_long || '',
      category_id: String(product.category_id),
      price: String(product.price),
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      promo_code: product.promo_code || '',
      commission_n1: String(product.commission_n1),
      commission_n2: String(product.commission_n2),
      commission_n3: String(product.commission_n3),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.description_short || !form.category_id || !form.price) {
      toast.error('Remplissez les champs requis (titre, description, catégorie, prix)')
      return
    }
    setIsSaving(true)
    try {
      const body = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
        commission_n1: Number(form.commission_n1),
        commission_n2: Number(form.commission_n2),
        commission_n3: Number(form.commission_n3),
      }
      const isEdit = !!editingProduct
      const url = isEdit
        ? `/api/marketplace/products/${editingProduct.id}`
        : '/api/marketplace/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur')
      }
      toast.success(isEdit ? 'Produit mis à jour !' : 'Produit créé !')
      setDialogOpen(false)
      fetchProducts()
    } catch (e: any) {
      toast.error(e.message || 'Erreur de sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active'
    try {
      const res = await fetch(`/api/marketplace/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(newStatus === 'active' ? 'Produit publié sur le Marketplace !' : 'Produit retiré du Marketplace')
      fetchProducts()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/marketplace/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Produit supprimé')
      fetchProducts()
    } catch {
      toast.error('Erreur')
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount)

  const getCategoryIcon = (cat: Category | null) => cat?.icon || '📦'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-400" />
            Marketplace
          </h2>
          <p className="text-zinc-400 text-sm">
            {mode === 'admin'
              ? 'Gérez vos produits sur le Marketplace'
              : 'Gérez tous les produits du Marketplace'}
          </p>
        </div>
        <Button onClick={openCreate} className="glass-button">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-purple-500/20 text-white"
          />
        </div>
        <div className="flex gap-2">
          {['', 'active', 'draft', 'archived'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={
                statusFilter === s
                  ? 'glass-button text-white text-xs'
                  : 'text-zinc-400 hover:text-white text-xs'
              }
            >
              {s === '' ? 'Tous' : s === 'active' ? 'Actifs' : s === 'draft' ? 'Brouillons' : 'Archivés'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
              <Package className="w-3.5 h-3.5" /> Total produits
            </div>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
              <Eye className="w-3.5 h-3.5" /> Publiés
            </div>
            <p className="text-2xl font-bold text-white">
              {products.filter((p) => p.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
              <Edit className="w-3.5 h-3.5" /> Brouillons
            </div>
            <p className="text-2xl font-bold text-white">
              {products.filter((p) => p.status === 'draft').length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" /> Vues totales
            </div>
            <p className="text-2xl font-bold text-white">
              {products.reduce((sum, p) => sum + (p.views_count || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : products.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-zinc-400 mb-1">Aucun produit</p>
            <p className="text-sm text-zinc-500">
              Cliquez sur &quot;Ajouter un produit&quot; pour publier sur le Marketplace
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => (
            <Card key={product.id} className="glass-card border-0 hover:border-purple-500/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  {/* Product image */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full md:w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full md:w-24 h-24 rounded-lg bg-purple-500/10 flex items-center justify-center text-3xl shrink-0">
                      {getCategoryIcon(
                        categories.find((c) => c.id === product.category_id) || null
                      )}
                    </div>
                  )}

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{product.title}</h3>
                        <p className="text-zinc-400 text-xs truncate">{product.description_short}</p>
                      </div>
                      <Badge
                        className={
                          product.status === 'active'
                            ? 'bg-green-500/15 text-green-400 border-green-500/30 text-xs shrink-0'
                            : product.status === 'draft'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs shrink-0'
                            : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30 text-xs shrink-0'
                        }
                      >
                        {product.status === 'active'
                          ? 'Actif'
                          : product.status === 'draft'
                          ? 'Brouillon'
                          : 'Archivé'}
                      </Badge>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mt-2">
                      <span>
                        {getCategoryIcon(
                          categories.find((c) => c.id === product.category_id) || null
                        )}{' '}
                        {product.category_name}
                      </span>
                      <span className="text-white font-medium">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-green-400">
                        {product.commission_n1}% comm.
                      </span>
                      <span>{product.views_count} vues</span>
                      <span>{product.sales_count} ventes</span>
                      {mode === 'super_admin' && product.seller_name && (
                        <span className="text-amber-400">
                          👤 {product.seller_name || product.seller_email}
                        </span>
                      )}
                    </div>

                    {/* Affiliate link & promo */}
                    {(product.affiliate_link || product.promo_code) && (
                      <div className="flex flex-wrap gap-3 mt-2">
                        {product.affiliate_link && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-zinc-500">Lien:</span>
                            <span className="text-purple-300 font-mono truncate max-w-[200px]">
                              {product.affiliate_link}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(product.affiliate_link!)
                                toast.success('Lien copié !')
                              }}
                              className="text-zinc-500 hover:text-purple-400"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {product.promo_code && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-zinc-500">Promo:</span>
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs px-1.5 py-0">
                              {product.promo_code}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(product)}
                      className={`border-purple-500/20 hover:bg-purple-500/10 text-xs ${
                        product.status === 'active' ? 'text-amber-400' : 'text-green-400'
                      }`}
                    >
                      {product.status === 'active' ? (
                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 mr-1" />
                      )}
                      {product.status === 'active' ? 'Retirer' : 'Publier'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(product)}
                      className="border-purple-500/20 hover:bg-purple-500/10 text-white text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs"
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                      )}
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Marketplace link */}
      <Card className="glass-card border-0 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Voir le Marketplace en direct</p>
              <p className="text-zinc-500 text-xs">
                marketplace-affiliationpro.com
              </p>
            </div>
            <a
              href="https://marketplace-affiliationpro.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10 text-white text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Ouvrir
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-purple-500/20 bg-[#0c1222] text-white overflow-y-auto" style={{ maxWidth: '1152px', maxHeight: '95vh' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingProduct
                ? 'Modifiez les informations du produit'
                : 'Remplissez les informations pour publier sur le Marketplace'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">
                Titre du produit <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="Ex: Formation complète en marketing digital"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-white/5 border-purple-500/20 text-white"
              />
            </div>

            {/* Description courte */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">
                Description courte <span className="text-red-400">*</span>
              </Label>
              <Textarea
                placeholder="Description visible sur la carte du Marketplace..."
                value={form.description_short}
                onChange={(e) => setForm({ ...form, description_short: e.target.value })}
                className="bg-white/5 border-purple-500/20 text-white resize-none"
                rows={3}
              />
            </div>

            {/* Description longue */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Description longue</Label>
              <Textarea
                placeholder="Description complète (visible dans le modal du produit)..."
                value={form.description_long}
                onChange={(e) => setForm({ ...form, description_long: e.target.value })}
                className="bg-white/5 border-purple-500/20 text-white resize-none"
                rows={4}
              />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Catégorie <span className="text-red-400">*</span>
                </Label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full bg-white/5 border border-purple-500/20 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                >
                  <option value="" className="bg-[#0c1222]">Sélectionner...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#0c1222]">
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Prix (CA$) <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="497"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-white/5 border-purple-500/20 text-white"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Commissions */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Commissions (%)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Niveau 1 (direct)</p>
                  <Input
                    type="number"
                    value={form.commission_n1}
                    onChange={(e) => setForm({ ...form, commission_n1: e.target.value })}
                    className="bg-white/5 border-purple-500/20 text-white text-center"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Niveau 2 (équipe)</p>
                  <Input
                    type="number"
                    value={form.commission_n2}
                    onChange={(e) => setForm({ ...form, commission_n2: e.target.value })}
                    className="bg-white/5 border-purple-500/20 text-white text-center"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Niveau 3</p>
                  <Input
                    type="number"
                    value={form.commission_n3}
                    onChange={(e) => setForm({ ...form, commission_n3: e.target.value })}
                    className="bg-white/5 border-purple-500/20 text-white text-center"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              {/* Commission preview */}
              {form.price && (
                <div className="bg-white/5 rounded-lg p-3 mt-2">
                  <p className="text-xs text-zinc-400 mb-2">Aperçu commissions :</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-green-400">
                      N1: {formatCurrency((Number(form.price) * Number(form.commission_n1)) / 100)}
                    </div>
                    <div className="text-blue-400">
                      N2: {formatCurrency((Number(form.price) * Number(form.commission_n2)) / 100)}
                    </div>
                    <div className="text-purple-400">
                      N3: {formatCurrency((Number(form.price) * Number(form.commission_n3)) / 100)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">URL de l&apos;image</Label>
              <Input
                placeholder="https://example.com/mon-image.png"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="bg-white/5 border-purple-500/20 text-white"
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mt-2"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>

            {/* Affiliate link */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm flex items-center gap-1">
                Lien affilié <span className="text-purple-400 text-xs">(d&apos;AffiliationPro)</span>
              </Label>
              <Input
                placeholder="https://affiliationpro.cashflowecosysteme.com/ref/..."
                value={form.affiliate_link}
                onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })}
                className="bg-white/5 border-purple-500/20 text-white font-mono text-xs"
              />
            </div>

            {/* Promo code */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm flex items-center gap-1">
                Code promo <span className="text-purple-400 text-xs">(d&apos;AffiliationPro)</span>
              </Label>
              <Input
                placeholder="BIENVENUE20"
                value={form.promo_code}
                onChange={(e) => setForm({ ...form, promo_code: e.target.value.toUpperCase() })}
                className="bg-white/5 border-purple-500/20 text-white uppercase"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="glass-button flex-1"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : editingProduct ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isSaving
                  ? 'Sauvegarde...'
                  : editingProduct
                  ? 'Mettre à jour'
                  : 'Créer le produit'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-purple-500/20 hover:bg-purple-500/10 text-zinc-300"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
