import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'Textife – AI WhatsApp Business Automation', template: '%s | Textife' },
  description: 'Automate your WhatsApp business with AI. Reply instantly, capture leads, and grow revenue 24/7.',
  keywords: ['WhatsApp AI', 'business automation', 'AI chatbot', 'lead capture', 'WhatsApp bot'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Textife – AI WhatsApp Business Automation',
    description: 'Turn WhatsApp into your 24/7 AI sales & support assistant.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontSize: '14px' },
            success: { iconTheme: { primary: '#2563EB', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
