import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera, ArrowRight, Shield, Zap, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Focus</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Détection de faune par{' '}
              <span className="text-primary">Intelligence Artificielle</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Automatisez la détection et la validation d'espèces animales dans vos photos de terrain
              grâce à l'IA et à une validation collaborative.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/10 py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Fonctionnalités principales
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Détection automatique</h3>
              <p className="text-muted-foreground">
                Notre IA analyse vos images et détecte automatiquement les espèces présentes
                avec un haut niveau de confiance.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Validation collaborative</h3>
              <p className="text-muted-foreground">
                Validez ou corrigez les détections avec votre équipe pour améliorer
                continuellement la précision.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Gestion de projets</h3>
              <p className="text-muted-foreground">
                Organisez vos campagnes de terrain, gérez les accès et suivez
                les statistiques en temps réel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Focus. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
