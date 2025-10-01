import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { currentUser } = useAuth();

  // Basic protection - ensure user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-gray-600">Welcome, {currentUser.fullName}</p>
            <p className="text-sm text-gray-500">Role: {currentUser.role}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">User Management</h3>
              <p className="text-blue-600 text-sm mt-2">Manage system users and permissions</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Analytics</h3>
              <p className="text-green-600 text-sm mt-2">View system analytics and reports</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">System Settings</h3>
              <p className="text-purple-600 text-sm mt-2">Configure system settings</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Test Confirmation</h3>
            <p className="text-yellow-700">
              ✅ Admin login successful! You are logged in as an admin user.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              This confirms that the admin authentication system is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
