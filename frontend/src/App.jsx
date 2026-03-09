import { Routes, Route } from "react-router-dom";
import POSTest from "./components/POSTest.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import PosMain from "./features/pos/PosMain.jsx";
import AdminDashboard from "./features/admin/AdminDashboard.jsx";
import ManagerDashboard from "./features/manager/ManagerDashboard.jsx";
import StaffDashboard from "./features/staff/StaffDashboard.jsx";
import InventoryDashboard from "./features/inventory/InventoryDashboard.jsx";
import ProcurementDashboard from "./features/procurement/ProcurementDashboard.jsx";
import ReportsDashboard from "./features/reports/ReportsDashboard.jsx";
import AdjustmentForm from "./features/inventory/AdjustmentForm.jsx";
import ProtectedRoute from "./components/shared/ProtectedRoute.jsx";

function App() {
  return (
    <div className="h-screen w-full">
      <Routes>
        {/* Authentication Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* POS Routes - accessible by staff, manager, admin */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <PosMain />
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes - accessible by staff, manager, admin */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/add"
          element={
            <ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <AdjustmentForm />
            </ProtectedRoute>
          }
        />

        {/* Procurement Routes - accessible by manager, admin */}
        <Route
          path="/procurement"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ProcurementDashboard />
            </ProtectedRoute>
          }
        />

        {/* Reports Routes - accessible by manager, admin */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ReportsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes for backward compatibility */}
        <Route path="/auth/pos" element={<PosMain />} />
      </Routes>
    </div>
  );
}

export default App;
