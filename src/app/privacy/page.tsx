import Link from 'next/link'
import { Zap, Shield, Lock, Eye, Globe, Bell, FileText, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Textife',
  description: 'How Textife collects, uses, and protects your personal data. GDPR & CCPA compliant.',
}

const LAST_UPDATED = 'March 1, 2025'

const sections = [
  {
    id: 'overview',
    icon: Shield,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    title: '1. Overview',
    content: [
      `Textife ("we", "our", "us") is a SaaS platform providing AI-powered WhatsApp automation, cybersecurity alerts, and productivity tools. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website (textife.com) and services.`,
      `By creating an account or using Textife, you agree to the practices described in this policy. We are committed to handling your data responsibly and transparently in compliance with GDPR (EU), CCPA (California), and applicable data protection laws worldwide.`,
    ],
  },
  {
    id: 'data-collected',
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    title: '2. Data We Collect',
    subsections: [
      {
        title: 'Account Information',
        items: [
          'Full name, email address, and username (provided at registration)',
          'Date of birth (optional, used for age verification)',
          'Password (stored as a secure bcrypt hash — never in plaintext)',
          'Account plan and subscription status',
        ],
      },
      {
        title: 'Usage & Activity Data',
        items: [
          'AI interactions: prompts sent, responses received, and tokens consumed',
          'Pages visited within the dashboard and time spent on features',
          'Bot configurations, templates created, and lead records (yours)',
          'API call logs for billing and abuse prevention',
        ],
      },
      {
        title: 'Payment Information',
        items: [
          'Transaction IDs and payment status from PayPal and NOWPayments',
          'Selected plan and billing amount — we never store full card numbers',
          'Subscription dates and renewal history',
        ],
      },
      {
        title: 'Technical Data',
        items: [
          'IP address, browser type, and device information',
          'Authentication tokens (JWT) stored in browser localStorage',
          'Error logs and performance telemetry (anonymized where possible)',
        ],
      },
    ],
  },
  {
    id: 'how-we-use',
    icon: Zap,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
    title: '3. How We Use Your Data',
    items: [
      'To operate and deliver the Textife platform, including AI features and WhatsApp automation',
      'To process payments and manage your subscription plan',
      'To send security alerts, product updates, and transactional emails',
      'To analyze anonymized usage patterns and improve platform performance',
      'To detect and prevent fraud, abuse, and unauthorized access',
      'To comply with legal obligations and respond to lawful requests',
      'To contact you regarding your account or support requests',
    ],
  },
  {
    id: 'ai-data',
    icon: Globe,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    title: '4. AI Processing & OpenAI',
    content: [
      `Textife uses OpenAI's API (GPT-4o-mini) to power AI features including content generation, scam alerts, chat, and business tools. When you submit prompts or interact with AI features, your input is transmitted to OpenAI's servers for processing.`,
      `We do not train OpenAI models on your personal data. OpenAI's data retention policies apply to API calls, and prompts are not used for model training by default (OpenAI API zero-data-retention settings apply). For full details, see OpenAI's Privacy Policy at openai.com/privacy.`,
      `We store AI conversation history in our database to enable features like chat history and context continuity. You can delete your chat history at any time from Settings.`,
    ],
  },
  {
    id: 'cookies',
    icon: Bell,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    title: '5. Cookies & Tracking',
    subsections: [
      {
        title: 'Essential Cookies',
        items: [
          'Authentication tokens (JWT) to keep you logged in across sessions',
          'Dark mode preference and UI state stored in localStorage',
          'CSRF protection tokens for security',
        ],
      },
      {
        title: 'Analytics Cookies (Optional)',
        items: [
          'Anonymous page view and feature usage data to improve Textife',
          'Performance monitoring with no personally identifiable information',
          'Can be disabled in Settings → Privacy → Analytics & Usage Data',
        ],
      },
    ],
    content: [
      'We do not use advertising or third-party tracking cookies. We do not sell your browsing data to advertisers or data brokers — ever.',
    ],
  },
  {
    id: 'data-sharing',
    icon: Eye,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    title: '6. Data Sharing & Third Parties',
    content: [
      'We do not sell, rent, or share your personal data with third parties for marketing purposes. We only share data with trusted service providers necessary to operate Textife:',
    ],
    table: [
      { provider: 'Supabase / PostgreSQL', purpose: 'Database hosting and storage', location: 'USA (AWS us-east-1)' },
      { provider: 'OpenAI', purpose: 'AI feature processing', location: 'USA' },
      { provider: 'Vercel', purpose: 'Application hosting and CDN', location: 'Global Edge Network' },
      { provider: 'PayPal', purpose: 'Payment processing', location: 'USA / Global' },
      { provider: 'NOWPayments', purpose: 'Crypto payment processing', location: 'EU' },
    ],
    contentAfter: [
      'All third-party providers are contractually bound to protect your data and may not use it for their own marketing purposes. We may disclose data if required by law, court order, or to protect the safety of our users or the public.',
    ],
  },
  {
    id: 'gdpr',
    icon: Lock,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    title: '7. Your Rights (GDPR & CCPA)',
    content: [
      'Depending on your location, you have the following rights regarding your personal data:',
    ],
    rights: [
      { right: 'Right of Access', desc: 'Request a copy of all personal data we hold about you' },
      { right: 'Right to Rectification', desc: 'Correct inaccurate or incomplete personal data' },
      { right: 'Right to Erasure', desc: 'Request deletion of your account and associated data ("right to be forgotten")' },
      { right: 'Right to Portability', desc: 'Export your data in a machine-readable JSON format via Settings → Privacy' },
      { right: 'Right to Restrict Processing', desc: 'Limit how we process your data in certain circumstances' },
      { right: 'Right to Object', desc: 'Opt out of analytics, marketing emails, and non-essential data processing' },
      { right: 'CCPA Rights', desc: 'California residents: right to know, delete, and opt-out of sale of personal information' },
    ],
    contentAfter: [
      'To exercise any of these rights, email us at privacy@textife.com or use the data controls in Settings → Privacy. We will respond within 30 days (GDPR requirement). Account deletion requests are processed within 72 hours.',
    ],
  },
  {
    id: 'security',
    icon: Shield,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    title: '8. Data Security',
    items: [
      'All data in transit is encrypted with TLS 1.3 (HTTPS)',
      'Passwords are hashed with bcrypt (cost factor 12) — never stored in plaintext',
      'Authentication uses short-lived JWT tokens (7-day expiry)',
      'Database access is restricted to authorized services only via Supabase RLS',
      'API keys are stored as environment variables, never in source code',
      'Suspicious login activity triggers automatic account alerts',
      'Regular security audits and dependency vulnerability scanning',
    ],
    content: [
      'While we implement industry-standard security measures, no system is 100% secure. We encourage you to use a strong, unique password and enable Two-Factor Authentication when available. Report suspected security issues to security@textife.com.',
    ],
  },
  {
    id: 'retention',
    icon: FileText,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-50',
    title: '9. Data Retention',
    content: [
      'We retain your personal data for as long as your account is active or as needed to provide services. Specific retention periods:',
    ],
    retentionTable: [
      { type: 'Account & profile data', period: 'Until account deletion + 30 days' },
      { type: 'Chat messages', period: '12 months (or until manually deleted)' },
      { type: 'Payment records', period: '7 years (legal requirement)' },
      { type: 'AI interaction logs', period: '90 days' },
      { type: 'Security & access logs', period: '180 days' },
      { type: 'Anonymized analytics', period: 'Indefinitely (no personal identifiers)' },
    ],
  },
  {
    id: 'children',
    icon: Shield,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    title: '10. Children\'s Privacy',
    content: [
      'Textife is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16. If you believe a child under 16 has created an account, please contact us at privacy@textife.com and we will delete the account within 48 hours.',
    ],
  },
  {
    id: 'changes',
    icon: Bell,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    title: '11. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our services or applicable laws. We will notify you of significant changes by email and by displaying a notice in the dashboard. The "Last Updated" date at the top of this page indicates when the policy was last revised.',
      'Continued use of Textife after changes take effect constitutes your acceptance of the updated policy.',
    ],
  },
  {
    id: 'contact',
    icon: Globe,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    title: '12. Contact & Data Controller',
    content: [
      'If you have questions about this Privacy Policy, want to exercise your data rights, or have a privacy concern, please contact us:',
    ],
    contact: {
      email: 'privacy@textife.com',
      security: 'security@textife.com',
      support: 'support@textife.com',
    },
  },
]

