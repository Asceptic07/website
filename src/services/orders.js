import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

export const placeOrder = async (uid, orderItems) => {
  if (!uid) throw new Error("User not authenticated");
  if (!orderItems || orderItems.length === 0) throw new Error("No items to order");

  await runTransaction(db, async (tx) => {
    let total = 0;

    for (const item of orderItems) {
      const productRef = doc(db, "products", item.productId);
      const productSnap = await tx.get(productRef);

      if (!productSnap.exists()) throw new Error("Product not found");

      const product = productSnap.data();
      const stock = product.stock ?? 0;

      if (!product.active) throw new Error(`${product.title || product.name} is inactive`);
      if (stock < item.qty)
        throw new Error(`${product.title || product.name} only has ${stock} left`);

      total += (product.Price || product.price) * item.qty;

      // Deduct stock
      tx.update(productRef, {
        stock: stock - item.qty,
        updatedAt: serverTimestamp(),
      });
    }

    // Create order record
    const ordersRef = collection(db, "orders");
    const orderRef = doc(ordersRef);
    tx.set(orderRef, {
      uid,
      items: orderItems,
      total,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // Clear user cart
    const userCartRef = collection(db, "carts", uid, "items");
    const cartDocs = await getDocs(userCartRef);
    cartDocs.forEach((d) => tx.delete(d.ref));
  });

  return { ok: true };
};