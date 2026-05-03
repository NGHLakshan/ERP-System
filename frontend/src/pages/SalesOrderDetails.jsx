import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSalesOrder, confirmSalesOrder, cancelSalesOrder } from '../api/api';

const STATUS_COLOR = {
    draft:      { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
    confirmed:  { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    cancelled:  { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444' },
};

const SalesOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await getSalesOrder(id);
            setOrder(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order:', error);
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!window.confirm('Confirm this order? Stock will be deducted.')) return;
        try {
            await confirmSalesOrder(id);
            fetchOrder();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to confirm order.');
        }
    };

    const handleCancel = async () => {
        const extra = order.status === 'confirmed' ? ' Stock will be reverted.' : '';
        if (!window.confirm(`Cancel this order?${extra}`)) return;
        try {
            await cancelSalesOrder(id);
            fetchOrder();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to cancel order.');
        }
    };

    if (loading) return <div className="loading">Loading order details...</div>;
    if (!order) return <div className="card" style={{ color: 'var(--danger-color)' }}>Order not found.</div>;

    const sc = STATUS_COLOR[order.status] || {};
    const total = parseFloat(order.total_amount || 0);

    return (
        <div>
            {/* Top bar (screen only) */}
            <div className="app-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={() => navigate('/sales')}>
                        ← Back
                    </button>
                    <h1 className="app-title">Order SO-{order.id}</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status === 'draft' && (
                        <Link to={`/sales/${id}/edit`} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                            ✏️ Edit
                        </Link>
                    )}
                    {order.status === 'draft' && (
                        <button className="btn btn-primary" onClick={handleConfirm}>
                            ✅ Confirm Order
                        </button>
                    )}
                    {order.status !== 'cancelled' && (
                        <button className="btn btn-danger" onClick={handleCancel}>
                            ✕ Cancel
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px' }}
                        onClick={() => window.print()}
                    >
                        🖨️ Print Invoice
                    </button>
                </div>
            </div>

            {/* Invoice card */}
            <div className="card invoice-card">
                {/* Invoice Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--border-color)' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ⚡ ERPPro
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>Sales Invoice</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            INVOICE
                        </div>
                        <div style={{ color: 'var(--primary-color)', fontWeight: '600', marginTop: '4px' }}>
                            SO-{order.id}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                            Date: {new Date(order.date).toLocaleDateString('en-GB')}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <span style={{
                                padding: '4px 14px',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                background: sc.bg,
                                color: sc.text,
                            }}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: '28px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.08em', marginBottom: '8px' }}>BILL TO</p>
                    {order.customer_details ? (
                        <>
                            <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>{order.customer_details.name}</p>
                            {order.customer_details.phone && <p style={{ color: 'var(--text-muted)' }}>📞 {order.customer_details.phone}</p>}
                            {order.customer_details.email && <p style={{ color: 'var(--text-muted)' }}>📧 {order.customer_details.email}</p>}
                            {order.customer_details.address && <p style={{ color: 'var(--text-muted)' }}>🏠 {order.customer_details.address}</p>}
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>No customer info</p>
                    )}
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>#</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>PRODUCT</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>QTY</th>
                            <th style={{ padding: '12px 14px', textAlign: 'right' }}>UNIT PRICE</th>
                            <th style={{ padding: '12px 14px', textAlign: 'right' }}>SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, idx) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                                <td style={{ padding: '12px 14px', fontWeight: '500' }}>
                                    {item.product_details?.name || `Product #${item.product}`}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>{item.quantity}</td>
                                <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                                    Rs. {parseFloat(item.price).toFixed(2)}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600', color: 'var(--secondary-color)' }}>
                                    Rs. {parseFloat(item.subtotal).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                            <td colSpan="4" style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '700', fontSize: '1rem', color: 'var(--text-muted)' }}>
                                TOTAL AMOUNT
                            </td>
                            <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '1.4rem', color: 'var(--primary-color)' }}>
                                Rs. {total.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Notes */}
                {order.notes && (
                    <div style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginTop: '16px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>NOTES</p>
                        <p style={{ color: 'var(--text-main)' }}>{order.notes}</p>
                    </div>
                )}

                <p style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Thank you for your business! — ERPPro System
                </p>
            </div>

            {/* Print CSS */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .sidebar { display: none !important; }
                    body { background: white !important; }
                    .invoice-card {
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                        color: #111 !important;
                    }
                    * { color: #111 !important; }
                }
            `}</style>
        </div>
    );
};

export default SalesOrderDetails;
