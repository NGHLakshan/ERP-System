import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSalesOrder, confirmSalesOrder, cancelSalesOrder } from '../api/api';
import ExportButton from '../components/ExportButton';
import { 
  ArrowLeft, Edit, CheckCircle, XCircle, Printer, 
  FileText, User, Calendar, Tag, CreditCard, Info
} from 'lucide-react';

const STATUS_MAP = {
    draft:     { cls: 'badge-draft',     label: 'Draft',     icon: Info },
    confirmed: { cls: 'badge-confirmed', label: 'Confirmed', icon: CheckCircle },
    cancelled: { cls: 'badge-cancelled', label: 'Cancelled', icon: XCircle },
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

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading order details...</p>
        </div>
    );

    if (!order) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
            <p>Order not found.</p>
            <Link to="/sales" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Back to Sales</Link>
        </div>
    );

    const sm = STATUS_MAP[order.status] || STATUS_MAP.draft;
    const StatusIcon = sm.icon;
    const total = parseFloat(order.total_amount || 0);

    const exportData = order.items.map((item, idx) => ({
        id: idx + 1,
        product: item.product_details?.name || `Product #${item.product}`,
        qty: item.quantity,
        price: `Rs. ${parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        subtotal: `Rs. ${parseFloat(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    }));

    const exportHeaders = ["#", "Product", "Qty", "Unit Price", "Subtotal"];

    return (
        <div className="sales-details-page">
            {/* Action Bar */}
            <div className="page-header no-print">
                <div>
                    <h1 className="page-title">
                        <FileText size={24} style={{ color: 'var(--primary)' }} />
                        Order SO-{order.id}
                    </h1>
                    <p className="page-subtitle">Detailed view of sales transaction</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/sales')}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    {order.status === 'draft' && (
                        <Link to={`/sales/${id}/edit`} className="btn btn-secondary">
                            <Edit size={16} /> Edit
                        </Link>
                    )}
                    {order.status === 'draft' && (
                        <button className="btn btn-primary" onClick={handleConfirm}>
                            <CheckCircle size={16} /> Confirm
                        </button>
                    )}
                    {order.status !== 'cancelled' && (
                        <button className="btn btn-danger" onClick={handleCancel}>
                            <XCircle size={16} /> Cancel
                        </button>
                    )}
                    <ExportButton 
                        data={exportData}
                        headers={exportHeaders}
                        title={`Sales Invoice: SO-${order.id}`}
                        filename={`Invoice_SO_${order.id}`}
                    />
                    <button className="btn btn-secondary" onClick={() => window.print()}>
                        <Printer size={16} /> Print
                    </button>
                </div>
            </div>

            {/* Invoice Layout */}
            <div className="card invoice-card" style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={20} color="white" />
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>ERP<span style={{ color: 'var(--primary-h)' }}>Pro</span></span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Premium Business Management Solution</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>INVOICE</h2>
                        <p style={{ color: 'var(--primary-h)', fontWeight: 700, fontSize: '1.1rem' }}>SO-{order.id}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                    {/* Bill To */}
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Bill To</p>
                        {order.customer_details ? (
                            <div>
                                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{order.customer_details.name}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                                    {order.customer_details.phone && <p>📞 {order.customer_details.phone}</p>}
                                    {order.customer_details.email && <p>📧 {order.customer_details.email}</p>}
                                    {order.customer_details.address && <p>🏠 {order.customer_details.address}</p>}
                                </div>
                            </div>
                        ) : <p style={{ color: 'var(--text-muted)' }}>No customer information</p>}
                    </div>

                    {/* Order Meta */}
                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Date Issued</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                                <Calendar size={15} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontWeight: 600 }}>{new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Order Status</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <StatusIcon size={15} className={sm.cls === 'badge-confirmed' ? 'text-success' : sm.cls === 'badge-danger' ? 'text-danger' : 'text-warning'} />
                                <span className={`status-badge ${sm.cls}`} style={{ fontWeight: 700 }}>{sm.label}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Payment Method</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                                <CreditCard size={15} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontWeight: 600 }}>Standard Terms</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Amount</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                                <Tag size={15} style={{ color: 'var(--success)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--success)' }}>Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                                <th>DESCRIPTION</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>QTY</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>UNIT PRICE</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                                    <td>
                                        <p style={{ fontWeight: 700, color: 'var(--text)' }}>{item.product_details?.name || `Product #${item.product}`}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: PRD-{item.product.toString().padStart(4, '0')}</p>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--text-sub)' }}>Rs. {parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>Rs. {parseFloat(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ maxWidth: '400px' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Notes & Comments</p>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                            {order.notes || "No additional notes provided for this transaction."}
                        </div>
                    </div>
                    <div style={{ minWidth: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>Subtotal</span>
                            <span>Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            <span>Tax (0%)</span>
                            <span>Rs. 0.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>GRAND TOTAL</span>
                            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary-h)' }}>Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>This is a computer generated invoice and does not require a signature.</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-h)' }}>THANK YOU FOR YOUR BUSINESS</p>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .sidebar { display: none !important; }
                    .main-content { margin-left: 0 !important; }
                    .page-body { padding: 0 !important; }
                    .layout { display: block !important; }
                    body { background: white !important; }
                    .invoice-card {
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        color: #111 !important;
                    }
                    .card { border: none !important; box-shadow: none !important; }
                    .table-wrapper { border: 1px solid #ddd !important; }
                    .data-table th { background: #f8f9fa !important; color: #333 !important; border-bottom: 1px solid #ddd !important; }
                    .data-table td { border-bottom: 1px solid #eee !important; color: #111 !important; }
                    * { color: #111 !important; }
                    .status-badge { border: 1px solid #ddd !important; color: #333 !important; background: none !important; }
                }
            `}</style>
        </div>
    );
};

const AlertCircle = ({ size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default SalesOrderDetails;
