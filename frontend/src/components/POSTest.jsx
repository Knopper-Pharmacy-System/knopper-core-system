import React, { useState, useEffect } from 'react';

const POSTest = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Mock Data: This is what you'll show in the meeting as "Sample Data"
  const mockInventory = [
    { id: 1, name: "Amoxicillin 500mg", stock: 45, price: "₱12.00", status: "In Stock" },
    { id: 2, name: "Paracetamol 500mg", stock: 8, price: "₱5.00", status: "Low Stock" },
    { id: 3, name: "Vitamin C + Zinc", stock: 120, price: "₱15.50", status: "In Stock" },
  ];

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* 1. Header with Offline Indicator */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-knopper-blue">Knopper Pharmacy POS</h1>
          <p className="text-gray-500 font-medium">Branch: Panganiban (Naga City)</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 animate-pulse'}`}>
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          {isOnline ? "Connected to Flask Server" : "Offline Mode (Brownout Mode)"}
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory Column (Decision: Do we want search here?) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📦 Current Inventory 
              <span className="text-sm font-normal text-gray-400">(Mock Data)</span>
            </h2>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Medicine Name</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockInventory.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4 font-medium">{item.name}</td>
                      <td className={`px-4 py-4 font-bold ${item.stock < 10 ? 'text-red-500' : 'text-gray-700'}`}>{item.stock}</td>
                      <td className="px-4 py-4 text-gray-600">{item.price}</td>
                      <td className="px-4 py-4">
                        <button className="text-knopper-blue font-bold hover:underline cursor-pointer">Add to Cart</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sales/Cart Column (Decision: Offline Sync button?) */}
        <div className="space-y-6">
          <div className="bg-knopper-blue p-6 rounded-2xl text-white shadow-lg shadow-blue-900/20">
            <h2 className="text-xl font-bold mb-4 underline decoration-knopper-accent">Quick Sale</h2>
            <div className="space-y-4">
              <label className="block text-sm opacity-80">Scan Item or Type Name</label>
              <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-knopper-accent" placeholder="Waiting for input..." />
              <button className="w-full bg-knopper-accent hover:bg-cyan-500 py-3 rounded-lg font-black uppercase tracking-wider transition-all">
                Finalize Transaction
              </button>
              <p className="text-xs text-center opacity-60 italic">Transactions will auto-sync when internet returns.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default POSTest;