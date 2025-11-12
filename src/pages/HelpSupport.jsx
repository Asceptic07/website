import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, Mail, MessageCircle, Clock, HelpCircle } from 'lucide-react';

const HelpSupport = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I place an order?",
      answer: "To place an order, browse our products, add items to your cart, and proceed to checkout. You can pay using various payment methods including credit/debit cards, UPI, and cash on delivery."
    },
    {
      id: 2,
      question: "What are the delivery charges?",
      answer: "We offer free delivery on orders above ₹999. For orders below ₹999, a delivery charge of ₹50 applies. Delivery is available across all Tier-2 and Tier-3 cities we serve."
    },
    {
      id: 3,
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-5 business days. For express delivery (available in select cities), orders are delivered within 1-2 business days. You'll receive tracking information once your order is shipped."
    },
    {
      id: 4,
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all products. Items must be in original condition with packaging. Defective products can be returned within 7 days for immediate replacement or refund."
    },
    {
      id: 5,
      question: "Do you provide warranty on products?",
      answer: "Yes, all our products come with manufacturer warranty. Warranty period varies by product - typically 1-2 years for electrical appliances. Warranty details are mentioned on each product page."
    },
    {
      id: 6,
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via SMS and email. You can track your order status in the 'My Orders' section of your profile or use the tracking link provided."
    },
    {
      id: 7,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI payments, net banking, digital wallets, and cash on delivery. All online payments are processed securely through encrypted gateways."
    },
    {
      id: 8,
      question: "Can I cancel my order?",
      answer: "Yes, you can cancel your order before it's shipped. Once shipped, you can return the product as per our return policy. Refunds for cancelled orders are processed within 3-5 business days."
    },
    {
      id: 9,
      question: "Do you have physical stores?",
      answer: "Currently, we operate online only to serve customers across Tier-2 and Tier-3 cities efficiently. However, we have authorized service centers in major cities for warranty and repair services."
    },
    {
      id: 10,
      question: "How do I contact customer support?",
      answer: "You can reach us through phone (1800-123-4567), email (support@kitchenpro.com), or live chat. Our support team is available Monday to Saturday, 9 AM to 7 PM."
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      contact: "1800-123-4567",
      availability: "Mon-Sat, 9 AM - 7 PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your queries via email",
      contact: "support@kitchenpro.com",
      availability: "Response within 24 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available on website",
      availability: "Mon-Sat, 9 AM - 7 PM"
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="text-purple-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Help & Support</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're here to help! Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        {/* Contact Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-purple-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{method.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                  <p className="font-semibold text-purple-600 mb-2">{method.contact}</p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {method.availability}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="bg-white rounded-lg shadow-md">
            {faqs.map((faq, index) => (
              <div key={faq.id} className={`${index !== faqs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                  {openFaq === faq.id ? (
                    <ChevronUp className="text-purple-600 flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                </button>
                
                {openFaq === faq.id && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Additional Help */}
        <section className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="mb-6 opacity-90">
            Can't find what you're looking for? Our customer support team is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Live Chat
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Call Support
            </button>
          </div>
        </section>

        {/* Service Hours */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Our customer support team is available Monday to Saturday, 9:00 AM to 7:00 PM (IST)
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;