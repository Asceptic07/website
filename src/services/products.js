// src/services/products.js
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { requireAdmin } from './user';

// Normalize a product doc to canonical keys used across the app.
const normalizeProduct = (id, data) => {
  const price = (typeof data.price === 'number') ? data.price
              : (typeof data.Price === 'number') ? data.Price
              : undefined;
  const images = Array.isArray(data.images) ? data.images
               : Array.isArray(data.Images) ? data.Images
               : [];
  const title = data.title ?? data.name ?? '';
  const stock = (typeof data.stock === 'number') ? data.stock : 0;

  // 🎯 SMART DISCOUNT PARSING
  let discount = 0;
  if (data.discount) {
    if (typeof data.discount === 'number') {
      discount = data.discount;
    } else if (typeof data.discount === 'string') {
      // Remove % and parse as number
      discount = parseFloat(data.discount.replace('%', '')) || 0;
    }
  }

  // 🎯 CALCULATE DISCOUNTED PRICE
  let finalPrice = price;
  let originalPrice = undefined;
  
  if (discount > 0 && price) {
    originalPrice = price;
    finalPrice = price - (price * discount / 100);
    finalPrice = Math.round(finalPrice); // Round to nearest rupee
  }

  return {
    id,
    images,
    price: finalPrice,           // ✅ This is now the discounted price!
    originalPrice,                // ✅ Original price (if discount exists)
    title,
    active: Boolean(data.active),
    brand: data.brand ?? '',
    category: data.category ?? '',
    features: Array.isArray(data.features) ? data.features : [],
    specifications: data.specifications ?? {},
    stock,
    inStock: (typeof data.stock === 'number') ? data.stock > 0 : true,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    discount: discount > 0 ? discount : null,  // ✅ null if 0, so it won't render!
    description: data.description ?? '',
    badge: data.badge ?? '',
  };
};

export const getProductById = async (productId) => {
  const snap = await getDoc(doc(db, 'products', productId));
  if (!snap.exists()) return null;
  return normalizeProduct(snap.id, snap.data());
};

export const getProductBySlug = async (slug) => {
  const q = query(
    collection(db, 'products'),
    where('slug', '==', slug),
    where('active', '==', true),
    limit(1)
  );
  const snaps = await getDocs(q);
  if (snaps.empty) return null;
  const d = snaps.docs[0];
  return normalizeProduct(d.id, d.data());
};

export const searchProducts = async ({
  term,
  category,
  brand,
  maxPrice,
  pageSize = 12,
  cursor = null,
}) => {
  const clauses = [where('active', '==', true)];
  
  // ✅ Server-side exact category match
  if (category) clauses.push(where('category', '==', category));
  if (brand) clauses.push(where('brand', '==', brand));

  let qBase = query(
    collection(db, 'products'),
    ...clauses,
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (cursor) qBase = query(qBase, startAfter(cursor));

  const snaps = await getDocs(qBase);

  let items = snaps.docs.map((d) => normalizeProduct(d.id, d.data()));

  // Text filter
  if (term && term.trim()) {
    const t = term.trim().toLowerCase();
    items = items.filter((p) =>
      (p.features || []).some((f) => String(f).toLowerCase().includes(t)) ||
      (p.category || '').toLowerCase().includes(t) ||
      (p.brand || '').toLowerCase().includes(t) ||
      (p.title || '').toLowerCase().includes(t)
    );
  }

  // Client-side price cap filter to handle mixed Price/price schema
  if (typeof maxPrice === 'number') {
    items = items.filter((p) => typeof p.price === 'number' && p.price <= maxPrice);
  }

  // ✅ CLIENT-SIDE case-insensitive category filter as backup
  // This ensures products match even if casing differs
  if (category) {
    const categoryLower = category.toLowerCase();
    items = items.filter((p) => (p.category || '').toLowerCase() === categoryLower);
  }

  const lastDoc = snaps.docs[snaps.docs.length - 1] || null;
  return { items, nextCursor: lastDoc };
};

export const listProductsPaged = async ({ pageSize = 20, startAfterCreatedAt = null }) => {
  let qBase = query(
    collection(db, 'products'),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (startAfterCreatedAt) {
    qBase = query(qBase, startAfter(startAfterCreatedAt));
  }

  const snaps = await getDocs(qBase);
  const items = snaps.docs.map((d) => normalizeProduct(d.id, d.data()));

  const last = snaps.docs[snaps.docs.length - 1] || null;
  return { items, nextCursor: last ? last.data().createdAt : null };
};

export const adminCreateProduct = async (uid, product) => {
  await requireAdmin(uid);

  const now = serverTimestamp();
  // Canonical payload in lowercase keys
  const payload = {
    title: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    brand: '',
    images: [],
    active: true,
    searchableKeywords: [],
    createdAt: now,
    updatedAt: now,
    ...product,
  };

  if (!payload.title || !payload.slug) throw new Error('title and slug required');

  const existing = await getProductBySlug(payload.slug);
  if (existing) throw new Error('Slug already exists');

  // Keep searchableKeywords in sync if not provided
  if (!payload.searchableKeywords?.length) {
    payload.searchableKeywords = ensureSearchableKeywords(payload);
  }

  const ref = await addDoc(collection(db, 'products'), payload);
  return { id: ref.id };
};

export const adminUpdateProduct = async (uid, productId, updates) => {
  await requireAdmin(uid);
  const ref = doc(db, 'products', productId);

  const toApply = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  // Optionally recompute searchableKeywords if relevant fields changed
  if (
    toApply.title !== undefined ||
    toApply.category !== undefined ||
    toApply.brand !== undefined ||
    toApply.tags !== undefined
  ) {
    // Fetch current to compute keywords
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const merged = { ...snap.data(), ...toApply };
      toApply.searchableKeywords = ensureSearchableKeywords(merged);
    }
  }

  await updateDoc(ref, toApply);
  return { ok: true };
};

export const adminDeleteProduct = async (uid, productId) => {
  await requireAdmin(uid);
  await deleteDoc(doc(db, 'products', productId));
  // Consider a background job/CF to remove from all carts if needed
  return { ok: true };
};

export const adminToggleActive = async (uid, productId, active) => {
  await requireAdmin(uid);
  await updateDoc(doc(db, 'products', productId), { active, updatedAt: serverTimestamp() });
  return { ok: true };
};

export const ensureSearchableKeywords = (product) => {
  const base = [
    product.title,
    product.category,
    product.brand,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .flatMap((v) => String(v).split(/\s+/));

  const uniq = Array.from(new Set(base.map((s) => s.toLowerCase())));
  return uniq;
};
