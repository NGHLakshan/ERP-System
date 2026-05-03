import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../api/api';
import './AuditLogs.css';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        model_name: '',
        search: ''
    });
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await getAuditLogs(filters);
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const getActionBadgeClass = (action) => {
        switch (action) {
            case 'CREATE': return 'badge-income'; // reusing existing green
            case 'UPDATE': return 'badge-warning'; // reusing existing warning
            case 'DELETE': return 'badge-expense'; // reusing existing red
            default: return '';
        }
    };

    return (
        <div className="audit-logs-page finance-page">
            <div className="app-header">
                <div>
                    <h1 className="app-title">Audit Logs</h1>
                    <p className="text-muted">History of all actions in the system</p>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    <label className="filter-label">Action</label>
                    <select 
                        name="action" 
                        value={filters.action} 
                        onChange={handleFilterChange}
                        className="form-input"
                        style={{ padding: '0.5rem', minWidth: '150px' }}
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Search</label>
                    <input 
                        type="text" 
                        name="search" 
                        placeholder="Search model or user..." 
                        value={filters.search} 
                        onChange={handleFilterChange}
                        className="form-input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading audit logs...</div>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table className="finance-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Timestamp</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Model</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                                <th style={{ padding: '1rem' }}>Object ID</th>
                                <th style={{ padding: '1rem' }}>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="item-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                                {(log.user_details?.username || 'S')[0].toUpperCase()}
                                            </div>
                                            <span>{log.user_details?.username || 'System'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="ref-badge">{log.model_name}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`tx-type-badge ${getActionBadgeClass(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>#{log.object_id}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div className="card" onClick={(e) => e.stopPropagation()} style={{
                        maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Action Details: {selectedLog.model_name} #{selectedLog.object_id}</h3>
                            <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="finance-section">
                                <h4 className="section-title">Old Data</h4>
                                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto' }}>
                                    {JSON.stringify(selectedLog.old_data || {}, null, 2)}
                                </pre>
                            </div>
                            <div className="finance-section">
                                <h4 className="section-title">New Data</h4>
                                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto' }}>
                                    {JSON.stringify(selectedLog.new_data || {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
