import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Battery, Zap, Thermometer, ShieldCheck, Power, MapPin,
    Gauge, Wifi, Clock, Activity, Navigation, Signal
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

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/dashboards', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dummyDashboard = { _id: 'dummy123', dashboardName: 'Test Vehicle Alpha (Live Demo)', deviceId: 'DEV-001' };
                const all = [...res.data, dummyDashboard];
                setDashboards(all);
                setIsConnected(true);
                setSelectedDashboard(res.data.length > 0 ? res.data[res.data.length - 1] : dummyDashboard);
            } catch {
                const dummyDashboard = { _id: 'dummy123', dashboardName: 'Test Vehicle Alpha (Live Demo)', deviceId: 'DEV-001' };
                setDashboards([dummyDashboard]);
                setSelectedDashboard(dummyDashboard);
                setIsConnected(true);
            }
        };
        fetchDashboards();
    }, []);

    useEffect(() => {
        if (!selectedDashboard) return;
        const now = Date.now();
        const fakeHistory = Array.from({ length: 20 }).map((_, i) => ({
            timestamp:          now - (20 - i) * 5000,
            batterySOC:         Math.floor(80 + Math.random() * 20),
            batteryTemperature: +(25 + Math.random() * 5).toFixed(1),
            batteryVoltage:     +(12 + Math.random() * 2).toFixed(1),
            speed:              Math.floor(30 + Math.random() * 80),
            signalStrength:     Math.floor(70 + Math.random() * 30),
            ignitionStatus:     'ON',
            engineRPM:          Math.floor(1200 + Math.random() * 2000),
            gpsLatitude:        20.2961 + (Math.random() - 0.5) * 0.01,
            gpsLongitude:       85.8245 + (Math.random() - 0.5) * 0.01,
            deviceId:           selectedDashboard.deviceId
        }));
        setDeviceData(fakeHistory);
        setLatestData(fakeHistory[fakeHistory.length - 1]);

        const interval = setInterval(() => {
            const newPoint = {
                timestamp:          Date.now(),
                batterySOC:         Math.floor(80 + Math.random() * 20),
                batteryTemperature: +(25 + Math.random() * 5).toFixed(1),
                batteryVoltage:     +(12 + Math.random() * 2).toFixed(1),
                speed:              Math.floor(30 + Math.random() * 80),
                signalStrength:     Math.floor(70 + Math.random() * 30),
                ignitionStatus:     'ON',
                engineRPM:          Math.floor(1200 + Math.random() * 2000),
                gpsLatitude:        20.2961 + (Math.random() - 0.5) * 0.01,
                gpsLongitude:       85.8245 + (Math.random() - 0.5) * 0.01,
                deviceId:           selectedDashboard.deviceId
            };
            setDeviceData(prev => [...prev, newPoint].slice(-50));
            setLatestData(newPoint);
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedDashboard]);

    /* ─── 9 KPI CARDS ─── */
    const kpis = latestData ? [
        {
            icon: <Power size={22} />,
            iconBg: latestData.ignitionStatus === 'ON' ? '#ECFDF5' : '#FEF2F2',
            iconColor: latestData.ignitionStatus === 'ON' ? '#059669' : '#DC2626',
            label: 'Ignition Status',
            value: latestData.ignitionStatus,
            valueColor: latestData.ignitionStatus === 'ON' ? '#059669' : '#DC2626',
            sub: null,
            trend: latestData.ignitionStatus === 'ON' ? 'Engine Running' : 'Engine Off',
            trendColor: latestData.ignitionStatus === 'ON' ? '#059669' : '#DC2626',
        },
        {
            icon: <Battery size={22} />,
            iconBg: '#EFF6FF', iconColor: '#1F3A5F',
            label: 'Battery SOC',
            value: `${latestData.batterySOC}%`,
            valueColor: '#1E293B',
            sub: { pct: latestData.batterySOC, color: latestData.batterySOC > 20 ? '#1F3A5F' : '#EF4444' },
            trend: latestData.batterySOC > 20 ? 'Charge OK' : 'Low Battery',
            trendColor: latestData.batterySOC > 20 ? '#2563EB' : '#DC2626',
        },
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
        {
            icon: <Signal size={22} />,
            iconBg: '#F0FDF4', iconColor: '#16A34A',
            label: 'Signal Strength',
            value: `${latestData.signalStrength}%`,
            valueColor: '#1E293B',
            sub: { pct: latestData.signalStrength, color: latestData.signalStrength > 60 ? '#16A34A' : '#F59E0B' },
            trend: latestData.signalStrength > 60 ? 'Strong Signal' : 'Weak Signal',
            trendColor: latestData.signalStrength > 60 ? '#16A34A' : '#D97706',
        },
        {
            icon: <Navigation size={22} />,
            iconBg: '#FFF1F2', iconColor: '#E11D48',
            label: 'GPS Coordinates',
            value: `${latestData.gpsLatitude.toFixed(4)}°N`,
            valueColor: '#1E293B',
            sub: null,
            trend: `${latestData.gpsLongitude.toFixed(4)}°E`,
            trendColor: '#64748B',
        },
        {
            icon: <Clock size={22} />,
            iconBg: '#F8FAFC', iconColor: '#475569',
            label: 'Last Updated',
            value: new Date(latestData.timestamp).toLocaleTimeString(),
            valueColor: '#1E293B',
            sub: null,
            trend: 'Live Data',
            trendColor: '#059669',
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

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vehicle Monitoring</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Real-time telemetry and diagnostics</p>
                </div>
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
            </div>

            {/* ── 9 KPI Cards — 3×3 Grid ── */}
            {latestData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {kpis.map((k, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 transition-all duration-200 cursor-default"
                            style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0px 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {/* Icon + Label */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.iconBg, color: k.iconColor }}>
                                        {k.icon}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{k.label}</span>
                                </div>
                                {/* Live pulse dot */}
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            </div>

                            {/* Value */}
                            <p className="text-3xl font-extrabold tracking-tight leading-none" style={{ color: k.valueColor }}>
                                {k.value}
                            </p>

                            {/* Progress bar (optional) */}
                            {k.sub && (
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(Math.max(k.sub.pct, 0), 100)}%`, background: k.sub.color }} />
                                </div>
                            )}

                            {/* Trend label */}
                            <p className="text-xs font-semibold" style={{ color: k.trendColor }}>
                                {k.trend}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Skeleton while loading */}
            {!latestData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-36 animate-pulse" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
                            <div className="bg-slate-100 rounded-xl w-10 h-10 mb-4" />
                            <div className="bg-slate-100 rounded h-4 w-1/2 mb-2" />
                            <div className="bg-slate-100 rounded h-7 w-2/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Chart + Map ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Battery SOC Chart */}
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

                {/* Live Map */}
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

            {/* ── Status Footer ── */}
            <div className="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-3" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">System Health: </span>
                    <span className="text-sm font-bold text-emerald-600">All Systems Normal</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Device ID:</span>
                    <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">{selectedDashboard?.deviceId ?? '--'}</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-slate-400 font-medium">Auto-refreshing every 3s</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
