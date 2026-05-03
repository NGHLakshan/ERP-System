import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend
} from 'recharts';
import { 
  DollarSign, TrendingUp, TrendingDown, Receipt, 
  PieChart as PieIcon, ArrowRight, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getFinanceSummary, getTransactions, getMonthlyReport } from '../api/api';

export default function FinanceDashboard() {
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_profit: 0 });
    const [recentTx, setRecentTx] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [sumRes, txRes, monthRes] = await Promise.all([
                    getFinanceSummary(),
                    getTransactions(),
                    getMonthlyReport({ year: new Date().getFullYear() }),
                ]);
                setSummary(sumRes.data);
                setRecentTx(txRes.data.slice(0, 8));
                
                // Format monthly data for Recharts
                const formattedMonths = monthRes.data.map(row => {
                    const [year, monthNum] = row.month.split('-');
                    const date = new Date(year, parseInt(monthNum) - 1);
                    return {
                        name: date.toLocaleString('default', { month: 'short' }),
                        Income: parseFloat(row.income),
                        Expense: parseFloat(row.expense),
                        Profit: parseFloat(row.profit)
                    };
                });
                setMonthlyData(formattedMonths);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

    const isProfit = summary.net_profit >= 0;

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Analyzing financial records...</p>
        </div>
    );

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <DollarSign size={24} style={{ color: 'var(--primary)' }} />
                        Finance Dashboard
                    </h1>
                    <p className="page-subtitle">Complete financial health overview</p>
                </div>
                <div className="header-actions">
                    <Link to="/finance/transactions" className="btn btn-secondary">
                        <Receipt size={16} /> Transactions
                    </Link>
                    <Link to="/finance/profit" className="btn btn-primary">
                        <PieIcon size={16} /> Profit Summary
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon sales-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="kpi-label">Total Income</p>
                        <p className="kpi-value income-value" style={{ color: 'var(--success)' }}>{formatCurrency(summary.total_income)}</p>
                        <p className="kpi-trend up">
                            <ArrowUpRight size={12} /> Revenue from sales
                        </p>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon stock-icon">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="kpi-label">Total Expenses</p>
                        <p className="kpi-value expense-value" style={{ color: 'var(--danger)' }}>{formatCurrency(summary.total_expense)}</p>
                        <p className="kpi-trend down">
                            <ArrowDownRight size={12} /> Operational costs
                        </p>
                    </div>
                </div>

                <div className="kpi-card" style={{ borderLeft: `4px solid ${isProfit ? 'var(--success)' : 'var(--danger)'}` }}>
                    <div className="kpi-icon profit-icon" style={{ background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="kpi-label">Net {isProfit ? 'Profit' : 'Loss'}</p>
                        <p className="kpi-value" style={{ color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                            {formatCurrency(Math.abs(summary.net_profit))}
                        </p>
                        <p className="kpi-trend" style={{ color: 'var(--text-muted)' }}>
                            Performance delta
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="dashboard-section full-width">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="section-title">
                            <Calendar size={18} style={{ color: 'var(--primary)' }} />
                            Monthly Performance ({new Date().getFullYear()})
                        </h2>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    tickFormatter={(val) => `Rs.${val/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="Income" fill="var(--success)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>
                        <Receipt size={18} style={{ color: 'var(--primary)' }} />
                        Recent Financial Activity
                    </h2>
                    <Link to="/finance/transactions" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        View Full History <ArrowRight size={14} />
                    </Link>
                </div>
                
                {recentTx.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Info size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                        <p>No financial activity recorded yet.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>REFERENCE</th>
                                    <th>TYPE</th>
                                    <th>DESCRIPTION</th>
                                    <th>DATE</th>
                                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTx.map(tx => (
                                    <tr key={tx.id}>
                                        <td><span className="ref-badge">{tx.reference}</span></td>
                                        <td>
                                            <span className={`status-badge ${tx.type === 'INCOME' ? 'badge-confirmed' : 'badge-danger'}`}>
                                                {tx.type === 'INCOME' ? 'Income' : 'Expense'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-sub)' }}>{tx.description}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                            <span style={{ color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                                                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
