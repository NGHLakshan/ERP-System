import React, { useState, useEffect } from 'react';
import { getMonthlyReport, getDailyReport, getFinanceSummary } from '../api/api';

export default function ProfitSummary() {
    const [view, setView] = useState('monthly'); // 'monthly' | 'daily'
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
            setMonthlyData(monthRes.data);
            setDailyData(dayRes.data);
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
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return `${monthNames[parseInt(m) - 1]} ${y}`;
    };

    const data = view === 'monthly' ? monthlyData : dailyData;

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Profit Summary</h1>
                    <p className="page-subtitle">Detailed income vs expense breakdown</p>
                </div>
            </div>

            {/* Summary Banner */}
            <div className="profit-banner">
                <div className="profit-banner-item">
                    <span className="profit-banner-label">Total Income</span>
                    <span className="profit-banner-value income-value">{formatCurrency(summary.total_income)}</span>
                </div>
                <div className="profit-banner-divider">−</div>
                <div className="profit-banner-item">
                    <span className="profit-banner-label">Total Expenses</span>
                    <span className="profit-banner-value expense-value">{formatCurrency(summary.total_expense)}</span>
                </div>
                <div className="profit-banner-divider">=</div>
                <div className="profit-banner-item">
                    <span className="profit-banner-label">Net {summary.net_profit >= 0 ? 'Profit' : 'Loss'}</span>
                    <span className={`profit-banner-value ${summary.net_profit >= 0 ? 'profit-value' : 'loss-value'}`}>
                        {formatCurrency(Math.abs(summary.net_profit))}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
                <div className="filter-group">
                    <label className="filter-label">View</label>
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${view === 'monthly' ? 'active' : ''}`}
                            onClick={() => setView('monthly')}
                        >📅 Monthly</button>
                        <button
                            className={`toggle-btn ${view === 'daily' ? 'active' : ''}`}
                            onClick={() => setView('daily')}
                        >📆 Daily</button>
                    </div>
                </div>
                {view === 'monthly' && (
                    <div className="filter-group">
                        <label className="filter-label">Year</label>
                        <select
                            className="form-input"
                            value={year}
                            onChange={e => setYear(e.target.value)}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                )}
                {view === 'daily' && (
                    <>
                        <div className="filter-group">
                            <label className="filter-label">From</label>
                            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">To</label>
                            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                    </>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading report...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <p>No data available for the selected period.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{view === 'monthly' ? 'Month' : 'Date'}</th>
                                <th style={{ textAlign: 'right' }}>Income</th>
                                <th style={{ textAlign: 'right' }}>Expenses</th>
                                <th style={{ textAlign: 'right' }}>Net Profit</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => {
                                const profit = row.profit;
                                return (
                                    <tr key={i}>
                                        <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                            {view === 'monthly' ? formatMonth(row.month) : row.date}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="amount-income">+{formatCurrency(row.income)}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="amount-expense">-{formatCurrency(row.expense)}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={profit >= 0 ? 'profit-value amount-income' : 'loss-value amount-expense'}>
                                                {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${profit >= 0 ? 'badge-success' : 'badge-danger'}`}>
                                                {profit >= 0 ? '✅ Profit' : '❌ Loss'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
