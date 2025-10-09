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

console.log('🚀 Creating sample reactions...');

async function createSampleReactions() {
  try {
    // Get all projects
    const projectsSnapshot = await db.collection('projects').get();
    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (projects.length === 0) {
      console.log('❌ No projects found. Please create projects first.');
      return;
    }

    console.log(`📊 Found ${projects.length} projects`);

    // Sample user ID (the one we created earlier)
    const sampleUserId = 'sample-user-1';
    
    // Reaction types
    const reactionTypes = ['like', 'love', 'fire', 'wow', 'laugh', 'idea', 'rocket', 'clap'];
    
    // Create reactions for each project
    for (const project of projects) {
      console.log(`   Creating reactions for: ${project.title}`);
      
      // Create 3-8 random reactions per project
      const numReactions = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < numReactions; i++) {
        const reactionType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        
        await db.collection('reactions').add({
          projectId: project.id,
          userId: sampleUserId,
          type: reactionType,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      console.log(`   ✅ Created ${numReactions} reactions`);
    }
    
    console.log('🎉 Sample reactions creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample reactions:', error);
  }
}

createSampleReactions();
