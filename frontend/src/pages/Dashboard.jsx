import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Battery, Zap, Thermometer, ShieldCheck, Power, MapPin,
    Gauge, Wifi, Clock, Activity, Signal, Search,
    LayoutGrid, ChevronRight, Trash2
} from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const Dashboard = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [deviceData, setDeviceData] = useState([]);
    const [latestData, setLatestData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSelectingDashboard, setIsSelectingDashboard] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [localIgnition, setLocalIgnition] = useState('ON');

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const isAdmin = user.role === 'admin';

    const handleDeleteDashboard = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this dashboard? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://adas-4cqb.onrender.com/api/dashboards/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const remaining = dashboards.filter(d => d._id !== id);
            setDashboards(remaining);
            if (remaining.length === 1) {
                setSelectedDashboard(remaining[0]);
                setIsSelectingDashboard(false);
            } else if (remaining.length === 0) {
                setSelectedDashboard(null);
                setIsSelectingDashboard(false);
            }
        } catch (error) {
            console.error("Error deleting dashboard:", error);
            alert(error.response?.data?.message || "Failed to delete dashboard");
        }
    };
    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsConnected(false);
                    return;
                }
                const res = await axios.get('https://adas-4cqb.onrender.com/api/dashboards', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const all = res.data || [];
                setDashboards(all);
                setIsConnected(true);

                if (all.length > 1) {
                    setIsSelectingDashboard(true);
                    setSelectedDashboard(null);
                } else if (all.length === 1) {
                    setSelectedDashboard(all[0]);
                    setIsSelectingDashboard(false);
                } else {
                    setSelectedDashboard(null);
                    setIsSelectingDashboard(false);
                }
            } catch (err) {
                console.error("Failed to fetch dashboards", err);
                setDashboards([]);
                setSelectedDashboard(null);
                setIsSelectingDashboard(false);
                setIsConnected(false);
            }
        };
        fetchDashboards();
    }, []);

    useEffect(() => {
        if (!selectedDashboard) return;
        const now = Date.now();
        const fakeHistory = Array.from({ length: 20 }).map((_, i) => ({
            timestamp: now - (20 - i) * 5000,
            batterySOC: Math.floor(80 + Math.random() * 20),
            batteryTemperature: +(25 + Math.random() * 5).toFixed(1),
            batteryVoltage: +(12 + Math.random() * 2).toFixed(1),
            speed: Math.floor(30 + Math.random() * 80),
            signalStrength: Math.floor(70 + Math.random() * 30),
            ignitionStatus: 'ON',
            engineRPM: Math.floor(1200 + Math.random() * 2000),
            gpsLatitude: 20.2961 + (Math.random() - 0.5) * 0.01,
            gpsLongitude: 85.8245 + (Math.random() - 0.5) * 0.01,
            deviceId: selectedDashboard.deviceId
        }));
        setDeviceData(fakeHistory);
        setLatestData(fakeHistory[fakeHistory.length - 1]);

        const interval = setInterval(() => {
            const newPoint = {
                timestamp: Date.now(),
                batterySOC: Math.floor(80 + Math.random() * 20),
                batteryTemperature: +(25 + Math.random() * 5).toFixed(1),
                batteryVoltage: +(12 + Math.random() * 2).toFixed(1),
                speed: Math.floor(30 + Math.random() * 80),
                signalStrength: Math.floor(70 + Math.random() * 30),
                ignitionStatus: 'ON',
                engineRPM: Math.floor(1200 + Math.random() * 2000),
                gpsLatitude: 20.2961 + (Math.random() - 0.5) * 0.01,
                gpsLongitude: 85.8245 + (Math.random() - 0.5) * 0.01,
                deviceId: selectedDashboard.deviceId
            };
            setDeviceData(prev => [...prev, newPoint].slice(-50));
            setLatestData(newPoint);
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedDashboard]);

    const batteryColor = latestData?.batterySOC < 20 ? '#EF4444' : latestData?.batterySOC <= 50 ? '#F59E0B' : '#10B981';

    const renderCombinedKPI = () => {
        if (!latestData) return null;
        return (
            <div
                className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-5 transition-all duration-200"
                style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0px 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Power & Battery Status</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-6 h-full items-center">
                    {/* Ignition Status Side */}
                    <div className="flex flex-col justify-center items-center gap-4 p-5 rounded-2xl bg-slate-50 h-full border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Power size={22} className="text-slate-600" />
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Ignition</span>
                        </div>
                        <button
                            onClick={() => setLocalIgnition(prev => prev === 'ON' ? 'OFF' : 'ON')}
                            className="w-full py-4 rounded-xl font-black text-lg text-white transition-all transform active:scale-95 shadow-md hover:shadow-lg"
                            style={{ background: localIgnition === 'ON' ? '#059669' : '#DC2626' }}
                        >
                            {localIgnition}
                        </button>
                        <span className="text-xs text-slate-400 font-medium">Click to toggle</span>
                    </div>

                    {/* Battery SOC Side */}
                    <div className="flex flex-col justify-center items-center gap-3 p-5 rounded-2xl bg-slate-50 h-full border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Battery size={22} className="text-slate-600" />
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Battery SOC</span>
                        </div>
                        <div className="text-5xl font-black tracking-tight" style={{ color: batteryColor }}>
                            {latestData.batterySOC}%
                        </div>

                        {/* 3-way segmented bars */}
                        <div className="flex gap-1.5 w-full mt-3 h-3">
                            <div className={`flex-1 rounded-full transition-colors duration-500 ${latestData.batterySOC > 0 ? 'bg-red-500' : 'bg-slate-200'}`} />
                            <div className={`flex-1 rounded-full transition-colors duration-500 ${latestData.batterySOC > 20 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                            <div className={`flex-1 rounded-full transition-colors duration-500 ${latestData.batterySOC > 50 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const kpis = latestData ? [
        {
            icon: <Thermometer size={22} />,
            iconBg: '#FFF7ED', iconColor: '#EA580C',
            label: 'Battery Temp',
            value: `${latestData.batteryTemperature}°C`,
            valueColor: '#1E293B',
            sub: null,
            trend: latestData.batteryTemperature < 35 ? 'Normal Range' : 'High Temp',
            trendColor: latestData.batteryTemperature < 35 ? '#059669' : '#DC2626',
        },
        {
            icon: <Zap size={22} />,
            iconBg: '#FFFBEB', iconColor: '#D97706',
            label: 'Battery Voltage',
            value: `${latestData.batteryVoltage}V`,
            valueColor: '#1E293B',
            sub: null,
            trend: 'System Stable',
            trendColor: '#059669',
        },
        {
            icon: <Gauge size={22} />,
            iconBg: '#F0F9FF', iconColor: '#0284C7',
            label: 'Vehicle Speed',
            value: `${latestData.speed} km/h`,
            valueColor: '#1E293B',
            sub: { pct: Math.min(latestData.speed / 120 * 100, 100), color: latestData.speed > 100 ? '#EF4444' : '#0284C7' },
            trend: latestData.speed > 100 ? 'Over Speed' : 'Speed OK',
            trendColor: latestData.speed > 100 ? '#DC2626' : '#0284C7',
        },
        {
            icon: <Activity size={22} />,
            iconBg: '#FDF4FF', iconColor: '#9333EA',
            label: 'Engine RPM',
            value: `${latestData.engineRPM.toLocaleString()} rpm`,
            valueColor: '#1E293B',
            sub: null,
            trend: 'Normal Idle',
            trendColor: '#7C3AED',
        },
    ] : [];

    /* ─── CHART ─── */
    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 600 } },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                colorStops: [
                    { offset: 0, color: '#1F3A5F', opacity: 0.25 },
                    { offset: 100, color: '#F59E0B', opacity: 0.03 }
                ]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: '#64748B', fontSize: '11px' } },
            axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false }
        },
        yaxis: { labels: { style: { colors: '#64748B', fontSize: '11px' } } },
        grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
        colors: ['#1F3A5F'],
        tooltip: { theme: 'light' },
    };
    const chartSeries = [{ name: 'Battery SOC (%)', data: deviceData.map(d => [new Date(d.timestamp).getTime(), d.batterySOC]) }];
    const mapCenter = latestData?.gpsLatitude ? [latestData.gpsLatitude, latestData.gpsLongitude] : [20.2961, 85.8245];

    return (
        <div className="flex flex-col gap-6 slide-in pb-8">
            {isSelectingDashboard ? (
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <LayoutGrid className="text-indigo-600" size={26} /> My Dashboards
                            </h1>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Select a vehicle dashboard to view live telemetry.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="input-field pl-10"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {dashboards.filter(d => d.dashboardName.toLowerCase().includes(searchQuery.toLowerCase())).map(d => (
                            <div
                                key={d._id}
                                onClick={() => {
                                    setSelectedDashboard(d);
                                    setIsSelectingDashboard(false);
                                }}
                                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Gauge size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{d.dashboardName}</h3>
                                            <p className="text-xs font-mono text-slate-500 mt-1">{d.deviceId}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {d.user && d.user.email && (
                                            <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                                                {d.user.email}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {d.description && (
                                    <p className="text-sm text-slate-600 line-clamp-2">{d.description}</p>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    {isAdmin ? (
                                        <button
                                            onClick={(e) => handleDeleteDashboard(e, d._id)}
                                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold px-2 py-1 -ml-2 rounded-md hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={15} /> Delete
                                        </button>
                                    ) : (
                                        <span className="text-slate-400 text-xs font-medium">Assigned</span>
                                    )}
                                    <div className="flex items-center text-indigo-600 font-semibold text-sm">
                                        View Dashboard <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Header ── */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                {dashboards.length > 1 && (
                                    <button
                                        onClick={() => setIsSelectingDashboard(true)}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <LayoutGrid size={24} />
                                    </button>
                                )}
                                Vehicle Monitoring
                            </h1>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Real-time telemetry and diagnostics</p>
                        </div>
                        {dashboards.length === 0 && !isSelectingDashboard && (
                            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
                                <Activity className="text-slate-300 mb-4" size={48} />
                                <h2 className="text-lg font-bold text-slate-700">No Dashboards Assigned</h2>
                                <p className="text-slate-500 mt-1 max-w-sm text-center">There are currently no active tracking dashboards assigned to your account.</p>
                            </div>
                        )}

                        {dashboards.length > 0 && (
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <select
                                    className="input-field min-w-[220px]"
                                    value={selectedDashboard?._id || ''}
                                    onChange={e => setSelectedDashboard(dashboards.find(d => d._id === e.target.value))}
                                >
                                    {dashboards.map(d => <option key={d._id} value={d._id}>{d.dashboardName}</option>)}
                                </select>
                                <div className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 whitespace-nowrap shrink-0 ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {isConnected ? 'Live' : 'Offline'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── KPI Cards ── */}
                    {selectedDashboard && latestData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {renderCombinedKPI()}
                            {kpis.map((k, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 transition-all duration-200 cursor-default"
                                    style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0px 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.iconBg, color: k.iconColor }}>
                                                {k.icon}
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{k.label}</span>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                                    </div>
                                    <p className="text-3xl font-extrabold tracking-tight leading-none" style={{ color: k.valueColor }}>
                                        {k.value}
                                    </p>
                                    {k.sub && (
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(Math.max(k.sub.pct, 0), 100)}%`, background: k.sub.color }} />
                                        </div>
                                    )}
                                    <p className="text-xs font-semibold" style={{ color: k.trendColor }}>
                                        {k.trend}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Chart + Map ── */}
                    {selectedDashboard && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Battery Performance Trend</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Battery SOC over last 50 readings</p>
                                    </div>
                                    <span className="text-xs font-bold text-navy bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">Last 50 pts</span>
                                </div>
                                <div className="flex-1 w-full min-h-[280px]">
                                    {deviceData.length > 0 ? (
                                        <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Waiting for data...</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col overflow-hidden" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                            <MapPin size={16} className="text-amber-500" /> Live Location
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">GPS tracking active</p>
                                    </div>
                                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                                        <Wifi size={11} /> GPS On
                                    </span>
                                </div>
                                <div className="flex-1 min-h-[280px] rounded-xl overflow-hidden border border-slate-100 relative z-0">
                                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} key={`${mapCenter[0]}-${mapCenter[1]}`}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        />
                                        {latestData?.gpsLatitude && (
                                            <Marker position={[latestData.gpsLatitude, latestData.gpsLongitude]}>
                                                <Popup>
                                                    <strong>Vehicle Location</strong><br />
                                                    <span className="text-xs">Lat: {latestData.gpsLatitude.toFixed(5)}</span><br />
                                                    <span className="text-xs">Lng: {latestData.gpsLongitude.toFixed(5)}</span>
                                                </Popup>
                                            </Marker>
                                        )}
                                    </MapContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Status Footer ── */}
                    {selectedDashboard && (
                        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-3" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span className="text-sm font-semibold text-slate-700">System Health: </span>
                                <span className="text-sm font-bold text-emerald-600">All Systems Normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Device ID:</span>
                                <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">{selectedDashboard.deviceId ?? '--'}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs text-slate-400 font-medium">Auto-refreshing every 3s</span>
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
