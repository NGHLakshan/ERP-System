import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSalesOrders, confirmSalesOrder, cancelSalesOrder } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, FilePlus, Eye, Edit2, CheckCircle, XCircle } from 'lucide-react';

const STATUS_MAP = {
    draft:     { cls: 'badge-draft',     label: 'Draft'     },
    confirmed: { cls: 'badge-confirmed', label: 'Confirmed' },
    cancelled: { cls: 'badge-cancelled', label: 'Cancelled' },
};

const SalesOrderList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);

    const isManager = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try { const r = await getSalesOrders(); setOrders(r.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleConfirm = async (order) => {
        if (!window.confirm(`Confirm SO-${order.id}? Stock will be deducted.`)) return;
        try { await confirmSalesOrder(order.id); fetchOrders(); }
        catch (e) { alert(e.response?.data?.detail || 'Failed to confirm.'); }
    };

    const handleCancel = async (order) => {
        const extra = order.status === 'confirmed' ? ' Stock will be reverted.' : '';
        if (!window.confirm(`Cancel SO-${order.id}?${extra}`)) return;
        try { await cancelSalesOrder(order.id); fetchOrders(); }
        catch (e) { alert(e.response?.data?.detail || 'Failed to cancel.'); }
    };

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading orders...</p>
        </div>
    );

    // Summary counts
    const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
    const totalRev = orders.filter(o => o.status === 'confirmed').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title"><ShoppingCart size={24} style={{ color: 'var(--primary)' }} /> Sales Orders</h1>
                    <p className="page-subtitle">{orders.length} total orders</p>
                </div>
                <div className="header-actions">
                    <Link to="/sales/new" className="btn btn-primary"><FilePlus size={16} /> New Order</Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="tx-quick-stats" style={{ marginBottom: '1.5rem' }}>
                {[
                    { label: 'Draft',     value: counts.draft     || 0, color: '#f59e0b' },
                    { label: 'Confirmed', value: counts.confirmed || 0, color: '#10b981' },
                    { label: 'Cancelled', value: counts.cancelled || 0, color: '#ef4444' },
                    { label: 'Revenue',   value: `Rs. ${totalRev.toLocaleString()}`, color: '#818cf8' },
                ].map(s => (
                    <div className="tx-stat" key={s.label}>
                        <span className="tx-stat-label">{s.label}</span>
                        <span className="tx-stat-value" style={{ color: s.color }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <ShoppingCart size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No sales orders yet.</p>
                    <Link to="/sales/new" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                        <FilePlus size={16} /> Create First Order
                    </Link>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => {
                                    const sm = STATUS_MAP[order.status] || {};
                                    return (
                                        <tr key={order.id}>
                                            <td>
                                                <button
                                                    onClick={() => navigate(`/sales/${order.id}`)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary-h)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', padding: 0 }}
                                                >
                                                    SO-{order.id}
                                                </button>
                                            </td>
                                            <td style={{ fontWeight: 500, color: 'var(--text)' }}>
                                                {order.customer_details?.name || '—'}
                                            </td>
                                            <td>{new Date(order.date).toLocaleDateString('en-GB')}</td>
                                            <td>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                                                Rs. {parseFloat(order.total_amount || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${sm.cls}`}>{sm.label}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem' }}
                                                        onClick={() => navigate(`/sales/${order.id}`)}>
                                                        <Eye size={14} />
                                                    </button>
                                                    {order.status === 'draft' && (
                                                        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem' }}
                                                            onClick={() => navigate(`/sales/${order.id}/edit`)}>
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                    {order.status === 'draft' && isManager && (
                                                        <button className="btn btn-success" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                                                            onClick={() => handleConfirm(order)}>
                                                            <CheckCircle size={14} /> Confirm
                                                        </button>
                                                    )}
                                                    {order.status !== 'cancelled' && isManager && (
                                                        <button className="btn btn-danger" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                                                            onClick={() => handleCancel(order)}>
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
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
    );
};

export default SalesOrderList;
