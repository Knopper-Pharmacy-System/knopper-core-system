import { Routes, Route } from "react-router-dom";
import POSTest from "./components/POSTest.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import PosMain from "./features/pos/PosMain.jsx";

function App() {
  return (
    <div className="h-screen w-full">
      <Routes>
        //? ============================= //* Authentication Route
        //?==============================
        <Route path="/" element={<LoginPage />} />
        //!
        ====================================================================================================
        //? ============================= //* POS Route
        //?==============================
        <Route path="/auth/pos" element={<PosMain />} />
      </Routes>
    </div>
  );
}

export default App;
