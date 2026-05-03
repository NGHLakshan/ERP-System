import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, Eye, User, 
  Calendar, Layers, Activity, X, Database
} from 'lucide-react';
import { getAuditLogs } from '../api/api';

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
            case 'CREATE': return 'badge-confirmed';
            case 'UPDATE': return 'badge-draft';
            case 'DELETE': return 'badge-danger';
            default: return '';
        }
    };

    if (loading && logs.length === 0) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Scanning system history...</p>
        </div>
    );

    return (
        <div className="audit-logs-page finance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <History size={24} style={{ color: 'var(--primary)' }} />
                        System Audit Logs
                    </h1>
                    <p className="page-subtitle">Track every change and action across the platform</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
                        <label className="form-label"><Activity size={12} style={{ marginRight: '4px' }} /> Action Type</label>
                        <select 
                            name="action" 
                            value={filters.action} 
                            onChange={handleFilterChange}
                            className="form-input"
                        >
                            <option value="">All Operations</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: '250px' }}>
                        <label className="form-label"><Search size={12} style={{ marginRight: '4px' }} /> Search Record</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                name="search" 
                                placeholder="Search by model, user or ID..." 
                                value={filters.search} 
                                onChange={handleFilterChange}
                                className="form-input"
                                style={{ paddingLeft: '2.4rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            {logs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <Database size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                    <p style={{ fontSize: '1rem' }}>No logs found matching your filters.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>TIMESTAMP</th>
                                    <th>PERFORMED BY</th>
                                    <th>MODEL</th>
                                    <th style={{ textAlign: 'center' }}>ACTION</th>
                                    <th style={{ textAlign: 'center' }}>OBJ ID</th>
                                    <th style={{ textAlign: 'right' }}>DATA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={12} />
                                                {new Date(log.timestamp).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                <div style={{ 
                                                    width: '24px', height: '24px', borderRadius: '50%', 
                                                    background: 'rgba(99,102,241,0.1)', color: 'var(--primary-h)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.7rem', fontWeight: 800
                                                }}>
                                                    {(log.user_details?.username || 'S')[0].toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.user_details?.username || 'System'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Layers size={12} style={{ color: 'var(--text-muted)' }} />
                                                <span className="ref-badge" style={{ fontSize: '0.75rem' }}>{log.model_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge ${getActionBadgeClass(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            #{log.object_id}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <Eye size={12} /> Inspect
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Log Inspector Modal */}
            {selectedLog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)',
                    padding: '2rem'
                }} onClick={() => setSelectedLog(null)}>
                    <div className="card" style={{
                        maxWidth: '900px', width: '100%', maxHeight: '85vh', 
                        display: 'flex', flexDirection: 'column', padding: 0,
                        overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                        borderColor: 'var(--primary)'
                    }} onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div style={{ 
                            padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <History size={20} style={{ color: 'var(--primary-h)' }} />
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Audit Inspector</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedLog.model_name} Record #{selectedLog.object_id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--danger)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                    Previous State
                                </h4>
                                <div style={{ background: '#05070a', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', fontSize: '0.8rem', position: 'relative' }}>
                                    <pre style={{ margin: 0, color: '#f87171', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(selectedLog.old_data || {}, null, 2)}
                                    </pre>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                    Updated State
                                </h4>
                                <div style={{ background: '#05070a', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', fontSize: '0.8rem' }}>
                                    <pre style={{ margin: 0, color: '#34d399', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(selectedLog.new_data || {}, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', textAlign: 'right' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Close Inspector</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
