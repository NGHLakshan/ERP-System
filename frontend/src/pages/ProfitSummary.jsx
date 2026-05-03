import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  ChevronRight, ArrowRight, Download, Printer, Filter, PieChart as PieIcon,
  Info, CheckCircle, AlertCircle
} from 'lucide-react';
import { getMonthlyReport, getDailyReport, getFinanceSummary } from '../api/api';

export default function ProfitSummary() {
    const [view, setView] = useState('monthly');
    const [monthlyData, setMonthlyData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_profit: 0 });
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [monthRes, dayRes, sumRes] = await Promise.all([
                getMonthlyReport({ year }),
                getDailyReport({ date_from: dateFrom, date_to: dateTo }),
                getFinanceSummary({ date_from: dateFrom, date_to: dateTo }),
            ]);
            setMonthlyData(monthRes.data.map(d => ({ ...d, profit: parseFloat(d.profit), income: parseFloat(d.income), expense: parseFloat(d.expense) })));
            setDailyData(dayRes.data.map(d => ({ ...d, profit: parseFloat(d.profit), income: parseFloat(d.income), expense: parseFloat(d.expense) })));
            setSummary(sumRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [year, dateFrom, dateTo]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val || 0);

    const formatMonth = (str) => {
        const [y, m] = str.split('-');
        const date = new Date(y, parseInt(m) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const data = (view === 'monthly' ? monthlyData : dailyData).map(row => ({
        ...row,
        name: view === 'monthly' ? row.month.split('-')[1] : row.date
    }));

    const isProfit = summary.net_profit >= 0;

    if (loading && (monthlyData.length === 0 && dailyData.length === 0)) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Generating performance summary...</p>
        </div>
    );

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <PieIcon size={24} style={{ color: 'var(--primary)' }} />
                        Profit & Loss Summary
                    </h1>
                    <p className="page-subtitle">Comparative financial performance analysis</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => window.print()}>
                        <Printer size={16} /> Print Report
                    </button>
                    <button className="btn btn-primary">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Premium Summary Banner */}
            <div className="profit-banner" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '2.5rem' }}>
                <div className="profit-banner-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={14} style={{ color: 'var(--success)' }} />
                        </div>
                        <span className="profit-banner-label">Gross Income</span>
                    </div>
                    <span className="profit-banner-value text-success">{formatCurrency(summary.total_income)}</span>
                </div>
                
                <div className="profit-banner-divider">−</div>
                
                <div className="profit-banner-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={14} style={{ color: 'var(--danger)' }} />
                        </div>
                        <span className="profit-banner-label">Total Expenses</span>
                    </div>
                    <span className="profit-banner-value text-danger">{formatCurrency(summary.total_expense)}</span>
                </div>
                
                <div className="profit-banner-divider">=</div>
                
                <div className="profit-banner-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={14} style={{ color: isProfit ? 'var(--success)' : 'var(--danger)' }} />
                        </div>
                        <span className="profit-banner-label">Net {isProfit ? 'Profit' : 'Loss'}</span>
                    </div>
                    <span className={`profit-banner-value ${isProfit ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(Math.abs(summary.net_profit))}
                    </span>
                </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="section-title">
                        <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                        Financial Trend Over Time
                    </h2>
                    
                    <div className="view-toggle">
                        <button className={`toggle-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>Monthly</button>
                        <button className={`toggle-btn ${view === 'daily' ? 'active' : ''}`} onClick={() => setView('daily')}>Daily</button>
                    </div>
                </div>

                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                                tickFormatter={(val) => view === 'monthly' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(val)-1] : val.split('-')[2]}
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
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area type="monotone" dataKey="income" name="Income" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" name="Expense" stroke="var(--danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label"><Filter size={12} style={{ marginRight: '4px' }} /> Parameters</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {view === 'monthly' ? (
                                <select className="form-input" value={year} onChange={e => setYear(e.target.value)} style={{ minWidth: '120px' }}>
                                    {years.map(y => <option key={y} value={y}>{y} Fiscal Year</option>)}
                                </select>
                            ) : (
                                <>
                                    <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                                    <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Breakdown Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{view === 'monthly' ? 'TIME PERIOD' : 'TRANSACTION DATE'}</th>
                                <th style={{ textAlign: 'right' }}>TOTAL INCOME</th>
                                <th style={{ textAlign: 'right' }}>TOTAL EXPENSES</th>
                                <th style={{ textAlign: 'right' }}>NET YIELD</th>
                                <th style={{ textAlign: 'center' }}>PERFORMANCE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => {
                                const profit = row.profit;
                                return (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 700, color: 'var(--text)' }}>
                                            {view === 'monthly' ? formatMonth(row.month) : row.date}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                                            +{formatCurrency(row.income)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>
                                            -{formatCurrency(row.expense)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 800 }}>
                                            <span style={{ color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge ${profit >= 0 ? 'badge-confirmed' : 'badge-danger'}`} style={{ minWidth: '100px', justifyContent: 'center' }}>
                                                {profit >= 0 ? <CheckCircle size={10} style={{ marginRight: '4px' }} /> : <AlertCircle size={10} style={{ marginRight: '4px' }} />}
                                                {profit >= 0 ? 'Surplus' : 'Deficit'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
