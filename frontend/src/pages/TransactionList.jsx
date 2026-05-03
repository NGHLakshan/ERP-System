import React, { useState, useEffect } from 'react';
import { 
  Receipt, Filter, Search, X, Calendar, 
  TrendingUp, TrendingDown, DollarSign, Download, ArrowLeft, Info
} from 'lucide-react';
import { getTransactions } from '../api/api';
import { Link } from 'react-router-dom';

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
    const netProfit = totalIncome - totalExpense;

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

    if (loading && transactions.length === 0) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fetching transaction history...</p>
        </div>
    );

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Receipt size={24} style={{ color: 'var(--primary)' }} />
                        Transaction Ledger
                    </h1>
                    <p className="page-subtitle">Complete history of financial movements</p>
                </div>
                <div className="header-actions">
                    <Link to="/finance" className="btn btn-secondary">
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                    <button className="btn btn-primary">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="tx-quick-stats" style={{ marginBottom: '1.5rem' }}>
                <div className="tx-stat">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <TrendingUp size={14} style={{ color: 'var(--success)' }} />
                        <span className="tx-stat-label">Income</span>
                    </div>
                    <span className="tx-stat-value text-success">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="tx-stat">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <TrendingDown size={14} style={{ color: 'var(--danger)' }} />
                        <span className="tx-stat-label">Expense</span>
                    </div>
                    <span className="tx-stat-value text-danger">{formatCurrency(totalExpense)}</span>
                </div>
                <div className="tx-stat">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <DollarSign size={14} style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }} />
                        <span className="tx-stat-label">Net Flux</span>
                    </div>
                    <span className={`tx-stat-value ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(Math.abs(netProfit))}
                    </span>
                </div>
                <div className="tx-stat">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Filter size={14} style={{ color: 'var(--primary-h)' }} />
                        <span className="tx-stat-label">Record Count</span>
                    </div>
                    <span className="tx-stat-value">{transactions.length} items</span>
                </div>
            </div>

            {/* Advanced Filters Card */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <Filter size={16} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Filter Transactions</h2>
                </div>
                
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '180px' }}>
                        <label className="form-label">Transaction Type</label>
                        <select
                            className="form-input"
                            value={filters.type}
                            onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
                        >
                            <option value="">All Categories</option>
                            <option value="INCOME">Income / Inflow</option>
                            <option value="EXPENSE">Expense / Outflow</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '180px' }}>
                        <label className="form-label">Date From</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                className="form-input"
                                style={{ paddingLeft: '2.4rem' }}
                                value={filters.date_from}
                                onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '180px' }}>
                        <label className="form-label">Date To</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                className="form-input"
                                style={{ paddingLeft: '2.4rem' }}
                                value={filters.date_to}
                                onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={handleApply}>
                            <Search size={16} /> Filter
                        </button>
                        <button className="btn btn-secondary" onClick={handleReset}>
                            <X size={16} /> Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            {transactions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <Info size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                    <p style={{ fontSize: '1rem' }}>No records found matching your selection.</p>
                    <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={handleReset}>Show All Records</button>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                                    <th>REFERENCE</th>
                                    <th>TYPE</th>
                                    <th>DESCRIPTION</th>
                                    <th>DATE</th>
                                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, idx) => (
                                    <tr key={tx.id}>
                                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{idx + 1}</td>
                                        <td><span className="ref-badge">{tx.reference}</span></td>
                                        <td>
                                            <span className={`status-badge ${tx.type === 'INCOME' ? 'badge-confirmed' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                {tx.type === 'INCOME' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {tx.type === 'INCOME' ? 'Income' : 'Expense'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
                                            {tx.description}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
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
                </div>
            )}
        </div>
    );
}
