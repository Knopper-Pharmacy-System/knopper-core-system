import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useDevice } from '../../components/shared/DeviceProvider.jsx';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  ArrowLeft,
  Menu,
  X,
  Filter
} from 'lucide-react';
import api from '../../api/lib/api.js';

const ReportsDashboard = () => {
  const { logout, userRole } = useAuth();
  const { isMobile, isTablet } = useDevice();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      // Mock data for now - in real implementation, these would be API calls
      setReports([
        {
          id: 1,
          name: 'Sales Report',
          type: 'sales',
          period: 'January 2024',
          generatedAt: '2024-01-31',
          status: 'completed',
          downloadUrl: '#'
        },
        {
          id: 2,
          name: 'Inventory Report',
          type: 'inventory',
          period: 'January 2024',
          generatedAt: '2024-01-31',
          status: 'completed',
          downloadUrl: '#'
        },
        {
          id: 3,
          name: 'Financial Report',
          type: 'financial',
          period: 'Q4 2023',
          generatedAt: '2024-01-31',
          status: 'processing',
          downloadUrl: null
        }
      ]);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sales', label: 'Sales Reports', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory Reports', icon: Package },
    { id: 'financial', label: 'Financial Reports', icon: DollarSign },
    { id: 'user-activity', label: 'User Activity', icon: Users },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'activity', label: 'Activity', icon: Users },
  ];

  const stats = {
    totalSales: 125000,
    totalTransactions: 1250,
    averageTransaction: 100,
    topProduct: 'Paracetamol 500mg',
    lowStockItems: 15,
    expiringItems: 8,
    totalRevenue: 125000,
    profitMargin: 25.5
  };

  const generateReport = async (reportType) => {
    try {
      // Mock report generation
      alert(`Generating ${reportType} report for ${dateRange}...`);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const downloadReport = (report) => {
    // Mock download
    alert(`Downloading ${report.name}...`);
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
          <div className="flex items-center">
            <button
              onClick={() => navigate('/manager/dashboard')}
              className="mr-2 p-1 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Reports</h2>
          </div>
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
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-gray-700">{item.label}</span>
            </button>
          ))}
        </nav>
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
              <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Range Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="inline h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900">₱{stats.totalSales.toLocaleString()}</p>
                        <p className="text-xs text-green-600">+12% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                        <p className="text-xs text-blue-600">+8% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                        <p className="text-2xl font-bold text-gray-900">₱{stats.averageTransaction}</p>
                        <p className="text-xs text-purple-600">+5% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.profitMargin}%</p>
                        <p className="text-xs text-yellow-600">+2% from last month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-gray-400" />
                      <span className="ml-2 text-gray-500">Chart will be displayed here</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{stats.topProduct}</span>
                        <span className="text-sm text-gray-600">45% of sales</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Package className="h-5 w-5 text-yellow-600 mr-2" />
                      <h3 className="text-lg font-medium text-yellow-800">Low Stock Alert</h3>
                    </div>
                    <p className="text-yellow-700">
                      {stats.lowStockItems} items are running low on stock and need reordering.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-red-600 mr-2" />
                      <h3 className="text-lg font-medium text-red-800">Expiry Alert</h3>
                    </div>
                    <p className="text-red-700">
                      {stats.expiringItems} items are expiring within 30 days.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Sales Reports</h3>
                    <button
                      onClick={() => generateReport('sales')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Generate Report
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reports.filter(r => r.type === 'sales').map((report) => (
                      <div key={report.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-600">Period: {report.period}</p>
                          <p className="text-sm text-gray-600">Generated: {report.generatedAt}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                          {report.downloadUrl && (
                            <button
                              onClick={() => downloadReport(report)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Inventory Reports</h3>
                    <button
                      onClick={() => generateReport('inventory')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Generate Report
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">1,247</p>
                      <p className="text-sm text-blue-700">Total Items</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Package className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-900">{stats.lowStockItems}</p>
                      <p className="text-sm text-yellow-700">Low Stock</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-900">{stats.expiringItems}</p>
                      <p className="text-sm text-red-700">Expiring Soon</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reports.filter(r => r.type === 'inventory').map((report) => (
                      <div key={report.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-600">Period: {report.period}</p>
                          <p className="text-sm text-gray-600">Generated: {report.generatedAt}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                          {report.downloadUrl && (
                            <button
                              onClick={() => downloadReport(report)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Financial Reports</h3>
                    <button
                      onClick={() => generateReport('financial')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Generate Report
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                      <p className="text-sm text-green-700">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-900">₱{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="text-sm text-blue-700">Profit Margin</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.profitMargin}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reports.filter(r => r.type === 'financial').map((report) => (
                      <div key={report.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-600">Period: {report.period}</p>
                          <p className="text-sm text-gray-600">Generated: {report.generatedAt}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                          {report.downloadUrl && (
                            <button
                              onClick={() => downloadReport(report)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">User Activity Reports</h3>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Staff Activity Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Logins</p>
                          <p className="text-2xl font-bold text-gray-900">156</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Transactions Processed</p>
                          <p className="text-2xl font-bold text-gray-900">1,247</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Average Session Time</p>
                          <p className="text-2xl font-bold text-gray-900">45min</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Staff login: Maria Clara</span>
                          <span className="text-gray-500">2 minutes ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction processed: #TXN001234</span>
                          <span className="text-gray-500">5 minutes ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inventory updated: Paracetamol</span>
                          <span className="text-gray-500">12 minutes ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsDashboard;