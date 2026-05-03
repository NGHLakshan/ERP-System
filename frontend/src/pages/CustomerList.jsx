import React, { useState, useEffect, useCallback } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/api';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X, Save } from 'lucide-react';

const emptyForm = { name: '', phone: '', email: '', address: '' };

const CustomerList = () => {
    const [customers,       setCustomers]       = useState([]);
    const [loading,         setLoading]         = useState(true);
    const [searchTerm,      setSearchTerm]      = useState('');
    const [showForm,        setShowForm]        = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData,        setFormData]        = useState(emptyForm);
    const [saving,          setSaving]          = useState(false);

    const fetchCustomers = useCallback(async (search = '') => {
        try {
            const response = await getCustomers(search);
            setCustomers(response.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
    useEffect(() => {
        const t = setTimeout(() => fetchCustomers(searchTerm), 400);
        return () => clearTimeout(t);
    }, [searchTerm, fetchCustomers]);

    const handleChange  = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const openAddForm   = () => { setEditingCustomer(null); setFormData(emptyForm); setShowForm(true); };
    const openEditForm  = c  => { setEditingCustomer(c); setFormData({ name: c.name, phone: c.phone, email: c.email, address: c.address }); setShowForm(true); };
    const closeForm     = () => { setShowForm(false); setEditingCustomer(null); setFormData(emptyForm); };

    const handleSubmit = async e => {
        e.preventDefault(); setSaving(true);
        try {
            editingCustomer ? await updateCustomer(editingCustomer.id, formData) : await createCustomer(formData);
            closeForm(); fetchCustomers(searchTerm);
        } catch { alert('Failed to save customer.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async c => {
        if (!window.confirm(`Delete "${c.name}"?`)) return;
        try { await deleteCustomer(c.id); fetchCustomers(searchTerm); }
        catch { alert('Cannot delete — customer has existing orders.'); }
    };

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading customers...</p>
        </div>
    );

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Users size={24} style={{ color: 'var(--primary)' }} /> Customers</h1>
                    <p className="page-subtitle">{customers.length} customer{customers.length !== 1 ? 's' : ''} registered</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={openAddForm}>
                        <Plus size={16} /> Add Customer
                    </button>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '1.5rem' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.2rem' }}
                />
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99,102,241,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
                            {editingCustomer ? `Edit: ${editingCustomer.name}` : 'New Customer'}
                        </h2>
                        <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {[
                                { name: 'name',    label: 'Full Name *', placeholder: 'Customer name', type: 'text',  required: true  },
                                { name: 'phone',   label: 'Phone',       placeholder: '077 000 0000',  type: 'text'                   },
                                { name: 'email',   label: 'Email',       placeholder: 'email@example.com', type: 'email'              },
                                { name: 'address', label: 'Address',     placeholder: 'Address',        type: 'text'                   },
                            ].map(f => (
                                <div className="form-group" key={f.name} style={{ marginBottom: 0 }}>
                                    <label className="form-label">{f.label}</label>
                                    <input type={f.type} name={f.name} className="form-input" value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder} required={f.required} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <Save size={15} /> {saving ? 'Saving...' : editingCustomer ? 'Update' : 'Save Customer'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={closeForm}><X size={15} /> Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customer Cards */}
            {customers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>{searchTerm ? `No results for "${searchTerm}"` : 'No customers yet. Add your first!'}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1.25rem' }}>
                    {customers.map(c => (
                        <div key={c.id} className="card" style={{ transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            {/* Avatar + Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '1rem', color: 'white', flexShrink: 0,
                                }}>
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, color: 'var(--text)' }}>{c.name}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                                {[
                                    { icon: Phone, value: c.phone || 'Not provided' },
                                    { icon: Mail,  value: c.email || 'Not provided' },
                                    { icon: MapPin,value: c.address || 'Not provided' },
                                ].map(({ icon: Icon, value }, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Icon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.825rem', color: value === 'Not provided' ? 'var(--text-muted)' : 'var(--text-sub)' }}>{value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => openEditForm(c)}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button className="btn btn-danger" onClick={() => handleDelete(c)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerList;
