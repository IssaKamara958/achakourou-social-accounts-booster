'use client';

import Link from 'next/link';
import { ArrowRight, Instagram, Facebook, Video, Sparkles, BarChart3, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Achakourou</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Gérez tous vos réseaux sociaux depuis une seule plateforme
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Synchronisez Facebook, Instagram et TikTok. Publiez, migrez, optimisez avec l'IA. 
          Boostez votre présence sociale.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex justify-center gap-8 mt-12">
          <div className="flex items-center gap-2 text-facebook font-semibold">
            <Facebook className="h-6 w-6" /> Facebook
          </div>
          <div className="flex items-center gap-2 text-instagram font-semibold">
            <Instagram className="h-6 w-6" /> Instagram
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <Video className="h-6 w-6" /> TikTok
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Share2}
            title="Synchronisation Multi-comptes"
            description="Connectez tous vos comptes Facebook, Instagram et TikTok en un clic. Synchronisation automatique."
          />
          <FeatureCard
            icon={Sparkles}
            title="IA Intégrée"
            description="Générez du contenu optimisé, des visuels et des scripts vidéo avec notre IA."
          />
          <FeatureCard
            icon={BarChart3}
            title="SEO & Publicités"
            description="Analysez et optimisez le référencement de vos profils. Créez et retouchez vos campagnes pub."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center bg-primary/5 rounded-3xl mb-20">
        <h2 className="text-3xl font-bold mb-4">Prêt à booster votre présence sociale ?</h2>
        <p className="text-muted-foreground mb-8">Rejoignez Achakourou dès aujourd'hui.</p>
        <Link href="/register">
          <Button size="lg">Créer mon compte</Button>
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
