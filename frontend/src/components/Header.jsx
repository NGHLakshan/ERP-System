import React from 'react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="main-header" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '1rem 2rem',
            marginBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <NotificationBell />
            <div className="user-profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: 'white'
                }}>
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.username}</span>
            </div>
        </header>
    );
}
