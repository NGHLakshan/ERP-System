import React from 'react';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-8 py-4 mb-4 border-b border-white/5 bg-slate-900/20 backdrop-blur-md sticky top-0 z-30">
            <div className="flex-1 flex justify-start">
                <GlobalSearch />
            </div>
            
            <div className="flex items-center gap-6">
                <NotificationBell />
                <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{user?.username}</span>
                </div>
            </div>
        </header>
    );
}
