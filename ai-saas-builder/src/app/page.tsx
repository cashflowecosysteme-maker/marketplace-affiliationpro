import Link from "next/link";
import Image from "next/image";
import { StarryBackground } from "@/components/starry-background";
import { LogoSlider } from "@/components/logo-slider";
import { FloatingOrbs, FloatingParticles } from "@/components/premium-animations";
import { NyXiaWidget } from "@/components/nyxia-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Gift,
  ChevronRight,
  Check,
  BarChart3,
  Link2,
  Mail,
  LayoutDashboard,
  Settings,
  Crown,
  Heart,
} from "lucide-react";

export default function Home() {
  return (
    <>
    <div className="relative min-h-screen overflow-hidden">
      <StarryBackground />
      <FloatingOrbs />
      <FloatingParticles />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8 lg:px-12">
        {/* Left - Branding */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-zinc-400 tracking-wide">Publication CashFlow</span>
              <span className="text-[10px] text-purple-400/70">Visionnaire depuis 1997</span>
            </div>
          </div>
          <span className="text-lg font-bold gradient-text ml-11 mt-0.5">AffiliationPro</span>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Fonctionnalités
          </Link>
          <Link href="#howitworks" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Comment ça marche
          </Link>
          <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Tarifs
          </Link>
          <Link href="#publicationcashflow" className="text-sm text-zinc-400 hover:text-white transition-colors">
            PublicationCashflow
          </Link>
        </div>

        {/* Right - Social + Auth */}
        <div className="flex items-center gap-3">
          {/* Social Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Site Web */}
            <a href="https://www.publication-web.com" target="_blank" rel="noopener noreferrer" 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-500 hover:border-transparent hover:-translate-y-0.5"
              title="Site Web">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
            
            {/* Facebook */}
            <a href="https://www.facebook.com/PublicationWeb" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-500 hover:border-transparent hover:-translate-y-0.5"
              title="Facebook">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            {/* Instagram */}
            <a href="https://www.instagram.com/publication.web/" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400 hover:border-transparent hover:-translate-y-0.5"
              title="Instagram">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            
            {/* TikTok */}
            <a href="https://www.tiktok.com/@publicationweb" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-cyan-400 hover:to-pink-500 hover:border-transparent hover:-translate-y-0.5"
              title="TikTok">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-white/10" />

          {/* Auth Buttons */}
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white text-sm px-3">
              Connexion
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="glass-button text-white border-0 text-sm px-4">
              Essai gratuit
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 glass-button border-purple-500/30 text-purple-300 shimmer">
            🚀 Alternative à l'affiliation Systeme.io
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight slide-in-up">
            <span className="text-white">Ton programme d'affiliation</span>
            <br />
            <span className="relative inline-block">
              {/* Glow effect behind text */}
              <span className="absolute inset-0 blur-2xl opacity-60 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse" style={{ transform: 'scale(1.5)' }} />
              <span className="relative gradient-text">prêt en 5 minutes</span>
            </span>
          </h1>
          
          {/* MEGA ARGUMENT - Punch pour les orphelins Systeme.io */}
          <div className="relative max-w-4xl mx-auto mb-10 mt-20">
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/15 via-purple-500/15 to-green-500/15 blur-3xl rounded-3xl" />
            
            <div className="relative p-8 md:p-10 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm">
              {/* Ligne 1 - Le problème - BADGE PLUS GRAND */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
                <span className="px-6 py-3 rounded-full bg-red-500/30 border-2 border-red-500/50 text-red-100 text-lg md:text-xl font-bold animate-pulse shadow-lg shadow-red-500/20">
                  ⚠️ Systeme.io a fermé son affiliation
                </span>
                <span className="text-zinc-300 text-2xl hidden md:block">→</span>
                <span className="text-white font-bold text-xl md:text-2xl">
                  Tu cherches une alternative ?
                </span>
              </div>
              
              {/* Ligne 2 - La solution */}
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white mb-5">
                  Crée ton propre programme d'affiliation
                </p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                  <span className="flex items-center gap-2 text-purple-300 font-bold text-lg">
                    <span className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-lg">📊</span>
                    3 niveaux de commissions
                  </span>
                  <span className="flex items-center gap-2 text-blue-300 font-bold text-lg">
                    <span className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-lg">🎯</span>
                    Dashboard complet
                  </span>
                  <span className="flex items-center gap-2 text-green-300 font-bold text-lg">
                    <span className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center text-lg">⚡</span>
                    Automatisation totale
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/signup">
              <Button size="lg" className="glass-button text-white border-0 px-8 py-6 text-lg group">
                🚀 Créer mon compte gratuit
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#howitworks">
              <Button size="lg" variant="outline" className="border-purple-500/30 text-zinc-300 hover:text-white hover:bg-purple-500/10 px-8 py-6 text-lg">
                Comment ça marche ?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Done For You Section */}
      <section className="relative z-10 px-6 py-12 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 border border-green-500/30 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 spotlight">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Image */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md aspect-[3/2] rounded-2xl overflow-hidden border-2 border-green-500/20 shadow-2xl shadow-green-500/10 float">
                  <Image
                    src="/heureuse.png"
                    alt="Femme heureuse - Done For You"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
                </div>
              </div>
              
              {/* Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                  <Crown className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">100% Done For You</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  <span className="text-green-400">Zéro Technique.</span>
                  <br />
                  <span className="text-green-400">Zéro Effort.</span>
                  <br />
                  <span className="gradient-text">Zéro Stress.</span>
                </h2>
                
                <p className="text-zinc-300 text-lg mb-6 leading-relaxed">
                  Tu paies. Tu cliques. <span className="text-green-400 font-semibold">L'IA fait tout le reste</span> pendant que tu profites de ta vie.
                </p>
                
                <div className="space-y-3 mb-6">
                  {[
                    "Ton employé numérique 24h/24 et 7j/7",
                    "L'IA travaille pendant que tu dors",
                    "Tu te réveilles avec des résultats",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                      <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                      <span className="text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-zinc-400 text-sm italic">
                  "Je paie, je clic, c'est fait. Je ne réfléchis plus." ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Slider - Trust Section */}
      <LogoSlider />

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 slide-in-up">
              ✨ Tout ce dont tu as besoin
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Une solution complète pour gérer ton programme d'affiliation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: BarChart3,
                title: "3 Niveaux de Commissions",
                description: "Niveau 1 : 25% • Niveau 2 : 10% • Niveau 3 : 5% (ou personnalise selon tes besoins). Motive tes affiliés à recruter d'autres affiliés !",
                color: "text-purple-400",
              },
              {
                icon: Link2,
                title: "Intégration Systeme.io",
                description: "Connecte ton compte Systeme.io en 1 clic. Chaque vente est automatiquement trackée et les commissions calculées.",
                color: "text-blue-400",
              },
              {
                icon: LayoutDashboard,
                title: "Page d'Inscription Pro",
                description: "Une page d'inscription personnalisée pour recruter tes affiliés automatiquement. Ton branding, ton style.",
                color: "text-green-400",
              },
              {
                icon: TrendingUp,
                title: "Dashboard Affiliés",
                description: "Tes affiliés voient leurs ventes, leur équipe, leurs gains, leurs liens personnalisés. Tout est clair et motivant.",
                color: "text-orange-400",
              },
              {
                icon: Settings,
                title: "Dashboard Admin",
                description: "Gère tes affiliés, visualise les statistiques, exporte les données, effectue les paiements en quelques clics.",
                color: "text-pink-400",
              },
              {
                icon: Mail,
                title: "Emails Automatiques",
                description: "Bienvenue aux affiliés, notification de vente, récapitulatif mensuel... Tout est automatisé.",
                color: "text-cyan-400",
              },
            ].map((feature, i) => (
              <Card key={i} className="glass-card glass-card-hover border-0 shimmer card-tilt">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="howitworks" className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🚀 Comment ça <span className="gradient-text">marche</span> ?
            </h2>
            <p className="text-zinc-400">En 3 étapes simples, ton programme est prêt</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Crée ton compte",
                description: "Inscription gratuite en 30 secondes. Tu configures ton programme : nom, logo, pourcentages de commissions.",
              },
              {
                step: "2",
                title: "Connecte Systeme.io",
                description: "Tu colles ton webhook Systeme.io et c'est tout ! Les ventes sont automatiquement trackées.",
              },
              {
                step: "3",
                title: "Recrute tes affiliés",
                description: "Partage ta page d'inscription. Tes affiliés s'inscrivent, reçoivent leurs liens et commencent à vendre pour toi !",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="glass-card rounded-2xl p-6 h-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-6 w-8 h-8 text-purple-500/50 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-violet-400 text-sm font-semibold tracking-wider uppercase">Tarification simple</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Lance ton programme<br />
              <span className="gradient-text">d'affiliation</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mx-auto">Commence à 19 $. Scale quand tu es prêt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start relative">
            {/* Ambient glow behind Pro card */}
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[120px] pointer-events-none" />

            {/* ─── STARTER ─── */}
            <Card className="glass-card rounded-3xl p-8 glass-card-hover">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <p className="text-violet-400/80 font-bold tracking-widest uppercase text-sm mb-6">Starter</p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-zinc-500 text-2xl font-semibold">19 $</span>
                  </div>
                  <p className="text-zinc-500 text-sm">Paiement unique · À vie</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Programme d'affiliation basique",
                    "Jusqu'à 10 affiliés",
                    "1 niveau de commissions",
                    "Dashboard affilié simple",
                    "Page d'inscription personnalisée",
                    "Support communauté",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button size="lg" variant="outline" className="w-full rounded-xl border-violet-500/30 text-white hover:bg-violet-500/10 hover:border-violet-500/50 transition-all py-5">
                    Commencer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* ─── PRO (Featured) ─── */}
            <Card className="glass-card rounded-3xl p-8 md:scale-105 md:-my-4 relative border-violet-500/50 glow-pulse-intense shimmer z-10">
              {/* Badge flottant */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-1.5 rounded-full shadow-lg shadow-violet-500/40 text-xs font-bold tracking-wider border-0">
                  ⭐ Le plus populaire
                </Badge>
              </div>
              <CardContent className="p-0">
                <div className="text-center mb-8 mt-2">
                  <p className="text-violet-400 font-bold tracking-widest uppercase text-sm mb-6">Pro</p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-black text-white gradient-text">39 $</span>
                  </div>
                  <p className="text-zinc-500 text-sm">par mois · Sans engagement</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "3 niveaux de commissions",
                    "Affiliés illimités",
                    "Marque blanche",
                    "Dashboard ultra-complet",
                    "API + Webhooks multiples",
                    "Emails avancés",
                    "Support prioritaire",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button size="lg" className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white border-0 py-5 text-base font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all group">
                    Démarrer maintenant
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* ─── AGENCE ─── */}
            <Card className="glass-card rounded-3xl p-8 glass-card-hover">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <p className="text-violet-400/80 font-bold tracking-widest uppercase text-sm mb-6">Agence</p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-zinc-500 text-2xl font-semibold">97 $</span>
                  </div>
                  <p className="text-zinc-500 text-sm">par mois · Multi-comptes</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Tout le plan Pro",
                    "Multi-comptes clients",
                    "Gestionnaire de compte dédié",
                    "API complète",
                    "Intégration sur mesure",
                    "Rapports avancés",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button size="lg" variant="outline" className="w-full rounded-xl border-violet-500/30 text-white hover:bg-violet-500/10 hover:border-violet-500/50 transition-all py-5">
                    Nous contacter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PublicationCashflow - Flagship Product */}
      <section id="publicationcashflow" className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          {/* Premium Card with animated gradient background */}
          <div className="relative rounded-3xl pt-6">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 animate-pulse rounded-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 rounded-3xl" />
            
            {/* Glowing orbs in background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/15 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] transform -translate-x-1/2 -translate-y-1/2" />
            
            {/* Content */}
            <div className="relative glass-card rounded-3xl p-8 md:p-12 border border-amber-500/40">
              {/* Floating crown icon */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/50 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30">
                    <span className="text-lg">👑</span>
                    Notre Solution Premium
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  <span className="relative inline-block">
                    <span className="absolute inset-0 blur-2xl opacity-50 bg-amber-400" style={{ transform: 'scale(2)' }} />
                    <span className="relative bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                      PublicationCashflow
                    </span>
                  </span>
                </h2>
                
                <p className="text-xl md:text-2xl text-zinc-100 mb-4 font-medium">
                  L'IA crée ton site d'affiliation en <span className="text-amber-400 font-bold">60 secondes</span>.
                </p>
                
                <p className="text-zinc-300 mb-8 text-lg">
                  Puis elle publie <span className="text-white font-semibold">automatiquement du contenu 24h/24 et 7j/7</span>...
                </p>
                
                {/* Done For You Banner - Premium Style */}
                <div className="relative mb-8 p-5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10" />
                  <div className="absolute inset-0 border border-green-500/30 rounded-2xl" />
                  <div className="relative text-center">
                    <p className="text-green-400 font-bold text-lg mb-1 flex items-center justify-center gap-2">
                      <span className="text-2xl">✨</span>
                      100% Done For You
                      <span className="text-sm text-zinc-400 font-normal">— Zéro Technique, Zéro Stress</span>
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Tu paies. Tu cliques. L'IA fait tout le reste pendant que tu profites de ta vie.
                    </p>
                  </div>
                </div>
                
                {/* Feature Grid - Premium Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: "⚡", text: "Génération en 60 sec", color: "from-yellow-500/20 to-amber-500/20" },
                    { icon: "🤖", text: "Contenu automatisé 24/7", color: "from-purple-500/20 to-blue-500/20" },
                    { icon: "📘", text: "Intégration Facebook...", color: "from-blue-500/20 to-cyan-500/20" },
                    { icon: "📅", text: "Et bien plus encore...", color: "from-green-500/20 to-emerald-500/20" },
                  ].map((item, i) => (
                    <div key={i} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm" style={{ background: item.color.split(' ')[0] }} />
                      <div className="relative text-center p-4 rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-500/30 transition-all duration-300 group-hover:-translate-y-1">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <p className="text-zinc-200 text-sm font-medium">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* CTA Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/30">
                  <div>
                    <p className="text-zinc-200 text-lg font-medium">Découvre ce que l'IA peut faire pour toi...</p>
                    <p className="text-amber-400 text-sm flex items-center gap-2">
                      <span>👉</span>
                      <span>Ton employé numérique qui travaille pendant que tu dors...</span>
                    </p>
                  </div>
                  <a href="https://www.publicationcashflow.com/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0 group shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300">
                      Voir la démo
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 glow-pulse-intense shimmer">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              💜 Prêt(e) à lancer ton <span className="gradient-text">programme d'affiliation</span> ?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Rejoins les entrepreneurs qui utilisent AffiliationPro pour automatiser leurs ventes. 
              Essai gratuit de 7 jours, sans carte de crédit.
            </p>
            <Link href="/signup">
              <Button size="lg" className="glass-button text-white border-0 px-12 py-6 text-lg group">
                🚀 Démarrer mon essai gratuit
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ambassadeur Section */}
      <section className="relative z-10 px-6 py-16 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
            
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-pink-500/30 rounded-full blur-[80px]" />
            
            {/* Content */}
            <div className="relative p-8 md:p-10 text-center">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <span className="text-xl">💎</span>
                <span className="text-purple-300 font-semibold">Offre Exclusive</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Deviens un Ambassadeur
                </span>
              </h2>
              
              <p className="text-zinc-300 text-lg mb-6 max-w-xl mx-auto">
                Rembourse rapidement ton investissement en partageant AffiliationPro autour de toi.
                <span className="text-purple-400 font-semibold"> Gagne des commissions sur chaque vente !</span>
              </p>
              
              <Link 
                href="/ambassadeur"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
              >
                <span>🌟</span>
                Devenir Ambassadeur
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 md:px-12 lg:px-24 border-t border-purple-500/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">
            © 2026 AffiliationPro - Un service Publication-Web Cashflow • Visionnaire depuis 1997 ✨
          </p>
        </div>
      </footer>
    </div>
    <NyXiaWidget mode="pastille" />
    </>
  );
}
