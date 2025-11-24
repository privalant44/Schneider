'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Calendar,
  HelpCircle as QuestionIcon,
  UserCog,
  TestTube,
  Brain,
  Database,
  LogOut,
  User
} from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Important pour les cookies
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      }
    } catch (error) {
      // Pas connecté
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Accueil',
      href: '/',
      icon: Home,
      current: pathname === '/'
    },
    {
      name: 'Gestion des Clients',
      href: '/admin/clients',
      icon: Building2,
      current: pathname === '/admin/clients'
    },
    {
      name: 'Sessions',
      href: '/admin/sessions',
      icon: Calendar,
      current: pathname === '/admin/sessions'
    },
           {
             name: 'Axes d\'Analyse',
             href: '/admin/analysis-axes',
             icon: UserCog,
             current: pathname === '/admin/analysis-axes'
           },
    {
      name: 'Référentiel Questions',
      href: '/admin/questions',
      icon: QuestionIcon,
      current: pathname === '/admin/questions'
    },
    {
      name: 'Analyses et Comparaisons',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname === '/admin/analytics' || pathname === '/admin/analytics/comparison'
    },
    {
      name: 'Base de Données',
      href: '/admin/database',
      icon: Database,
      current: pathname === '/admin/database'
    }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-anima-blue rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800">Administration</span>
            </Link>
          </div>

          {/* Navigation items */}
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-anima-blue text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Boutons en haut à droite */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin/tests"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Page de tests"
            >
              <TestTube className="w-4 h-4" />
              Tests
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Paramètres de l'application"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </Link>
            
            {/* Menu utilisateur */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Menu utilisateur"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{user.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-800">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'super-admin' ? 'Super Administrateur' : 'Administrateur'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
