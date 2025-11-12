// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback, useRef } from 'react';
import { useUser } from './UserContext';
import {
  addToCart as fbAddToCart,
  updateCartQty as fbUpdateCartQty,
  removeFromCart as fbRemoveFromCart,
  getCartItems as fbGetCartItems,
} from '../services/cart.js';


// Local item shape: { id, title, price, quantity, image, ... }
// Firestore item shape: { id: productId, productId, qty, priceAtAdd }
const CartContext = createContext(null);


const initialState = { items: [], hydrated: false, syncing: false };


// Action types
const types = {
  HYDRATE: 'HYDRATE',
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  SET_QTY: 'SET_QTY',
  START_SYNC: 'START_SYNC',
  END_SYNC: 'END_SYNC',
  CLEAR: 'CLEAR',
};


const cartReducer = (state, action) => {
  switch (action.type) {
    case types.HYDRATE: {
      return { ...state, items: action.payload, hydrated: true };
    }
    case types.START_SYNC:
      return { ...state, syncing: true };
    case types.END_SYNC:
      return { ...state, syncing: false };
    case types.ADD: {
      const incoming = action.payload; // { id, title, price, image, ... }
      const existing = state.items.find((i) => i.id === incoming.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === incoming.id ? { ...i, quantity: i.quantity + (incoming.quantity || 1) } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...incoming, quantity: incoming.quantity || 1 }],
      };
    }
    case types.REMOVE: {
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    }
    case types.SET_QTY: {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== id) };
      }
      return {
        ...state,
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      };
    }
    case types.CLEAR:
      return { ...state, items: [] };
    default:
      return state;
  }
};


