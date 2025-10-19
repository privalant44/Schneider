'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Database
} from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Accueil',
      href: '/admin',
      icon: Home,
      current: pathname === '/admin'
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
            <Link href="/admin" className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
