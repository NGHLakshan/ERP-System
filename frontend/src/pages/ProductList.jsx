import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('products/');
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`products/${id}/`);
                fetchProducts(); // Refresh list
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div>
            <div className="app-header">
                <h1 className="app-title">Inventory Management</h1>
                <Link to="/add" className="btn btn-primary">+ Add Product</Link>
            </div>

            {products.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No products found. Add a new product to get started.
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product.id} className="card product-card">
                            <h2 className="product-title">{product.name}</h2>
                            <p className="product-desc">{product.description || 'No description provided.'}</p>
                            <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="btn btn-danger"
                                >
                                    Delete
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
