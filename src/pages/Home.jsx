import React, { useEffect, useState, useRef } from 'react';
import { Zap, Truck, Shield, ArrowRight, ChefHat, Award, Users, ShoppingBag, ShoppingCart, Flame, Waves, Package, Droplet, UtensilsCrossed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { listProductsPaged } from '../services/products.js';

const Home = () => {
  const { addToCart, items } = useCart();
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState({ customers: 0, products: 0, cities: 0, years: 0 });
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const categories = [
    { name: 'Electric Kettles', icon: Zap, color: 'from-red-500 to-red-600' },
    { name: 'Gas Burners', icon: Flame, color: 'from-orange-500 to-orange-600' },
    { name: 'Mixer Grinders', icon: Waves, color: 'from-red-600 to-red-700' },
    { name: 'Lunch Boxes', icon: Package, color: 'from-rose-500 to-rose-600' },
    { name: 'Water Bottles', icon: Droplet, color: 'from-red-400 to-red-500' },
    { name: 'Cookware Sets', icon: UtensilsCrossed, color: 'from-amber-500 to-amber-600' }
  ];

  const stats = [
    { label: 'Happy Customers', value: 2000, icon: Users },
    { label: 'Products Sold', value: 2000, icon: Award },
    { label: 'Cities Served', value: 5, icon: Truck },
    { label: 'Years of Trust', value: 4, icon: Shield }
  ];

  // Scroll listener for stats counter
  useEffect(() => {
    const handleScroll = () => {
      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight && !statsVisible) {
          setStatsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsVisible]);

  // Animated counter effect
  useEffect(() => {
    if (!statsVisible) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounters({
        customers: Math.floor(progress * 2000),
        products: Math.floor(progress * 2000),
        cities: Math.floor(progress * 5),
        years: Math.floor(progress * 4)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [statsVisible]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { items } = await listProductsPaged({ pageSize: 3 });
        setFeaturedProducts(items);
      } catch (error) {
        console.error('Error fetching products', error);
        setFeaturedProducts([]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const existingItem = items.find(i => i.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (product.stock !== undefined && currentQty + 1 > product.stock) {
      alert('Cannot add more than available stock');
      return;
    }
    addToCart(product, 1);
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product);
    navigate('/cart');
  };

  const handleStartShopping = () => {
    navigate('/category?category=all');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleViewCategories = () => {
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      const headerOffset = 80;
      const elementPosition = categoriesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      categoriesSection.classList.add('highlight-section');
      setTimeout(() => {
        categoriesSection.classList.remove('highlight-section');
      }, 2000);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section with Floating Particles & Enhanced Blobs */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Gradient Blobs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        
        {/* Floating Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20 animate-float"
              style={{
                width: Math.random() * 40 + 10 + 'px',
                height: Math.random() * 40 + 10 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: (Math.random() * 10 + 15) + 's'
              }}
            ></div>
          ))}
        </div>
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-4xl">⚡</div>
          <div className="absolute top-32 right-20 text-5xl">🍳</div>
          <div className="absolute bottom-20 left-1/4 text-4xl">💧</div>
          <div className="absolute bottom-10 right-1/3 text-5xl">🥤</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-1 gap-12 items-center">
            <div className="text-white space-y-8 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium animate-slideInLeft">
                <Zap className="w-4 h-4" />
                Premium Kitchen Appliances
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight animate-slideInUp">
                Transform Your
                <span className="block text-yellow-300">Kitchen Today</span>
              </h1>
              <p className="text-xl text-red-100 leading-relaxed animate-slideInUp animation-delay-100">
                Discover amazing deals on premium kitchen appliances designed for modern Indian homes. Quality guaranteed, prices unmatched.
              </p>
              
              {/* Buttons - Both Fully Functional */}
              <div className="flex flex-col sm:flex-row gap-4 animate-slideInUp animation-delay-200">
                <button onClick={handleStartShopping} className="btn btn-secondary text-red-700 hover:bg-white transform transition-transform hover:scale-105">
                  <ChefHat className="w-5 h-5" />
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={handleViewCategories} className="btn btn-outline border-white text-white hover:bg-white hover:text-red-700 transition-all duration-200 transform hover:scale-105">
                  View Categories
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Badges/Pills with pulse animation */}
              <div className="flex flex-wrap gap-3 pt-4 animate-slideInUp animation-delay-300">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm animate-pulse">
                  <span className="text-lg">🚚</span>
                  <span>Free Shipping Over ₹999</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <span className="text-lg">⭐</span>
                  <span>Rated 4.8/5 by 2000+</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm animate-pulse" style={{ animationDelay: '1s' }}>
                  <span className="text-lg">✓</span>
                  <span>100% Authentic</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/20">
                <div className="animate-slideInUp">
                  <div className="text-3xl font-bold">2,000+</div>
                  <div className="text-red-200 text-sm">Happy Customers</div>
                </div>
                <div className="animate-slideInUp animation-delay-100">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-red-200 text-sm">Cities Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
              opacity: 0;
            }
            10% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.5;
            }
            90% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(-100vh) translateX(100px);
              opacity: 0;
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }

          .animate-float {
            animation: float linear infinite;
          }

          .animate-slideInLeft {
            animation: slideInLeft 0.8s ease-out;
          }

          .animate-slideInUp {
            animation: slideInUp 0.8s ease-out;
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out;
          }

          .animation-delay-100 {
            animation-delay: 0.1s;
          }

          .animation-delay-200 {
            animation-delay: 0.2s;
          }

          .animation-delay-300 {
            animation-delay: 0.3s;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </section>

      {/* Stats Section with Counter Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={statsRef}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, value: counters.customers, label: 'Happy Customers' },
            { icon: Award, value: counters.products, label: 'Products Sold' },
            { icon: Truck, value: counters.cities, label: 'Cities Served' },
            { icon: Shield, value: counters.years, label: 'Years of Trust' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="text-center space-y-3 transform transition-all duration-500 hover:scale-105 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                  {stat.label.includes('Cities') || stat.label.includes('Years') ? '' : '+'}
                </div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12 animate-fadeInUp">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Featured <span className="gradient-text">Products</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Handpicked collection of our most popular kitchen appliances with unbeatable prices and quality
          </p>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Loading featured products...</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="product-card group flex flex-col h-full animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div onClick={() => navigate(`/product/${product.id}`)} className="block flex-1 cursor-pointer">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="product-info-container flex-1 px-4 py-2">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                        {product.title || product.name}
                      </h3>
                      
                      {/* ✅ PRICE SECTION - DISCOUNT INLINE WITH STRIKETHROUGH PRICE */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-slate-900">
                          ₹{product.price?.toLocaleString()}
                        </span>
                        {product.originalPrice && product.discount && product.discount > 0 && (
                          <>
                            <span className="text-sm text-slate-500 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              {product.discount}% OFF
                            </span>
                          </>
                        )}
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
                    className="btn-buy-now inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Buy Now
                  </button>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section with Staggered Animation */}
      <section
        id="categories-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 transition-all duration-500"
      >
        <div className="text-center space-y-4 mb-12 animate-fadeInUp">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Shop by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore our wide range of kitchen appliances organized by category
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const categoryIdMap = {
              'Electric Kettles': 'kettles',
              'Gas Burners': 'burners',
              'Mixer Grinders': 'mixers',
              'Lunch Boxes': 'lunchbox',
              'Water Bottles': 'bottles',
              'Cookware Sets': 'cookware'
            };
            const categoryId = categoryIdMap[category.name];
            return (
              <Link
                key={index}
                to={`/category?category=${categoryId}`}
                className={`card card-hover group cursor-pointer text-center p-8 space-y-4 block transform transition-all duration-300 hover:scale-105 bg-gradient-to-br ${category.color} animate-fadeInUp`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <category.icon className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-red-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Section with Scroll Animation */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 animate-fadeInUp">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Why Choose <span className="gradient-text">Ajeet Home Appliances</span>?
            </h2>
          </div>
          <div className="feature-grid">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'Free delivery on orders above ₹999 across Tier-2 & Tier-3 cities' },
              { icon: Shield, title: 'Quality Guarantee', desc: 'All products come with manufacturer warranty and quality guarantee' },
              { icon: Users, title: '24/7 Support', desc: 'Fast customer service and technical support in your local language' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="card text-center p-8 space-y-4 hover-glow animate-fadeInUp transform transition-all hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="feature-icon mx-auto">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold animate-slideInUp">Ready to upgrade your kitchen?</h2>
          <p className="text-xl text-red-100 animate-slideInUp animation-delay-100">
            Join thousands of satisfied customers and transform your cooking experience today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideInUp animation-delay-200">
            <button onClick={handleStartShopping} className="btn btn-secondary text-red-700 transform transition-transform hover:scale-105">
              <ChefHat className="w-5 h-5" />
              Start Shopping
            </button>
            <button
              onClick={handleViewCategories}
              className="btn btn-outline border-white text-white hover:bg-white hover:text-red-700 transition-all duration-200 transform hover:scale-105"
            >
              View Categories
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CSS Highlight Effect */}
      <style jsx>{`
        .highlight-section {
          animation: highlightPulse 2s ease-in-out;
        }
        @keyframes highlightPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(220, 38, 38, 0.3); }
          100% { transform: scale(1); }
        }
        .scroll-mt-20 {
          scroll-margin-top: 5rem;
        }
      `}</style>
    </div>
  );
};

export default Home;
