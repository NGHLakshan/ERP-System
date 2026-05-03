import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, User, FileText, Loader2 } from 'lucide-react';
import { globalSearch } from '../api/api';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                try {
                    const res = await globalSearch(query);
                    setResults(res.data.results);
                    setIsOpen(true);
                } catch (err) {
                    console.error("Search error:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (url) => {
        navigate(url);
        setQuery('');
        setIsOpen(false);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Product': return <Package className="w-4 h-4 text-blue-400" />;
            case 'Customer': return <User className="w-4 h-4 text-green-400" />;
            case 'Sales Order': return <FileText className="w-4 h-4 text-purple-400" />;
            default: return <Search className="w-4 h-4" />;
        }
    };

    return (
        <div className="relative w-full max-w-md mx-4" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="Search products, customers, orders..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 2 && setIsOpen(true)}
                />
                <div className="absolute left-3 top-2.5">
                    {loading ? (
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-slate-500" />
                    )}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl bg-opacity-95">
                    <div className="max-h-96 overflow-y-auto">
                        {results.map((result, idx) => (
                            <button
                                key={`${result.type}-${result.id}-${idx}`}
                                onClick={() => handleSelect(result.url)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 border-b border-slate-700/50 last:border-0 transition-colors text-left"
                            >
                                <div className="p-2 bg-slate-900/50 rounded-lg">
                                    {getIcon(result.type)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">{result.name}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">{result.type}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {isOpen && query.length > 2 && results.length === 0 && !loading && (
                <div className="absolute mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 text-center z-50">
                    <p className="text-sm text-slate-400">No results found for "{query}"</p>
                </div>
            )}
        </div>
    );
}
