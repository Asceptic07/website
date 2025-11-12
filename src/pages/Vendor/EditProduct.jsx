import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { updateProduct, getProducts } from '../../services/vendor';
import { uploadImage } from '../../services/uploader';
import VendorLayout from '../../components/VendorLayout';
import { Image, Plus, X } from 'lucide-react';


export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIndices, setRemovedImageIndices] = useState([]);


  const [formData, setFormData] = useState({
    title: '',
    price: '',
    discount: 0,
    category: '',
    stock: '',
    features: [], // ✅ Changed from description to features
    specifications: {}, // ✅ Changed from specs to specifications
  });


  useEffect(() => {
    fetchProductDetails();
  }, [id]);


  const fetchProductDetails = async () => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);


      if (!docSnap.exists()) {
        setError('Product not found');
        setPageLoading(false);
        return;
      }


      const productData = docSnap.data();
      setFormData({
        title: productData.title || '',
        price: productData.price || '',
        discount: productData.discount || 0,
        category: productData.category || '',
        stock: productData.stock || '',
        features: productData.features || [], // ✅ Load features
        specifications: productData.specifications || {}, // ✅ Load specifications
      });


      setExistingImages(productData.images || []);
      setImageUrls(productData.images || []);
      setPageLoading(false);
    } catch (err) {
      setError('Failed to load product: ' + err.message);
      setPageLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleFeatureChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) => (i === index ? value : feature)),
    }));
  };


  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };


  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };


  const handleSpecificationChange = (e, index) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value,
      },
    }));
  };


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);


    const newUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newUrls]);
  };


  const removeImage = (index) => {
    if (index < existingImages.length) {
      setRemovedImageIndices((prev) => [...prev, index]);
    }

    setImageUrls((prev) => prev.filter((_, i) => i !== index));

    const newImageStartIndex = existingImages.length;
    if (index >= newImageStartIndex) {
      const fileIndex = index - newImageStartIndex;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    try {
      const validFeatures = formData.features.filter(f => f.trim() !== '');
      if (validFeatures.length === 0) {
        setError('Please add at least one key feature');
        setLoading(false);
        return;
      }


      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((file) => uploadImage(file));
        uploadedUrls = await Promise.all(uploadPromises);
      }


      const finalImages = existingImages
        .filter((_, index) => !removedImageIndices.includes(index))
        .concat(uploadedUrls);


      const updateData = {
        title: formData.title,
        price: Number(formData.price),
        discount: Number(formData.discount),
        category: formData.category,
        stock: Number(formData.stock),
        features: validFeatures, // ✅ Updated
        specifications: formData.specifications, // ✅ Updated
        images: finalImages,
      };


      await updateProduct(id, updateData);
      navigate('/vendor/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (pageLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </VendorLayout>
    );
  }


  return (
    <VendorLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Edit Product
        </h1>


        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  <option value="Electric Kettle">Electric Kettle</option>
                  <option value="Burner">Burner</option>
                  <option value="Mixer Grinder">Mixer Grinder</option>
                  <option value="Lunch Box">Lunch Box</option>
                  <option value="Water Bottle">Water Bottle</option>
                  <option value="Electric Iron">Electric Iron</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
          </div>


          {/* Key Features - ✅ ADDED */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Key Features
              </h2>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Plus className="-ml-1 mr-1 h-4 w-4" />
                Add Feature
              </button>
            </div>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="e.g., 1.8L Capacity, Power Indicator"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-sm text-gray-500">No features added yet. Click "Add Feature" to add one.</p>
              )}
            </div>
          </div>


          {/* Product Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Product Images
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 flex-wrap">
                <label className="flex items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-red-500">
                  <div className="space-y-1 text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">Add Image</div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt=""
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                You have {imageUrls.length} image(s). Add or remove as needed.
              </p>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Specifications
              </h2>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    specifications: { ...prev.specifications, [specKey]: '' },
                  }));
                }}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Plus className="-ml-1 mr-1 h-4 w-4" />
                Add Spec
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(formData.specifications).map(([key, value], index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-center">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const specs = Object.entries(formData.specifications);
                      const newSpecs = {};
                      specs.forEach(([k, v], i) => {
                        if (i === index) {
                          newSpecs[newKey] = v;
                        } else {
                          newSpecs[k] = v;
                        }
                      });
                      setFormData((prev) => ({
                        ...prev,
                        specifications: newSpecs,
                      }));
                    }}
                    placeholder="Key (e.g., Material, Color)"
                    className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          specifications: {
                            ...prev.specifications,
                            [key]: e.target.value,
                          },
                        }));
                      }}
                      placeholder="Value (e.g., Stainless Steel)"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const { [key]: _, ...rest } = formData.specifications;
                        setFormData((prev) => ({
                          ...prev,
                          specifications: rest,
                        }));
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
}
