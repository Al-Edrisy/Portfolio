const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
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

async function migrateUserRoles() {
  console.log('🚀 Starting user roles migration...');

  const usersSnapshot = await db.collection('users').get();
  console.log(`Found ${usersSnapshot.docs.length} user documents.`);

  const batch = db.batch();
  let migrateCount = 0;

  usersSnapshot.docs.forEach(userDoc => {
    const data = userDoc.data();
    const currentRole = data.role;
    let newRole = currentRole;

    if (currentRole === 'developer') {
      newRole = 'admin';
    } else if (currentRole === 'client' || (currentRole !== 'admin' && currentRole !== 'user')) {
      newRole = 'user';
    }

    if (newRole !== currentRole) {
      console.log(`Updating user ${data.name || userDoc.id} (${data.email || 'no email'}): "${currentRole}" -> "${newRole}"`);
      batch.update(userDoc.ref, { role: newRole });
      migrateCount++;
    }
  });

  if (migrateCount > 0) {
    await batch.commit();
    console.log(`✅ Successfully migrated ${migrateCount} users to standard roles ('admin' or 'user').`);
  } else {
    console.log('✅ No users required role updates. All user roles are already standardized.');
  }
}

migrateUserRoles()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error during user role migration:', err);
    process.exit(1);
  });
