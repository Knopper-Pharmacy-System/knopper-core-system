import { Routes, Route } from "react-router-dom";
import POSTest from "./components/POSTest.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";

function App() {
  return (
    <div>
      <Routes>
        //? =============================
        //* Authentication Route
        //?==============================
        <Route path="/" element={<LoginPage />} />
        //! ====================================================================================================
        //? =============================
        //* POS Route
        //?==============================
        <Route path="/auth/pos" element={<POSTest />} />
      </Routes>
    </div>
  );
}

export default App;
