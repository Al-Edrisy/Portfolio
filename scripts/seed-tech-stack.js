const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('Error: Firebase Admin credentials not found in environment.');
  process.exit(1);
}

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

const seedTechStack = async () => {
  const techs = [
    // Frontend
    { id: 'react', name: 'React', slug: 'react', category: 'frontend', displayOrder: 1 },
    { id: 'nextjs', name: 'Next.js', slug: 'nextjs', category: 'frontend', displayOrder: 2 },
    { id: 'typescript', name: 'TypeScript', slug: 'typescript', category: 'frontend', displayOrder: 3 },
    { id: 'javascript', name: 'JavaScript', slug: 'javascript', category: 'frontend', displayOrder: 4 },
    { id: 'tailwind', name: 'Tailwind CSS', slug: 'tailwind', category: 'frontend', displayOrder: 5 },
    { id: 'vuejs', name: 'Vue.js', slug: 'vuejs', category: 'frontend', displayOrder: 6 },
    { id: 'angular', name: 'Angular', slug: 'angular', category: 'frontend', displayOrder: 7 },
    { id: 'svelte', name: 'Svelte', slug: 'svelte', category: 'frontend', displayOrder: 8 },
    { id: 'redux', name: 'Redux', slug: 'redux', category: 'frontend', displayOrder: 9 },
    { id: 'vite', name: 'Vite', slug: 'vite', category: 'frontend', displayOrder: 10 },

    // Mobile
    { id: 'flutter', name: 'Flutter', slug: 'flutter', category: 'mobile', displayOrder: 11 },
    { id: 'react-native', name: 'React Native', slug: 'react-native', category: 'mobile', displayOrder: 12 },
    { id: 'dart', name: 'Dart', slug: 'dart', category: 'mobile', displayOrder: 13 },
    { id: 'swift', name: 'Swift', slug: 'swift', category: 'mobile', displayOrder: 14 },
    { id: 'kotlin', name: 'Kotlin', slug: 'kotlin', category: 'mobile', displayOrder: 15 },
    { id: 'expo', name: 'Expo', slug: 'expo', category: 'mobile', displayOrder: 16 },

    // Backend
    { id: 'nodejs', name: 'Node.js', slug: 'nodejs', category: 'backend', displayOrder: 17 },
    { id: 'python', name: 'Python', slug: 'python', category: 'backend', displayOrder: 18 },
    { id: 'fastapi', name: 'FastAPI', slug: 'fastapi', category: 'backend', displayOrder: 19 },
    { id: 'nestjs', name: 'NestJS', slug: 'nestjs', category: 'backend', displayOrder: 20 },
    { id: 'express', name: 'Express.js', slug: 'express', category: 'backend', displayOrder: 21 },
    { id: 'django', name: 'Django', slug: 'django', category: 'backend', displayOrder: 22 },
    { id: 'golang', name: 'Go (Golang)', slug: 'golang', category: 'backend', displayOrder: 23 },
    { id: 'csharp', name: 'C# / .NET', slug: 'csharp', category: 'backend', displayOrder: 24 },
    { id: 'graphql', name: 'GraphQL', slug: 'graphql', category: 'backend', displayOrder: 25 },

    // Database
    { id: 'postgresql', name: 'PostgreSQL', slug: 'postgresql', category: 'database', displayOrder: 26 },
    { id: 'mongodb', name: 'MongoDB', slug: 'mongodb', category: 'database', displayOrder: 27 },
    { id: 'redis', name: 'Redis', slug: 'redis', category: 'database', displayOrder: 28 },
    { id: 'supabase', name: 'Supabase', slug: 'supabase', category: 'database', displayOrder: 29 },
    { id: 'firebase', name: 'Firebase', slug: 'firebase', category: 'database', displayOrder: 30 },
    { id: 'mysql', name: 'MySQL', slug: 'mysql', category: 'database', displayOrder: 31 },
    { id: 'prisma', name: 'Prisma ORM', slug: 'prisma', category: 'database', displayOrder: 32 },

    // Cloud & DevOps
    { id: 'docker', name: 'Docker', slug: 'docker', category: 'devops', displayOrder: 33 },
    { id: 'cloudflare', name: 'Cloudflare', slug: 'cloudflare', category: 'devops', displayOrder: 34 },
    { id: 'aws', name: 'AWS', slug: 'aws', category: 'devops', displayOrder: 35 },
    { id: 'gcp', name: 'Google Cloud', slug: 'gcp', category: 'devops', displayOrder: 36 },
    { id: 'vercel', name: 'Vercel', slug: 'vercel', category: 'devops', displayOrder: 37 },
    { id: 'railway', name: 'Railway', slug: 'railway', category: 'devops', displayOrder: 38 },
    { id: 'linux', name: 'Linux', slug: 'linux', category: 'devops', displayOrder: 39 },
    { id: 'git', name: 'Git & GitHub', slug: 'git', category: 'devops', displayOrder: 40 },

    // AI & Intelligent Systems
    { id: 'langchain', name: 'LangChain', slug: 'langchain', category: 'ai', displayOrder: 41 },
    { id: 'langflow', name: 'Langflow', slug: 'langflow', category: 'ai', displayOrder: 42 },
    { id: 'pytorch', name: 'PyTorch', slug: 'pytorch', category: 'ai', displayOrder: 43 },
    { id: 'huggingface', name: 'Hugging Face', slug: 'huggingface', category: 'ai', displayOrder: 44 },
    { id: 'openai', name: 'OpenAI / LLMs', slug: 'openai', category: 'ai', displayOrder: 45 },
    { id: 'ollama', name: 'Ollama', slug: 'ollama', category: 'ai', displayOrder: 46 },

    // Design & UI
    { id: 'figma', name: 'Figma', slug: 'figma', category: 'design', displayOrder: 47 },
    { id: 'framer-motion', name: 'Framer Motion', slug: 'framer-motion', category: 'design', displayOrder: 48 },
    { id: 'gsap', name: 'GSAP', slug: 'gsap', category: 'design', displayOrder: 49 },
    { id: 'shadcn', name: 'shadcn/ui', slug: 'shadcn', category: 'design', displayOrder: 50 },

    // Other Tools
    { id: 'rest-api', name: 'REST APIs', slug: 'rest-api', category: 'other', displayOrder: 51 },
    { id: 'websockets', name: 'WebSockets', slug: 'websockets', category: 'other', displayOrder: 52 },
    { id: 'postman', name: 'Postman', slug: 'postman', category: 'other', displayOrder: 53 }
  ];

  console.log('Seeding Tech Stack Catalog...');
  const batch = db.batch();

  for (const tech of techs) {
    const docRef = db.collection('tech_stack_catalog').doc(tech.id);
    batch.set(docRef, {
      name: tech.name,
      slug: tech.slug,
      category: tech.category,
      logoMediaId: tech.logoMediaId,
      officialUrl: tech.officialUrl,
      displayOrder: tech.displayOrder,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();
  console.log('✅ Tech Stack Catalog seeded successfully.');
};

seedTechStack().catch(console.error);
