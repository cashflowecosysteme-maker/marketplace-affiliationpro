'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StarryBackground } from '@/components/starry-background'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Users,
  DollarSign,
  Download,
  Sparkles,
  Search,
  ShoppingCart,
  Clock,
  Shield,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
  Crown,
  BarChart3,
  RefreshCw,
  Settings,
  Mail,
  MessageSquare,
  Send,
  Key,
  Globe,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Edit,
  Copy,
  Check,
  X,
  CreditCard,
  Building,
  User,
  TrendingUp,
  Wallet,
  LogOut,
  ChevronDown,
  ChevronRight,
  Link2,
  ExternalLink,
  UserPlus,
  Webhook,
  Store,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import MarketplaceManager from '@/components/marketplace-manager'

type TabType = 'dashboard' | 'admins' | 'marketplace' | 'teams' | 'messaging' | 'settings'

interface Profile {
  id: string
  email: string
  full_name: string | null
  affiliate_code: string
  role: 'super_admin' | 'admin' | 'affiliate'
  paypal_email: string | null
  subdomain: string | null
  parent_id: string | null
  created_at: string
  webhook_secret?: string | null
  parent?: { full_name: string | null; email: string } | null
  children?: Profile[]
  level3?: Profile[]
  affiliates?: Array<{
    id: string
    total_earnings: number
    total_referrals: number
    status: string
  }>
}

interface Sale {
  id: string
  amount: number
  status: string
  created_at: string
  commission_l1: number
  customer_email: string | null
  affiliates: {
    id: string
    user_id: string
    profile: { full_name: string | null; email: string; role: string } | null
  } | null
}

interface Message {
  id: string
  subject: string
  content: string
  sender_id: string
  recipient_id: string | null
  is_broadcast: boolean
  created_at: string
  read_at: string | null
  sender: { full_name: string | null; email: string } | null
  recipient: { full_name: string | null; email: string } | null
}

interface SuperAdminData {
  stats: {
    totalUsers: number
    totalAdmins: number
    totalAffiliates: number
    totalSales: number
    totalRevenue: number
    pendingPayouts: number
    totalPayouts: number
  }
  admins: Profile[]
  teams: { admin: Profile; level2: Profile[]; level3Count: number }[]
  recentSales: Sale[]
  messages: Message[]
  programs: Array<{ id: string; name: string; commission_l1: number; commission_l2: number; commission_l3: number; is_active: number }>
}

