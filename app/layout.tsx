import type { Metadata } from 'next'
import { Inter, Homemade_Apple } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const homemadeApple = Homemade_Apple({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-homemade'
})

export const metadata: Metadata = {
  title: 'Questionnaire Schneider - Anima Néo',
  description: 'Questionnaire de cartographie de culture d\'entreprise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${homemadeApple.variable}`}>{children}</body>
    </html>
  )
}
