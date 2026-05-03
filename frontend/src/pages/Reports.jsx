import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { FileText, Download, Filter, Package, TrendingUp, ShoppingBag, PieChart as PieIcon } from 'lucide-react';
import { getSalesReport, getInventoryReport, getFinanceAnalytics } from '../api/api';
import ExportButton from '../components/ExportButton';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [inventoryData, setInventoryData] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [financeData, setFinanceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [invRes, salesRes, finRes] = await Promise.all([
                    getInventoryReport(),
                    getSalesReport(),
                    getFinanceAnalytics()
                ]);
                setInventoryData(invRes.data);
                setSalesData(salesRes.data);
                setFinanceData(finRes.data);
            } catch (err) {
                console.error("Reports error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

    const getExportProps = () => {
        switch (activeTab) {
            case 'inventory':
                return {
                    data: inventoryData?.low_stock_items.map(item => ({
                        product: item.product__name,
                        warehouse: item.warehouse__name,
                        qty: item.quantity,
                        status: 'CRITICAL'
                    })) || [],
                    headers: ["Product", "Warehouse", "Quantity", "Status"],
                    title: "Inventory Report - Low Stock Alerts",
                    filename: "Inventory_Report"
                };
            case 'sales':
                return {
                    data: salesData?.top_products.map(item => ({
                        product: item.product__name,
                        revenue: formatCurrency(item.total_revenue),
                        qty: item.total_qty
                    })) || [],
                    headers: ["Product", "Revenue", "Quantity Sold"],
                    title: "Sales Report - Product Performance",
                    filename: "Sales_Report"
                };
            case 'finance':
                return {
                    data: financeData?.monthly_analysis.map(row => ({
                        month: row.month,
                        income: formatCurrency(row.income),
                        expense: formatCurrency(row.expense),
                        profit: formatCurrency(row.profit)
                    })) || [],
                    headers: ["Month", "Income", "Expense", "Net Profit"],
                    title: "Finance Report - Monthly Analysis",
                    filename: "Finance_Report"
                };
            default: return { data: [], headers: [], title: "", filename: "" };
        }
    };

    const exportProps = getExportProps();

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Generating Analytical Reports...</p>
        </div>
    );

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Management Reports</h1>
                    <p className="page-subtitle">Detailed business intelligence and data exports.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary mr-2"><Filter size={18} /> Filters</button>
                    <ExportButton {...exportProps} />
                </div>
            </div>

            <div className="reports-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    <Package size={18} /> Inventory
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    <TrendingUp size={18} /> Sales
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('finance')}
                >
                    <PieIcon size={18} /> Finance
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'inventory' && (
                    <div className="report-grid">
                        <div className="dashboard-section chart-section">
                            <h3 className="section-title">Warehouse Distribution</h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={inventoryData?.warehouse_distribution}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="total_items"
                                            nameKey="warehouse__name"
                                        >
                                            {inventoryData?.warehouse_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <h3 className="section-title">Low Stock Alerts</h3>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Warehouse</th>
                                            <th>Quantity</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryData?.low_stock_items.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.product__name}</td>
                                                <td>{item.warehouse__name}</td>
                                                <td className="text-danger font-bold">{item.quantity}</td>
                                                <td><span className="status-badge badge-danger">CRITICAL</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'sales' && (
                    <div className="report-grid">
                        <div className="dashboard-section chart-section">
                            <h3 className="section-title">Revenue by Product</h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer>
                                    <BarChart data={salesData?.top_products} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `Rs.${v/1000}k`} />
                                        <YAxis dataKey="product__name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                                        <Tooltip />
                                        <Bar dataKey="total_revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <h3 className="section-title">Top Revenue Customers</h3>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Customer Name</th>
                                            <th>Total Revenue</th>
                                            <th>Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesData?.top_customers.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.customer__name}</td>
                                                <td className="font-bold">{formatCurrency(item.total_spent)}</td>
                                                <td>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: '85%', background: COLORS[i] }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="report-grid">
                        <div className="dashboard-section full-width">
                            <h3 className="section-title">Monthly Profit Breakdown</h3>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Income</th>
                                            <th>Expense</th>
                                            <th>Net Profit</th>
                                            <th>Margin %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {financeData?.monthly_analysis.map((row, i) => {
                                            const margin = row.income > 0 ? ((row.profit / row.income) * 100).toFixed(1) : 0;
                                            return (
                                                <tr key={i}>
                                                    <td>{row.month}</td>
                                                    <td className="text-success">{formatCurrency(row.income)}</td>
                                                    <td className="text-danger">{formatCurrency(row.expense)}</td>
                                                    <td className={`font-bold ${row.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        {formatCurrency(row.profit)}
                                                    </td>
                                                    <td>{margin}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
