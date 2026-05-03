import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  BarChart3, Download, Filter, Package, TrendingUp, 
  PieChart as PieIcon, FileText, ArrowUpRight, 
  AlertCircle, ShieldCheck, Zap, Layers, ChevronRight
} from 'lucide-react';
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synthesizing business intelligence...</p>
        </div>
    );

    return (
        <div className="reports-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
                        Intelligence Hub
                    </h1>
                    <p className="page-subtitle">Strategic data analysis and performance auditing.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Filter size={16} /> Filters
                    </button>
                    <ExportButton {...exportProps} />
                </div>
            </div>

            {/* Premium Tab Navigation */}
            <div className="reports-tabs" style={{ background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem', display: 'inline-flex' }}>
                {[
                    { id: 'inventory', label: 'Inventory', icon: Package },
                    { id: 'sales', label: 'Sales Metrics', icon: TrendingUp },
                    { id: 'finance', label: 'Fiscal Health', icon: PieIcon },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button 
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                padding: '0.75rem 1.5rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                        >
                            <Icon size={18} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="tab-content">
                {activeTab === 'inventory' && (
                    <div className="dashboard-grid">
                        <div className="dashboard-section glass">
                            <h3 className="section-title">
                                <Layers size={18} style={{ color: 'var(--primary)', marginRight: '8px' }} />
                                Regional Distribution
                            </h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={inventoryData?.warehouse_distribution}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="total_items"
                                            nameKey="warehouse__name"
                                            animationBegin={0}
                                            animationDuration={1500}
                                        >
                                            {inventoryData?.warehouse_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="dashboard-section glass">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 className="section-title" style={{ margin: 0 }}>
                                    <AlertCircle size={18} style={{ color: 'var(--danger)', marginRight: '8px' }} />
                                    Critical Alerts
                                </h3>
                                <span className="status-badge badge-danger">Immediate Action Required</span>
                            </div>
                            <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>SKU / Product</th>
                                            <th>Location</th>
                                            <th style={{ textAlign: 'center' }}>Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryData?.low_stock_items.map((item, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600 }}>{item.product__name}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{item.warehouse__name}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ color: 'var(--danger)', fontWeight: 800 }}>{item.quantity}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'sales' && (
                    <div className="dashboard-grid">
                        <div className="dashboard-section full-width glass">
                            <h3 className="section-title">
                                <Zap size={18} style={{ color: 'var(--warning)', marginRight: '8px' }} />
                                Revenue Contribution by Vertical
                            </h3>
                            <div style={{ height: '350px' }}>
                                <ResponsiveContainer>
                                    <BarChart data={salesData?.top_products} layout="vertical" margin={{ left: 40, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="product__name" type="category" stroke="var(--text-muted)" fontSize={11} width={120} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                        <Bar dataKey="total_revenue" name="Revenue Generated" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="dashboard-section glass full-width">
                            <h3 className="section-title">Premier Account Performance</h3>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '250px' }}>Client Entity</th>
                                            <th style={{ textAlign: 'right' }}>Total Lifetime Value</th>
                                            <th>Engagement Index</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesData?.top_customers.map((item, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                                            {item.customer__name[0]}
                                                        </div>
                                                        <span style={{ fontWeight: 700 }}>{item.customer__name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success)' }}>{formatCurrency(item.total_spent)}</td>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${Math.min(100, (item.total_spent / salesData.top_customers[0].total_spent) * 100)}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: '10px' }}></div>
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
                    <div className="dashboard-section full-width glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>
                                <ShieldCheck size={18} style={{ color: 'var(--success)', marginRight: '8px' }} />
                                Fiscal Performance Ledger
                            </h3>
                            <div className="status-badge badge-confirmed">Audit Verified</div>
                        </div>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>MONTHLY PERIOD</th>
                                        <th style={{ textAlign: 'right' }}>GROSS INCOME</th>
                                        <th style={{ textAlign: 'right' }}>OPERATING EXPENSE</th>
                                        <th style={{ textAlign: 'right' }}>NET YIELD</th>
                                        <th style={{ textAlign: 'center' }}>PROFITABILITY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financeData?.monthly_analysis.map((row, i) => {
                                        const margin = row.income > 0 ? ((row.profit / row.income) * 100).toFixed(1) : 0;
                                        return (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 700 }}>{row.month}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(row.income)}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(row.expense)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>
                                                    <span style={{ color: row.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                        {formatCurrency(row.profit)}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}></div>
                                                        <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{margin}% Margin</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .tab-btn:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                }
                .tab-btn.active:hover {
                    background: var(--primary) !important;
                }
            `}</style>
        </div>
    );
}
