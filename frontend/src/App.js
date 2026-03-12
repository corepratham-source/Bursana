// import { Routes, Route, Navigate } from 'react-router-dom';
// import Home from './pages/Home';
// import CustomerLoginPage from './components/CustomerLoginPage';
// import SupplierLoginPage from './components/SupplierLoginPage';
// import SupplierLayout from './components/SupplierLayout';
// import ProductIngestion from './components/ProductIngestion';
// import ProductManagePage from './components/ProductManagePage';

// function App() {
//   return (
//     <Routes>
//       {/* Customer Portal */}
//       <Route path="/customer" element={<CustomerLoginPage />} />

      
//       {/* Supplier Portal */}
//       <Route path="/supplier" element={<SupplierLoginPage />} />
//       <Route path="/supplier/ingest" element={<SupplierLayout><ProductIngestion /></SupplierLayout>} />
//       <Route path="/supplier/manage" element={<SupplierLayout><ProductManagePage /></SupplierLayout>} />
      
//       {/* Main routing handled by Home component */}
//       <Route path="/*" element={<Home />} />
//     </Routes>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";

import CustomerLoginPage from "./components/CustomerLoginPage";
import SupplierLoginPage from "./components/SupplierLoginPage";

import SupplierLayout from "./components/SupplierLayout";
import ProductIngestion from "./components/ProductIngestion";
import ProductManagePage from "./components/ProductManagePage";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Default Landing */}
      <Route path="/" element={<Home />} />

      {/* ================= CUSTOMER PORTAL ================= */}

      <Route path="/customer" element={<CustomerLoginPage />} />

      {/* ================= SUPPLIER PORTAL ================= */}

      <Route path="/supplier" element={<SupplierLoginPage />} />

      <Route
        path="/supplier/ingest"
        element={
          <ProtectedRoute role="supplier">
            <SupplierLayout>
              <ProductIngestion />
            </SupplierLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/manage"
        element={
          <ProtectedRoute role="supplier">
            <SupplierLayout>
              <ProductManagePage />
            </SupplierLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;