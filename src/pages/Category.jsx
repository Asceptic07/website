import React, { useState, useEffect, useMemo } from 'react';
import { Grid, List, Search, SlidersHorizontal, X, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { searchProducts } from '../services/products.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Category = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceSlab, setSelectedPriceSlab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add allProducts state and its fetch effect
  const [allProducts, setAllProducts] = useState([]);
  
  useEffect(() => {
    (async () => {
      const response = await searchProducts({
        term: '',
        category: undefined,
        maxPrice: undefined,
        pageSize: 1000
      });
      setAllProducts(response.items || []);
    })();
  }, []);

  const { addToCart, items } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const priceSlabs = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: 'under-999', label: 'Under ₹999', min: 0, max: 999 },
    { id: '1000-2999', label: '₹1000 - ₹2999', min: 1000, max: 2999 },
    { id: '3000-4999', label: '₹3000 - ₹4999', min: 3000, max: 4999 },
    { id: '5000-6999', label: '₹5000 - ₹6999', min: 5000, max: 6999 },
    { id: 'above-7000', label: 'Above ₹7000', min: 7000, max: Infinity }
  ];

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'kettles', name: 'Electric Kettle' },
    { id: 'burner', name: 'Burner' },
    { id: 'mixers', name: 'Mixer Grinder' },
    { id: 'lunchbox', name: 'Lunch Box' },
    { id: 'bottles', name: 'Water Bottle' },
    { id: 'iron', name: 'Electric Iron' }
  ];

  useEffect(() => {
    (async () => {
      const snaps = await getDocs(collection(db, 'products'));
      console.log(
        'All Firestore products with full data:',
        snaps.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    })();
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.search]);

  // Initialize filters from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const priceParam = searchParams.get('price');
    const searchParam = searchParams.get('search');

    if (categoryParam && categories.find(c => c.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
    if (priceParam && priceSlabs.find(s => s.id === priceParam)) {
      setSelectedPriceSlab(priceParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Fetch products from Firebase on filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const priceSlabObj = priceSlabs.find(slab => slab.id === selectedPriceSlab) || priceSlabs[0];
        let maxPrice = priceSlabObj.max === Infinity ? undefined : priceSlabObj.max;

        const categoryFilter = selectedCategory === 'all'
          ? undefined
          : categories.find(c => c.id === selectedCategory).name;

        const response = await searchProducts({
          term: searchQuery,
          category: categoryFilter,
          maxPrice: maxPrice,
          pageSize: 100,
        });

        console.log('searchProducts returned:', response.items);
        setProducts(response.items || []);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedPriceSlab, searchQuery]);

  // Dynamic category counts computed from allProducts (not products)
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(c => (counts[c.id] = 0));
    allProducts.forEach(p => {
      const match = categories.find(c => c.name === p.category);
      if (match) counts[match.id]++;
      counts.all++;
    });
    return counts;
  }, [allProducts, categories]);

  // Client-side filtering by price slab
  const filteredProducts = useMemo(() => {
    const priceSlabObj = priceSlabs.find(slab => slab.id === selectedPriceSlab) || priceSlabs[0];
    return products.filter(p => p.price >= priceSlabObj.min && p.price <= priceSlabObj.max);
  }, [products, selectedPriceSlab, priceSlabs]);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        sorted.sort((a, b) => {
          const da = parseInt(a.discount) || 0;
          const db = parseInt(b.discount) || 0;
          return db - da;
        });
        break;
      default: // name
        sorted.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
        break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // URL update helper
  const updateURL = (newCategory, newPriceSlab, newSearch = searchQuery) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    if (newPriceSlab && newPriceSlab !== 'all') params.set('price', newPriceSlab);
    if (newSearch && newSearch.trim() !== '') params.set('search', newSearch.trim());
    navigate(`/category${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    updateURL(catId, selectedPriceSlab, searchQuery);
  };

  const handlePriceSlabChange = (slabId) => {
    setSelectedPriceSlab(slabId);
    updateURL(selectedCategory, slabId, searchQuery);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    updateURL(selectedCategory, selectedPriceSlab, query);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceSlab('all');
    setSearchQuery('');
    setSortBy('name');
    navigate('/category', { replace: true });
  };

  const handleAddToCart = (product) => {
  const existingItem = items.find(i => i.id === product.id);
  const currentQty = existingItem ? existingItem.quantity : 0;
  if (product.stock !== undefined && currentQty + 1 > product.stock) {
    alert('Cannot add more than available stock');
    return;
  }
  addToCart(product, 1);};

  const handleBuyNow = (product) => { handleAddToCart(product); navigate('/cart'); };

  const getCategoryDisplayName = () => {
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.name : 'All Products';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
          <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900">Categories</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-slate-900">{getCategoryDisplayName()}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                {selectedCategory === 'all' ? (
                  <>Kitchen <span className="gradient-text">Appliances</span></>
                ) : (
                  <><span className="gradient-text">{getCategoryDisplayName()}</span></>
                )}
              </h1>
              <p className="text-slate-600 mt-2">
                {selectedCategory === 'all'
                  ? 'Discover our wide range of premium kitchen appliances'
                  : `Explore our collection of ${getCategoryDisplayName().toLowerCase()}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="input pl-10 pr-4 py-2 w-64"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary lg:hidden"
                aria-label="Toggle Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">
                Showing {sortedProducts.length} products
              </span>
              {(selectedCategory !== 'all' || selectedPriceSlab !== 'all' || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm font-medium text-slate-700">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input py-2 text-sm min-w-0"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Discount</option>
                </select>
              </div>

              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0 space-y-6`}>
            <div className="card p-4 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 hover:bg-slate-100 rounded"
                  aria-label="Close Filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-red-50 text-red-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-xs text-slate-400">{categoryCounts[category.id] || 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  {priceSlabs.map((slab) => (
                    <label
                      key={slab.id}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        value={slab.id}
                        checked={selectedPriceSlab === slab.id}
                        onChange={() => handlePriceSlabChange(slab.id)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 focus:ring-2"
                      />
                      <span className={`ml-3 text-sm transition-colors ${
                        selectedPriceSlab === slab.id
                          ? 'text-red-600 font-medium'
                          : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {slab.label}
                      </span>
                      {selectedPriceSlab === slab.id && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">Brand</h4>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">Ajeet Home Appliances</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">All products are from our trusted brand</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="text-center py-16 text-gray-500">Loading products...</p>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
                {sortedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={viewMode === 'grid'
                        ? 'product-card group flex flex-col h-full'
                        : 'card card-hover group flex gap-6 p-6 flex-col h-full'}
                    >
                    {viewMode === 'grid' ? (
                      <>
                        {product.badge && (
                          <div className="product-badge">
                            {product.badge}
                          </div>
                        )}
                        <div
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="block flex-1 cursor-pointer"
                        >
                          <div className="product-image-container">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title || product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                            {!product.inStock && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-medium">Out of Stock</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="product-info-container flex-shrink-0 px-4 py-2">
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                              {product.title || product.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-slate-900">
                                ₹{product.price?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        </div>
                        <div className="product-buttons-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(product);
                            }}
                            disabled={!product.inStock}
                            className={product.inStock ? "btn-buy-now inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2" : "btn btn-outline opacity-50 cursor-not-allowed"}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            {product.inStock ? 'Buy Now' : 'Out of Stock'}
                          </button>
                          {product.inStock && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className="btn-add-cart inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex gap-6 flex-1 cursor-pointer"
                        >
                          <div className="w-48 flex-shrink-0 relative">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title || product.name}
                                className="w-full h-36 rounded-xl object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-36 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                            {!product.inStock && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                <span className="text-white font-medium">Out of Stock</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                                  {product.title || product.name}
                                </h3>
                                <div className="text-xs text-slate-500">{product.brand}</div>
                              </div>
                              {product.badge && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-2xl font-bold text-slate-900">
                                ₹{product.price?.toLocaleString()}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-slate-500 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                              {product.discount && (
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                  {product.discount}
                                </span>
                              )}
                            </div>
                            {product.features && product.features.length > 0 && (
                              <div className="space-y-2">
                                {product.features.slice(0, 3).map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end justify-center min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(product);
                            }}
                            disabled={!product.inStock}
                            className={`w-full text-sm py-2 inline-flex items-center justify-center gap-1 rounded-xl px-4 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              product.inStock
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg focus:ring-red-500'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            {product.inStock ? 'Buy Now' : 'Out of Stock'}
                          </button>
                          {product.inStock && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className="w-full text-sm py-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500 inline-flex items-center justify-center gap-1 rounded-xl px-4 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
