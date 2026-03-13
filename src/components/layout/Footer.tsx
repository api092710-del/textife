import Link from 'next/link'
import { Zap, Shield, Globe, Lock, Twitter, Instagram, Linkedin } from 'lucide-react'

const LINKS = {
  Product: [
    { label:'AI Bots',        href:'/dashboard/bots' },
    { label:'Content Hub',    href:'/dashboard/content' },
    { label:'Prompt Library', href:'/dashboard/prompts' },
    { label:'Voice Changer',  href:'/dashboard/voicechanger' },
    { label:'Pricing',        href:'/#pricing' },
  ],
  Tools: [
    { label:'Quick Tools',    href:'/dashboard/quicktools' },
    { label:'Growth Coach',   href:'/dashboard/growth' },
    { label:'AI Chat',        href:'/dashboard/chat' },
    { label:'Scam Alerts',    href:'/dashboard/news' },
    { label:'Analytics',      href:'/dashboard/analytics' },
  ],
  Company: [
    { label:'About',    href:'#' },
    { label:'Blog',     href:'#' },
    { label:'Careers',  href:'#' },
    { label:'Contact',  href:'mailto:support@textife.com' },
    { label:'Affiliate', href:'#' },
  ],
  Legal: [
    { label:'Privacy Policy',  href:'/privacy' },
    { label:'Terms of Service', href:'#' },
    { label:'GDPR',            href:'/privacy#gdpr' },
    { label:'Cookie Policy',   href:'/privacy#cookies' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display font-black text-white text-lg">
                Texti<span className="text-indigo-400">fe</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-48 mb-5">
              AI-powered WhatsApp automation + content creation + personal growth tools for modern businesses.
            </p>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { icon:Shield, label:'GDPR', color:'text-green-400' },
                { icon:Lock,   label:'SSL',  color:'text-blue-400' },
                { icon:Globe,  label:'Global',color:'text-purple-400' },
              ].map(b => {
                const Icon = b.icon
                return (
                  <span key={b.label} className="flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">
                    <Icon className={`w-3 h-3 ${b.color}`} />{b.label}
                  </span>
                )
              })}
            </div>
            {/* Social */}
            <div className="flex gap-2">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-center transition-all">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Textife. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Secure payments via
            <span className="font-bold text-gray-500 ml-1">PayPal</span> &
            <span className="font-bold text-gray-500 ml-1">NOWPayments</span>
            <span className="ml-1">(BTC, ETH, USDT + 70 coins)</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
