import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSalesOrders, confirmSalesOrder, cancelSalesOrder } from '../api/api';

const STATUS_COLOR = {
    draft:      { bg: 'rgba(245,158,11,0.15)',   text: '#f59e0b' },
    confirmed:  { bg: 'rgba(16,185,129,0.15)',   text: '#10b981' },
    cancelled:  { bg: 'rgba(239,68,68,0.15)',    text: '#ef4444' },
};

const SalesOrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await getSalesOrders();
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sales orders:', error);
            setLoading(false);
        }
    };

    const handleConfirm = async (order) => {
        if (!window.confirm(`Confirm order SO-${order.id}? This will deduct stock.`)) return;
        try {
            await confirmSalesOrder(order.id);
            fetchOrders();
        } catch (error) {
            const msg = error.response?.data?.detail || 'Failed to confirm order.';
            alert(msg);
        }
    };

    const handleCancel = async (order) => {
        const extra = order.status === 'confirmed' ? ' Stock will be reverted.' : '';
        if (!window.confirm(`Cancel order SO-${order.id}?${extra}`)) return;
        try {
            await cancelSalesOrder(order.id);
            fetchOrders();
        } catch (error) {
            const msg = error.response?.data?.detail || 'Failed to cancel order.';
            alert(msg);
        }
    };

    if (loading) return <div className="loading">Loading sales orders...</div>;

    return (
        <div>
            <div className="app-header">
                <h1 className="app-title">📈 Sales Orders</h1>
                <Link to="/sales/new" className="btn btn-primary">+ New Order</Link>
            </div>

            {orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    No sales orders yet. <Link to="/sales/new" style={{ color: 'var(--primary-color)' }}>Create your first order →</Link>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>
                                        {h.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const sc = STATUS_COLOR[order.status] || {};
                                return (
                                    <tr
                                        key={order.id}
                                        style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--primary-color)' }}>
                                            SO-{order.id}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>{order.customer_details?.name || '—'}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                                            {order.items?.length || 0} item(s)
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--secondary-color)' }}>
                                            Rs. {parseFloat(order.total_amount || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '999px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: sc.bg,
                                                color: sc.text,
                                                textTransform: 'uppercase',
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {/* View Details */}
                                                <button
                                                    className="btn"
                                                    style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'transparent' }}
                                                    onClick={() => navigate(`/sales/${order.id}`)}
                                                >
                                                    👁 View
                                                </button>

                                                {/* Edit – only for draft */}
                                                {order.status === 'draft' && (
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }}
                                                        onClick={() => navigate(`/sales/${order.id}/edit`)}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                )}

                                                {/* Confirm – only for draft */}
                                                {order.status === 'draft' && (
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                                        onClick={() => handleConfirm(order)}
                                                    >
                                                        ✅ Confirm
                                                    </button>
                                                )}

                                                {/* Cancel */}
                                                {order.status !== 'cancelled' && (
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                                        onClick={() => handleCancel(order)}
                                                    >
                                                        ✕ Cancel
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
            )}
        </div>
    );
};

export default SalesOrderList;