export const CartProvider = ({ children }) => {
  const [{ items, hydrated, syncing }, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useUser();
  const mergingRef = useRef(false);


  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isAuthenticated) {
      if (items.length > 0) {
        localStorage.setItem('guestCart', JSON.stringify(items));
      } else {
        localStorage.removeItem('guestCart');
      }
    }
  }, [items, isAuthenticated]);


  // Helpers
  const getTotalPrice = useCallback(() => {
    // Prefer priceAtAdd if present; fallback to price
    return items.reduce((total, i) => {
      const price = typeof i.priceAtAdd === 'number' ? i.priceAtAdd : i.price || 0;
      return total + price * i.quantity;
    }, 0);
  }, [items]);


  const getTotalItems = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);


  // Convert Firestore cart items to local shape
  const mapFromFirestore = useCallback((docs) => {
    // fbGetCartItems returns [{ id, productId, qty, priceAtAdd, ... }]
    return docs.map((d) => ({
      id: d.productId || d.id, // ensure productId is used as id
      quantity: d.qty || 1,
      priceAtAdd: d.priceAtAdd,
      title: '',
      image: '',
      price: d.priceAtAdd, 
      // Optional UI fields may be enriched client-side if product data is available
    }));
  }, []);


  // Load Firestore cart on auth ready
  useEffect(() => {
    let cancelled = false;


    const hydrate = async () => {
      if (!isAuthenticated || !user?.uid) {
        // For guests, restore from localStorage if available
        if (!hydrated) {
          const savedCart = localStorage.getItem('guestCart');
          const guestItems = savedCart ? JSON.parse(savedCart) : [];
          dispatch({ type: types.HYDRATE, payload: guestItems });
        }
        return;
      }


      try {
        const fbItems = await fbGetCartItems(user.uid);
        if (cancelled) return;


        const mapped = mapFromFirestore(fbItems);

        const { getProductById } = await import('../services/products');

        for (let i = 0; i < mapped.length; i++) {
          const productId = mapped[i].id;
          try {
            const product = await getProductById(productId);
            if (product) {
              mapped[i].title = product.title;
              mapped[i].image = product.images?.[0] || '';
              mapped[i].brand = product.brand;
              mapped[i].stock = product.stock;
            }
          } catch (err) {
            console.warn('Failed to load product', productId);
          }
        }
        
        // Get guest cart items from localStorage
        const savedGuestCart = localStorage.getItem('guestCart');
        const guestItems = savedGuestCart ? JSON.parse(savedGuestCart) : [];
        
        // Merge: combine Firestore items with guest items
        let mergedItems = [...mapped];
        
        if (guestItems.length > 0 && !mergingRef.current) {
          mergingRef.current = true;
          
          // For each guest item, add to Firestore and merged cart
          for (const guestItem of guestItems) {
            const existingIndex = mergedItems.findIndex(i => i.id === guestItem.id);
            
            if (existingIndex >= 0) {
              // If item already in Firestore, add guest quantity to it
              const newQty = mergedItems[existingIndex].quantity + guestItem.quantity;
              mergedItems[existingIndex].quantity = newQty;
              await fbUpdateCartQty(user.uid, guestItem.id, newQty);
            } else {
              // If new item, add to Firestore
              mergedItems.push(guestItem);
              await fbAddToCart(user.uid, guestItem.id, guestItem.quantity);
            }
          }
          
          // Clear localStorage guest cart after merging
          localStorage.removeItem('guestCart');
        }


        dispatch({ type: types.HYDRATE, payload: mergedItems });
      } catch (e) {
        // On failure, still try to restore guest cart
        const savedGuestCart = localStorage.getItem('guestCart');
        const guestItems = savedGuestCart ? JSON.parse(savedGuestCart) : [];
        dispatch({ type: types.HYDRATE, payload: guestItems });
      } finally {
        mergingRef.current = false;
      }
    };


    hydrate();
    return () => {
      cancelled = true;
    };
    // Intentionally include items so guest cart merges on first login
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.uid]);


  // Local + Firestore add
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (product.stock !== undefined && quantity > product.stock) {
        alert('Cannot add more than available stock.');
        return;
      }
      dispatch({ type: types.ADD, payload: { ...product, quantity } });
      if (isAuthenticated && user?.uid) {
        dispatch({ type: types.START_SYNC });
        try {
          await fbAddToCart(user.uid, product.id, quantity);
        } catch (error) {
          alert(error.message || 'Failed to add to cart.');
          // Optionally revert local count here if needed
        } finally {
          dispatch({ type: types.END_SYNC });
        }
      }
    },
    [isAuthenticated, user?.uid]
  );


  // Local + Firestore remove
  const removeFromCart = useCallback(
    async (productId) => {
      dispatch({ type: types.REMOVE, payload: productId });
      if (isAuthenticated && user?.uid) {
        dispatch({ type: types.START_SYNC });
        try {
          await fbRemoveFromCart(user.uid, productId);
        } finally {
          dispatch({ type: types.END_SYNC });
        }
      }
    },
    [isAuthenticated, user?.uid]
  );


  // Local + Firestore quantity set
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      const item = items.find(i => i.id === productId);
      if (!item) return;
      if (item.stock !== undefined && quantity > item.stock) {
        alert('Quantity exceeds available stock.');
        return;
      }
      dispatch({ type: types.SET_QTY, payload: { id: productId, quantity } });
      if (isAuthenticated && user?.uid) {
        dispatch({ type: types.START_SYNC });
        try {
          await fbUpdateCartQty(user.uid, productId, quantity);
        } catch (error) {
          alert(error.message || 'Failed to update quantity.');
          // Optionally revert local quantity here if needed
        } finally {
          dispatch({ type: types.END_SYNC });
        }
      }
    },
    [isAuthenticated, user?.uid, items]
  );


  const clearLocal = useCallback(() => {
    dispatch({ type: types.CLEAR });
    localStorage.removeItem('guestCart');
  }, []);


  const value = useMemo(
    () => ({
      items,
      hydrated,
      syncing,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotalPrice,
      getTotalItems,
      clearLocal,
    }),
    [items, hydrated, syncing, addToCart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearLocal]
  );


  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};
