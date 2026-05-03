import React, { useState, useEffect } from 'react';
import { getTransactions } from '../api/api';

export default function TransactionList() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ type: '', date_from: '', date_to: '' });
    const [applied, setApplied] = useState({});

    const fetchTransactions = async (params = {}) => {
        setLoading(true);
        try {
            const res = await getTransactions(params);
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleApply = () => {
        setApplied(filters);
        fetchTransactions(filters);
    };

    const handleReset = () => {
        const empty = { type: '', date_from: '', date_to: '' };
        setFilters(empty);
        setApplied({});
        fetchTransactions(empty);
    };

    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount), 0);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📋 Transactions</h1>
                    <p className="page-subtitle">All income and expense records</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="tx-quick-stats">
                <div className="tx-stat income-stat">
                    <span className="tx-stat-label">Filtered Income</span>
                    <span className="tx-stat-value income-value">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="tx-stat expense-stat">
                    <span className="tx-stat-label">Filtered Expenses</span>
                    <span className="tx-stat-value expense-value">{formatCurrency(totalExpense)}</span>
                </div>
                <div className={`tx-stat ${totalIncome - totalExpense >= 0 ? 'profit-stat' : 'loss-stat'}`}>
                    <span className="tx-stat-label">Net Profit</span>
                    <span className={`tx-stat-value ${totalIncome - totalExpense >= 0 ? 'profit-value' : 'loss-value'}`}>
                        {formatCurrency(totalIncome - totalExpense)}
                    </span>
                </div>
                <div className="tx-stat">
                    <span className="tx-stat-label">Total Records</span>
                    <span className="tx-stat-value">{transactions.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-group">
                    <label className="filter-label">Type</label>
                    <select
                        className="form-input"
                        value={filters.type}
                        onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
                        style={{ minWidth: '140px' }}
                    >
                        <option value="">All Types</option>
                        <option value="INCOME">📈 Income</option>
                        <option value="EXPENSE">📉 Expense</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">From Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={filters.date_from}
                        onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))}
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">To Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={filters.date_to}
                        onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))}
                    />
                </div>
                <div className="filter-actions">
                    <button className="btn btn-primary" onClick={handleApply}>🔍 Apply</button>
                    <button className="btn btn-secondary" onClick={handleReset}>✕ Reset</button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading transactions...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <p>No transactions found. Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Reference</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, idx) => (
                                <tr key={tx.id} className={tx.type === 'INCOME' ? 'row-income' : 'row-expense'}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                                    <td><span className="ref-badge">{tx.reference}</span></td>
                                    <td>
                                        <span className={`tx-type-badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                                            {tx.type === 'INCOME' ? '📈 Income' : '📉 Expense'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '300px' }}>
                                        {tx.description}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{tx.date}</td>
                                    <td style={{ textAlign: 'right' }}>
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
    );
}
