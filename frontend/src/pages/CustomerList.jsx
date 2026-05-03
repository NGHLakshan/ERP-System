import React, { useState, useEffect, useCallback } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/api';

const emptyForm = { name: '', phone: '', email: '', address: '' };

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null); // null = adding new
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchCustomers = useCallback(async (search = '') => {
        try {
            const response = await getCustomers(search);
            setCustomers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchCustomers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddForm = () => {
        setEditingCustomer(null);
        setFormData(emptyForm);
        setShowForm(true);
    };

    const openEditForm = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCustomer(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, formData);
            } else {
                await createCustomer(formData);
            }
            closeForm();
            fetchCustomers(searchTerm);
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Failed to save customer.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (customer) => {
        if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return;
        try {
            await deleteCustomer(customer.id);
            fetchCustomers(searchTerm);
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Failed to delete customer. They may have existing sales orders.');
        }
    };

    if (loading) return <div className="loading">Loading customers...</div>;

    return (
        <div>
            {/* Header */}
            <div className="app-header">
                <h1 className="app-title">👥 Customers</h1>
                <button className="btn btn-primary" onClick={openAddForm}>
                    + Add Customer
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="🔍  Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(99,102,241,0.4)' }}>
                    <h2 style={{ marginBottom: '20px' }}>
                        {editingCustomer ? `Edit: ${editingCustomer.name}` : 'Add New Customer'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Customer name"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Phone</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="077 000 0000"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={closeForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customer Grid */}
            {customers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    {searchTerm ? `No customers found for "${searchTerm}"` : 'No customers yet. Add your first customer!'}
                </div>
            ) : (
                <div className="product-grid">
                    {customers.map((customer) => (
                        <div key={customer.id} className="card product-card">
                            <h3 style={{ marginTop: 0, marginBottom: '12px', color: 'var(--text-main)' }}>
                                {customer.name}
                            </h3>
                            <p style={{ margin: '5px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                📞 {customer.phone || 'N/A'}
                            </p>
                            <p style={{ margin: '5px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                📧 {customer.email || 'N/A'}
                            </p>
                            <p style={{ margin: '5px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                🏠 {customer.address || 'N/A'}
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                    onClick={() => openEditForm(customer)}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                    onClick={() => handleDelete(customer)}
                                >
                                    🗑️ Delete
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
