import React, { useState, useEffect } from "react";
import logoOutline from "../../assets/logo_outline.png";
import bannerLogo from "../../assets/banner_logo.png";
import {
  Wifi,
  WifiOff,
  ShoppingCart,
  Trash2,
  Plus,
  Receipt as ReceiptIcon,
  User,
  Calendar,
  Clock,
} from "lucide-react";

const ModernPosView = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      description: "Biogesic 500mg (10s)",
      quantity: 2,
      price: 45.0,
      total: 90.0,
    },
    {
      id: 2,
      description: "Neozep Forte Tablet (10s)",
      quantity: 1,
      price: 68.5,
      total: 68.5,
    },
    {
      id: 3,
      description: "Kremil-S Antacid (12s)",
      quantity: 3,
      price: 55.0,
      total: 165.0,
    },
    {
      id: 4,
      description: "Alaxan FR Caplet (10s)",
      quantity: 2,
      price: 89.75,
      total: 179.5,
    },
    {
      id: 5,
      description: "Ceelin Plus Syrup 60mL",
      quantity: 1,
      price: 125.0,
      total: 125.0,
    },
  ]);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState("");
  const [currentItemDescription, setCurrentItemDescription] = useState("");
  const [discount, setDiscount] = useState(0);
  const [addOn, setAddOn] = useState(0);
  const [terminalId] = useState("001");
  const [invoiceNo] = useState("000000001");
  const [transNo] = useState("000000001");
  const [cashierName] = useState("Gino L.");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update date and time every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentDate(
        now
          .toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
          .replace(",", "")
          .toUpperCase(),
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online status
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  // Calculate amount due
  const amountDue = subtotal - discount + addOn;

  // Add item to cart
  const addItemToCart = () => {
    if (!currentItemDescription || !currentPrice) return;
    const newItem = {
      id: Date.now(),
      description: currentItemDescription,
      quantity: currentQuantity,
      price: parseFloat(currentPrice),
      total: currentQuantity * parseFloat(currentPrice),
    };
    setCartItems([...cartItems, newItem]);
    setCurrentItemDescription("");
    setCurrentQuantity(1);
    setCurrentPrice("");
  };

  // Remove item from cart
  const removeItemFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Handle Enter key to add item
  const handleKeyPress = (e) => {
    if (e.key === "Enter") addItemToCart();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-[#e8eeff] to-[#dce7ff] p-6">
      <div className="max-w-400 mx-auto grid grid-cols-[1fr_380px] gap-6 h-[calc(100vh-48px)]">
        {/* ══ Main Transaction Area ══ */}
        <div className="flex flex-col gap-6 min-h-0">
          {/* Header */}
          <header className="bg-linear-to-r from-[#041848] via-[#062d8c] to-[#3266e6] rounded-2xl shadow-xl p-6 flex items-center justify-between shrink-0">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={bannerLogo}
                alt="Knopper"
                className="h-15 w-auto object-contain pointer-events-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
              <span className="text-[#b9e0ff] text-sm font-medium uppercase tracking-wider">
                Terminal ID:
              </span>
              <span className="text-white font-bold text-lg">000</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#b9e0ff] text-sm font-semibold uppercase">
                Status:
              </span>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
                  isOnline
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="font-semibold text-sm uppercase">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </header>

          {/* Amount Due Card */}
          <div className="bg-linear-to-br from-[#041848] via-[#062d8c] to-[#3266e6] rounded-2xl shadow-2xl p-8 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[#c9d9ff] uppercase tracking-[0.2em] text-sm font-semibold mb-2">
                  Amount Due
                </p>
                <p className="text-white text-7xl font-bold tracking-tight">
                  ₱{amountDue.toFixed(2)}
                </p>
              </div>
              <ShoppingCart className="w-20 h-20 text-white/20" />
            </div>
          </div>

          {/* Transaction IDs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 grid grid-cols-3 gap-6 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-semibold text-sm">
                Term ID:
              </span>
              <span className="text-slate-900 font-bold">{terminalId}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-semibold text-sm">
                Invoice No.:
              </span>
              <span className="text-slate-900 font-bold">{invoiceNo}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-semibold text-sm">
                Trans No.:
              </span>
              <span className="text-slate-900 font-bold">{transNo}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-0">
            {/* Table Header */}
            <div className="bg-linear-to-r from-white to-[#e8eeff] border-b border-[#c5d5fb] shrink-0">
              <div className="grid grid-cols-[50px_1fr_100px_150px_150px] divide-x divide-[#c5d5fb] font-semibold text-slate-700 text-sm uppercase tracking-wide">
                <div className="px-4 py-4">#</div>
                <div className="px-4 py-4">Item Description</div>
                <div className="px-4 py-4 text-center">Qty</div>
                <div className="px-4 py-4 text-center">Price</div>
                <div className="px-4 py-4 text-center">Total</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No items in cart</p>
                  <p className="text-sm">
                    Start adding items to begin transaction
                  </p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[50px_1fr_100px_150px_150px] divide-x divide-slate-100 border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="px-4 py-4 text-slate-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="px-4 py-4 text-slate-900 font-medium">
                      {item.description}
                    </div>
                    <div className="px-4 py-4 text-center text-slate-700">
                      {item.quantity}
                    </div>
                    <div className="px-4 py-4 text-center text-slate-700">
                      ₱{item.price.toFixed(2)}
                    </div>
                    <div className="px-4 py-4 text-center font-semibold text-[#062d8c] flex items-center justify-between">
                      <span>₱{item.total.toFixed(2)}</span>
                      <button
                        onClick={() => removeItemFromCart(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg text-red-500"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 shrink-0">
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="grid grid-cols-[1fr_120px_150px_auto] gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Item Description
                  </label>
                  <input
                    type="text"
                    value={currentItemDescription}
                    onChange={(e) => setCurrentItemDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter item description..."
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-[#3266e6] focus:ring-2 focus:ring-[#dce7ff] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Qty
                  </label>
                  <input
                    type="number"
                    value={currentQuantity}
                    onChange={(e) =>
                      setCurrentQuantity(parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-[#3266e6] focus:ring-2 focus:ring-[#dce7ff] transition-all text-center font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Price
                  </label>
                  <input
                    type="number"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    onKeyPress={handleKeyPress}
                    step="0.01"
                    placeholder="0.00"
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-[#3266e6] focus:ring-2 focus:ring-[#dce7ff] transition-all font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2 text-slate-500 pb-3">
                  <span className="text-sm font-semibold">Item #</span>
                  <span className="text-2xl font-bold text-[#062d8c]">
                    {cartItems.length + 1}
                  </span>
                </div>
              </div>

              <button
                onClick={addItemToCart}
                className="bg-linear-to-r from-[#062d8c] to-[#3266e6] text-white px-8 py-3 rounded-xl hover:from-[#041848] hover:to-[#062d8c] transition-all shadow-lg hover:shadow-xl font-semibold uppercase tracking-wide flex items-center gap-2 self-end"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* ══ Right Sidebar — Receipt Panel ══ */}
        <div className="flex flex-col gap-6">
          {/* Receipt Header */}
          <div className="bg-linear-to-br from-[#041848] to-[#3266e6] rounded-2xl shadow-xl p-6 flex items-center justify-center gap-3 shrink-0">
            <ReceiptIcon className="w-7 h-7 text-white" />
            <h2 className="text-white font-bold text-2xl uppercase tracking-wider">
              Receipt
            </h2>
          </div>

          {/* Receipt Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 shrink-0">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-slate-600 font-semibold">Subtotal</span>
              <span className="text-slate-900 font-bold text-lg">
                ₱{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-red-600 font-semibold">Discount</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="w-28 px-3 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-right font-bold"
              />
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-slate-600 font-semibold">Add On</span>
              <input
                type="number"
                value={addOn}
                onChange={(e) => setAddOn(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="w-28 px-3 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-[#3266e6] focus:ring-2 focus:ring-[#dce7ff] transition-all text-right font-bold"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-900 font-bold text-lg">
                Total Due
              </span>
              <span className="text-[#062d8c] font-bold text-2xl">
                ₱{amountDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Knopper Branding */}
          <div className="bg-linear-to-br from-[#041848] via-[#062d8c] to-[#3266e6] rounded-2xl shadow-xl overflow-hidden relative aspect-square shrink-0">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <img
                src={logoOutline}
                alt="Knopper Logo"
                className="w-54 h-54 object-contain pointer-events-none"
              />
              <span className="text-white font-black text-3xl tracking-tight">
                knopper
              </span>
              <span className="text-[#b9e0ff] text-xs uppercase tracking-widest font-semibold">
                Core System
              </span>
            </div>
          </div>

          {/* Cashier Info */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col">
            <div className="bg-linear-to-r from-white to-[#e8eeff] px-6 py-3 border-b border-[#c5d5fb] flex items-center gap-2 shrink-0">
              <User className="w-5 h-5 text-[#062d8c]" />
              <span className="font-semibold text-slate-700">
                Cashier Details
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <p className="text-2xl font-bold text-slate-900">{cashierName}</p>
              <div className="w-full h-px bg-slate-200" />
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#3266e6] shrink-0" />
                  <span className="text-slate-600 font-medium">
                    {currentDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#3266e6] shrink-0" />
                  <span className="text-slate-600 font-medium">
                    {currentTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPosView;
