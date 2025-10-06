import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    LineChart, Line, AreaChart, Area,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// Custom tooltip styles matching the project theme
const tooltipStyle = { 
    background: '#111827', 
    border: '1px solid #374151', 
    borderRadius: '0.75rem', 
    padding: '1rem 1.25rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fontSize: '14px',
    minWidth: '200px'
};

// Color palette for charts - unified blue theme with modern colors
const chartColors = {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    accent: '#2563eb',
    success: '#1e40af',
    warning: '#1e3a8a',
    danger: '#1e40af',
    gradient: ['#3b82f6', '#1d4ed8', '#2563eb', '#1e40af', '#1e3a8a', '#60a5fa'],
    modern: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#84cc16']
};

// User Growth Chart - Shows actual user registration days
export const UserGrowthChart = ({ data = [], loading = false }) => {
    // Debug: Log the raw data from backend
    console.log('UserGrowthChart raw data:', data);
    
    // Process the data to show user growth properly
    const processUserGrowthData = () => {
        if (!data || data.length === 0) {
            console.log('No data provided to UserGrowthChart');
            return [];
        }

        // Backend now only returns days with registrations, so we just need to format the data
        const formattedData = data.map(item => {
            // Ensure we have a valid date string
            const dateStr = item.date;
            console.log(`Processing date: ${dateStr}, newUsers: ${item.newUsers}`);
            
            // Parse the date (format should be YYYY-MM-DD from backend)
            const dateObj = new Date(dateStr + 'T12:00:00'); // Add noon time to avoid timezone issues
            
            console.log(`Date object created:`, dateObj);
            
            const formattedItem = {
                date: dateStr,
                label: dateObj.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                }),
                fullDate: dateObj.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                }),
                newUsers: parseInt(item.newUsers) || 0
            };
            
            console.log('Formatted item:', formattedItem);
            return formattedItem;
        });

        console.log('Final formatted data:', formattedData);
        return formattedData;
    };

    const chartData = processUserGrowthData();

    if (loading) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>User Growth</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <div className="animate-pulse h-full bg-gray-700/30 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    // If no data, show empty state
    if (chartData.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>User Growth</span>
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                        Daily new user registrations
                    </p>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-400 text-sm">No user registrations yet</p>
                        <p className="text-gray-500 text-xs mt-1">User growth will appear as new users register</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalGrowth = chartData.reduce((sum, item) => sum + (item.newUsers || 0), 0);
    const avgGrowth = totalGrowth > 0 ? (totalGrowth / chartData.length).toFixed(1) : 0;
    
    return (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-gray-200 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>User Growth</span>
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                    Daily new user registrations ({totalGrowth} total, ~{avgGrowth} avg/day)
                </p>
            </CardHeader>
            <CardContent className="h-80 flex items-end justify-center pb-0">
                <div className="w-full h-5/6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 40, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis 
                            dataKey="label" 
                            stroke="#9ca3af" 
                            fontSize={11} 
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                            interval={0}
                        />
                        <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                            domain={[0, 'dataMax + 1']}
                        />
                        <Tooltip 
                            contentStyle={tooltipStyle}
                            labelStyle={{ color: '#f3f4f6' }}
                            itemStyle={{ color: '#3b82f6' }}
                            formatter={(value, name) => [`${value}`, 'New Users']}
                            labelFormatter={(label, payload) => {
                                if (payload && payload[0] && payload[0].payload) {
                                    return `${payload[0].payload.fullDate}`;
                                }
                                return label;
                            }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="newUsers"
                            stroke={chartColors.primary}
                            strokeWidth={2}
                            fill="url(#userGrowthGradient)"
                            dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: chartColors.primary }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// Trips Per Month Chart - Modern Shadcn Style
export const TripsChart = ({ data = [], loading = false }) => {
    if (loading) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200">Trips per Month</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <div className="animate-pulse h-full bg-gray-700/30 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    // Calculate trend
    const currentMonth = data[data.length - 1]?.trips || 0;
    const previousMonth = data[data.length - 2]?.trips || 0;
    const trendPercentage = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1) : 0;
    const isPositiveTrend = trendPercentage >= 0;

    return (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-gray-200 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Total Trips per Month</span>
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                    Monthly trip data for the last 6 months
                </p>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            stroke="#9ca3af" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={tooltipStyle}
                            labelStyle={{ color: '#f3f4f6' }}
                            itemStyle={{ color: '#3b82f6' }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            formatter={(value) => [`${value}`, 'Trips']}
                        />
                        <Bar 
                            dataKey="trips" 
                            fill={chartColors.primary}
                            radius={[8, 8, 0, 0]} 
                            isAnimationActive={true}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
            <div className="border-t border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {isPositiveTrend ? (
                            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        )}
                        <span className={`font-medium ${isPositiveTrend ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositiveTrend ? 'Trending up' : 'Trending down'} by {Math.abs(trendPercentage)}% this month
                        </span>
                    </div>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                    Showing total trips for the last {data.length} months
                </div>
            </div>
        </Card>
    );
};

// Fuel Costs Trend Chart
export const FuelCostsChart = ({ data = [], loading = false }) => {
    if (loading) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200">Fuel Costs Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <div className="animate-pulse h-full bg-gray-700/30 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-gray-200 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Fuel Costs Trend</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                            contentStyle={tooltipStyle}
                            labelStyle={{ color: '#f3f4f6' }}
                            itemStyle={{ color: '#2563eb' }}
                            formatter={(value) => [`₱${value?.toLocaleString()}`, 'Average Cost']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="averageCost" 
                            stroke={chartColors.accent} 
                            strokeWidth={3}
                            dot={{ fill: chartColors.accent, strokeWidth: 2, r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// Top Stations Chart - Compact Modern Design with Consistent Styling
export const TopStationsChart = ({ data = [], loading = false }) => {
    // Debug logging
    console.log('TopStationsChart data:', data);
    
    // Project-consistent color palette using teal and blue theme
    const stationColors = ['#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'];
    
    if (loading) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Top Fuel Stations</span>
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                        Most frequently used fuel stations
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-64 animate-pulse bg-gray-700/30 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    // Show message when no data is available
    if (!data || data.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Top Fuel Stations</span>
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                        Most frequently used fuel stations
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-400 text-sm">No station data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate total visits for percentages
    const totalVisits = data.reduce((sum, item) => sum + (item.count || 0), 0);
    
    // Prepare data for display (top 5 stations for better visual balance)
    // Handle both 'name' and 'station' field names for compatibility
    const normalizedData = data.map(item => ({
        ...item,
        station: item.station || item.name || 'Unknown Station',
        count: item.count || 0
    }));
    
    const displayData = normalizedData.slice(0, 5).filter(item => item.count > 0);
    
    // If no valid data after filtering, show no data message
    if (displayData.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Top Fuel Stations</span>
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                        Most frequently used fuel stations
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-400 text-sm">No valid station data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-gray-200 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Top Fuel Stations</span>
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                    Most frequently used fuel stations
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    {/* Chart on the left */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-[240px] aspect-square">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip 
                                        cursor={false}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0];
                                                const percentage = ((data.value / totalVisits) * 100).toFixed(1);
                                                const stationName = data.payload.station || data.payload.name || 'Unknown Station';
                                                return (
                                                    <div className="rounded-lg border bg-gray-800 border-gray-700 px-3 py-2 text-sm shadow-md">
                                                        <div className="font-medium text-gray-200">
                                                            {stationName}
                                                        </div>
                                                        <div className="text-gray-400">
                                                            {data.value} logs ({percentage}%)
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Pie 
                                        data={displayData} 
                                        dataKey="count" 
                                        nameKey="station"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={0}
                                        paddingAngle={0}
                                    >
                                        {displayData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={stationColors[index % stationColors.length]}
                                                stroke="#000000"
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Legend on the right */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 font-medium leading-none text-gray-300 mb-4">
                            <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Showing top {displayData.length} stations
                        </div>
                        
                        {/* Legend Items */}
                        <div className="space-y-2">
                            {displayData.map((item, index) => {
                                const percentage = ((item.count / totalVisits) * 100).toFixed(1);
                                return (
                                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-700/20 hover:bg-gray-700/30 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div 
                                                className="w-4 h-4 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: stationColors[index % stationColors.length] }}
                                            />
                                            <span className="text-gray-300 text-sm truncate">
                                                {item.station}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-mono">
                                            <span className="text-gray-400">
                                                {item.count}
                                            </span>
                                            <span className="text-gray-500">
                                                ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
            
            {/* Footer */}
            <div className="px-6 pb-4 pt-4 border-t border-gray-700">
                <div className="text-gray-400 text-xs">
                    Based on {totalVisits} total fuel logs
                </div>
            </div>
        </Card>
    );
};

// Frequent Routes Table
export const FrequentRoutesTable = ({ data = [], loading = false }) => {
    if (loading) {
        return (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-200">Most Frequent Routes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="animate-pulse flex space-x-4">
                                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-gray-200 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span>Most Frequent Routes (Top 5)</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Rank</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">From</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">To</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-3">Trips</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {data.slice(0, 5).map((route, index) => (
                                <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                                                index === 1 ? 'bg-gray-500/20 text-gray-300' :
                                                index === 2 ? 'bg-amber-600/20 text-amber-300' :
                                                'bg-gray-600/20 text-gray-400'
                                            }`}>
                                                {index + 1}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-gray-300 max-w-xs truncate">{route.startLocation}</td>
                                    <td className="py-4 text-sm text-gray-300 max-w-xs truncate">{route.endLocation}</td>
                                    <td className="py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                            {route.count} trips
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};