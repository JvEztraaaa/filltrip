import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import DeleteConfirmationModal from '../ui/delete-confirmation-modal';
import { adminTrips } from '../../others/services/admin';

const TripsManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingTrip, setEditingTrip] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tripToDelete, setTripToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Extract user filter from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const filterUserId = urlParams.get('userId');
    const filterUserName = urlParams.get('userName');

    const fetchTrips = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await adminTrips.getTrips(page, 10, search, filterUserId);
            let data = response.trips || [];
            // Defensive client-side filter (in case backend filter not applied yet)
            if (filterUserId) {
                data = data.filter(t => String(t.user_id) === String(filterUserId));
            }
            setTrips(data);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError(err.message || 'Failed to fetch trips');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips(currentPage, searchTerm);
    }, [currentPage, filterUserId]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchTrips(1, searchTerm);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchTrips(1, '');
    };

    const clearUserFilter = () => {
        navigate('/admin/trips', { replace: true });
        setCurrentPage(1);
        setSearchTerm('');
        // refetch without user filter (filterUserId becomes null after navigation)
        setTimeout(() => fetchTrips(1, ''), 0);
    };

    const handleEdit = (trip) => {
        setEditingTrip({ ...trip });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingTrip) return;
        
        try {
            await adminTrips.updateTrip(editingTrip.id, editingTrip);
            setShowEditModal(false);
            setEditingTrip(null);
            fetchTrips(currentPage, searchTerm);
        } catch (err) {
            setError(err.message || 'Failed to update trip');
        }
    };

    const handleDelete = (trip) => {
        setTripToDelete(trip);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!tripToDelete) return;
        
        try {
            setIsDeleting(true);
            await adminTrips.deleteTrip(tripToDelete.id);
            setShowDeleteModal(false);
            setTripToDelete(null);
            fetchTrips(currentPage, searchTerm);
        } catch (err) {
            setError(err.message || 'Failed to delete trip');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && trips.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200">Trips Management</CardTitle>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <span>Trips Management</span>
                                <span className="text-sm font-normal text-gray-400">({trips.length} trips{filterUserName ? ' for user' : ''})</span>
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
                                placeholder="Search trips..."
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
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Route</th>
                                    {!filterUserId && <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">User</th>}
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Distance</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Fuel Cost</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Vehicle</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Created</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {trips.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="py-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm font-medium text-gray-200 truncate">{trip.start_location}</p>
                                                <p className="text-xs text-gray-400 truncate">to {trip.end_location}</p>
                                            </div>
                                        </td>
                                        {!filterUserId && (
                                            <td className="py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-medium text-blue-300">
                                                            {trip.user_name ? trip.user_name.charAt(0).toUpperCase() : 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-200">{trip.user_name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-400">{trip.user_email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="py-4 text-sm text-gray-300">{trip.distance_km} km</td>
                                        <td className="py-4 text-sm text-gray-300">₱{parseFloat(trip.fuel_cost || 0).toLocaleString()}</td>
                                        <td className="py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                                {trip.vehicle_label || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-gray-400">{formatDate(trip.created_at)}</td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(trip)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit trip"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(trip)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete trip"
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

            {/* Edit Trip Modal */}
            {showEditModal && editingTrip && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Edit Trip</h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Start Location</label>
                                        <input
                                            type="text"
                                            value={editingTrip.start_location || ''}
                                            onChange={(e) => setEditingTrip({...editingTrip, start_location: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">End Location</label>
                                        <input
                                            type="text"
                                            value={editingTrip.end_location || ''}
                                            onChange={(e) => setEditingTrip({...editingTrip, end_location: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Distance (km)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingTrip.distance_km || ''}
                                            onChange={(e) => setEditingTrip({...editingTrip, distance_km: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Fuel Cost</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingTrip.fuel_cost || ''}
                                            onChange={(e) => setEditingTrip({...editingTrip, fuel_cost: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Label</label>
                                    <input
                                        type="text"
                                        value={editingTrip.vehicle_label || ''}
                                        onChange={(e) => setEditingTrip({...editingTrip, vehicle_label: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

export default TripsManagement;