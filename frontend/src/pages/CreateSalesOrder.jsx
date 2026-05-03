import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomers, getProducts, getStock, createSalesOrder, updateSalesOrder, getSalesOrder } from '../api/api';

const CreateSalesOrder = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // if id present → edit mode
    const isEditMode = !!id;

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [stockMap, setStockMap] = useState({}); // productId → available qty
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

            // Build a map: productId → total available quantity
            const map = {};
            stockRes.data.forEach(s => {
                map[s.product] = (map[s.product] || 0) + s.quantity;
            });
            setStockMap(map);

            // If edit mode → load existing order
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

        // Auto-fill price when product is selected
        if (field === 'product') {
            const selectedProduct = products.find(p => p.id.toString() === value.toString());
            if (selectedProduct) {
                newItems[index].price = parseFloat(selectedProduct.price);
            }
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { product: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (parseFloat(item.quantity) * parseFloat(item.price)), 0);
    };

    const getAvailableStock = (productId) => {
        if (!productId) return null;
        return stockMap[parseInt(productId)] ?? 0;
    };

    const validateItems = () => {
        for (let item of items) {
            if (!item.product || item.quantity <= 0) {
                alert('Please select a product and enter a valid quantity for all items.');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerId) { alert('Please select a customer.'); return; }
        if (!validateItems()) return;

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
            if (isEditMode) {
                await updateSalesOrder(id, orderData);
            } else {
                await createSalesOrder(orderData);
            }
            navigate('/sales');
        } catch (error) {
            console.error('Error saving order:', error);
            const msg = error.response?.data?.detail || 'Failed to save order.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading form data...</div>;

    return (
        <div>
            <div className="app-header">
                <h1 className="app-title">
                    {isEditMode ? '✏️ Edit Sales Order' : '📝 New Sales Order'}
                </h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Customer + Notes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Customer *</label>
                            <select
                                className="form-input"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                required
                            >
                                <option value="">-- Select Customer --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Notes</label>
                            <input
                                type="text"
                                className="form-input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes..."
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <h3 style={{ marginBottom: '12px' }}>Order Items</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '10px' }}>PRODUCT</th>
                                    <th style={{ padding: '10px', width: '80px' }}>STOCK</th>
                                    <th style={{ padding: '10px', width: '100px' }}>QTY</th>
                                    <th style={{ padding: '10px', width: '130px' }}>UNIT PRICE</th>
                                    <th style={{ padding: '10px', width: '120px' }}>SUBTOTAL</th>
                                    <th style={{ padding: '10px', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const available = getAvailableStock(item.product);
                                    const isLowStock = available !== null && item.quantity > available;
                                    return (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px' }}>
                                                <select
                                                    className="form-input"
                                                    style={{ margin: 0 }}
                                                    value={item.product}
                                                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map(p => {
                                                        const qty = stockMap[p.id] ?? 0;
                                                        return (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} (Stock: {qty})
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                {available !== null ? (
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '999px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        background: available === 0 ? 'rgba(239,68,68,0.2)' : available < 5 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                                                        color: available === 0 ? '#ef4444' : available < 5 ? '#f59e0b' : '#10b981',
                                                    }}>
                                                        {available}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ margin: 0, borderColor: isLowStock ? '#ef4444' : undefined }}
                                                    value={item.quantity}
                                                    min="1"
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    required
                                                />
                                                {isLowStock && (
                                                    <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>⚠️ Low</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ margin: 0 }}
                                                    value={item.price}
                                                    step="0.01"
                                                    min="0"
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                                                Rs. {(parseFloat(item.quantity) * parseFloat(item.price)).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                                                        color: items.length === 1 ? 'var(--text-muted)' : '#ef4444',
                                                        fontSize: '1.2rem',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" style={{ padding: '16px 10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                        TOTAL AMOUNT:
                                    </td>
                                    <td style={{ padding: '16px 10px', fontWeight: '700', fontSize: '1.3rem', color: 'var(--primary-color)' }}>
                                        Rs. {calculateTotal().toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" className="btn btn-secondary" onClick={addItem}>
                            + Add Item
                        </button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/sales')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : isEditMode ? '💾 Update Order' : '💾 Save as Draft'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSalesOrder;
