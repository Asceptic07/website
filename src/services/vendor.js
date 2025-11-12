import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';

// Products Management
export const getProducts = async (pageSize = 10, startAfterDoc = null) => {
  try {
    let q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Failed to fetch products: ' + error.message);
  }
};

export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Failed to add product: ' + error.message);
  }
};

export const updateProduct = async (productId, updates) => {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to update product: ' + error.message);
  }
};

export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    throw new Error('Failed to delete product: ' + error.message);
  }
};

// Orders Management
export const getOrders = async (status = null, pageSize = 10, startAfterDoc = null) => {
  try {
    let q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    if (pageSize) {
      q = query(q, limit(pageSize));
    }

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Failed to fetch orders: ' + error.message);
  }
};

export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Order not found');
    }
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    throw new Error('Failed to fetch order: ' + error.message);
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to update order status: ' + error.message);
  }
};

// Dashboard Metrics
export const getDashboardMetrics = async () => {
  try {
    // Get total products
    const productsSnap = await getDocs(collection(db, 'products'));
    const totalProducts = productsSnap.size;

    // Get orders by status
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const orders = ordersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const dispatchedOrders = orders.filter(order => order.status === 'dispatched').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

    // Get low stock products (less than 3 items)
    const lowStockProducts = productsSnap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(product => product.stock < 3)
      .length;

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())
      .slice(0, 5);

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      dispatchedOrders,
      deliveredOrders,
      lowStockProducts,
      recentOrders,
    };
  } catch (error) {
    throw new Error('Failed to fetch dashboard metrics: ' + error.message);
  }
};