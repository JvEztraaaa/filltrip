import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import DeleteConfirmationModal from '../ui/delete-confirmation-modal';
import { adminFuelHistory } from '../../others/services/admin';

const FuelHistoryManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [fuelHistory, setFuelHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingEntry, setEditingEntry] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Extract user filter from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const filterUserId = urlParams.get('userId');
    const filterUserName = urlParams.get('userName');

    const fetchFuelHistory = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await adminFuelHistory.getFuelHistory(page, 10, search, filterUserId);
            let data = response.fuelHistory || [];
            if (filterUserId) {
                data = data.filter(e => String(e.user_id) === String(filterUserId));
            }
            setFuelHistory(data);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError(err.message || 'Failed to fetch fuel history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFuelHistory(currentPage, searchTerm);
    }, [currentPage, filterUserId]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchFuelHistory(1, searchTerm);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchFuelHistory(1, '');
    };

    const clearUserFilter = () => {
        navigate('/admin/fuel-history', { replace: true });
        setCurrentPage(1);
        setSearchTerm('');
        setTimeout(() => fetchFuelHistory(1, ''), 0);
    };

    const handleEdit = (entry) => {
        setEditingEntry({ ...entry });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingEntry) return;
        
        try {
            await adminFuelHistory.updateFuelHistoryEntry(editingEntry.id, editingEntry);
            setShowEditModal(false);
            setEditingEntry(null);
            fetchFuelHistory(currentPage, searchTerm);
        } catch (err) {
            setError(err.message || 'Failed to update fuel history entry');
        }
    };

    const handleDelete = async (entryId) => {
        if (!window.confirm('Are you sure you want to delete this fuel history entry?')) return;
        
        try {
            await adminFuelHistory.deleteFuelHistoryEntry(entryId);
            fetchFuelHistory(currentPage, searchTerm);
        } catch (err) {
            setError(err.message || 'Failed to delete fuel history entry');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && fuelHistory.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200">Fuel History Management</CardTitle>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span>Fuel History Management</span>
                                <span className="text-sm font-normal text-gray-400">({fuelHistory.length} entries{filterUserName ? ' for user' : ''})</span>
                            </CardTitle>
                            {filterUserName && (
                                <div className="mt-2 flex items-center space-x-2">
                                    <span className="text-sm text-blue-300">Filtered by user:</span>
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium">
                                        {filterUserName}
                                    </span>
                                    <button
                                        onClick={clearUserFilter}
                                        className="text-xs text-gray-400 hover:text-gray-300 underline"
                                    >
                                        Clear filter
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <form onSubmit={handleSearch} className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Search fuel entries..."
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
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Vehicle</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Fuel Details</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Cost</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Station</th>
                                    {!filterUserId && <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">User</th>}
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Date</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {fuelHistory.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-200">{entry.vehicle_name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-400">{entry.odometer_km} {entry.distance_unit || 'km'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="text-sm text-gray-300">
                                                <p>{entry.liters} {entry.fuel_unit || 'L'}</p>
                                                <p className="text-xs text-gray-400">{entry.fuel_type}</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="text-sm text-gray-300">
                                                <p>{entry.currency || '₱'}{parseFloat(entry.total_cost || 0).toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">@{entry.currency || '₱'}{parseFloat(entry.price_per_liter || 0).toFixed(2)}/L</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                                {entry.station || 'N/A'}
                                            </span>
                                        </td>
                                        {!filterUserId && (
                                            <td className="py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                                    User #{entry.user_id}
                                                </span>
                                            </td>
                                        )}
                                        <td className="py-4 text-sm text-gray-400">{formatDate(entry.date)}</td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit entry"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete entry"
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

            {/* Edit Entry Modal */}
            {showEditModal && editingEntry && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Edit Fuel History Entry</h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Name</label>
                                        <input
                                            type="text"
                                            value={editingEntry.vehicle_name || ''}
                                            onChange={(e) => setEditingEntry({...editingEntry, vehicle_name: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Odometer (km)</label>
                                        <input
                                            type="number"
                                            value={editingEntry.odometer_km || ''}
                                            onChange={(e) => setEditingEntry({...editingEntry, odometer_km: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Liters</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingEntry.liters || ''}
                                            onChange={(e) => setEditingEntry({...editingEntry, liters: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Price per Liter</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingEntry.price_per_liter || ''}
                                            onChange={(e) => setEditingEntry({...editingEntry, price_per_liter: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Total Cost</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingEntry.total_cost || ''}
                                            onChange={(e) => setEditingEntry({...editingEntry, total_cost: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Fuel Type</label>
                                        <input
                                            type="text"
                                            value={editingEntry.fuel_type || ''}
                                            onChange={(e) => setEditingEntry({...editingEntry, fuel_type: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                                        <input
                                            type="text"
                                            value={editingEntry.station || ''}
                                            onChange={(e) => setEditingEntry({...editingEntry, station: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={editingEntry.date ? new Date(editingEntry.date).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setEditingEntry({...editingEntry, date: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
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
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FuelHistoryManagement;