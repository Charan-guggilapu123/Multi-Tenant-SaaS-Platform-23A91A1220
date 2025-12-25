import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tenantName: '',
        subdomain: '',
        adminEmail: '',
        adminPassword: '',
        adminFullName: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await api.post('/auth/register-tenant', formData);
            if (response.data.success) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Register your organization</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-300 text-center">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                name="tenantName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Organization Name"
                                value={formData.tenantName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="subdomain"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Subdomain"
                                value={formData.subdomain}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="adminFullName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Admin Full Name"
                                value={formData.adminFullName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="adminEmail"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Admin Email"
                                value={formData.adminEmail}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="adminPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-700 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-0 focus:border-gray-600 sm:text-sm"
                                placeholder="Password"
                                value={formData.adminPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-black hover:bg-neutral-900"
                        >
                            Register
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/login" className="font-medium text-white hover:text-gray-300">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
