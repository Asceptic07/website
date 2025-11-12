import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';

const getValidPrice = (product) => {
  const p = product?.price;
  if (typeof p !== 'number' || !Number.isFinite(p)) {
    throw new Error('Invalid product price');
  }
  return p;
};

export const getCartItems = async (uid) => {
  const itemsCol = collection(db, 'carts', uid, 'items');
  const snaps = await getDocs(itemsCol);
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addToCart = async (uid, productId, qty = 1) => {
  console.debug('addToCart called', { uid, productId, qty, at: new Date().toISOString(), stack: new Error().stack });
  if (!uid) throw new Error('uid required');
  if (!productId) throw new Error('productId required');
  if (qty <= 0) throw new Error('qty must be positive');

  const productRef = doc(db, 'products', productId);
  const cartItemRef = doc(db, 'carts', uid, 'items', productId);

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) throw new Error('Product not found');

    const product = productSnap.data();
    if (!product.active) throw new Error('Product inactive');

    const existing = await tx.get(cartItemRef);
    const newQty = (existing.exists() ? (existing.data().qty || 0) : 0) + qty;

    if (typeof product.stock === 'number' && newQty > product.stock) {
      throw new Error('Insufficient stock');
    }

    const priceAtAdd = getValidPrice(product);

    if (existing.exists()) {
      tx.update(cartItemRef, {
        qty: newQty,
        priceAtAdd,
        updatedAt: serverTimestamp(),
      });
    } else {
      tx.set(cartItemRef, {
        productId,
        qty: newQty,
        priceAtAdd,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });

  return { ok: true };
};

export const updateCartQty = async (uid, productId, qty) => {
  console.debug('updateCartQty called', { uid, productId, qty, at: new Date().toISOString(), stack: new Error().stack })
  if (qty <= 0) {
    await removeFromCart(uid, productId);
    return { ok: true };
  }

  const productRef = doc(db, 'products', productId);
  const cartItemRef = doc(db, 'carts', uid, 'items', productId);

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) throw new Error('Product not found');

    const product = productSnap.data();
    if (!product.active) throw new Error('Product inactive');
    if (typeof product.stock === 'number' && qty > product.stock) {
      throw new Error('Insufficient stock');
    }

    const existing = await tx.get(cartItemRef);
    if (!existing.exists()) throw new Error('Item not in cart');

    const priceAtAdd = getNumericPrice(product);

    tx.update(cartItemRef, {
      qty,
      priceAtAdd,
      updatedAt: serverTimestamp(),
    });
  });

  return { ok: true };
};

export const removeFromCart = async (uid, productId) => {
  await deleteDoc(doc(db, 'carts', uid, 'items', productId));
  return { ok: true };
};

export const clearCart = async (uid) => {
  const items = await getCartItems(uid);
  await Promise.all(items.map(it => deleteDoc(doc(db, 'carts', uid, 'items', it.id))));
  return { ok: true };
};