import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useDevice } from '../../components/shared/DeviceProvider.jsx';
import {
  ShoppingCart,
  Package,
  Search,
  AlertTriangle,
  Clock,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import api from '../../api/lib/api.js';

const StaffDashboard = () => {
  const { logout, userRole } = useAuth();
  const { isMobile, isTablet } = useDevice();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nearExpiryItems, setNearExpiryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearExpiryItems();
  }, []);

  const fetchNearExpiryItems = async () => {
    try {
      const response = await api.get('/inventory/near-expiry');
      setNearExpiryItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching near expiry items:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, path: '/pos' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
    { id: 'search', label: 'Search Products', icon: Search, path: '/inventory' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} inset-y-0 left-0 z-50
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        transition-transform duration-300 ease-in-out
        w-64 bg-white shadow-lg border-r border-gray-200
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Staff Panel</h2>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <item.icon className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-gray-700">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mr-3 p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900">Staff Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span className="capitalize">{userRole}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                    <p className="text-2xl font-bold text-gray-900">₱0.00</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Items in Stock</p>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Near Expiry</p>
                    <p className="text-2xl font-bold text-gray-900">{nearExpiryItems.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Near Expiry Alert */}
            {nearExpiryItems.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-medium text-yellow-800">Near Expiry Alert</h3>
                </div>
                <div className="space-y-2">
                  {nearExpiryItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-yellow-700">
                        Expires: {item.expiry_date} ({item.quantity} left)
                      </span>
                    </div>
                  ))}
                </div>
                {nearExpiryItems.length > 5 && (
                  <p className="text-sm text-yellow-700 mt-2">
                    And {nearExpiryItems.length - 5} more items...
                  </p>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/pos')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Start Transaction</p>
                    <p className="text-sm text-gray-600">Process customer orders</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/inventory')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="h-8 w-8 text-green-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Check Inventory</p>
                    <p className="text-sm text-gray-600">View stock levels</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/inventory')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search className="h-8 w-8 text-purple-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Search Products</p>
                    <p className="text-sm text-gray-600">Find items quickly</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;