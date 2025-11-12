import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
  CheckCircle,
  Minus,
  Plus,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductById, searchProducts } from '../services/products.js';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const prod = await getProductById(id);
        if (!prod) {
          navigate('/category');
          return;
        }
        setProduct(prod);

        // Fetch related products by category, excluding current product
        const related = await searchProducts({
          category: prod.category,
          pageSize: 5,
        });
        const filteredRelated = (related.items || []).filter(p => p.id !== id).slice(0, 3);
        setRelatedProducts(filteredRelated);

        // Reset selected image index on product load
        setSelectedImage(0);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/category');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h2>
          <Link to="/category" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
          <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/category" className="hover:text-red-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-slate-900">{product.title || product.name}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-white/20">
              <img
                src={product.images && product.images[selectedImage] ? product.images[selectedImage] : ''}
                alt={product.title || product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {product.badge}
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title || product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-slate-600 mb-2">{product.brand}</div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.title || product.name}</h1>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-slate-900">
                  ₹{product.price?.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-slate-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discount && (
                  <span className="text-lg font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-600">
                You save ₹{(product.originalPrice - product.price).toLocaleString()}
              </div>
            </div>

            {/* Bank Offers */}
            {product.bankOffers && product.bankOffers.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Bank Offers
                </h3>
                <div className="space-y-2">
                  {product.bankOffers.map((offer, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {offer}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            {product.deliveryInfo && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-slate-700">Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700">{product.deliveryInfo.returnPolicy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-slate-700">Warranty Included</span>
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                    className="p-2 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= (product.stock || 999)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Stock indicator */}
                <span className="text-sm text-slate-600">
                  {product.stock && product.stock > 0 ? (
                    product.stock <= 5 ? (
                      <span className="text-orange-600 font-medium">
                        Only {product.stock} left in stock!
                      </span>
                    ) : (
                      <span className="text-green-600">In Stock</span>
                    )
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={!product.stock || product.stock === 0}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {product.stock && product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock === 0}
                  className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              <div className="flex justify-center">
                <button className="btn btn-secondary px-8">
                  <Share2 className="w-4 h-4" />
                  Share Product
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            {/* Key Features - Now Main Heading */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Features</h2>
              <div className="space-y-3">
                {product.features && product.features.length > 0 ? (
                  product.features.map((feature, index) => (
                    <div key={index} className="flex gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No features available for this product.</p>
                )}
              </div>
            </div>


            {/* Specifications */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Specifications</h2>
              <div className="space-y-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100 last:border-0">
                    <div className="text-sm font-medium text-slate-700 sm:w-1/3 mb-1 sm:mb-0">{key}</div>
                    <div className="text-sm text-slate-900 sm:w-2/3">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery & Support Info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Delivery Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-slate-700">Estimated delivery: {product.deliveryInfo?.estimatedDelivery}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-slate-700">Free delivery on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700">{product.deliveryInfo?.returnPolicy}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Customer Support</h3>
              <div className="space-y-3 text-sm text-slate-700">
                <p>Need help? Our customer support team is here to assist you.</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>+91 9871775388</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>info@ajeethome.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Hours:</span>
                  <span>Mon-Sat, 9 AM - 7 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relProd) => (
                <div key={relProd.id} className="product-card group">
                  {relProd.badge && (
                    <div className="product-badge">{relProd.badge}</div>
                  )}
                  <Link to={`/product/${relProd.id}`} className="block h-full flex-col">
                    <div className="product-image-container">
                      {relProd.images && relProd.images[0] ? (
                        <img
                          src={relProd.images[0]}
                          alt={relProd.title || relProd.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="product-info-container">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                          {relProd.title || relProd.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            ₹{relProd.price?.toLocaleString()}
                          </span>
                          {relProd.originalPrice && (
                            <span className="text-sm text-slate-500 line-through">
                              ₹{relProd.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {relProd.discount && (
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              {relProd.discount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>


                  <div className="product-buttons-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(relProd);
                        navigate('/cart');
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Buy Now
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(relProd);
                      }}
                      className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
