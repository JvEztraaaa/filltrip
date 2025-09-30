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
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area, ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, computeTrendPercent } from '../../components/ui/chart';
import { TrendingUp } from 'lucide-react';
import AnalyticsCalendar from '../../components/AnalyticsCalendar';

// Formatting helper for KPI + axis numbers.
function fmt(num, digits = 2) { if (num === 0) return '0'; if (!num) return '—'; return Number(num).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }); }

// Shared tooltip style - enhanced for better readability
const tooltipStyle = { 
    background: '#111827', 
    border: '1px solid #374151', 
    borderRadius: '0.75rem', 
    padding: '1rem 1.25rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fontSize: '14px',
    minWidth: '200px'
};

const kpiDefs = [
    { key: 'totalTrips', label: 'Total Trips', color: 'text-teal-300', fmt: v => fmt(v, 0) },
    { key: 'totalDistance', label: 'Total Distance (km)', color: 'text-indigo-300', fmt: fmt },
    { key: 'totalFuelConsumed', label: 'Total Fuel Consumed (L)', color: 'text-fuchsia-300', fmt: fmt },
    { key: 'totalFuelCost', label: 'Total Fuel Cost Spent (₱)', color: 'text-emerald-300', fmt: v => '₱' + fmt(v) },
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
    const frequentRoutes = useMemo(() => buildFrequentRoutes(trips, 5), [trips]);
    const dailyActivity = useMemo(() => buildDailyActivity(trips, refuels), [trips, refuels]);

    // Overall trend dataset - percentage changes from previous month
    const overallTrend = useMemo(() => {
        if (monthly.length === 0) return [];
        
        return monthly.map((month, index) => {
            if (index === 0) {
                // First month - no previous month to compare, show as 0% change
                return {
                    label: month.label,
                    distance: 0,
                    liters: 0,
                    cost: 0,
                    // Keep raw values for tooltip
                    rawDistance: month.distance,
                    rawLiters: month.liters,
                    rawCost: month.fuelCost
                };
            }
            
            const prevMonth = monthly[index - 1];
            
            return {
                label: month.label,
                // Calculate percentage change from previous month
                distance: prevMonth.distance === 0 ? 0 : ((month.distance - prevMonth.distance) / prevMonth.distance) * 100,
                liters: prevMonth.liters === 0 ? 0 : ((month.liters - prevMonth.liters) / prevMonth.liters) * 100,
                cost: prevMonth.fuelCost === 0 ? 0 : ((month.fuelCost - prevMonth.fuelCost) / prevMonth.fuelCost) * 100,
                // Keep raw values for tooltip
                rawDistance: month.distance,
                rawLiters: month.liters,
                rawCost: month.fuelCost
            };
        });
    }, [monthly]);

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
                                                <YAxis 
                                                    tick={{ fontSize: 11, fill: '#9ca3af' }} 
                                                    axisLine={false} 
                                                    tickLine={false}
                                                    tickFormatter={(value) => `${value > 0 ? '+' : ''}${Math.round(value)}%`}
                                                    label={{ 
                                                        value: 'Change from Previous Month (%)', 
                                                        angle: -90, 
                                                        position: 'insideLeft',
                                                        style: { textAnchor: 'middle', fill: '#9ca3af', fontSize: '12px' }
                                                    }}
                                                />
                                                {/* Reference line at 0% (no change) */}
                                                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        background: '#1f2937', 
                                                        border: '1px solid #374151', 
                                                        borderRadius: '12px',
                                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                        padding: '1rem 1.25rem',
                                                        fontSize: '14px',
                                                        minWidth: '280px'
                                                    }} 
                                                    labelStyle={{ 
                                                        color: '#f3f4f6', 
                                                        fontSize: '15px', 
                                                        fontWeight: '600', 
                                                        marginBottom: '8px'
                                                    }}
                                                    formatter={(value, name, props) => {
                                                        const data = props.payload;
                                                        const isFirstMonth = props.payload.label === overallTrend[0]?.label;
                                                        
                                                        if (name === 'distance') {
                                                            if (isFirstMonth) {
                                                                return [
                                                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{fmt(data.rawDistance)} km</span>, 
                                                                    <span style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>Distance (baseline)</span>
                                                                ];
                                                            }
                                                            return [
                                                                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                                                    {fmt(data.rawDistance)} km ({value > 0 ? '+' : ''}{Math.round(value)}%)
                                                                </span>,
                                                                <span style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>Distance</span>
                                                            ];
                                                        }
                                                        if (name === 'liters') {
                                                            if (isFirstMonth) {
                                                                return [
                                                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{fmt(data.rawLiters)} L</span>, 
                                                                    <span style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>Fuel (baseline)</span>
                                                                ];
                                                            }
                                                            return [
                                                                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                                                    {fmt(data.rawLiters)} L ({value > 0 ? '+' : ''}{Math.round(value)}%)
                                                                </span>,
                                                                <span style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>Fuel</span>
                                                            ];
                                                        }
                                                        if (name === 'cost') {
                                                            if (isFirstMonth) {
                                                                return [
                                                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>₱{fmt(data.rawCost)}</span>, 
                                                                    <span style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>Cost (baseline)</span>
                                                                ];
                                                            }
                                                            return [
                                                                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                                                    ₱{fmt(data.rawCost)} ({value > 0 ? '+' : ''}{Math.round(value)}%)
                                                                </span>,
                                                                <span style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>Cost</span>
                                                            ];
                                                        }
                                                        return [value, name];
                                                    }} 
                                                />
                                                <Line type="monotone" dataKey="distance" stroke="#f59e0b" strokeWidth={2} dot={false} name="distance" />
                                                <Line type="monotone" dataKey="liters" stroke="#38bdf8" strokeWidth={2} dot={false} name="liters" />
                                                <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={false} name="cost" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Monthly Charts Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Monthly Fuel Consumption */}
                                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-white">Fuel Consumed Per Month</h3>
                                            <p className="text-sm text-gray-400">
                                                Monthly fuel consumption in liters
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
                                                            content={<ChartTooltipContent hideLabel formatter={(v) => <span style={{ fontSize: '14px', fontWeight: '600' }}>{fmt(v)} L</span>} />} 
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
                                                        {up ? 'higher' : 'lower'} than prev month 
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
                                            <h3 className="text-lg font-medium text-white">Total Spent (₱) on Fuel Per Month</h3>
                                            <p className="text-sm text-gray-400">Monthly fuel expenditure in Philippine pesos</p>
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
                                                        contentStyle={{
                                                            ...tooltipStyle,
                                                            minWidth: '220px'
                                                        }} 
                                                        labelStyle={{ 
                                                            color: '#f3f4f6', 
                                                            fontSize: '15px', 
                                                            fontWeight: '600', 
                                                            marginBottom: '8px'
                                                        }} 
                                                        formatter={(v) => [
                                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>₱{fmt(v)}</span>, 
                                                            <span style={{ fontSize: '14px', color: '#d1d5db' }}>Cost</span>
                                                        ]} 
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
                                                        {up ? 'higher' : 'lower'} than prev month 
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

                            {/* Right Sidebar */}
                            <div className="w-80 flex-shrink-0">
                                <div className="sticky top-24">

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
