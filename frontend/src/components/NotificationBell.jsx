import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/api';
import './NotificationBell.css';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications();
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button 
                className={`bell-button ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
                title="Notifications"
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="mark-all-btn">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="dropdown-body">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">No notifications yet</div>
                        ) : (
                            notifications.slice(0, 10).map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                >
                                    <div className="notification-content">
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">{formatTime(notification.created_at)}</span>
                                    </div>
                                    {!notification.is_read && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="dropdown-footer">
                            <span>Showing latest {Math.min(notifications.length, 10)}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
