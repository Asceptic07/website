import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Home,
  Grid3X3,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { searchProducts } from '../services/products.js';


const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);


  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user, isAuthenticated } = useUser();


  const searchTimeout = useRef(null);

  // Check if current page is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';


  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);


  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);


    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }


    if (query.trim().length > 0) {
      setLoadingSuggestions(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const result = await searchProducts({ term: query.trim(), pageSize: 10 });
          setSearchSuggestions(result.items || []);
        } catch (err) {
          console.error('Error fetching search suggestions:', err);
          setSearchSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
          setShowSuggestions(true);
        }
      }, 300); // debounce 300ms
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
      setLoadingSuggestions(false);
    }
  };


  const handleSearchKeyDown = (e) => {
    if (!showSuggestions) return;


    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < searchSuggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(searchSuggestions[highlightedIndex]);
        } else if (searchQuery.trim()) {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };


  const handleSuggestionClick = (product) => {
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    navigate(`/product/${product.id}`);
  };


  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    handleSearchSubmit();
  };


  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };


  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    navigate(path);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100);
  };


  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    };
    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);


  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };


  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/category', icon: Grid3X3 },
    { name: 'Cart', path: '/cart', icon: ShoppingCart },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Help & Support', path: '/help', icon: HelpCircle },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-3 group hover:opacity-90 transition-opacity cursor-pointer"
              aria-label="Logo and Home"
            >
              <img
                src="/logo-ajeet.jpg"
                alt="Ajeet Home Appliances Logo"
                className="h-12 w-auto object-contain max-w-[60px] sm:max-w-none"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">Ajeet Home Appliances</h1>
                <p className="text-xs text-slate-500 -mt-1">Quality Home Solutions</p>
              </div>
            </button>


            {/* Enhanced Search Bar - Desktop (HIDDEN on Auth Pages) */}
            {!isAuthPage && (
              <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-1 max-w-lg mx-8 relative"
                onClick={(e) => e.stopPropagation()}
                role="search"
              >
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for home appliances..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    className="input pl-10 pr-10 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    aria-autocomplete="list"
                    aria-controls="search-suggestions-list"
                    aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}


                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div
                      id="search-suggestions-list"
                      role="listbox"
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-80 overflow-y-auto z-50"
                    >
                      {loadingSuggestions && (
                        <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                      )}
                      {!loadingSuggestions &&
                        searchSuggestions.map((product, index) => (
                          <div
                            key={product.id}
                            id={`suggestion-${index}`}
                            role="option"
                            aria-selected={highlightedIndex === index}
                            onClick={() => handleSuggestionClick(product)}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0 ${
                              index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <img
                              src={product.images && product.images[0] ? product.images[0] : product.image}
                              alt={product.title || product.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate text-sm">
                                {highlightMatch(product.title || product.name, searchQuery)}
                              </h4>
                              <p className="text-xs text-slate-600">
                                {highlightMatch(product.categoryName || product.category, searchQuery)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-blue-600">
                                  ₹{product.price?.toLocaleString()}
                                </span>
                                {product.badge && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          </div>
                        ))}


                      {/* View All Results Option */}
                      {!loadingSuggestions && (
                        <div
                          onClick={handleSearchSubmit}
                          className="flex items-center justify-center gap-2 p-3 text-blue-600 hover:bg-blue-50 cursor-pointer font-medium transition-colors border-t border-slate-100"
                        >
                          <Search className="w-4 h-4" />
                          View all results for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}


                  {/* No Results Message */}
                  {showSuggestions && searchSuggestions.length === 0 && !loadingSuggestions && searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-6 text-center z-50">
                      <div className="text-slate-500">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No products found</p>
                        <p className="text-sm">Try searching for different keywords</p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}


            {/* Right Side Actions (HIDDEN on Auth Pages) */}
            {!isAuthPage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigation('/cart')}
                  className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {getTotalItems()}
                    </span>
                  )}
                </button>


                {/* Login Button - Only shows when NOT authenticated */}
                {!isAuthenticated && (
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
                    aria-label="Login"
                  >
                    Login
                  </button>
                )}


                {/* Profile Section - Only shows when authenticated */}
                {isAuthenticated && (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      aria-label="User Profile"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <span className="hidden lg:block text-sm font-medium text-slate-700">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>


                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 card rounded-xl shadow-xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => handleNavigation('/profile')}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </button>
                          <button
                            onClick={() => handleNavigation('/help')}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                          >
                            <HelpCircle className="w-4 h-4" />
                            Help & Support
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  aria-label="Menu Toggle"
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>
            )}

            {/* Logo Only (Show on Auth Pages) */}
            {isAuthPage && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Menu Toggle"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-slate-600" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-600" />
                )}
              </button>
            )}
          </div>
        </div>


        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-white/20">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`nav-link ${isActive ? 'active' : ''} w-full text-left`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.path === '/cart' && getTotalItems() > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>


      {/* Main Content */}
      <main className="flex-1">{children}</main>


      {/* Footer */}
      <footer className="mt-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center p-1">
                  <img
                    src="/logo-ajeet.jpg"
                    alt="Ajeet Home Appliances Logo"
                    className="h-full w-full object-contain opacity-90"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ajeet Home Appliances</h3>
                  <p className="text-sm text-slate-400">Quality Home Solutions</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Your trusted partner for quality home appliances. We bring comfort and convenience to your daily life with premium kitchen and home solutions.
              </p>
            </div>


            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className="block text-slate-400 hover:text-white text-sm transition-colors text-left"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>


            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@ajeethome.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 9871775388</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Serving Delhi NCR</span>
                </div>
                <p>Hours: Mon-Sat, 9 AM - 7 PM</p>
              </div>
            </div>


            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                  <div
                    key={social}
                    className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="text-xs">{social[0]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-500">Quality • Service • Trust</p>
              </div>
            </div>
          </div>


          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Ajeet Home Appliances. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default Layout;
