import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import VendorLayout from '../../components/VendorLayout';
import { ArrowLeft, Edit, Package, DollarSign, Tag, FileText, Grid3X3, CheckCircle } from 'lucide-react';


export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchProductDetails();
  }, [id]);


  const fetchProductDetails = async () => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);


      if (!docSnap.exists()) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      console.log('Product data from Firebase:', data);
      console.log('Description:', data.description);
      console.log('Features:', data.features);
      console.log('Specifications:', data.specifications);

      setProduct({
        id: docSnap.id,
        ...data,
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load product: ' + err.message);
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </VendorLayout>
    );
  }


  if (error || !product) {
    return (
      <VendorLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error || 'Product not found'}</p>
            <button
              onClick={() => navigate('/vendor/products')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }


  return (
    <VendorLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vendor/products')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Product Details</h1>
              <p className="text-sm text-gray-500 mt-1">View complete product information</p>
            </div>
          </div>
          <Link
            to={`/vendor/products/edit/${id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Link>
        </div>


        {/* Product Images */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No images available
              </div>
            )}
          </div>
        </div>


        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-500">
                <FileText className="w-4 h-4 mr-2" />
                Product Name
              </label>
              <p className="text-lg font-semibold text-gray-900">{product.title}</p>
            </div>


            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-500">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Category
              </label>
              <p className="text-lg font-semibold text-gray-900">{product.category}</p>
            </div>


            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-500">
                <DollarSign className="w-4 h-4 mr-2" />
                Price
              </label>
              <p className="text-lg font-semibold text-gray-900">₹{product.price?.toLocaleString()}</p>
            </div>


            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-500">
                <Tag className="w-4 h-4 mr-2" />
                Discount
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {product.discount > 0 ? `${product.discount}%` : 'No discount'}
              </p>
            </div>


            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-500">
                <Package className="w-4 h-4 mr-2" />
                Stock
              </label>
              <p className="text-lg font-semibold text-gray-900">{product.stock} units</p>
            </div>


            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  product.stock > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Features */}
        {product.features && product.features.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-900">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Specifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Specifications</h2>
          {product.specifications && Object.keys(product.specifications).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex items-start border-b border-gray-100 pb-3 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700 min-w-[150px]">{key}:</span>
                  <span className="text-sm text-gray-900 flex-1">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No specifications added for this product</p>
          )}
        </div>


        {/* Metadata */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Product ID:</span>
              <span className="ml-2 font-mono text-gray-900">{product.id}</span>
            </div>
            {product.createdAt && (
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(product.createdAt.toDate()).toLocaleDateString()}
                </span>
              </div>
            )}
            {product.updatedAt && (
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(product.updatedAt.toDate()).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
