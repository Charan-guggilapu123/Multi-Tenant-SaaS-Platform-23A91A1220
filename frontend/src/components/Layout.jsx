import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [dark, setDark] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'dark';
        const isDark = saved === 'dark';
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleTheme = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <nav className="bg-neutral-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/dashboard" className="text-xl font-bold text-white">SaaS Platform</Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/dashboard" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Dashboard
                                </Link>
                                <Link to="/projects" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Projects
                                </Link>
                                {(user && (user.role === 'tenant_admin' || user.role === 'super_admin')) && (
                                    <Link to="/subscription" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Subscription
                                    </Link>
                                )}
                                {user && (user.role === 'tenant_admin' || user.role === 'super_admin') && (
                                    <Link to="/users" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Users
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={toggleTheme}
                                className="relative inline-flex items-center px-3 py-2 border border-gray-700 text-sm rounded-md text-white bg-black hover:bg-neutral-800"
                            >
                                {dark ? 'Dark' : 'Light'}
                            </button>
                            <div className="flex-shrink-0">
                                <span className="text-gray-300 mr-4">
                                    {user?.fullName} ({user?.role})
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-white bg-black hover:bg-neutral-800 focus:outline-none"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
