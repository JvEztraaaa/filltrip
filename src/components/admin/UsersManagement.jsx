import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import DeleteConfirmationModal from '../ui/delete-confirmation-modal';
import { adminUsers } from '../../others/services/admin';

const UsersManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchUsers = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await adminUsers.getUsers(page, 10, search);
            setUsers(response.users || []);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, searchTerm);
    }, [currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers(1, searchTerm);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchUsers(1, '');
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        
        try {
            await adminUsers.updateUser(editingUser.id, editingUser);
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers(currentPage, searchTerm);
        } catch (err) {
            setError(err.message || 'Failed to update user');
        }
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        
        try {
            setIsDeleting(true);
            await adminUsers.deleteUser(userToDelete.id);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers(currentPage, searchTerm);
        } catch (err) {
            setError(err.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    // Navigation handlers for viewing user data
    const handleViewUserTrips = (user) => {
        navigate(`/admin/trips?userId=${user.id}&userName=${encodeURIComponent(user.first_name + ' ' + user.last_name)}`);
    };

    const handleViewUserSavedPlaces = (user) => {
        navigate(`/admin/saved-places?userId=${user.id}&userName=${encodeURIComponent(user.first_name + ' ' + user.last_name)}`);
    };

    const handleViewUserFuelHistory = (user) => {
        navigate(`/admin/fuel-history?userId=${user.id}&userName=${encodeURIComponent(user.first_name + ' ' + user.last_name)}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && users.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200">Users Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-16 bg-gray-700/30 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <CardTitle className="text-gray-200 flex items-center space-x-2">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <span>Users Management</span>
                                <span className="text-sm font-normal text-gray-400">({users.length} users)</span>
                            </CardTitle>
                        </div>
                        
                        <form onSubmit={handleSearch} className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                                title="Refresh data"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </CardHeader>
                
                <CardContent>
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">User</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Email</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Role</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Created</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">View</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                                        <span className="text-white font-medium text-sm">
                                                            {user.first_name?.charAt(0) || user.username?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-200">
                                                        {user.first_name && user.last_name 
                                                            ? `${user.first_name} ${user.last_name}`
                                                            : user.username
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-400">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-gray-200">{user.email}</td>
                                        <td className="py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-500/20 text-purple-300' 
                                                    : 'bg-blue-500/20 text-blue-300'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                                        <td className="py-4 text-sm">
                                            <div className="flex flex-col space-y-1">
                                                <button
                                                    onClick={() => handleViewUserTrips(user)}
                                                    className="text-blue-400 hover:text-blue-300 text-left transition-colors cursor-pointer text-xs"
                                                >
                                                    View Trips
                                                </button>
                                                <button
                                                    onClick={() => handleViewUserSavedPlaces(user)}
                                                    className="text-blue-400 hover:text-blue-300 text-left transition-colors cursor-pointer text-xs"
                                                >
                                                    View Saved Places
                                                </button>
                                                <button
                                                    onClick={() => handleViewUserFuelHistory(user)}
                                                    className="text-blue-400 hover:text-blue-300 text-left transition-colors cursor-pointer text-xs"
                                                >
                                                    View Fuel History
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit user"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete user"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-400">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 rounded-lg transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 rounded-lg transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Edit User</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.first_name || ''}
                                        onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.last_name || ''}
                                        onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                    <select
                                        value={editingUser.role || 'user'}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete the user "${userToDelete?.first_name} ${userToDelete?.last_name}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </>
    );
};

export default UsersManagement;