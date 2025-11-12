import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { CreditCard, Smartphone, Landmark, ArrowLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const cartContext = useCart();
  const { user, isAuthenticated } = useUser();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Safely get cart items
  const cart = cartContext?.items || [];
  const getTotalPrice = cartContext?.getTotalPrice || (() => 0);
  const getTotalItems = cartContext?.getTotalItems || (() => 0);
  const clearCart = cartContext?.clearLocal || (() => {});

  // Redirect to login if not authenticated
  useEffect(() => {
    setIsLoading(true);
    
    if (!isAuthenticated) {
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
      return;
    }
    
    setIsLoading(false);
  }, [isAuthenticated, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
          <Link to="/category" className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Payment Method Selected:', paymentMethod);
      console.log('Cart Items:', cart);
      console.log('Total Amount:', getTotalPrice());

      setOrderPlaced(true);
      clearCart();
      
      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-xl max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Order Placed Successfully! 🎉</h2>
          <p className="text-slate-600 mb-6">Thank you for your purchase. You'll be redirected to home soon.</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Choose Payment Method</h1>
            
            <div className="space-y-4">
              {/* Net Banking */}
              <div
                onClick={() => setPaymentMethod('netbanking')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-red-600 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    paymentMethod === 'netbanking' ? 'bg-red-600' : 'bg-slate-200'
                  }`}>
                    <Landmark className={`w-6 h-6 ${paymentMethod === 'netbanking' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Net Banking</h3>
                    <p className="text-sm text-slate-600">Pay directly from your bank account</p>
                  </div>
                  {paymentMethod === 'netbanking' && (
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>

              {/* UPI */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-red-600 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    paymentMethod === 'upi' ? 'bg-red-600' : 'bg-slate-200'
                  }`}>
                    <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">UPI</h3>
                    <p className="text-sm text-slate-600">Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                  {paymentMethod === 'upi' && (
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>

              {/* Credit/Debit Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-600 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    paymentMethod === 'card' ? 'bg-red-600' : 'bg-slate-200'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Credit/Debit Card</h3>
                    <p className="text-sm text-slate-600">Visa, MasterCard, American Express</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePaymentSubmit}
              disabled={isProcessing || !paymentMethod}
              className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-400 px-6 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing Payment...
                </span>
              ) : (
                `Pay ₹${getTotalPrice().toLocaleString()}`
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart && cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.title || item.name}</p>
                        <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No items in cart</p>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900 font-medium">₹{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-red-600">₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Secure Payment
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Easy Returns & Exchange
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Quality Guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
