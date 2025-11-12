import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';


const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');


  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };


  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };


  // Check if profile is complete
  const isProfileComplete = () => {
    return (
      user?.name &&
      user?.email &&
      user?.phone &&
      user?.address?.street &&
      user?.address?.city &&
      user?.address?.state &&
      user?.address?.pincode
    );
  };


  // Handle Proceed to Checkout
  const handleCheckout = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setValidationMessage('Please login to proceed with checkout');
      setShowValidationModal(true);
      return;
    }

    // Check if profile is complete
    if (!isProfileComplete()) {
      setValidationMessage('Please complete your profile with name, phone, and delivery address before checkout');
      setShowValidationModal(true);
      return;
    }

    // ✅ ACTUALLY navigate to checkout
    navigate('/checkout');
};



  const deliveryCharge = getTotalPrice() > 999 ? 0 : 50;
  const finalTotal = getTotalPrice() + deliveryCharge;


  if (items.length === 0) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <a href="/" className="btn btn-primary">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <span className="text-lg text-gray-600">{getTotalItems()} items</span>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {items.map((item, index) => (
                <div key={item.id} className={`p-6 ${index !== items.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-start space-x-4">
                    {/* Product Image - FIXED */}
                    <div className="flex-shrink-0">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name || item.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || item.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.name || item.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.features && item.features.slice(0, 2).join(' • ')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">₹{(item.price || 0).toLocaleString()}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">₹{item.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="mt-4 text-right">
                    <span className="text-lg font-semibold">
                      Subtotal: ₹{((item.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-semibold">₹{getTotalPrice().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className={`font-semibold ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                
                {deliveryCharge > 0 && (
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    💡 Add ₹{(1000 - getTotalPrice()).toLocaleString()} more to get FREE delivery!
                  </p>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="btn btn-primary w-full mb-4 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
              
              <div className="text-center">
                <a href="/category" className="text-purple-600 hover:text-purple-800 text-sm">
                  Continue Shopping
                </a>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Easy Returns & Exchange</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Quality Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-800">Action Required</h3>
            </div>
            
            <p className="text-gray-600 mb-6">{validationMessage}</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowValidationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    navigate('/profile');
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {!isAuthenticated ? 'Login' : 'Complete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Cart;
