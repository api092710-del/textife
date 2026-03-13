import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white fill-white" /></div>
              <span className="font-display font-bold text-white text-lg">Trendy<span className="text-primary-400">gene</span></span>
            </Link>
            <p className="text-sm leading-relaxed max-w-52">The AI-powered WhatsApp automation platform for modern businesses.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal',   links: ['Privacy Policy', 'Terms of Service', 'GDPR', 'Security'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} Trendygene. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>🔒 SSL Secured</span><span>GDPR Compliant</span><span>🌍 Global</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
