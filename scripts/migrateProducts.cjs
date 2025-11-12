// scripts/migrateProducts.cjs
const admin = require('firebase-admin');
const fs = require('fs');

const sa = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

(async () => {
  const snap = await db.collection('products').get();

  const del = admin.firestore.FieldValue.delete();
  let batch = db.batch();
  let count = 0;

  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const updates = {};

    // Backfill canonical fields
    if (d.price === undefined && typeof d.Price === 'number') updates.price = d.Price;
    if (d.images === undefined && Array.isArray(d.Images)) updates.images = d.Images;
    if (!d.title && typeof d.name === 'string') updates.title = d.name;

    // Optional: remove legacy fields
    if (d.Price !== undefined) updates.Price = del;
    if (d.Images !== undefined) updates.Images = del;
    if (d.name !== undefined) updates.name = del;

    if (Object.keys(updates).length) {
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      batch.set(docSnap.ref, updates, { merge: true });
      count++;
      if (count % 450 === 0) { await batch.commit(); batch = db.batch(); }
    }
  }

  await batch.commit();
  console.log('Migration complete');
  process.exit(0);
})();