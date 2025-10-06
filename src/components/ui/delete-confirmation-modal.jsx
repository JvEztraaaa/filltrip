import React from 'react';

const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Delete Item", 
    message = "Are you sure you want to delete this item?",
    itemName = "",
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
                        <p className="text-sm text-gray-400">This action cannot be undone</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-300 mb-2">{message}</p>
                    {itemName && (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 mt-3">
                            <p className="text-sm text-gray-400">Item to delete:</p>
                            <p className="text-gray-200 font-medium truncate">{itemName}</p>
                        </div>
                    )}
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 border border-red-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <span>Delete</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;