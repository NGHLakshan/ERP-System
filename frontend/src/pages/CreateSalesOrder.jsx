import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCustomers, getProducts, getStock, createSalesOrder, updateSalesOrder, getSalesOrder } from '../api/api';
import { 
  FilePlus, ShoppingCart, User, MessageSquare, Plus, Trash2, 
  ArrowLeft, Save, AlertCircle, Package, Info
} from 'lucide-react';

const CreateSalesOrder = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [stockMap, setStockMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [customerId, setCustomerId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ product: '', quantity: 1, price: 0 }]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [custRes, prodRes, stockRes] = await Promise.all([
                getCustomers(),
                getProducts(),
                getStock(),
            ]);

            setCustomers(custRes.data);
            setProducts(prodRes.data);

            const map = {};
            stockRes.data.forEach(s => {
                map[s.product] = (map[s.product] || 0) + s.quantity;
            });
            setStockMap(map);

            if (isEditMode) {
                const orderRes = await getSalesOrder(id);
                const order = orderRes.data;

                if (order.status !== 'draft') {
                    alert(`This order is "${order.status}" and cannot be edited.`);
                    navigate('/sales');
                    return;
                }

                setCustomerId(order.customer || '');
                setNotes(order.notes || '');
                setItems(
                    order.items.map(i => ({
                        product: i.product.toString(),
                        quantity: i.quantity,
                        price: parseFloat(i.price),
                    }))
                );
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'product') {
            const selectedProduct = products.find(p => p.id.toString() === value.toString());
            if (selectedProduct) {
                newItems[index].price = parseFloat(selectedProduct.price);
            }
        }

        setItems(newItems);
    };

    const addItem = () => setItems([...items, { product: '', quantity: 1, price: 0 }]);
    const removeItem = (index) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => items.reduce((total, item) => total + (parseFloat(item.quantity) * parseFloat(item.price)), 0);
    const getAvailableStock = (productId) => productId ? (stockMap[parseInt(productId)] ?? 0) : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerId) { alert('Please select a customer.'); return; }
        
        setSaving(true);
        const orderData = {
            customer: customerId,
            notes,
            items: items.map(i => ({
                product: i.product,
                quantity: parseInt(i.quantity),
                price: parseFloat(i.price),
            })),
        };

        try {
            isEditMode ? await updateSalesOrder(id, orderData) : await createSalesOrder(orderData);
            navigate('/sales');
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to save order.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Preparing order form...</p>
        </div>
    );

    return (
        <div className="sales-order-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {isEditMode ? <Edit2 size={24} style={{ color: 'var(--primary)' }} /> : <FilePlus size={24} style={{ color: 'var(--primary)' }} />}
                        {isEditMode ? 'Edit Sales Order' : 'New Sales Order'}
                    </h1>
                    <p className="page-subtitle">{isEditMode ? `Order Reference: SO-${id}` : 'Create a new draft order for a customer'}</p>
                </div>
                <div className="header-actions">
                    <Link to="/sales" className="btn btn-secondary">
                        <ArrowLeft size={16} /> Back to List
                    </Link>
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                <User size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                Customer *
                            </label>
                            <select
                                className="form-input"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                required
                            >
                                <option value="">Select a customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                <MessageSquare size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                Notes
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special instructions..."
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <Package size={18} style={{ color: 'var(--primary-h)' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Order Items</h3>
                    </div>

                    <div className="table-wrapper" style={{ marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>PRODUCT</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>STOCK</th>
                                    <th style={{ width: '120px' }}>QUANTITY</th>
                                    <th style={{ width: '150px' }}>UNIT PRICE</th>
                                    <th style={{ width: '150px' }}>SUBTOTAL</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const available = getAvailableStock(item.product);
                                    const isLowStock = available !== null && item.quantity > available;
                                    return (
                                        <tr key={index}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <select
                                                    className="form-input"
                                                    value={item.product}
                                                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {available !== null ? (
                                                    <span className={`status-badge ${available === 0 ? 'badge-danger' : available < 5 ? 'badge-draft' : 'badge-confirmed'}`} style={{ minWidth: '36px', justifyContent: 'center' }}>
                                                        {available}
                                                    </span>
                                                ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={item.quantity}
                                                        min="1"
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        required
                                                        style={{ borderColor: isLowStock ? 'var(--danger)' : undefined }}
                                                    />
                                                    {isLowStock && (
                                                        <div style={{ position: 'absolute', top: '-18px', right: 0, fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                            <AlertCircle size={10} /> OVER LIMIT
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={item.price}
                                                    step="0.01"
                                                    min="0"
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>
                                                Rs. {(parseFloat(item.quantity) * parseFloat(item.price)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                    className="btn-danger"
                                                    style={{ background: 'none', border: 'none', padding: '4px', cursor: items.length === 1 ? 'not-allowed' : 'pointer', opacity: items.length === 1 ? 0.3 : 1 }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', padding: '1.25rem' }}>
                                        GRAND TOTAL
                                    </td>
                                    <td style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-h)', padding: '1.25rem' }}>
                                        Rs. {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" className="btn btn-secondary" onClick={addItem}>
                            <Plus size={16} /> Add Another Item
                        </button>
                        <div style={{ display: 'flex', gap: '0.875rem' }}>
                            <Link to="/sales" className="btn btn-secondary">Cancel</Link>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? (
                                    <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div> Processing...</>
                                ) : (
                                    <><Save size={16} /> {isEditMode ? 'Update Order' : 'Save as Draft'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(99,102,241,0.05)', borderStyle: 'dashed' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Inventory Note</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Stock will only be deducted when the order is <strong>Confirmed</strong>. Draft orders reserve no stock. 
                            Prices are automatically pulled from current product data but can be overridden.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Edit2 = ({ size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);

export default CreateSalesOrder;
