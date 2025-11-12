// backfillCreatedAt.js
const admin = require('firebase-admin');

// Load your service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backfillCreatedAt() {
  // Fetch all product documents
  const snaps = await db.collection('products').get();
  console.log(`Found ${snaps.size} products; backfilling createdAt…`);

  // Update each doc with a serverTimestamp()
  const promises = snaps.docs.map((docSnap) =>
    docSnap.ref.update({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  );
  await Promise.all(promises);

  console.log('Backfill complete.');
  process.exit(0);
}

backfillCreatedAt().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
