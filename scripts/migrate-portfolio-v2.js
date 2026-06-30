const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('Error: Firebase Admin credentials not found in environment.');
  process.exit(1);
}

const app = admin.apps.length === 0 ? admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
}) : admin.apps[0];

const db = admin.firestore();

// Helpers for slug generation
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

// Map technology strings to catalog IDs
const techMap = {
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'next.js': 'nextjs',
  'nextjs': 'nextjs',
  'next': 'nextjs',
  'typescript': 'typescript',
  'ts': 'typescript',
  'node.js': 'nodejs',
  'nodejs': 'nodejs',
  'node': 'nodejs',
  'nestjs': 'nestjs',
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  'redis': 'redis',
  'docker': 'docker',
  'cloudflare': 'cloudflare',
  'aws': 'aws'
};

async function migrate() {
  console.log('Starting migration to Portfolio V2 Schema...');

  // Fetch all tech stack catalog items to make sure we map correctly
  const techCatalogSnapshot = await db.collection('tech_stack_catalog').get();
  const validTechIds = new Set(techCatalogSnapshot.docs.map(doc => doc.id));
  console.log(`Loaded ${validTechIds.size} tech items from catalog.`);

  const projectsSnapshot = await db.collection('projects').get();
  console.log(`Found ${projectsSnapshot.docs.length} legacy projects to migrate.`);

  const batch = db.batch();

  for (const projectDoc of projectsSnapshot.docs) {
    const data = projectDoc.data();
    console.log(`Migrating project: "${data.title}"...`);

    // 1. Generate unique slug if not present
    const slug = data.slug || slugify(data.title);

    // 2. Map technology tags to catalog IDs
    const techStackIds = [];
    if (Array.isArray(data.tech)) {
      for (const t of data.tech) {
        const normalized = t.toLowerCase().trim();
        const mappedId = techMap[normalized];
        if (mappedId && validTechIds.has(mappedId)) {
          if (!techStackIds.includes(mappedId)) {
            techStackIds.push(mappedId);
          }
        }
      }
    }

    // 3. Register legacy media URLs into centralized media_assets
    let thumbnailMediaId = '';
    let coverMediaId = '';
    const galleryMediaIds = [];

    // Register cover image
    const coverUrl = data.images?.cover || data.image || '';
    if (coverUrl) {
      const mediaId = `med_migrated_cover_${projectDoc.id}`;
      thumbnailMediaId = mediaId;
      coverMediaId = mediaId;

      const mediaRef = db.collection('media_assets').doc(mediaId);
      batch.set(mediaRef, {
        url: coverUrl,
        publicId: mediaId,
        storageProvider: 'cloudflare_r2',
        bucketName: process.env.R2_BUCKET_NAME || 'portfolio-bucket',
        objectKey: `migrated/${projectDoc.id}_cover`,
        originalFilename: 'cover_migrated.jpg',
        mimeType: 'image/jpeg',
        fileSize: 0,
        mediaType: 'image',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    // Register gallery images
    const galleryUrls = data.images?.gallery || [];
    if (Array.isArray(galleryUrls)) {
      for (let i = 0; i < galleryUrls.length; i++) {
        const url = galleryUrls[i];
        if (url && url !== coverUrl) {
          const mediaId = `med_migrated_gallery_${projectDoc.id}_${i}`;
          galleryMediaIds.push(mediaId);

          const mediaRef = db.collection('media_assets').doc(mediaId);
          batch.set(mediaRef, {
            url,
            publicId: mediaId,
            storageProvider: 'cloudflare_r2',
            bucketName: process.env.R2_BUCKET_NAME || 'portfolio-bucket',
            objectKey: `migrated/${projectDoc.id}_gallery_${i}`,
            originalFilename: `gallery_migrated_${i}.jpg`,
            mimeType: 'image/jpeg',
            fileSize: 0,
            mediaType: 'image',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      }
    }

    // 4. Build V2 payload
    const updatedPayload = {
      ...data,
      slug,
      techStackIds,
      thumbnailMediaId,
      coverMediaId,
      galleryMediaIds,
      features: data.features || [],
      challenges: data.challenges || '',
      solutions: data.solutions || '',
      results: data.results || '',
      links: {
        demo: data.link || '',
        github: data.github || '',
        documentation: data.documentation || ''
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Clean up deprecated root-level single links/image fields in the V2 schema
    // keep legacy for backward-compatibility query layers where needed, but mark as updated.
    batch.set(projectDoc.ref, updatedPayload, { merge: true });
  }

  await batch.commit();
  console.log('✅ Migration to Portfolio V2 Schema completed successfully.');
}

migrate().catch(console.error);
