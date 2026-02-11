import POSTest from './components/POSTest.jsx'; // Import your testing component

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      {/* Updated Navigation Bar in App.jsx */}
      <nav className="bg-knopper-blue p-4 text-white shadow-lg flex items-center gap-4">
        {/* Logo stays small enough not to crowd the text */}
        <img 
          src="/logo.png" 
          alt="Knopper Logo" 
          className="h-10 w-10 object-contain rounded-md bg-white p-0.5" 
        />
        <h1 className="text-2xl font-bold font-display">
          Knopper Pharmacy POS
        </h1>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto mt-10">
        <POSTest />
      </main>
    </div>
  )
}

export default App