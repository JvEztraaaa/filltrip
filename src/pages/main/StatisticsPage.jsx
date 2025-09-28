import React, { useEffect, useMemo, useState } from 'react';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';
import { listTrips } from '../../others/services/trips';
import { listRefuels } from '../../others/services/refuel';
import { computeKpis, buildMonthlyDatasets, buildFrequentRoutes, buildDailyActivity } from '../../others/services/statistics';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/table';
import {
    ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, computeTrendPercent } from '../../components/ui/chart';
import { TrendingUp } from 'lucide-react';
import AnalyticsCalendar from '../../components/AnalyticsCalendar';

// Formatting helper for KPI + axis numbers.
function fmt(num, digits = 2) { if (num === 0) return '0'; if (!num) return '—'; return Number(num).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }); }

// Shared tooltip style
const tooltipStyle = { background: '#111827', border: '1px solid #374151', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' };

const kpiDefs = [
    { key: 'totalTrips', label: 'Total Trips', color: 'text-teal-300', fmt: v => fmt(v, 0) },
    { key: 'totalDistance', label: 'Total Distance (km)', color: 'text-indigo-300', fmt: fmt },
    { key: 'totalFuelConsumed', label: 'Fuel Consumed (L)', color: 'text-fuchsia-300', fmt: fmt },
    { key: 'totalFuelCost', label: 'Fuel Cost (₱)', color: 'text-emerald-300', fmt: v => '₱' + fmt(v) },
    { key: 'avgCostPer100Km', label: 'Avg Cost /100km', color: 'text-amber-300', fmt: v => '₱' + fmt(v) },
    { key: 'mostUsedVehicle', label: 'Most Used Vehicle', color: 'text-sky-300', fmt: v => v || '—' },
];

const StatisticsPage = () => {
    const { currentUser } = useAuth();
    const [trips, setTrips] = useState([]);
    const [refuels, setRefuels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

        // Fetch trips & refuels once user is known.
        // NOTE: The backend endpoints currently do *implicit* user scoping via session (PHP). If in future an admin view loads
        // multiple users' data, adapt these calls to pass an explicit user_id parameter.
    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true); setError('');
            try {
                const [t, r] = await Promise.all([listTrips(), listRefuels()]);
                if (!cancel) { setTrips(t || []); setRefuels(r || []); }
            } catch (e) {
                if (!cancel) setError(e.message || 'Failed to load data');
            } finally { if (!cancel) setLoading(false); }
        })();
        return () => { cancel = true; };
    }, [currentUser?.id]);

        // Derived datasets (memoized for performance).
    const kpis = useMemo(() => computeKpis(trips, refuels), [trips, refuels]);
    const monthly = useMemo(() => buildMonthlyDatasets(trips, refuels), [trips, refuels]);
    const frequentRoutes = useMemo(() => buildFrequentRoutes(trips, 8), [trips]);
    const dailyActivity = useMemo(() => buildDailyActivity(trips, refuels), [trips, refuels]);

    // Overall trend dataset (distance, liters, fuelCost) aggregated monthly (reuse monthly array)
    const overallTrend = monthly.map(m => ({ label: m.label, distance: m.distance, liters: m.liters, cost: m.fuelCost }));

    return (
        <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
            <SidePanel />
            <Header />
            <div className="pt-20 md:pt-20 pl-0 md:pl-64 pr-0 pb-10 flex gap-6 max-w-[1920px] mx-auto">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6 pr-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Statistics & Analytics</h1>
                            <p className="text-gray-400 text-sm">Data-driven insights for your trips & fuel usage</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Filter stats</span>
                            <button className="p-1.5 rounded-md border border-gray-600 hover:border-gray-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                {/* Loading & Error States */}
                {loading && (
                    <div className="text-gray-300 text-sm animate-pulse">Loading analytics…</div>
                )}
                {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">{error}</div>
                )}

                    {!loading && !error && (
                        <div className="flex gap-6">
                            {/* Left Side: Main Content */}
                            <div className="flex-1">
                                {/* Overall Trends Section */}
                                <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-lg font-medium text-white">Overall Trends</h2>
                                            <p className="text-sm text-gray-400">Distance, fuel & cost over time</p>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {monthly.length > 0 && (
                                                <span>from <span className="text-gray-300">{monthly[0].label}</span> to <span className="text-gray-300">{monthly[monthly.length-1].label}</span></span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={overallTrend} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                                                <CartesianGrid strokeDasharray="1 1" stroke="#374151" opacity={0.3} />
                                                <XAxis 
                                                    dataKey="label" 
                                                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    dy={10}
                                                />
                                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        background: '#1f2937', 
                                                        border: '1px solid #374151', 
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                    }} 
                                                    formatter={(v, n) => {
                                                        if (n === 'distance') return [fmt(v)+' km','Distance'];
                                                        if (n === 'liters') return [fmt(v)+' L','Fuel'];
                                                        if (n === 'cost') return ['₱'+fmt(v),'Cost'];
                                                        return [v, n];
                                                    }} 
                                                />
                                                <Line type="monotone" dataKey="distance" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="liters" stroke="#38bdf8" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Monthly Charts Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Monthly Fuel Consumption */}
                                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-white">Monthly Fuel Consumption</h3>
                                            <p className="text-sm text-gray-400">
                                                {monthly.length ? `${monthly[0].label} – ${monthly[monthly.length-1].label}` : 'No data'}
                                            </p>
                                        </div>
                                        <div className="h-64">
                                            <ChartContainer config={{ liters: { label: 'Liters', color: 'var(--color-liters, #14b8a6)' }}} className="h-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                                        <CartesianGrid vertical={false} stroke="#374151" opacity={0.3} />
                                                        <XAxis 
                                                            dataKey="label" 
                                                            tickLine={false} 
                                                            axisLine={false} 
                                                            tick={{ fontSize: 11, fill: '#9ca3af' }} 
                                                        />
                                                        <YAxis 
                                                            tickLine={false} 
                                                            axisLine={false} 
                                                            tick={{ fontSize: 11, fill: '#9ca3af' }} 
                                                        />
                                                        <Tooltip 
                                                            cursor={false} 
                                                            content={<ChartTooltipContent hideLabel formatter={(v)=>fmt(v) + ' L'} />} 
                                                        />
                                                        <Bar dataKey="liters" name="Liters" fill="#38bdf8" radius={[6,6,0,0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                        </div>
                                        <div className="mt-4 text-xs flex flex-col gap-1 text-gray-400">
                                            {(() => { 
                                                const change = computeTrendPercent(monthly.map(m=>m.liters)); 
                                                const up = change >= 0; 
                                                return (
                                                    <div className="flex items-center gap-2 font-medium text-gray-300">
                                                        <span className={up? 'text-teal-300':'text-red-300'}>
                                                            {up? '+' : ''}{fmt(Math.abs(change),2)}%
                                                        </span> 
                                                        vs prev month 
                                                        <TrendingUp className="h-3.5 w-3.5 opacity-70" />
                                                    </div>
                                                ); 
                                            })()}
                                            <div className="leading-tight">Total liters consumed per month.</div>
                                        </div>
                                    </div>

                                    {/* Monthly Fuel Cost */}
                                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-white">Monthly Fuel Cost</h3>
                                            <p className="text-sm text-gray-400">Total PHP cost per month</p>
                                        </div>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.55} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="1 1" stroke="#374151" opacity={0.3} />
                                                    <XAxis 
                                                        dataKey="label" 
                                                        tick={{ fontSize: 11, fill: '#9ca3af' }} 
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <YAxis 
                                                        tick={{ fontSize: 11, fill: '#9ca3af' }} 
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={tooltipStyle} 
                                                        labelStyle={{ color: '#9ca3af' }} 
                                                        formatter={(v)=>['₱'+fmt(v),'Cost']} 
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="fuelCost" 
                                                        stroke="#6366f1" 
                                                        fill="url(#costGradient)" 
                                                        strokeWidth={2} 
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 text-xs flex flex-col gap-1 text-gray-400">
                                            {(() => { 
                                                const change = computeTrendPercent(monthly.map(m=>m.fuelCost)); 
                                                const up = change >= 0; 
                                                return (
                                                    <div className="flex items-center gap-2 font-medium text-gray-300">
                                                        <span className={up? 'text-red-300':'text-teal-300'}>
                                                            {up? '+' : ''}{fmt(Math.abs(change),2)}%
                                                        </span> 
                                                        vs prev month 
                                                        <TrendingUp className="h-3.5 w-3.5 opacity-70" />
                                                    </div>
                                                ); 
                                            })()}
                                            <div className="leading-tight">Total fuel expenditure per month.</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Most Frequent Routes Table */}
                                <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium text-white">Most Frequent Routes</h3>
                                        <p className="text-sm text-gray-400">Top routes by trip count</p>
                                    </div>
                                    {frequentRoutes.length === 0 ? (
                                        <div className="text-sm text-gray-400 py-8 text-center">No routes recorded yet.</div>
                                    ) : (
                                        <div className="overflow-hidden">
                                            <Table>
                                                <THead>
                                                    <TR>
                                                        <TH className="w-12">#</TH>
                                                        <TH>Start Location</TH>
                                                        <TH>End Location</TH>
                                                        <TH className="text-right">Trips</TH>
                                                    </TR>
                                                </THead>
                                                <TBody>
                                                    {frequentRoutes.map((route, index) => (
                                                        <TR key={route.start + route.end}>
                                                            <TD className="font-medium text-gray-400">{index + 1}</TD>
                                                            <TD className="truncate max-w-[200px] font-medium text-white" title={route.start}>
                                                                {route.start}
                                                            </TD>
                                                            <TD className="truncate max-w-[200px] font-medium text-white" title={route.end}>
                                                                {route.end}
                                                            </TD>
                                                            <TD className="text-right">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-900/20 text-teal-300">
                                                                    {route.count} trips
                                                                </span>
                                                            </TD>
                                                        </TR>
                                                    ))}
                                                </TBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Sidebar: Personal */}
                            <div className="w-80 flex-shrink-0">
                                <div className="sticky top-24">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-semibold text-white">Personal</h2>
                                    </div>

                                    {/* Calendar Section - No border */}
                                    <div className="mb-6">
                                        <AnalyticsCalendar activityMap={dailyActivity} />
                                    </div>

                                    {/* Key Metrics Section */}
                                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-white">Key Metrics</h3>
                                            <p className="text-sm text-gray-400">Overview of your statistics</p>
                                        </div>
                                        <div className="space-y-4">
                                            {kpiDefs.map((metric, index) => {
                                                const colors = ['text-teal-400', 'text-blue-400', 'text-purple-400', 'text-green-400', 'text-yellow-400', 'text-cyan-400'];
                                                const bgColors = ['bg-teal-500/10', 'bg-blue-500/10', 'bg-purple-500/10', 'bg-green-500/10', 'bg-yellow-500/10', 'bg-cyan-500/10'];
                                                return (
                                                    <div key={metric.key} className={`p-4 rounded-lg ${bgColors[index % bgColors.length]} border border-gray-600/30`}>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                                                    {metric.label}
                                                                </div>
                                                                <div className={`text-lg font-bold ${colors[index % colors.length]}`}>
                                                                    {metric.fmt(kpis[metric.key])}
                                                                </div>
                                                            </div>
                                                            <div className={`w-2 h-8 rounded-full ${bgColors[index % bgColors.length].replace('/10', '/40')}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
