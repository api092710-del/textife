import Link from 'next/link'
import { Zap, Shield, Globe, Lock } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Security Alerts', href: '/dashboard/news' },
    { label: 'AI Tools', href: '/dashboard/quicktools' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: 'mailto:support@textife.com' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '#' },
    { label: 'GDPR Compliance', href: '/privacy#gdpr' },
    { label: 'Cookie Policy', href: '/privacy#cookies' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">
                Texti<span className="text-indigo-400">fe</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-52 mb-5">
              AI-powered WhatsApp automation + real-time scam protection for modern businesses.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">
                <Shield className="w-3 h-3 text-green-400" /> GDPR
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">
                <Lock className="w-3 h-3 text-blue-400" /> SSL
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">
                <Globe className="w-3 h-3 text-purple-400" /> Global
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5 text-sm">
                {links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors hover:translate-x-0.5 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} Textife. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/privacy#gdpr" className="hover:text-white transition-colors">GDPR</Link>
            <span>🔒 SSL Secured</span>
            <span>🌍 Global Platform</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
