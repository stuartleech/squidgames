import './globals.css'
import { Inter, Orbitron } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ 
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron'
})

export const metadata = {
  title: 'Flag Football Tournament Manager',
  description: 'Manage your American Flag Football tournament with live score updates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.variable}`}>
        {children}
      </body>
    </html>
  )
}
