import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    trendValue, 
    icon: Icon, 
    color = 'blue',
    loading = false 
}) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            icon: 'text-blue-400',
            text: 'text-blue-300',
            accent: 'text-blue-200'
        },
        teal: {
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/20',
            icon: 'text-teal-400',
            text: 'text-teal-300',
            accent: 'text-teal-200'
        },
        purple: {
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            icon: 'text-purple-400',
            text: 'text-purple-300',
            accent: 'text-purple-200'
        },
        emerald: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            icon: 'text-emerald-400',
            text: 'text-emerald-300',
            accent: 'text-emerald-200'
        },
        amber: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            icon: 'text-amber-400',
            text: 'text-amber-300',
            accent: 'text-amber-200'
        }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-emerald-400';
        if (trend === 'down') return 'text-red-400';
        return 'text-gray-400';
    };

    if (loading) {
        return (
            <Card className={`${colors.bg} border-2 ${colors.border} backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-700/30 rounded w-3/4 animate-pulse"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-700/50 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-1/2 animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${colors.bg} border-2 ${colors.border} backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {Icon && (
                        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border} group-hover:scale-105 transition-transform`}>
                            <Icon className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className={`text-2xl font-bold ${colors.text}`}>
                        {value}
                    </p>
                    {trend && trendValue && (
                        <div className="flex items-center space-x-2">
                            {getTrendIcon()}
                            <span className={`text-sm font-medium ${getTrendColor()}`}>
                                {trendValue}
                            </span>
                            <span className="text-xs text-gray-400">vs last period</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const KPIGrid = ({ metrics, loading = false }) => {
    const kpiConfigs = [
        {
            key: 'totalUsers',
            title: 'Total Users',
            subtitle: 'Registered accounts',
            icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            color: 'blue',
            format: (value) => value?.toLocaleString() || '0'
        },
        {
            key: 'activeUsersToday',
            title: 'Active Today',
            subtitle: 'Users with activity',
            icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
            ),
            color: 'teal',
            format: (value) => value?.toLocaleString() || '0'
        },
        {
            key: 'totalTrips',
            title: 'Total Trips',
            subtitle: 'All recorded trips',
            icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            ),
            color: 'purple',
            format: (value) => value?.toLocaleString() || '0'
        },
        {
            key: 'totalFuelLogs',
            title: 'Total Fuel Logs',
            subtitle: 'Refuel records',
            icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: 'emerald',
            format: (value) => value?.toLocaleString() || '0'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {kpiConfigs.map((config) => (
                <KPICard
                    key={config.key}
                    title={config.title}
                    subtitle={config.subtitle}
                    value={config.format(metrics?.[config.key])}
                    icon={config.icon}
                    color={config.color}
                    loading={loading}
                />
            ))}
        </div>
    );
};

export default KPIGrid;