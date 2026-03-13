// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@trendygene.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      username: 'admin',
      email: 'admin@trendygene.com',
      password: adminPassword,
      role: 'ADMIN',
      plan: 'BUSINESS',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create demo user
  const demoPassword = await bcrypt.hash('Demo@123456', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@trendygene.com' },
    update: {},
    create: {
      fullName: 'Demo User',
      username: 'demouser',
      email: 'demo@trendygene.com',
      password: demoPassword,
      role: 'USER',
      plan: 'PRO',
    },
  })
  console.log('✅ Demo user created:', demo.email)

  // Create sample bots for demo user
  await prisma.botInstance.createMany({
    data: [
      { userId: demo.id, name: 'Shop Assistant', phoneNumber: '+971501234567', status: 'ACTIVE', totalReplies: 1234, leadsCaptures: 89 },
      { userId: demo.id, name: 'Support Bot', phoneNumber: '+971559876543', status: 'INACTIVE', totalReplies: 613, leadsCaptures: 45 },
    ],
    skipDuplicates: true,
  })

  // Create sample analytics (last 7 days)
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    await prisma.analytics.create({
      data: {
        userId: demo.id,
        date,
        messagesHandled: Math.floor(Math.random() * 300) + 100,
        leadsCaptures: Math.floor(Math.random() * 30) + 5,
        revenueEst: Math.floor(Math.random() * 500) + 200,
        apiCalls: Math.floor(Math.random() * 150) + 50,
      },
    })
  }

  // Create system templates
  const templates = [
    { title: 'Welcome Message', category: 'Onboarding', isPublic: true, content: 'Welcome to [Business Name]! 👋\n\nThank you for reaching out. I\'m your AI assistant, here to help you 24/7.\n\nHow can I assist you today? Feel free to ask about:\n• Our products and pricing\n• Order status & support\n• Business hours\n\nReply anytime — I\'m always here! 🤖', usageCount: 2340 },
    { title: 'Product Inquiry Reply', category: 'Sales', isPublic: true, content: 'Thank you for your interest in [Product Name]! 🎉\n\nHere are the key details:\n📦 Price: [Price]\n✅ Features: [Feature List]\n🚀 Availability: [Status]\n\nWould you like to place an order or need more info?', usageCount: 1890 },
    { title: 'Lead Capture', category: 'Marketing', isPublic: true, content: 'Great to hear from you! To help you better, I\'d love to get some quick info:\n\n1️⃣ What\'s your name?\n2️⃣ What\'s your business about?\n3️⃣ What\'s your main challenge?\n\nThis helps me give you the best recommendations! 😊', usageCount: 3100 },
    { title: 'Order Confirmation', category: 'E-commerce', isPublic: true, content: '✅ Order Confirmed!\n\nHi [Name], your order has been received:\n\nOrder #[ID]\nItems: [Items]\nTotal: [Amount]\nEstimated delivery: [Date]\n\nWe\'ll notify you when your order ships! 📦', usageCount: 4210 },
    { title: 'Follow-up Message', category: 'Sales', isPublic: true, content: 'Hi [Name]! 👋\n\nJust checking in — did you get a chance to review our offer?\n\nWe\'re offering a special [X]% discount valid until [Date].\n\nLet me know if you have any questions! 🙌', usageCount: 1560 },
    { title: 'Appointment Reminder', category: 'Service', isPublic: true, content: '📅 Reminder: Appointment Tomorrow!\n\nDate: [Date]\nTime: [Time]\nLocation: [Location]\n\nPlease confirm or reply to reschedule.\n\nSee you soon! ✨', usageCount: 890 },
  ]

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.title },
      update: {},
      create: { ...t, id: t.title.replace(/\s/g, '-').toLowerCase() },
    }).catch(() => prisma.template.create({ data: t }))
  }
  console.log('✅ Templates seeded')

  console.log('\n🎉 Seed complete!')
  console.log('📧 Admin login: admin@trendygene.com / Admin@123456')
  console.log('📧 Demo login:  demo@trendygene.com  / Demo@123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