export default function SuperAdminPage() {
  const router = useRouter()
  const { logout, isLoggingOut } = useAuth()
  const [data, setData] = useState<SuperAdminData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // New user form
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin' as 'admin' | 'affiliate',
    subdomain: '',
    adminId: '',
  })
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  
  // Password reset
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})
  
  // Subdomain editing
  const [editingSubdomain, setEditingSubdomain] = useState<string | null>(null)
  const [subdomainValue, setSubdomainValue] = useState('')
  
  // Messaging
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isBroadcast, setIsBroadcast] = useState(true)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  // Admin password change
  const [adminPassword, setAdminPassword] = useState({ current: '', new: '', confirm: '' })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Commission settings
  const [commissionL1, setCommissionL1] = useState(25)
  const [commissionL2, setCommissionL2] = useState(10)
  const [commissionL3, setCommissionL3] = useState(5)
  const [commissionProgramId, setCommissionProgramId] = useState('')
  const [isSavingCommissions, setIsSavingCommissions] = useState(false)

  // Feature 1: Create Affiliate linked to Admin
  const [affiliateDialogOpen, setAffiliateDialogOpen] = useState(false)
  const [affiliateForAdmin, setAffiliateForAdmin] = useState<Profile | null>(null)
  const [affiliateForm, setAffiliateForm] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  // Feature 3: Webhook Info Dialog
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false)
  const [webhookAdmin, setWebhookAdmin] = useState<Profile | null>(null)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false)

  // Feature 4: User Detail Panel
  const [userDetailOpen, setUserDetailOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [detailResetPassword, setDetailResetPassword] = useState(false)
  const [detailNewPassword, setDetailNewPassword] = useState('')

  // Feature 2: Collapsible L2 sections in Teams tab
  const [expandedL2, setExpandedL2] = useState<Set<string>>(new Set())

  const toggleL2 = (l2Id: string) => {
    setExpandedL2((prev) => {
      const next = new Set(prev)
      if (next.has(l2Id)) next.delete(l2Id)
      else next.add(l2Id)
      return next
    })
  }

  // Promote an affiliate to admin via API (uses the same promote logic)
  const promoteToAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Promouvoir ${userName} en tant qu'Admin ?`)) return
    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '', // Not used for promotion — the API detects existing user
          password: '',
          fullName: '',
          role: 'admin',
          promoteUserId: userId, // Signal to the API to promote this specific user
          subdomain: '',
          adminId: '',
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success(`✨ ${userName} promu en Admin !`)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const fetchData = useCallback(async (search?: string) => {
    try {
      const url = search ? `/api/super-admin?search=${encodeURIComponent(search)}` : '/api/super-admin'
      const response = await fetch(url)
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) router.push('/login')
        else if (response.status === 403) router.push('/dashboard')
        else throw new Error(result.error)
        return
      }

      setData(result)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Feature 5: Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!value.trim()) {
      setIsSearching(true)
      fetchData()
      return
    }
    setIsSearching(true)
    searchTimerRef.current = setTimeout(() => {
      fetchData(value)
    }, 300)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setIsSearching(true)
    fetchData(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearching(true)
    fetchData()
  }

  // Feature 1: Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'
    let pass = ''
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)]
    return pass
  }

  const openAffiliateDialog = (admin: Profile) => {
    setAffiliateForAdmin(admin)
    setAffiliateForm({ fullName: '', email: '', password: generatePassword() })
    setAffiliateDialogOpen(true)
  }

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!affiliateForAdmin) return
    setIsCreatingUser(true)
    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: affiliateForm.email,
          password: affiliateForm.password,
          fullName: affiliateForm.fullName,
          role: 'affiliate',
          adminId: affiliateForAdmin.id,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success('Affilié créé avec succès')
      setAffiliateDialogOpen(false)
      setAffiliateForAdmin(null)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsCreatingUser(false)
    }
  }

  // Feature 3: Generate webhook secret
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const openWebhookDialog = (admin: Profile) => {
    setWebhookAdmin(admin)
    setShowWebhookSecret(false)
    setWebhookDialogOpen(true)
  }

  const handleGenerateSecret = async () => {
    if (!webhookAdmin) return
    setIsGeneratingSecret(true)
    try {
      const secret = generateUUID()
      const response = await fetch('/api/super-admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: webhookAdmin.id, webhook_secret: secret }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success('Secret webhook généré')
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsGeneratingSecret(false)
    }
  }

  // Feature 4: User detail
  const openUserDetail = (user: Profile) => {
    setSelectedUser(user)
    setDetailResetPassword(false)
    setDetailNewPassword('')
    setUserDetailOpen(true)
  }

  const handleDetailResetPassword = async () => {
    if (!selectedUser || !detailNewPassword || detailNewPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, newPassword: detailNewPassword }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success('Mot de passe réinitialisé')
      setDetailResetPassword(false)
      setDetailNewPassword('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)

    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      if (result.promoted) {
        toast.success('✨ Affilié promu en Admin avec succès !')
      } else {
        toast.success('Utilisateur créé avec succès')
      }
      setNewUser({ email: '', password: '', fullName: '', role: 'admin', subdomain: '', adminId: '' })
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success('Mot de passe réinitialisé')
      setResetUserId(null)
      setNewPassword('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleUpdateSubdomain = async (userId: string) => {
    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subdomain: subdomainValue }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success('Sous-domaine mis à jour')
      setEditingSubdomain(null)
      setSubdomainValue('')
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageSubject || !messageContent) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    if (!isBroadcast && !selectedRecipient) {
      toast.error('Veuillez sélectionner un destinataire')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/super-admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: messageSubject,
          content: messageContent,
          recipientId: isBroadcast ? null : selectedRecipient,
          isBroadcast,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success(isBroadcast ? 'Message envoyé à tous' : 'Message envoyé')
      setMessageSubject('')
      setMessageContent('')
      setSelectedRecipient('')
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveCommissions = async () => {
    if (!commissionProgramId) {
      toast.error('Aucun programme trouvé')
      return
    }
    if (commissionL1 + commissionL2 + commissionL3 > 100) {
      toast.error('Le total ne peut pas dépasser 100%')
      return
    }
    setIsSavingCommissions(true)
    try {
      const response = await fetch('/api/super-admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: commissionProgramId, commission_l1: commissionL1, commission_l2: commissionL2, commission_l3: commissionL3 }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success(`Commissions mises à jour : N1=${commissionL1}%, N2=${commissionL2}%, N3=${commissionL3}%`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsSavingCommissions(false)
    }
  }

  // Load commission values when data is fetched
  useEffect(() => {
    if (data?.programs && data.programs.length > 0) {
      const prog = data.programs[0]
      setCommissionL1(prog.commission_l1)
      setCommissionL2(prog.commission_l2)
      setCommissionL3(prog.commission_l3)
      setCommissionProgramId(prog.id)
    }
  }, [data?.programs])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassword.new !== adminPassword.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (adminPassword.new.length < 6) {
      toast.error('Minimum 6 caractères')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/super-admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminPassword),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success('Mot de passe modifié')
      setAdminPassword({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExport = async (type: 'users' | 'sales') => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/super-admin/export?type=${type}`)
      if (!response.ok) throw new Error('Erreur')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Export téléchargé')
    } catch {
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount)
  
  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié !')
  }

  // Helper: find the parent admin for an affiliate
  const findParentAdmin = (userId: string): Profile | null => {
    for (const team of data?.teams || []) {
      if (team.admin.id === userId) return team.admin
      for (const l2 of team.level2) {
        if (l2.id === userId) return team.admin
        if (l2.level3) {
          for (const l3 of l2.level3) {
            if (l3.id === userId) return team.admin
          }
        }
      }
    }
    return null
  }

  if (isLoading && !data) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <StarryBackground />
        <div className="relative z-10 text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <StarryBackground />
        <Card className="glass-card max-w-md relative z-10">
          <CardContent className="p-8 text-center">
            <p className="text-zinc-400 mb-4">Accès non autorisé</p>
            <Button onClick={() => router.push('/login')} className="glass-button">Connexion</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <StarryBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">AffiliationPro</span>
          </Link>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            <Shield className="w-3 h-3 mr-1" />
            SUPER ADMIN
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={() => { setIsLoading(true); fetchData(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />Actualiser
          </Button>
          <Button 
            variant="ghost" 
            className="text-zinc-400 hover:text-white"
            onClick={logout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="relative z-10 px-6 pt-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 border-b border-purple-500/10 pb-4 overflow-x-auto">
            {[
              { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
              { id: 'admins' as TabType, label: 'Admins', icon: Building },
              { id: 'marketplace' as TabType, label: 'Marketplace', icon: Store },
              { id: 'teams' as TabType, label: 'Équipes', icon: Users },
              { id: 'messaging' as TabType, label: 'Messagerie', icon: MessageSquare },
              { id: 'settings' as TabType, label: 'Paramètres', icon: Settings },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className={`flex items-center gap-2 ${activeTab === tab.id ? 'glass-button text-white' : 'text-zinc-400 hover:text-white'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                    <Crown className="w-6 h-6 text-amber-400" />
                    Tableau de bord Super Admin
                  </h1>
                  <p className="text-zinc-400 text-sm">Vue globale de la plateforme AffiliationPro</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-purple-500/20 text-zinc-300" onClick={() => handleExport('users')} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />Exporter utilisateurs
                  </Button>
                  <Button variant="outline" size="sm" className="border-purple-500/20 text-zinc-300" onClick={() => handleExport('sales')} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />Exporter ventes
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <Card className="glass-card border-0">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{data.stats.totalUsers}</p>
                    <p className="text-zinc-500 text-xs">Total utilisateurs</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-0">
                  <CardContent className="p-4 text-center">
                    <Building className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{data.stats.totalAdmins}</p>
                    <p className="text-zinc-500 text-xs">Admins</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-0">
                  <CardContent className="p-4 text-center">
                    <User className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{data.stats.totalAffiliates}</p>
                    <p className="text-zinc-500 text-xs">Affiliés</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-0">
                  <CardContent className="p-4 text-center">
                    <ShoppingCart className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{data.stats.totalSales}</p>
                    <p className="text-zinc-500 text-xs">Ventes</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-0">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{formatCurrency(data.stats.totalRevenue)}</p>
                    <p className="text-zinc-500 text-xs">Revenus</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-0">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{formatCurrency(data.stats.pendingPayouts)}</p>
                    <p className="text-zinc-500 text-xs">En attente</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-0">
                  <CardContent className="p-4 text-center">
                    <Wallet className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{formatCurrency(data.stats.totalPayouts)}</p>
                    <p className="text-zinc-500 text-xs">Payés</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sales */}
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <ShoppingCart className="w-5 h-5 text-purple-400" />
                    Dernières ventes globales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {data.recentSales.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>Aucune vente</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.recentSales.map((sale) => (
                          <div key={sale.id} className="p-3 rounded-lg bg-white/5 border border-purple-500/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{formatCurrency(sale.amount)}</p>
                                <p className="text-zinc-500 text-xs">
                                  Par: {sale.affiliates?.profile?.full_name || sale.affiliates?.profile?.email || 'Inconnu'}
                                  <Badge className="ml-2 text-xs" variant="outline">
                                    {sale.affiliates?.profile?.role === 'admin' ? 'Admin' : 'Affilié'}
                                  </Badge>
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge className={sale.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}>
                                  {sale.status === 'paid' ? 'Payé' : 'En attente'}
                                </Badge>
                                <p className="text-xs text-zinc-500 mt-1">Commission: {formatCurrency(sale.commission_l1)}</p>
                              </div>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-purple-500/10 text-xs text-zinc-400">
                              <span><Calendar className="w-3 h-3 inline mr-1" />{formatDate(sale.created_at)}</span>
                              {sale.customer_email && <span>Client: {sale.customer_email}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ADMINS TAB */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              {/* Create Admin */}
              <Card className="glass-card border-0 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Plus className="w-5 h-5 text-green-400" />
                    Créer un compte Admin (Client)
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Nouveau client entreprise qui utilisera AffiliationPro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Input placeholder="Nom complet" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} required className="h-10 bg-white/5 border-purple-500/20 text-white" />
                    <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="h-10 bg-white/5 border-purple-500/20 text-white" />
                    <Input type="text" placeholder="Mot de passe" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength={6} className="h-10 bg-white/5 border-purple-500/20 text-white" />
                    <Input placeholder="Sous-domaine (optionnel)" value={newUser.subdomain} onChange={(e) => setNewUser({ ...newUser, subdomain: e.target.value.toLowerCase() })} className="h-10 bg-white/5 border-purple-500/20 text-white" />
                    <Button type="submit" disabled={isCreatingUser} className="glass-button h-10">
                      {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" />Créer Admin</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Admin List */}
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Building className="w-5 h-5 text-blue-400" />
                      Liste des Admins ({data.admins.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.admins.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                      <Building className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Aucun résultat</p>
                    </div>
                  )}
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-3">
                    {data.admins.map((admin) => (
                      <div key={admin.id} className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => openUserDetail(admin)}
                            >
                              {admin.full_name?.[0]?.toUpperCase() || admin.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p 
                                className="text-white font-medium cursor-pointer hover:text-amber-400 transition-colors"
                                onClick={() => openUserDetail(admin)}
                              >
                                {admin.full_name || 'Sans nom'}
                              </p>
                              <p className="text-zinc-400 text-sm flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span 
                                  className="cursor-pointer hover:text-amber-400 transition-colors"
                                  onClick={() => openUserDetail(admin)}
                                >
                                  {admin.email}
                                </span>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToClipboard(admin.email)}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </p>
                              <p className="text-zinc-500 text-xs">Code: {admin.affiliate_code} • {formatDate(admin.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Feature 3: Webhook eye icon */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-cyan-400"
                              onClick={() => openWebhookDialog(admin)}
                              title="Voir webhook"
                            >
                              <Webhook className="w-4 h-4" />
                            </Button>
                            {/* Feature 1: Add affiliate button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-green-500/30 text-green-400 hover:bg-green-500/10"
                              onClick={() => openAffiliateDialog(admin)}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">+ Ajouter affilié</span>
                            </Button>
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                              <Building className="w-3 h-3 mr-1" />Admin
                            </Badge>
                          </div>
                        </div>

                        {/* Subdomain */}
                        <div className="mt-3 pt-3 border-t border-purple-500/10 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span className="text-zinc-400">Sous-domaine:</span>
                            {editingSubdomain === admin.id ? (
                              <div className="flex items-center gap-2">
                                <Input value={subdomainValue} onChange={(e) => setSubdomainValue(e.target.value.toLowerCase())} className="h-8 w-40 bg-white/5 border-purple-500/20 text-white text-sm" />
                                <Button size="sm" className="h-8 glass-button" onClick={() => handleUpdateSubdomain(admin.id)}><Check className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditingSubdomain(null); setSubdomainValue(''); }}><X className="w-4 h-4" /></Button>
                              </div>
                            ) : (
                              <span className="text-white">
                                {admin.subdomain ? `${admin.subdomain}.affiliationpro.cashflowecosysteme.com` : 'Non configuré'}
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2" onClick={() => { setEditingSubdomain(admin.id); setSubdomainValue(admin.subdomain || ''); }}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </span>
                            )}
                          </div>

                          {/* Password Reset */}
                          <div className="flex items-center gap-2">
                            {resetUserId === admin.id ? (
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <Input type={showPassword[admin.id] ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau MDP" className="h-8 w-32 bg-white/5 border-purple-500/20 text-white text-sm pr-8" />
                                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-8 w-8 p-0" onClick={() => setShowPassword({ ...showPassword, [admin.id]: !showPassword[admin.id] })}>
                                    {showPassword[admin.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </Button>
                                </div>
                                <Button size="sm" className="h-8 glass-button" onClick={() => handleResetPassword(admin.id)}><Check className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setResetUserId(null); setNewPassword(''); }}><X className="w-4 h-4" /></Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" className="h-8 border-purple-500/20 text-zinc-300" onClick={() => setResetUserId(admin.id)}>
                                <Key className="w-3 h-3 mr-1" />Réinitialiser MDP
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MARKETPLACE TAB */}
          {activeTab === 'marketplace' && <MarketplaceManager mode="super_admin" />}

          {/* TEAMS TAB - Vue hiérarchique Admin → N2 → N3 */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-purple-400" />
                    Vue des équipes en cascade
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Admin (Client) → Niveau 2 (Affiliés directs) → Niveau 3 (Sous-affiliés)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar space-y-4">
                    {data.teams.length === 0 && (
                      <div className="text-center py-8 text-zinc-500">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>Aucune équipe trouvée</p>
                      </div>
                    )}
                    {data.teams.map((team) => (
                      <div key={team.admin.id} className="rounded-xl border border-amber-500/20 overflow-hidden">
                        {/* Admin Header */}
                        <div 
                          className="p-4 bg-amber-500/10 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors"
                          onClick={() => openUserDetail(team.admin)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                              {team.admin.full_name?.[0]?.toUpperCase() || team.admin.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{team.admin.full_name || 'Sans nom'}</p>
                              <p className="text-zinc-400 text-sm">{team.admin.email}</p>
                            </div>
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                              <Building className="w-3 h-3 mr-1" />Admin
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-zinc-400">Niveau 2: <span className="text-white font-medium">{team.level2.length}</span></p>
                            <p className="text-sm text-zinc-400">Niveau 3: <span className="text-white font-medium">{team.level3Count}</span></p>
                          </div>
                        </div>

                        {/* Level 2 Affiliates */}
                        {team.level2.length > 0 && (
                          <div className="p-4 space-y-2 bg-white/5">
                            {team.level2.map((l2) => {
                              const hasL3 = l2.level3 && l2.level3.length > 0
                              const isExpanded = expandedL2.has(l2.id)
                              return (
                                <div key={l2.id} className="ml-4">
                                  {/* L2 row */}
                                  <div 
                                    className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center gap-3 cursor-pointer hover:bg-blue-500/10 transition-colors"
                                    onClick={() => openUserDetail(l2)}
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                      {l2.full_name?.[0]?.toUpperCase() || l2.email[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium text-sm">{l2.full_name || 'Sans nom'}</p>
                                      <p className="text-zinc-500 text-xs truncate">{l2.email}</p>
                                    </div>
                                    <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs flex-shrink-0">
                                      Niveau 2
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        promoteToAdmin(l2.id, l2.full_name || l2.email)
                                      }}
                                      title="Promouvoir en Admin"
                                    >
                                      <Crown className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Promouvoir</span>
                                    </Button>
                                    {hasL3 && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); toggleL2(l2.id) }}
                                        className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                                        title={isExpanded ? 'Réduire' : 'Déplier'}
                                      >
                                        {isExpanded 
                                          ? <ChevronDown className="w-4 h-4 text-zinc-400" />
                                          : <ChevronRight className="w-4 h-4 text-zinc-400" />
                                        }
                                      </button>
                                    )}
                                  </div>

                                  {/* Feature 2: Level 3 collapsible section */}
                                  {hasL3 && isExpanded && (
                                    <div className="ml-6 mt-2 space-y-1.5">
                                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1 px-1">
                                        Niveau 3 ({l2.level3!.length})
                                      </p>
                                      {l2.level3!.map((l3) => (
                                        <div 
                                          key={l3.id}
                                          className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-center gap-3 cursor-pointer hover:bg-purple-500/10 transition-colors"
                                          onClick={() => openUserDetail(l3)}
                                        >
                                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {l3.full_name?.[0]?.toUpperCase() || l3.email[0].toUpperCase()}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm">{l3.full_name || 'Sans nom'}</p>
                                            <p className="text-zinc-500 text-xs truncate">{l3.email}</p>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-6 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs px-2"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                promoteToAdmin(l3.id, l3.full_name || l3.email)
                                              }}
                                              title="Promouvoir en Admin"
                                            >
                                              <Crown className="w-2.5 h-2.5 mr-1" />
                                              <span className="hidden sm:inline">Promouvoir</span>
                                            </Button>
                                            <Badge className={`text-xs ${l3.paypal_email ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                                              <CreditCard className="w-2.5 h-2.5 mr-1" />
                                              {l3.paypal_email ? 'PayPal ✓' : 'PayPal ✗'}
                                            </Badge>
                                            <span className="text-zinc-600 text-xs hidden sm:inline">
                                              {formatDate(l3.created_at)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {team.level2.length === 0 && (
                          <div className="p-4 text-center text-zinc-500 text-sm bg-white/5">
                            Aucun affilié Niveau 2
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MESSAGING TAB */}
          {activeTab === 'messaging' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Send className="w-5 h-5 text-purple-400" />
                    Envoyer un message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div className="flex gap-2">
                      <Button type="button" variant={isBroadcast ? 'default' : 'outline'} size="sm" className={isBroadcast ? 'glass-button' : 'border-purple-500/20 text-zinc-300'} onClick={() => setIsBroadcast(true)}>
                        <Users className="w-4 h-4 mr-1" />Tous
                      </Button>
                      <Button type="button" variant={!isBroadcast ? 'default' : 'outline'} size="sm" className={!isBroadcast ? 'glass-button' : 'border-purple-500/20 text-zinc-300'} onClick={() => setIsBroadcast(false)}>
                        <Mail className="w-4 h-4 mr-1" />Privé
                      </Button>
                    </div>

                    {!isBroadcast && (
                      <select value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)} className="w-full h-10 rounded-md bg-white/5 border border-purple-500/20 text-white px-3">
                        <option value="">Sélectionner un destinataire</option>
                        <optgroup label="Admins">
                          {data.admins.map((u) => (
                            <option key={u.id} value={u.id}>{u.full_name || u.email} (Admin)</option>
                          ))}
                        </optgroup>
                        <optgroup label="Affiliés">
                          {data.teams.flatMap(t => t.level2).map((u) => (
                            <option key={u.id} value={u.id}>{u.full_name || u.email} (N2)</option>
                          ))}
                        </optgroup>
                      </select>
                    )}

                    <Input placeholder="Sujet" value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} className="bg-white/5 border-purple-500/20 text-white" />
                    <Textarea placeholder="Message..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} rows={6} className="bg-white/5 border-purple-500/20 text-white resize-none" />
                    <Button type="submit" disabled={isSending} className="w-full glass-button">
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      {isBroadcast ? 'Envoyer à tous' : 'Envoyer'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    Messages envoyés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {data.messages.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>Aucun message</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.messages.map((msg) => (
                          <div key={msg.id} className="p-3 rounded-lg bg-white/5 border border-purple-500/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium text-sm">{msg.subject}</span>
                              <Badge className={msg.is_broadcast ? 'bg-purple-500/10 text-purple-300' : 'bg-blue-500/10 text-blue-300'}>
                                {msg.is_broadcast ? 'Tous' : 'Privé'}
                              </Badge>
                            </div>
                            <p className="text-zinc-400 text-sm line-clamp-2">{msg.content}</p>
                            <p className="text-zinc-500 text-xs mt-2">{formatDate(msg.created_at)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              {/* Commission Settings */}
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Taux de commissions
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Définissez les pourcentages de commission pour chaque niveau
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Level 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-zinc-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">1</span>
                        Niveau 1 — Affilié direct
                      </Label>
                      <span className="text-green-400 font-bold text-lg">{commissionL1}%</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionL1}
                      onChange={(e) => setCommissionL1(Number(e.target.value))}
                      className="bg-white/5 border-green-500/20 text-white"
                    />
                    <p className="text-zinc-500 text-xs">Pourcentage reçu par l'affilié qui a partagé le lien</p>
                  </div>

                  {/* Level 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-zinc-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">2</span>
                        Niveau 2 — Recruteur
                      </Label>
                      <span className="text-blue-400 font-bold text-lg">{commissionL2}%</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionL2}
                      onChange={(e) => setCommissionL2(Number(e.target.value))}
                      className="bg-white/5 border-blue-500/20 text-white"
                    />
                    <p className="text-zinc-500 text-xs">Pourcentage reçu par celui qui a recruté l'affilié</p>
                  </div>

                  {/* Level 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-zinc-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">3</span>
                        Niveau 3 — Sous-affilié
                      </Label>
                      <span className="text-purple-400 font-bold text-lg">{commissionL3}%</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionL3}
                      onChange={(e) => setCommissionL3(Number(e.target.value))}
                      className="bg-white/5 border-purple-500/20 text-white"
                    />
                    <p className="text-zinc-500 text-xs">Pourcentage reçu par le sous-affilié</p>
                  </div>

                  {/* Total */}
                  <div className={`p-3 rounded-lg border text-center ${commissionL1 + commissionL2 + commissionL3 > 100 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-purple-500/10'}`}>
                    <p className={`text-sm font-medium ${commissionL1 + commissionL2 + commissionL3 > 100 ? 'text-red-400' : 'text-zinc-300'}`}>
                      Total : {commissionL1 + commissionL2 + commissionL3}%
                    </p>
                    {commissionL1 + commissionL2 + commissionL3 > 100 && (
                      <p className="text-red-400 text-xs mt-1">Le total ne doit pas dépasser 100%</p>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="text-amber-300 text-xs font-medium mb-2">Exemple sur une vente de 100$</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-zinc-400">Niveau 1 (affilié)</span><span className="text-green-400 font-medium">{commissionL1}$</span></div>
                      <div className="flex justify-between"><span className="text-zinc-400">Niveau 2 (recruteur)</span><span className="text-blue-400 font-medium">{commissionL2}$</span></div>
                      <div className="flex justify-between"><span className="text-zinc-400">Niveau 3 (sous-affilié)</span><span className="text-purple-400 font-medium">{commissionL3}$</span></div>
                      <div className="flex justify-between pt-1 border-t border-purple-500/10"><span className="text-zinc-300 font-medium">Total commissions</span><span className="text-amber-400 font-bold">{commissionL1 + commissionL2 + commissionL3}$</span></div>
                      <div className="flex justify-between"><span className="text-zinc-400">Reste pour l'admin</span><span className="text-white font-medium">{100 - commissionL1 - commissionL2 - commissionL3}$</span></div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveCommissions}
                    disabled={isSavingCommissions || commissionL1 + commissionL2 + commissionL3 > 100}
                    className="w-full glass-button"
                  >
                    {isSavingCommissions ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sauvegarde...</>
                    ) : (
                      <><Check className="w-4 h-4 mr-2" />Sauvegarder les commissions</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Changer le mot de passe Super Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label className="text-zinc-300">Mot de passe actuel</Label>
                      <Input type="password" value={adminPassword.current} onChange={(e) => setAdminPassword({ ...adminPassword, current: e.target.value })} className="bg-white/5 border-purple-500/20 text-white" required />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Nouveau mot de passe</Label>
                      <Input type="password" value={adminPassword.new} onChange={(e) => setAdminPassword({ ...adminPassword, new: e.target.value })} className="bg-white/5 border-purple-500/20 text-white" required minLength={6} />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Confirmer</Label>
                      <Input type="password" value={adminPassword.confirm} onChange={(e) => setAdminPassword({ ...adminPassword, confirm: e.target.value })} className="bg-white/5 border-purple-500/20 text-white" required minLength={6} />
                    </div>
                    <Button type="submit" disabled={isChangingPassword} className="w-full glass-button">
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <><Key className="w-4 h-4 mr-2" /></>}
                      Changer le mot de passe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* ============================================================ */}
      {/* Feature 1: Create Affiliate Dialog */}
      {/* ============================================================ */}
      <Dialog open={affiliateDialogOpen} onOpenChange={setAffiliateDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <UserPlus className="w-5 h-5 text-green-400" />
              Ajouter un affilié
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Créer un affilié lié à {affiliateForAdmin?.full_name || affiliateForAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAffiliate} className="space-y-4">
            <div>
              <Label className="text-zinc-300">Code de référence</Label>
              <Input 
                value={affiliateForAdmin?.affiliate_code || ''} 
                disabled 
                className="h-10 bg-white/5 border-purple-500/20 text-zinc-400" 
              />
            </div>
            <div>
              <Label className="text-zinc-300">Nom complet</Label>
              <Input 
                placeholder="Nom de l'affilié" 
                value={affiliateForm.fullName} 
                onChange={(e) => setAffiliateForm({ ...affiliateForm, fullName: e.target.value })} 
                required 
                className="h-10 bg-white/5 border-purple-500/20 text-white" 
              />
            </div>
            <div>
              <Label className="text-zinc-300">Email</Label>
              <Input 
                type="email" 
                placeholder="email@exemple.com" 
                value={affiliateForm.email} 
                onChange={(e) => setAffiliateForm({ ...affiliateForm, email: e.target.value })} 
                required 
                className="h-10 bg-white/5 border-purple-500/20 text-white" 
              />
            </div>
            <div>
              <Label className="text-zinc-300">Mot de passe</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    type={showPassword['affiliate-new'] ? 'text' : 'password'} 
                    value={affiliateForm.password} 
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, password: e.target.value })} 
                    required 
                    minLength={6} 
                    className="h-10 bg-white/5 border-purple-500/20 text-white pr-10" 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-10 w-10 p-0 text-zinc-400"
                    onClick={() => setShowPassword({ ...showPassword, ['affiliate-new']: !showPassword['affiliate-new'] })}
                  >
                    {showPassword['affiliate-new'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-10 border-purple-500/20 text-zinc-300 flex-shrink-0"
                  onClick={() => setAffiliateForm({ ...affiliateForm, password: generatePassword() })}
                >
                  <Sparkles className="w-4 h-4 mr-1" />Générer
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isCreatingUser} className="flex-1 glass-button">
                {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" />Créer l'affilié</>}
              </Button>
              <Button type="button" variant="outline" className="border-purple-500/20 text-zinc-300" onClick={() => setAffiliateDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Feature 3: Webhook Info Dialog */}
      {/* ============================================================ */}
      <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Webhook className="w-5 h-5 text-cyan-400" />
              Configuration Webhook
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Webhook Systeme.io pour {webhookAdmin?.full_name || webhookAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Webhook URL */}
            <div>
              <Label className="text-zinc-300 flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                URL du Webhook
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://affiliationpro.cashflowecosysteme.com'}/api/webhooks/systemeio?admin_id=${webhookAdmin?.id || ''}`} 
                  className="h-10 bg-white/5 border-purple-500/20 text-zinc-300 text-sm font-mono"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 border-purple-500/20 text-zinc-300 flex-shrink-0"
                  onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://affiliationpro.cashflowecosysteme.com'}/api/webhooks/systemeio?admin_id=${webhookAdmin?.id || ''}`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Webhook Secret */}
            <div>
              <Label className="text-zinc-300 flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-amber-400" />
                Clé secrète
              </Label>
              {webhookAdmin?.webhook_secret ? (
                <div className="flex items-center gap-2">
                  <Input 
                    readOnly 
                    type={showWebhookSecret ? 'text' : 'password'} 
                    value={webhookAdmin.webhook_secret} 
                    className="h-10 bg-white/5 border-purple-500/20 text-white text-sm font-mono flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 p-0 text-zinc-400"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 border-purple-500/20 text-zinc-300 flex-shrink-0"
                    onClick={() => copyToClipboard(webhookAdmin.webhook_secret!)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-zinc-500 text-sm">Aucune clé secrète configurée</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    onClick={handleGenerateSecret}
                    disabled={isGeneratingSecret}
                  >
                    {isGeneratingSecret ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1" />Générer</>}
                  </Button>
                </div>
              )}
            </div>

            <p className="text-zinc-500 text-xs">
              Cette clé doit être configurée dans les paramètres webhook de Systeme.io pour valider les signatures des événements.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Feature 4: User Detail Panel Dialog */}
      {/* ============================================================ */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-purple-500/20 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    selectedUser.role === 'admin' 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                      : 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
                  }`}>
                    {selectedUser.full_name?.[0]?.toUpperCase() || selectedUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-white text-lg">{selectedUser.full_name || 'Sans nom'}</DialogTitle>
                    <DialogDescription className="text-zinc-400">{selectedUser.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10">
                    <p className="text-zinc-500 text-xs mb-1">Rôle</p>
                    <Badge className={selectedUser.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'}>
                      {selectedUser.role === 'admin' ? <><Building className="w-3 h-3 mr-1" />Admin</> : <><User className="w-3 h-3 mr-1" />Affilié</>}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10">
                    <p className="text-zinc-500 text-xs mb-1">Inscrit le</p>
                    <p className="text-white text-sm">{formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>

                {/* Affiliate Link & Code */}
                <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10">
                  <p className="text-zinc-500 text-xs mb-2 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />Code d'affiliation
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-amber-400 text-sm font-mono flex-1">{selectedUser.affiliate_code}</code>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400" onClick={() => copyToClipboard(selectedUser.affiliate_code)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-zinc-500 text-xs mt-2 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />Lien d'affiliation
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-cyan-400 text-xs font-mono flex-1 truncate">
                      {process.env.NEXT_PUBLIC_SITE_URL || 'https://affiliationpro.cashflowecosysteme.com'}/?ref={selectedUser.affiliate_code}
                    </code>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400 flex-shrink-0" onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://affiliationpro.cashflowecosysteme.com'}/?ref=${selectedUser.affiliate_code}`)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* PayPal */}
                <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10">
                  <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />Email PayPal
                  </p>
                  {selectedUser.paypal_email ? (
                    <div className="flex items-center gap-2">
                      <p className="text-green-400 text-sm">{selectedUser.paypal_email}</p>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400" onClick={() => copyToClipboard(selectedUser.paypal_email!)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">Non configuré</p>
                  )}
                </div>

                {/* Parent admin (for affiliates) */}
                {selectedUser.role === 'affiliate' && selectedUser.parent_id && (
                  <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10">
                    <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
                      <Building className="w-3 h-3" />Admin lié
                    </p>
                    <p className="text-amber-400 text-sm">{selectedUser.parent?.full_name || selectedUser.parent?.email || findParentAdmin(selectedUser.id)?.full_name || findParentAdmin(selectedUser.id)?.email || 'Inconnu'}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10 text-center">
                    <p className="text-zinc-500 text-xs mb-1">Ventes</p>
                    <p className="text-white font-bold">
                      {selectedUser.affiliates?.reduce((acc, a) => acc + a.total_referrals, 0) || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10 text-center">
                    <p className="text-zinc-500 text-xs mb-1">Commissions</p>
                    <p className="text-emerald-400 font-bold text-sm">
                      {formatCurrency(selectedUser.affiliates?.reduce((acc, a) => acc + a.total_earnings, 0) || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-purple-500/10 text-center">
                    <p className="text-zinc-500 text-xs mb-1">Équipe</p>
                    <p className="text-white font-bold">
                      {(selectedUser.children?.length || 0) + (selectedUser.level3?.length || 0)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-purple-500/10">
                  {!detailResetPassword ? (
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-500/20 text-zinc-300"
                      onClick={() => setDetailResetPassword(true)}
                    >
                      <Key className="w-4 h-4 mr-2" />Réinitialiser le mot de passe
                    </Button>
                  ) : (
                    <div className="space-y-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                      <p className="text-zinc-400 text-sm">Entrez le nouveau mot de passe :</p>
                      <div className="flex gap-2">
                        <Input 
                          type="password" 
                          placeholder="Nouveau mot de passe" 
                          value={detailNewPassword} 
                          onChange={(e) => setDetailNewPassword(e.target.value)} 
                          minLength={6} 
                          className="h-9 bg-white/5 border-purple-500/20 text-white flex-1" 
                        />
                        <Button size="sm" className="h-9 glass-button" onClick={handleDetailResetPassword}>
                          <Check className="w-4 h-4 mr-1" />OK
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9" onClick={() => { setDetailResetPassword(false); setDetailNewPassword('') }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full text-zinc-500 hover:text-zinc-300"
                    onClick={() => setUserDetailOpen(false)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />Voir leur panneau (bientôt)
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
