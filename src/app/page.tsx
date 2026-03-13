// src/app/page.tsx
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import FAQ from '@/components/landing/FAQ'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
