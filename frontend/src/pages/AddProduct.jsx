import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Package, ArrowLeft, Save, AlertCircle, Tag, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';

const AddProduct = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({ name: '', description: '', price: '', reorder_level: 10 });
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const isManager = user?.role === 'admin' || user?.role === 'manager';

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            await api.post('inventory/products/', formData);
            navigate('/products');
        } catch {
            setError('Failed to save product. Please check your inputs.');
            setLoading(false);
        }
    };

    if (!isManager) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '2rem', borderRadius: '1.5rem', marginBottom: '1.5rem' }}>
                    <ShieldAlert size={48} color="#ef4444" />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Access Denied</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You don't have permission to add products.</p>
                <Link to="/products" className="btn btn-primary">Go Back to Products</Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Package size={24} style={{ color: 'var(--primary)' }} /> Add New Product</h1>
                    <p className="page-subtitle">Fill in the details to add a product to inventory.</p>
                </div>
                <div className="header-actions">
                    <Link to="/products" className="btn btn-secondary"><ArrowLeft size={16} /> Back</Link>
                </div>
            </div>

            <div style={{ maxWidth: '600px' }}>
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
                        color: '#f87171', fontSize: '0.875rem',
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
                    </div>
                )}

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        {/* Product Name */}
                        <div className="form-group">
                            <label className="form-label">
                                <FileText size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                Product Name *
                            </label>
                            <input type="text" name="name" className="form-input" value={formData.name}
                                onChange={handleChange} required placeholder="e.g. Samsung Galaxy A55" />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-input" value={formData.description}
                                onChange={handleChange} placeholder="Optional product description..." />
                        </div>

                        {/* Price + Reorder Level */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">
                                    <Tag size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                    Price (Rs.) *
                                </label>
                                <input type="number" name="price" step="0.01" min="0" className="form-input"
                                    value={formData.price} onChange={handleChange} required placeholder="0.00" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">
                                    <AlertTriangle size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                    Reorder Level
                                </label>
                                <input type="number" name="reorder_level" min="0" className="form-input"
                                    value={formData.reorder_level} onChange={handleChange} placeholder="10" />
                            </div>
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                                {loading
                                    ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                                    : <><Save size={16} /> Save Product</>
                                }
                            </button>
                            <Link to="/products" className="btn btn-secondary"><ArrowLeft size={16} /> Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
