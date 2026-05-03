import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                setMonthlyData(monthRes.data);
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

    // Bar chart max value
    const maxBar = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">💰 Finance Dashboard</h1>
                    <p className="page-subtitle">Real-time financial overview of your business</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/finance/transactions" className="btn btn-secondary">📋 Transactions</Link>
                    <Link to="/finance/profit" className="btn btn-primary">📊 Profit Summary</Link>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading financial data...</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="finance-cards">
                        <div className="finance-card income-card">
                            <div className="finance-card-icon">📈</div>
                            <div className="finance-card-body">
                                <p className="finance-card-label">Total Income</p>
                                <p className="finance-card-value income-value">{formatCurrency(summary.total_income)}</p>
                                <p className="finance-card-sub">From confirmed sales</p>
                            </div>
                        </div>
                        <div className="finance-card expense-card">
                            <div className="finance-card-icon">📉</div>
                            <div className="finance-card-body">
                                <p className="finance-card-label">Total Expenses</p>
                                <p className="finance-card-value expense-value">{formatCurrency(summary.total_expense)}</p>
                                <p className="finance-card-sub">From received purchases</p>
                            </div>
                        </div>
                        <div className={`finance-card ${isProfit ? 'profit-card' : 'loss-card'}`}>
                            <div className="finance-card-icon">{isProfit ? '🏆' : '⚠️'}</div>
                            <div className="finance-card-body">
                                <p className="finance-card-label">Net {isProfit ? 'Profit' : 'Loss'}</p>
                                <p className={`finance-card-value ${isProfit ? 'profit-value' : 'loss-value'}`}>
                                    {formatCurrency(Math.abs(summary.net_profit))}
                                </p>
                                <p className="finance-card-sub">Income − Expenses</p>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Bar Chart */}
                    {monthlyData.length > 0 && (
                        <div className="finance-section">
                            <h2 className="section-title">📊 Monthly Overview ({new Date().getFullYear()})</h2>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {monthlyData.map((row, i) => {
                                        const [year, monthNum] = row.month.split('-');
                                        const label = monthNames[parseInt(monthNum) - 1];
                                        const incomeHeight = maxBar > 0 ? (row.income / maxBar) * 180 : 0;
                                        const expenseHeight = maxBar > 0 ? (row.expense / maxBar) * 180 : 0;
                                        return (
                                            <div key={i} className="bar-group">
                                                <div className="bars">
                                                    <div
                                                        className="bar bar-income"
                                                        style={{ height: `${incomeHeight}px` }}
                                                        title={`Income: ${formatCurrency(row.income)}`}
                                                    ></div>
                                                    <div
                                                        className="bar bar-expense"
                                                        style={{ height: `${expenseHeight}px` }}
                                                        title={`Expense: ${formatCurrency(row.expense)}`}
                                                    ></div>
                                                </div>
                                                <span className="bar-label">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="chart-legend">
                                    <span className="legend-item"><span className="legend-dot income-dot"></span>Income</span>
                                    <span className="legend-item"><span className="legend-dot expense-dot"></span>Expense</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Transactions */}
                    <div className="finance-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>🕐 Recent Transactions</h2>
                            <Link to="/finance/transactions" style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>View All →</Link>
                        </div>
                        {recentTx.length === 0 ? (
                            <div className="empty-state">
                                <p>No transactions yet. Confirm a sale or receive a purchase to start tracking!</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Reference</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTx.map(tx => (
                                            <tr key={tx.id}>
                                                <td><span className="ref-badge">{tx.reference}</span></td>
                                                <td>
                                                    <span className={`tx-type-badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                                                        {tx.type === 'INCOME' ? '📈 Income' : '📉 Expense'}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{tx.description}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{tx.date}</td>
                                                <td>
                                                    <span className={tx.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
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
                </>
            )}
        </div>
    );
}
