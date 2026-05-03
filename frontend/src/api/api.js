import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle expired tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- Auth ---
export const login = (credentials) => api.post('users/login/', credentials);
export const register = (data) => api.post('users/register/', data);

// --- Inventory ---
export const getProducts = () => api.get('inventory/products/');
export const createProduct = (data) => api.post('inventory/products/', data);
export const deleteProduct = (id) => api.delete(`inventory/products/${id}/`);

export const getSuppliers = () => api.get('inventory/suppliers/');
export const createSupplier = (data) => api.post('inventory/suppliers/', data);

export const getStock = () => api.get('inventory/stock/');
export const getStockMovements = () => api.get('inventory/stock-movements/');
export const getWarehouses = () => api.get('inventory/warehouses/');

// --- Purchasing ---
export const getPurchaseOrders = () => api.get('purchases/orders/');
export const getPurchaseOrder = (id) => api.get(`purchases/orders/${id}/`);
export const createPurchaseOrder = (data) => api.post('purchases/orders/', data);
export const receivePurchaseOrder = (id) => api.post(`purchases/orders/${id}/receive/`);
export const cancelPurchaseOrder = (id) => api.post(`purchases/orders/${id}/cancel/`);

// --- Sales ---
export const getCustomers = (search = '') => api.get(`sales/customers/${search ? `?search=${search}` : ''}`);
export const createCustomer = (data) => api.post('sales/customers/', data);
export const updateCustomer = (id, data) => api.put(`sales/customers/${id}/`, data);
export const deleteCustomer = (id) => api.delete(`sales/customers/${id}/`);

export const getSalesOrders = () => api.get('sales/orders/');
export const getSalesOrder = (id) => api.get(`sales/orders/${id}/`);
export const createSalesOrder = (data) => api.post('sales/orders/', data);
export const updateSalesOrder = (id, data) => api.put(`sales/orders/${id}/`, data);
export const confirmSalesOrder = (id) => api.post(`sales/orders/${id}/confirm/`);
export const cancelSalesOrder = (id) => api.post(`sales/orders/${id}/cancel/`);

// --- Finance ---
export const getTransactions = (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    return api.get(`finance/transactions/${query.toString() ? '?' + query.toString() : ''}`);
};
export const getFinanceSummary = (params = {}) => {
    const query = new URLSearchParams();
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    return api.get(`finance/summary/${query.toString() ? '?' + query.toString() : ''}`);
};
export const getDailyReport = (params = {}) => {
    const query = new URLSearchParams();
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    return api.get(`finance/reports/daily/${query.toString() ? '?' + query.toString() : ''}`);
};
export const getMonthlyReport = (params = {}) => {
    const query = new URLSearchParams();
    if (params.year) query.append('year', params.year);
    return api.get(`finance/reports/monthly/${query.toString() ? '?' + query.toString() : ''}`);
};

// --- Reports & Dashboard ---
export const getDashboardStats = () => api.get('reports/dashboard/');
export const getSalesReport = () => api.get('reports/sales/');
export const getInventoryReport = () => api.get('reports/inventory/');
export const getFinanceAnalytics = () => api.get('reports/finance/');
 
 // --- Audit Logs ---
export const getAuditLogs = (params = {}) => {
    const query = new URLSearchParams();
    if (params.action) query.append('action', params.action);
    if (params.model_name) query.append('model_name', params.model_name);
    if (params.user) query.append('user', params.user);
    if (params.search) query.append('search', params.search);
    return api.get(`core/logs/${query.toString() ? '?' + query.toString() : ''}`);
};

export const globalSearch = (query) => api.get(`core/search/?q=${query}`);

// --- Notifications ---
export const getNotifications = () => api.get('notifications/');
export const markNotificationAsRead = (id) => api.post(`notifications/${id}/mark_as_read/`);
export const markAllNotificationsAsRead = () => api.post('notifications/mark_all_as_read/');

export default api;
