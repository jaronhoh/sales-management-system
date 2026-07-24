import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RequireAuth, RequireAdmin } from '@/components/layout/Guards';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import SalesOrdersPage from '@/pages/SalesOrdersPage';
import SalesOrderDetailPage from '@/pages/SalesOrderDetailPage';
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage';
import PurchaseOrderDetailPage from '@/pages/PurchaseOrderDetailPage';
import VendorsPage from '@/pages/VendorsPage';
import ItemsPage from '@/pages/ItemsPage';
import LedgerPage from '@/pages/LedgerPage';
import ReportsPage from '@/pages/ReportsPage';
import UsersPage from '@/pages/UsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sales-orders" element={<SalesOrdersPage />} />
              <Route path="/sales-orders/:id" element={<SalesOrderDetailPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/items" element={<ItemsPage />} />

              <Route element={<RequireAdmin />}>
                <Route path="/ledger" element={<LedgerPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
