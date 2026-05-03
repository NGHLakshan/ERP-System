import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Package, Plus, Trash2, Tag, AlertTriangle, Search } from 'lucide-react';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try { const r = await api.get('inventory/products/'); setProducts(r.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try { await api.delete(`inventory/products/${id}/`); fetchProducts(); }
        catch { alert('Failed to delete product.'); }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading inventory...</p>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Package size={24} style={{ color: 'var(--primary)' }} /> Products</h1>
                    <p className="page-subtitle">{products.length} products in inventory</p>
                </div>
                <div className="header-actions">
                    <Link to="/add" className="btn btn-primary"><Plus size={16} /> Add Product</Link>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.2rem' }}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>{search ? `No products matching "${search}"` : 'No products yet.'}</p>
                    <Link to="/add" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                        <Plus size={16} /> Add First Product
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: '1.25rem' }}>
                    {filtered.map(product => (
                        <div key={product.id} className="card"
                            style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            {/* Icon + Name */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                    background: 'rgba(99,102,241,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Package size={20} style={{ color: '#818cf8' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '2px' }}>
                                        {product.name}
                                    </p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {product.description || 'No description'}
                                    </p>
                                </div>
                            </div>

                            {/* Price + Reorder */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Tag size={14} style={{ color: 'var(--success)' }} />
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--success)' }}>
                                        Rs. {parseFloat(product.price).toFixed(2)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Reorder @ {product.reorder_level}
                                    </span>
                                </div>
                            </div>

                            {/* Action */}
                            <div style={{ marginTop: 'auto' }}>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="btn btn-danger"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
