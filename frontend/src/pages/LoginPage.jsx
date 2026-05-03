import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const { login }   = useAuth();
    const navigate    = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ username, password });
            navigate('/');
        } catch {
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
            }} />

            <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                    }}>
                        <Zap size={28} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem', fontWeight: '800',
                        background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                    }}>
                        ERPPro
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Sign in to your workspace
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                }}>
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            marginBottom: '1.25rem',
                            color: '#f87171',
                            fontSize: '0.875rem',
                        }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{
                                display: 'block', fontSize: '0.78rem', fontWeight: '600',
                                color: 'var(--text-sub)', marginBottom: '0.4rem',
                                textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                                Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{
                                    position: 'absolute', left: '12px', top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                                }} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter your username"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.875rem 0.65rem 2.4rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: 'var(--text)',
                                        fontSize: '0.875rem',
                                        fontFamily: 'Inter, sans-serif',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block', fontSize: '0.78rem', fontWeight: '600',
                                color: 'var(--text-sub)', marginBottom: '0.4rem',
                                textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{
                                    position: 'absolute', left: '12px', top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                                }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.875rem 0.65rem 2.4rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: 'var(--text)',
                                        fontSize: '0.875rem',
                                        fontFamily: 'Inter, sans-serif',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: loading ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                fontFamily: 'Inter, sans-serif',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '16px', height: '16px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                    Signing in...
                                </>
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ERPPro v2.3 · Secure Business Management
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
