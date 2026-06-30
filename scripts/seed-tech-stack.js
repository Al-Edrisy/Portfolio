const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
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
    { id: 'react', name: 'React', slug: 'react', category: 'frontend', logoMediaId: 'tech_react_logo', officialUrl: 'https://react.dev', displayOrder: 1 },
    { id: 'nextjs', name: 'Next.js', slug: 'nextjs', category: 'frontend', logoMediaId: 'tech_nextjs_logo', officialUrl: 'https://nextjs.org', displayOrder: 2 },
    { id: 'typescript', name: 'TypeScript', slug: 'typescript', category: 'other', logoMediaId: 'tech_ts_logo', officialUrl: 'https://www.typescriptlang.org', displayOrder: 3 },
    { id: 'nodejs', name: 'Node.js', slug: 'nodejs', category: 'backend', logoMediaId: 'tech_nodejs_logo', officialUrl: 'https://nodejs.org', displayOrder: 4 },
    { id: 'nestjs', name: 'NestJS', slug: 'nestjs', category: 'backend', logoMediaId: 'tech_nestjs_logo', officialUrl: 'https://nestjs.com', displayOrder: 5 },
    { id: 'postgresql', name: 'PostgreSQL', slug: 'postgresql', category: 'database', logoMediaId: 'tech_postgres_logo', officialUrl: 'https://www.postgresql.org', displayOrder: 6 },
    { id: 'redis', name: 'Redis', slug: 'redis', category: 'database', logoMediaId: 'tech_redis_logo', officialUrl: 'https://redis.io', displayOrder: 7 },
    { id: 'docker', name: 'Docker', slug: 'docker', category: 'devops', logoMediaId: 'tech_docker_logo', officialUrl: 'https://www.docker.com', displayOrder: 8 },
    { id: 'cloudflare', name: 'Cloudflare', slug: 'cloudflare', category: 'devops', logoMediaId: 'tech_cloudflare_logo', officialUrl: 'https://www.cloudflare.com', displayOrder: 9 },
    { id: 'aws', name: 'AWS', slug: 'aws', category: 'devops', logoMediaId: 'tech_aws_logo', officialUrl: 'https://aws.amazon.com', displayOrder: 10 }
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
