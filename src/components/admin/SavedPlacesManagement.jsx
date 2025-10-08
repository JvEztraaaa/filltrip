import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// DeleteConfirmationModal not needed since using simple window.confirm for deletion
import { adminSavedPlaces } from '../../others/services/admin';

const SavedPlacesManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // Removed delete confirmation modal state (using window.confirm)
    // Edit functionality removed per requirements (only users editable)

    // Extract user filter from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const filterUserId = urlParams.get('userId');
    const filterUserName = urlParams.get('userName');

    const fetchSavedPlaces = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await adminSavedPlaces.getSavedPlaces(page, 10, search, filterUserId);
            let data = response.savedPlaces || [];
            if (filterUserId) {
                data = data.filter(p => String(p.user_id) === String(filterUserId));
            }
            setSavedPlaces(data);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError(err.message || 'Failed to fetch saved places');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPlaces(currentPage, searchTerm);
    }, [currentPage, filterUserId]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchSavedPlaces(1, searchTerm);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchSavedPlaces(1, '');
    };

    const clearUserFilter = () => {
        navigate('/admin/saved-places', { replace: true });
        setCurrentPage(1);
        setSearchTerm('');
        setTimeout(() => fetchSavedPlaces(1, ''), 0);
    };

    // Removed handleEdit / handleSaveEdit

    const handleDelete = async (placeId) => {
        if (!window.confirm('Are you sure you want to delete this saved place?')) return;
        
        try {
            await adminSavedPlaces.deleteSavedPlace(placeId);
            fetchSavedPlaces(currentPage, searchTerm);
        } catch (err) {
            setError(err.message || 'Failed to delete saved place');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && savedPlaces.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200">Saved Places Management</CardTitle>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Saved Places Management</span>
                                <span className="text-sm font-normal text-gray-400">({savedPlaces.length} places{filterUserName ? ' for user' : ''})</span>
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
                                placeholder="Search places..."
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
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Place Name</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Coordinates</th>
                                    {!filterUserId && <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">User</th>}
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Created</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {savedPlaces.map((place) => (
                                    <tr key={place.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-200">{place.place_name}</p>
                                                    <p className="text-xs text-gray-400">ID: {place.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="text-sm text-gray-300">
                                                <p>Lat: {parseFloat(place.latitude).toFixed(6)}</p>
                                                <p>Lng: {parseFloat(place.longitude).toFixed(6)}</p>
                                            </div>
                                        </td>
                                        {!filterUserId && (
                                            <td className="py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                                    User #{place.user_id}
                                                </span>
                                            </td>
                                        )}
                                        <td className="py-4 text-sm text-gray-400">{formatDate(place.created_at)}</td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                {/* Edit button removed */}
                                                <button
                                                    onClick={() => handleDelete(place.id)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete place"
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

            {/* Edit place modal removed */}
        </>
    );
};

export default SavedPlacesManagement;