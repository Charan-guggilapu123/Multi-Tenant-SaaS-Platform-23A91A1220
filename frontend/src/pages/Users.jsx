import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', fullName: '', password: '', role: 'user' });
    const [tenantId, setTenantId] = useState(null);

    const fetchUsers = async () => {
        try {
            // Need tenantId first.
            let currentTenantId = tenantId;
            if (!currentTenantId) {
                const meRes = await api.get('/auth/me');
                currentTenantId = meRes.data.data.tenant.id;
                setTenantId(currentTenantId);
            }

            const response = await api.get(`/tenants/${currentTenantId}/users`);
            setUsers(response.data.data.users);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/tenants/${tenantId}/users`, newUser);
            setShowModal(false);
            setNewUser({ email: '', fullName: '', password: '', role: 'user' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating user');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (error) {
            alert('Error deleting user');
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-300">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Users</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-black border border-gray-700 text-white px-4 py-2 rounded-md hover:bg-neutral-900"
                >
                    Add User
                </button>
            </div>

            <div className="bg-neutral-800 border border-gray-800 overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-700">
                    {users.map((user) => (
                        <li key={user.id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="text-sm font-medium text-white truncate">{user.fullName}</div>
                                        <div className="ml-2 text-sm text-gray-300">{user.email}</div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200 mr-4">
                                            {user.role}
                                        </span>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-300 hover:text-red-200 text-sm">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 border border-gray-800 rounded-lg max-w-md w-full p-6 text-white">
                        <h2 className="text-xl font-bold mb-4">Add New User</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 border p-2"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 border p-2"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 border p-2"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Role</label>
                                <select
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 border p-2"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="tenant_admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-neutral-900 border border-gray-700 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black border border-gray-700 text-white px-4 py-2 rounded-md"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
