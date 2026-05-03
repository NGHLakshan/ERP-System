import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, ShoppingCart, Package, DollarSign, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, Users 
} from 'lucide-react';
import { getDashboardStats, getSalesReport, getFinanceAnalytics } from '../api/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [financeData, setFinanceData] = useState([]);
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, salesRes, financeRes] = await Promise.all([
                    getDashboardStats(),
                    getSalesReport(),
                    getFinanceAnalytics()
                ]);
                setStats(statsRes.data);
                setPerformance(salesRes.data);
                setSalesData(salesRes.data.sales_trend);
                setFinanceData(financeRes.data.monthly_analysis);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Dashboard Insights...</p>
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🚀 Business Insights</h1>
                    <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="current-date">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon sales-icon"><TrendingUp size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Total Revenue</span>
                        <h2 className="kpi-value">{formatCurrency(stats?.total_sales)}</h2>
                        <span className="kpi-trend up"><ArrowUpRight size={14} /> 12% vs last month</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon purchase-icon"><ShoppingCart size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Total Purchases</span>
                        <h2 className="kpi-value">{formatCurrency(stats?.total_purchases)}</h2>
                        <span className="kpi-trend down"><ArrowDownRight size={14} /> 5% vs last month</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon profit-icon"><DollarSign size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Net Profit</span>
                        <h2 className={`kpi-value ${stats?.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(Math.abs(stats?.profit))}
                        </h2>
                        <span className="kpi-trend up"><ArrowUpRight size={14} /> {stats?.profit >= 0 ? 'Positive' : 'Action Required'}</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon stock-icon"><Package size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Low Stock Alerts</span>
                        <h2 className={`kpi-value ${stats?.low_stock_count > 0 ? 'text-warning' : ''}`}>
                            {stats?.low_stock_count}
                        </h2>
                        <span className="kpi-trend"><AlertTriangle size={14} /> Items below threshold</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Sales Chart */}
                <div className="dashboard-section chart-section">
                    <h3 className="section-title">📈 Sales Performance (Last 30 Days)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Profitability */}
                <div className="dashboard-section chart-section">
                    <h3 className="section-title">📊 Monthly Profitability</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={financeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="dashboard-section">
                    <h3 className="section-title">🏆 Top Selling Products</h3>
                    <div className="top-list">
                        {performance?.top_products.map((item, i) => (
                            <div key={i} className="top-item">
                                <div className="item-rank">{i+1}</div>
                                <div className="item-details">
                                    <span className="item-name">{item.product__name}</span>
                                    <span className="item-sub">{item.total_qty} units sold</span>
                                </div>
                                <div className="item-value">{formatCurrency(item.total_revenue)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="dashboard-section">
                    <h3 className="section-title">👥 Top Customers</h3>
                    <div className="top-list">
                        {performance?.top_customers.map((item, i) => (
                            <div key={i} className="top-item">
                                <div className="item-avatar">{item.customer__name[0]}</div>
                                <div className="item-details">
                                    <span className="item-name">{item.customer__name}</span>
                                    <span className="item-sub">Valued Partner</span>
                                </div>
                                <div className="item-value">{formatCurrency(item.total_spent)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