const TOC = sections.map(s => ({ id: s.id, title: s.title }))

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-black text-base text-gray-900">
              Texti<span className="text-indigo-600">fe</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings?tab=privacy" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              <Shield className="w-3.5 h-3.5" /> Privacy Settings
            </Link>
            <Link href="/dashboard" className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
              Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">

          {/* Sidebar TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contents</p>
                <nav className="space-y-0.5">
                  {TOC.map(item => (
                    <a key={item.id} href={`#${item.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all group">
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </a>
                  ))}
                </nav>
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <Link href="/dashboard/settings?tab=privacy"
                    className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-indigo-700 transition-colors">
                    <Shield className="w-3.5 h-3.5" /> Manage My Privacy
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            {/* Hero */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700">Privacy & Data Protection</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-3 leading-tight">
                Privacy Policy
              </h1>
              <p className="text-gray-500 text-base leading-relaxed mb-4">
                We take your privacy seriously. This policy explains exactly what data we collect, why we need it, and the control you have over it.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                  📅 Last updated: {LAST_UPDATED}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
                  ✅ GDPR Compliant
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                  🇺🇸 CCPA Compliant
                </span>
              </div>
            </div>

            {/* Quick action banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 mb-1">🔧 Manage your privacy in real time</p>
                <p className="text-xs text-gray-500 leading-relaxed">Control what data we collect, export your data, or delete your account instantly from your Settings.</p>
              </div>
              <Link href="/dashboard/settings?tab=privacy" className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap">
                <Shield className="w-3.5 h-3.5" /> Privacy Settings
              </Link>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {sections.map(section => {
                const Icon = section.icon
                return (
                  <section key={section.id} id={section.id} className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-9 h-9 ${section.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${section.iconColor}`} />
                      </div>
                      <h2 className="font-display font-bold text-xl text-gray-900">{section.title}</h2>
                    </div>

                    <div className="space-y-4 ml-0">
                      {section.content && section.content.map((para, i) => (
                        <p key={i} className="text-gray-600 text-sm leading-relaxed">{para}</p>
                      ))}

                      {section.subsections && section.subsections.map(sub => (
                        <div key={sub.title} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <h3 className="font-bold text-sm text-gray-900 mb-3">{sub.title}</h3>
                          <ul className="space-y-2">
                            {sub.items.map(item => (
                              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0 mt-1.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {section.items && (
                        <ul className="space-y-2.5">
                          {section.items.map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                              <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.table && (
                        <div className="overflow-x-auto -mx-1">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 text-xs font-black text-gray-400 uppercase tracking-wider">Provider</th>
                                <th className="text-left py-2 px-3 text-xs font-black text-gray-400 uppercase tracking-wider">Purpose</th>
                                <th className="text-left py-2 px-3 text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Location</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.table.map(row => (
                                <tr key={row.provider} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">{row.provider}</td>
                                  <td className="py-2.5 px-3 text-gray-500">{row.purpose}</td>
                                  <td className="py-2.5 px-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{row.location}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {section.contentAfter && section.contentAfter.map((para, i) => (
                        <p key={i} className="text-gray-600 text-sm leading-relaxed">{para}</p>
                      ))}

                      {section.rights && (
                        <div className="grid gap-3">
                          {section.rights.map(r => (
                            <div key={r.right} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-3.5">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-[10px] font-black">✓</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm text-gray-900">{r.right}</p>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{r.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.retentionTable && (
                        <div className="overflow-x-auto -mx-1">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 text-xs font-black text-gray-400 uppercase tracking-wider">Data Type</th>
                                <th className="text-left py-2 px-3 text-xs font-black text-gray-400 uppercase tracking-wider">Retention Period</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.retentionTable.map(row => (
                                <tr key={row.type} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                  <td className="py-2.5 px-3 font-medium text-gray-900">{row.type}</td>
                                  <td className="py-2.5 px-3 text-gray-500">{row.period}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {section.contact && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
                          {[
                            { label: 'Privacy requests', email: section.contact.email },
                            { label: 'Security issues', email: section.contact.security },
                            { label: 'General support', email: section.contact.support },
                          ].map(c => (
                            <div key={c.label} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-gray-500 w-28 flex-shrink-0">{c.label}:</span>
                              <a href={`mailto:${c.email}`} className="text-sm font-semibold text-indigo-600 hover:underline">{c.email}</a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>

            {/* Footer CTA */}
            <div className="mt-14 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white text-center">
              <h2 className="font-display font-black text-xl sm:text-2xl mb-2">Your Privacy, Your Control</h2>
              <p className="text-indigo-200 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
                Manage your data, export your information, or delete your account at any time — no questions asked.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/settings?tab=privacy"
                  className="flex items-center justify-center gap-2 bg-white text-indigo-700 rounded-xl px-5 py-2.5 text-sm font-black hover:bg-indigo-50 transition-colors">
                  <Shield className="w-4 h-4" /> Manage Privacy Settings
                </Link>
                <a href="mailto:privacy@textife.com"
                  className="flex items-center justify-center gap-2 bg-white/15 border border-white/20 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-white/25 transition-colors">
                  📧 Contact Privacy Team
                </a>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Textife. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors font-semibold text-gray-600">Privacy</Link>
            <Link href="/dashboard/billing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="mailto:support@textife.com" className="hover:text-gray-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
