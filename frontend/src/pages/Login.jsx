import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        tenantSubdomain: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await api.post('/auth/login', formData);
            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Sign in to your account</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-300 text-center">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                name="tenantSubdomain"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Tenant Subdomain (e.g. demo)"
                                value={formData.tenantSubdomain}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-black hover:bg-neutral-900"
                        >
                            Sign in
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/register" className="font-medium text-white hover:text-gray-300">
                            Or register a new tenant
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
