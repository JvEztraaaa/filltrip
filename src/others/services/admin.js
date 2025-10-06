// Admin API Service Layer
// Use relative path so Vite dev server proxy handles CORS and origin.
// In production you can swap this to an absolute domain if needed.
const BASE_URL = '/filltrip-db';

// Generic API helper function
async function apiRequest(endpoint, options = {}) {
    // Avoid double slashes if endpoint already begins with /
    const cleanedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${BASE_URL}/${cleanedEndpoint}`;
    const defaultOptions = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success === false) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Dashboard Analytics API
export const adminAnalytics = {
    // Get overall system metrics
    async getMetrics() {
        return apiRequest('admin_analytics.php?action=metrics');
    },

    // Get user growth data over time
    async getUserGrowth() {
        return apiRequest('admin_analytics.php?action=user_growth');
    },

    // Get trips analytics
    async getTripsAnalytics() {
        return apiRequest('admin_analytics.php?action=trips_analytics');
    },

    // Get fuel analytics
    async getFuelAnalytics() {
        return apiRequest('admin_analytics.php?action=fuel_analytics');
    },

    // Get popular stations
    async getPopularStations() {
        return apiRequest('admin_analytics.php?action=popular_stations');
    },

    // Get fuel type distribution
    async getFuelTypeDistribution() {
        return apiRequest('admin_analytics.php?action=fuel_type_distribution');
    },

    // Get frequent routes
    async getFrequentRoutes() {
        return apiRequest('admin_analytics.php?action=frequent_routes');
    }
};

// Users CRUD API
export const adminUsers = {
    // Get all users with pagination
    async getUsers(page = 1, limit = 10, search = '') {
        const params = new URLSearchParams({ page, limit, search });
        return apiRequest(`admin_users.php?${params}`);
    },

    // Get single user by ID
    async getUser(id) {
        return apiRequest(`admin_users.php?id=${id}`);
    },

    // Create new user
    async createUser(userData) {
        return apiRequest('admin_users.php', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Update user
    async updateUser(id, userData) {
        return apiRequest('admin_users.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...userData }),
        });
    },

    // Delete user
    async deleteUser(id) {
        return apiRequest('admin_users.php', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }
};

// Trips CRUD API
export const adminTrips = {
    // Get all trips with pagination
    async getTrips(page = 1, limit = 10, search = '') {
        const params = new URLSearchParams({ page, limit, search });
        return apiRequest(`admin_trips.php?${params}`);
    },

    // Get single trip by ID
    async getTrip(id) {
        return apiRequest(`admin_trips.php?id=${id}`);
    },

    // Update trip
    async updateTrip(id, tripData) {
        return apiRequest('admin_trips.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...tripData }),
        });
    },

    // Delete trip
    async deleteTrip(id) {
        return apiRequest('admin_trips.php', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }
};

// Saved Places CRUD API
export const adminSavedPlaces = {
    // Get all saved places with pagination
    async getSavedPlaces(page = 1, limit = 10, search = '') {
        const params = new URLSearchParams({ page, limit, search });
        return apiRequest(`admin_saved_places.php?${params}`);
    },

    // Get single saved place by ID
    async getSavedPlace(id) {
        return apiRequest(`admin_saved_places.php?id=${id}`);
    },

    // Update saved place
    async updateSavedPlace(id, placeData) {
        return apiRequest('admin_saved_places.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...placeData }),
        });
    },

    // Delete saved place
    async deleteSavedPlace(id) {
        return apiRequest('admin_saved_places.php', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }
};

// Fuel History CRUD API
export const adminFuelHistory = {
    // Get all fuel history with pagination
    async getFuelHistory(page = 1, limit = 10, search = '') {
        const params = new URLSearchParams({ page, limit, search });
        return apiRequest(`admin_fuel_history.php?${params}`);
    },

    // Get single fuel history entry by ID
    async getFuelHistoryEntry(id) {
        return apiRequest(`admin_fuel_history.php?id=${id}`);
    },

    // Update fuel history entry
    async updateFuelHistoryEntry(id, fuelData) {
        return apiRequest('admin_fuel_history.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...fuelData }),
        });
    },

    // Delete fuel history entry
    async deleteFuelHistoryEntry(id) {
        return apiRequest('admin_fuel_history.php', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }
};