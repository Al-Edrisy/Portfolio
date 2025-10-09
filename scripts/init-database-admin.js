const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

console.log('🚀 Initializing database with sample data...');
console.log(`📊 Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

// Sample projects data
const sampleProjects = [
  {
    title: "AI-Powered E-Commerce Platform",
    description: "Full-stack e-commerce solution with AI-driven product recommendations and dynamic pricing.",
    longDescription: "A comprehensive e-commerce platform built with Next.js and powered by OpenAI for intelligent product recommendations. Features include dynamic pricing, personalized user experiences, and real-time inventory management.",
    image: "/modern-ecommerce-dashboard-with-ai-analytics.jpg",
    images: [
      "/modern-ecommerce-dashboard-with-ai-analytics.jpg",
      "/analytics-dashboard.png"
    ],
    tech: ["Next.js", "OpenAI", "Stripe", "PostgreSQL", "TypeScript", "Tailwind CSS"],
    category: "web-development",
    link: "https://demo-ecommerce.com",
    github: "https://github.com/salihbenotman/ai-ecommerce",
    published: true,
    featured: true,
    authorId: "sample-user-1",
    reactionsCount: {
      like: 12,
      love: 8,
      fire: 5,
      wow: 3,
      laugh: 1,
      idea: 7,
      rocket: 9,
      clap: 15
    },
    commentsCount: 6,
    viewCount: 234,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Smart Content Management System",
    description: "CMS with AI content generation, automated SEO optimization, and real-time collaboration.",
    longDescription: "A modern content management system that leverages AI for content generation and SEO optimization. Built for teams with real-time collaboration features and automated publishing workflows.",
    image: "/content-management-system-interface-with-ai-featur.jpg",
    images: [
      "/content-management-system-interface-with-ai-featur.jpg"
    ],
    tech: ["React", "Langflow", "Firebase", "TypeScript", "Node.js"],
    category: "web-development",
    link: "https://demo-cms.com",
    github: "https://github.com/salihbenotman/smart-cms",
    published: true,
    featured: false,
    authorId: "sample-user-1",
    reactionsCount: {
      like: 8,
      love: 6,
      fire: 3,
      wow: 2,
      laugh: 0,
      idea: 5,
      rocket: 4,
      clap: 10
    },
    commentsCount: 4,
    viewCount: 156,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Real-Time Analytics Dashboard",
    description: "Interactive dashboard for business intelligence with live data visualization and predictive analytics.",
    longDescription: "A comprehensive analytics dashboard that provides real-time insights into business metrics. Features include interactive charts, predictive analytics, and customizable reports.",
    image: "/analytics-dashboard.png",
    images: [
      "/analytics-dashboard.png"
    ],
    tech: ["Vue.js", "D3.js", "Node.js", "MongoDB", "WebSocket"],
    category: "web-development",
    link: "https://demo-analytics.com",
    github: "https://github.com/salihbenotman/analytics-dashboard",
    published: true,
    featured: true,
    authorId: "sample-user-1",
    reactionsCount: {
      like: 15,
      love: 12,
      fire: 8,
      wow: 6,
      laugh: 1,
      idea: 9,
      rocket: 11,
      clap: 18
    },
    commentsCount: 8,
    viewCount: 312,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Mobile-First Banking App",
    description: "Secure banking application with biometric authentication and AI-powered financial insights.",
    longDescription: "A secure mobile banking application featuring biometric authentication, AI-powered financial insights, and seamless user experience. Built with React Native for cross-platform compatibility.",
    image: "/mobile-banking-app-interface-modern-design.jpg",
    images: [
      "/mobile-banking-app-interface-modern-design.jpg"
    ],
    tech: ["React Native", "Node.js", "AWS", "PostgreSQL", "Biometric Auth"],
    category: "mobile-app",
    link: "https://demo-banking.com",
    github: "https://github.com/salihbenotman/mobile-banking",
    published: true,
    featured: false,
    authorId: "sample-user-1",
    reactionsCount: {
      like: 20,
      love: 16,
      fire: 12,
      wow: 8,
      laugh: 2,
      idea: 14,
      rocket: 18,
      clap: 25
    },
    commentsCount: 12,
    viewCount: 445,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "AI Chatbot Platform",
    description: "Conversational AI platform with natural language processing and multi-channel deployment.",
    longDescription: "An advanced chatbot platform powered by AI and natural language processing. Supports multiple deployment channels including web, mobile, and social media platforms.",
    image: "/ai-chatbot-interface.png",
    images: [
      "/ai-chatbot-interface.png"
    ],
    tech: ["Python", "OpenAI", "FastAPI", "Redis", "Docker"],
    category: "ai-ml",
    link: "https://demo-chatbot.com",
    github: "https://github.com/salihbenotman/ai-chatbot",
    published: true,
    featured: true,
    authorId: "sample-user-1",
    reactionsCount: {
      like: 18,
      love: 14,
      fire: 10,
      wow: 7,
      laugh: 3,
      idea: 16,
      rocket: 13,
      clap: 22
    },
    commentsCount: 9,
    viewCount: 378,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Collaborative Design Tool",
    description: "Real-time collaborative design platform with version control and team management features.",
    longDescription: "A powerful design collaboration tool that enables teams to work together in real-time. Features include version control, team management, and seamless integration with design tools.",
    image: "/collaborative-design-tool-interface-with-team-feat.jpg",
    images: [
      "/collaborative-design-tool-interface-with-team-feat.jpg"
    ],
    tech: ["React", "Socket.io", "Express", "MongoDB", "Canvas API"],
    category: "ui-ux-design",
    link: "https://demo-design-tool.com",
    github: "https://github.com/salihbenotman/collaborative-design",
    published: true,
    featured: false,
    authorId: "sample-user-1",
    reactionsCount: {
      like: 11,
      love: 9,
      fire: 6,
      wow: 4,
      laugh: 1,
      idea: 8,
      rocket: 7,
      clap: 13
    },
    commentsCount: 5,
    viewCount: 198,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Sample user data
const sampleUsers = [
  {
    id: "sample-user-1",
    name: "Salih Ben Otman",
    email: "salih@example.com",
    avatar: "/placeholder-user.jpg",
    role: "developer",
    bio: "Full-stack developer passionate about creating innovative solutions with AI and modern web technologies.",
    location: "Morocco",
    website: "https://salihbenotman.com",
    github: "https://github.com/salihbenotman",
    linkedin: "https://linkedin.com/in/salihbenotman",
    twitter: "https://twitter.com/salihbenotman",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function initializeDatabase() {
  try {
    console.log('📝 Creating sample users...');
    
    // Create sample users
    for (const user of sampleUsers) {
      try {
        await db.collection('users').doc(user.id).set(user);
        console.log(`   ✅ Created user: ${user.name}`);
      } catch (error) {
        console.log(`   ⚠️  User might already exist: ${user.name}`);
      }
    }
    
    console.log('📝 Creating sample projects...');
    
    // Create sample projects
    for (let i = 0; i < sampleProjects.length; i++) {
      const project = sampleProjects[i];
      console.log(`   Creating project ${i + 1}/${sampleProjects.length}: ${project.title}`);
      
      try {
        const docRef = await db.collection('projects').add(project);
        console.log(`   ✅ Created project with ID: ${docRef.id}`);
      } catch (error) {
        console.log(`   ❌ Error creating project: ${error.message}`);
      }
    }
    
    console.log('🎉 Database initialization completed!');
    console.log('💡 You can now visit your projects page to see the data');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Initialize database
initializeDatabase();
