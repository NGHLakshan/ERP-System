import React from 'react';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="main-header">
            {/* Left: Search */}
            <div style={{ flex: 1, maxWidth: '480px' }}>
                <GlobalSearch />
            </div>

            {/* Right: Notifications + User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <NotificationBell />

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '0.4rem 0.875rem 0.4rem 0.4rem',
                    background: 'var(--surface-2)',
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                }}>
                    <div style={{
                        width: '30px', height: '30px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: '700', color: 'white',
                        flexShrink: 0,
                    }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)', lineHeight: 1.2 }}>
                            {user?.username}
                        </p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {user?.role}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
