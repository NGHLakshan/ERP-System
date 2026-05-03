import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('products/', formData);
            navigate('/');
        } catch (err) {
            console.error('Error adding product:', err);
            setError('Failed to add product. Please check the inputs.');
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="app-header" style={{ marginBottom: '2rem' }}>
                <h1 className="app-title">Add New Product</h1>
                <Link to="/" className="btn" style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                    ← Back to List
                </Link>
            </div>

            <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            className="form-input"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Price</label>
                        <input
                            type="number"
                            name="price"
                            step="0.01"
                            className="form-input"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
