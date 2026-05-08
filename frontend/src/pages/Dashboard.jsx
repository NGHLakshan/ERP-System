import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, ShoppingCart, Package, DollarSign, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, User, 
  Award, Zap, Calendar, ArrowRight, Activity
} from 'lucide-react';
import { getDashboardStats, getSalesReport, getFinanceAnalytics } from '../api/api';

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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synchronizing business data...</p>
        </div>
    );

    return (
        <div className="dashboard-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Zap size={24} style={{ color: 'var(--primary)' }} />
                        Command Center
                    </h1>
                    <p className="page-subtitle">Real-time ecosystem intelligence and performance metrics.</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Period</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 700 }}>
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="status-badge badge-confirmed" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                        <Activity size={12} style={{ marginRight: '6px' }} /> Live System
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card glass">
                    <div className="kpi-icon sales-icon"><TrendingUp size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Gross Revenue</span>
                        <h2 className="kpi-value">{formatCurrency(stats?.total_sales)}</h2>
                        <span className="kpi-trend up"><ArrowUpRight size={14} /> Global Performance</span>
                    </div>
                </div>
                <div className="kpi-card glass">
                    <div className="kpi-icon purchase-icon"><ShoppingCart size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Expenditure</span>
                        <h2 className="kpi-value">{formatCurrency(stats?.total_purchases)}</h2>
                        <span className="kpi-trend down"><ArrowDownRight size={14} /> Supply Chain Cost</span>
                    </div>
                </div>
                <div className="kpi-card glass">
                    <div className="kpi-icon profit-icon" style={{ background: stats?.profit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: stats?.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Net Yield</span>
                        <h2 className={`kpi-value ${stats?.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(Math.abs(stats?.profit))}
                        </h2>
                        <span className="kpi-trend" style={{ color: stats?.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {stats?.profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {stats?.profit >= 0 ? 'Profit Margin' : 'Capital Deficit'}
                        </span>
                    </div>
                </div>
                <div className="kpi-card glass">
                    <div className="kpi-icon stock-icon" style={{ background: stats?.low_stock_count > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)', color: stats?.low_stock_count > 0 ? 'var(--warning)' : 'var(--primary)' }}>
                        <Package size={24} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Inventory Health</span>
                        <h2 className={`kpi-value ${stats?.low_stock_count > 0 ? 'text-warning' : ''}`}>
                            {stats?.low_stock_count} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>Critical</span>
                        </h2>
                        <span className="kpi-trend" style={{ color: stats?.low_stock_count > 0 ? 'var(--warning)' : 'var(--success)' }}>
                            {stats?.low_stock_count > 0 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />} {stats?.low_stock_count > 0 ? 'Action Required' : 'Optimal Levels'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Sales Chart */}
                <div className="dashboard-section full-width">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="section-title">
                            <TrendingUp size={18} style={{ color: 'var(--primary)', marginRight: '8px' }} />
                            Revenue Momentum
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div> Daily Sales</span>
                        </div>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="day" 
                                    stroke="var(--text-muted)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="var(--text-muted)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `Rs.${value/1000}k`} 
                                />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: 'var(--text)' }}
                                />
                                <Area type="monotone" dataKey="total" name="Revenue" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profitability vs Expense */}
                <div className="dashboard-section">
                    <h3 className="section-title">
                        <Activity size={18} style={{ color: 'var(--primary)', marginRight: '8px' }} />
                        Cash Flow Analysis
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={financeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="income" name="Income" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="expense" name="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Rankings */}
                <div className="dashboard-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 className="section-title" style={{ margin: 0 }}>
                            <Award size={18} style={{ color: 'var(--warning)', marginRight: '8px' }} />
                            Elite Performers
                        </h3>
                        <Link to="/reports" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>All Insights</Link>
                    </div>
                    
                    <div className="top-performers-grid">
                        <div className="performer-list">
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Top Products</p>
                            {performance?.top_products.slice(0, 3).map((item, i) => (
                                <div key={i} className="performer-row">
                                    <div className="performer-rank">{i+1}</div>
                                    <div style={{ flex: 1 }}>
                                        <p className="performer-name">{item.product__name}</p>
                                        <p className="performer-meta">{item.total_qty} units sold</p>
                                    </div>
                                    <div className="performer-value">{formatCurrency(item.total_revenue)}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }}></div>
                        <div className="performer-list">
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Key Clients</p>
                            {performance?.top_customers.slice(0, 3).map((item, i) => (
                                <div key={i} className="performer-row">
                                    <div className="performer-avatar">{(item.customer__name || 'U')[0]}</div>
                                    <div style={{ flex: 1 }}>
                                        <p className="performer-name">{item.customer__name}</p>
                                        <p className="performer-meta">Premier Customer</p>
                                    </div>
                                    <div className="performer-value">{formatCurrency(item.total_spent)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .kpi-card.glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .performer-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    border-radius: 12px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .performer-row:hover {
                    background: rgba(255,255,255,0.02);
                    border-color: var(--border);
                }
                .performer-rank {
                    width: 24px;
                    height: 24px;
                    background: var(--primary);
                    color: white;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 800;
                }
                .performer-avatar {
                    width: 32px;
                    height: 32px;
                    background: var(--surface-light);
                    color: var(--primary-h);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    font-weight: 800;
                    border: 1px solid var(--border);
                }
                .performer-name { font-weight: 700; font-size: 0.875rem; color: var(--text); margin: 0; }
                .performer-meta { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
                .performer-value { font-weight: 800; font-size: 0.9rem; color: var(--primary-h); }
            `}</style>
        </div>
    );
}

const CheckCircle = ({ size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
