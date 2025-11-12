import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getOrderById } from '../../services/vendor';
import VendorLayout from '../../components/VendorLayout';
import { Search, Filter, X } from 'lucide-react';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const status = statusFilter === 'all' ? null : statusFilter;
      const data = await getOrders(status);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      // Update modal if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOrderClick = async (orderId) => {
    try {
      const orderDetails = await getOrderById(orderId);
      setSelectedOrder(orderDetails);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Search */}
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search orders..."
            />
          </div>

          {/* Status filter */}
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="dispatched">Dispatched</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
        )}

        {/* Orders Table */}
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => handleOrderClick(order.id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{order.totalAmount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.createdAt?.toDate().toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.createdAt?.toDate().toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'dispatched'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderClick(order.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>

            <div className="relative bg-white rounded-lg max-w-3xl w-full mx-auto">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order #{selectedOrder.id}
                </h3>

                {/* Order Status */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusUpdate(selectedOrder.id, e.target.value)
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Customer Details */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Customer Details
                  </h4>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <div className="text-sm text-gray-900">
                      {selectedOrder.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedOrder.customerEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedOrder.customerPhone}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Delivery Address
                  </h4>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <div className="text-sm text-gray-900">
                      {selectedOrder.address.street}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedOrder.address.city}, {selectedOrder.address.state}
                    </div>
                    <div className="text-sm text-gray-500">
                      PIN: {selectedOrder.address.pincode}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Order Items
                  </h4>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Item
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.title}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              ₹{item.price * item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100">
                        <tr>
                          <td
                            colSpan="2"
                            className="px-4 py-2 text-sm font-medium text-gray-900"
                          >
                            Total
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                            ₹{selectedOrder.totalAmount}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500">
                  <div>
                    Created:{' '}
                    {selectedOrder.createdAt?.toDate().toLocaleString()}
                  </div>
                  {selectedOrder.updatedAt && (
                    <div>
                      Last Updated:{' '}
                      {selectedOrder.updatedAt.toDate().toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}