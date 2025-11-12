import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVendor } from '../context/VendorContext';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function VendorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { signOut } = useVendor();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/vendor');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/vendor/dashboard',
      icon: LayoutGrid,
      current: location.pathname === '/vendor/dashboard',
    },
    {
      name: 'Products',
      href: '/vendor/products',
      icon: Package,
      current: location.pathname === '/vendor/products',
    },
    {
      name: 'Orders',
      href: '/vendor/orders',
      icon: ShoppingCart,
      current: location.pathname === '/vendor/orders',
    },
  ];

  return (
    <div>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-white border-b md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 hover:text-gray-600"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <div className="text-lg font-semibold text-red-600">Vendor Dashboard</div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <span className="text-xl font-bold text-red-600">Ajeet Home</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-red-600' : 'text-gray-400'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <div className="pt-16 md:pt-0">
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}