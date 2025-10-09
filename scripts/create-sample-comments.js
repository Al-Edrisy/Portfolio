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

console.log('🚀 Creating sample comments...');

async function createSampleComments() {
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
    
    // Sample comments
    const sampleComments = [
      "This looks amazing! Great work on the UI design.",
      "I love the concept! How did you implement the AI features?",
      "Very impressive project. The code quality looks excellent.",
      "This is exactly what I was looking for. Great job!",
      "The performance looks incredible. What technologies did you use?",
      "Beautiful design and functionality. Well done!",
      "I'm impressed with the attention to detail in this project.",
      "This is a fantastic example of modern web development.",
      "Great work on the user experience. Very intuitive!",
      "I love how clean and professional this looks.",
    ];
    
    // Create comments for each project
    for (const project of projects) {
      if (!project.title) continue; // Skip projects without titles
      
      console.log(`   Creating comments for: ${project.title}`);
      
      // Create 2-4 random comments per project
      const numComments = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numComments; i++) {
        const commentText = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        await db.collection('comments').add({
          projectId: project.id,
          userId: sampleUserId,
          content: commentText,
          parentCommentId: null, // Top-level comments
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          likes: [],
          repliesCount: 0,
        });
      }
      
      console.log(`   ✅ Created ${numComments} comments`);
    }
    
    console.log('🎉 Sample comments creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample comments:', error);
  }
}

createSampleComments();
