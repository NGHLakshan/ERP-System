import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import CustomerList from './pages/CustomerList';
import SalesOrderList from './pages/SalesOrderList';
import CreateSalesOrder from './pages/CreateSalesOrder';
import SalesOrderDetails from './pages/SalesOrderDetails';
import FinanceDashboard from './pages/FinanceDashboard';
import TransactionList from './pages/TransactionList';
import ProfitSummary from './pages/ProfitSummary';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/*" element={
                <ProtectedRoute>
                    <div style={{ display: 'flex' }}>
                        <Sidebar />
                        <div className="app-container" style={{ flexGrow: 1, paddingLeft: '20px' }}>
                            <Header />
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/products" element={<ProductList />} />
                                <Route path="/add" element={
                                    <ProtectedRoute roles={['admin', 'manager']}>
                                        <AddProduct />
                                    </ProtectedRoute>
                                } />
                                <Route path="/customers" element={<CustomerList />} />
                                <Route path="/sales" element={<SalesOrderList />} />
                                <Route path="/sales/new" element={<CreateSalesOrder />} />
                                <Route path="/sales/:id" element={<SalesOrderDetails />} />
                                <Route path="/sales/:id/edit" element={<CreateSalesOrder />} />
                                {/* Finance Routes */}
                                <Route path="/finance" element={<FinanceDashboard />} />
                                <Route path="/finance/transactions" element={<TransactionList />} />
                                <Route path="/finance/profit" element={<ProfitSummary />} />
                                <Route path="/audit-logs" element={
                                    <ProtectedRoute roles={['admin']}>
                                        <AuditLogs />
                                    </ProtectedRoute>
                                } />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </div>
                    </div>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
