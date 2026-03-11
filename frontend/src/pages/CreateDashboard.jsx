import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PlusCircle, Cpu, Power, Battery, Thermometer, Zap,
    MapPin, CheckCircle2, AlertCircle, Sparkles, ChevronRight, User, ArrowLeft,
    Gauge, Activity, MonitorCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
    { key: 'ignition', label: 'Ignition ON/OFF', icon: Power, color: '#22C55E', desc: 'Monitor engine ignition state' },
    { key: 'batteryTemperature', label: 'Battery Temperature', icon: Thermometer, color: '#F97316', desc: 'Real-time thermal monitoring' },
    { key: 'batterySOC', label: 'Battery SOC', icon: Battery, color: '#6366F1', desc: 'State of charge percentage' },
    { key: 'batteryVoltage', label: 'Battery Voltage', icon: Zap, color: '#EAB308', desc: 'Live voltage readings in V' },
    { key: 'speed', label: 'Vehicle Speed', icon: Gauge, color: '#0284C7', desc: 'Real-time speed monitoring' },
    { key: 'engineRPM', label: 'Engine RPM', icon: Activity, color: '#9333EA', desc: 'Engine revolutions per minute' },
    { key: 'gps', label: 'GPS Location', icon: MapPin, color: '#14B8A6', desc: 'Live map with coordinates' },
];

const CreateDashboard = () => {
    const [dashboardName, setDashboardName] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [enabledFeatures, setEnabledFeatures] = useState(FEATURES.map(f => f.key));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [createdParticleId, setCreatedParticleId] = useState('');
    const [devices, setDevices] = useState([]);
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('https://adas-fcgb.onrender.com/api/devices', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDevices(res.data);
            } catch (error) {
                console.error("Error fetching devices", error);
            }
        };

        if (isAuthenticated) {
            fetchDevices();
        }
    }, [isAuthenticated]);

    const toggleFeature = (key) => {
        setEnabledFeatures(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const toggleAll = () => {
        setEnabledFeatures(prev =>
            prev.length === FEATURES.length ? [] : FEATURES.map(f => f.key)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enabledFeatures.length === 0) {
            setError('Please enable at least one feature.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        setCreatedParticleId('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'https://adas-fcgb.onrender.com/api/dashboards',
                { dashboardName, deviceId, email, password, enabledFeatures, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCreatedParticleId(res.data.dashboard.particleId);
            setSuccess('Dashboard created! Your Particle ID has been auto-generated below — use it in your ESP32 firmware.');
            setDashboardName('');
            setDeviceId('');
            setEmail('');
            setPassword('');
            setDescription('');
            setEnabledFeatures(FEATURES.map(f => f.key));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create dashboard.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={isAuthenticated ? "h-full flex flex-col slide-in" : "min-h-screen p-4 md:p-6 lg:p-8"} style={isAuthenticated ? {} : { background: '#F5F7FA' }}>
            <div className={isAuthenticated ? "h-full flex flex-col" : "max-w-7xl mx-auto h-full flex flex-col slide-in"}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <PlusCircle size={22} style={{ color: '#6366F1' }} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Dashboard</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1">

                    {/* Left: Form */}
                    <div className="xl:col-span-3 flex flex-col gap-5">

                        {/* Alerts */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-xl text-red-700 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex flex-col gap-2 p-4 rounded-xl text-emerald-800 text-sm" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
                                    {success}
                                </div>
                                {createdParticleId && (
                                    <div className="mt-2 ml-7 p-3 rounded-lg text-base font-mono tracking-wider flex items-center justify-between gap-3" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
                                        <span className="text-xs text-slate-500 font-sans">Particle ID</span>
                                        <span>{createdParticleId}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Basic Info Card */}
                            <div className="cd-card">
                                <h3 className="cd-section-title">
                                    <Cpu size={16} />
                                    Device Configuration
                                </h3>

                                <div className="flex flex-col gap-4">
                                    <div className="cd-field-group">
                                        <label className="cd-label">Select Device</label>
                                        <select
                                            className="cd-input font-mono"
                                            value={deviceId}
                                            onChange={e => setDeviceId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose a device --</option>
                                            {devices.map(d => (
                                                <option key={d._id} value={d.deviceId}>{d.deviceName} ({d.deviceId})</option>
                                            ))}
                                        </select>
                                        <p className="cd-hint flex items-center gap-1">
                                            <Sparkles size={11} /> Choose an existing device to link to this dashboard
                                        </p>
                                    </div>

                                    <div className="cd-field-group">
                                        <label className="cd-label">Dashboard Name</label>
                                        <input
                                            type="text"
                                            className="cd-input"
                                            placeholder="e.g., Fleet Truck #42"
                                            value={dashboardName}
                                            onChange={e => setDashboardName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="cd-field-group">
                                        <label className="cd-label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                                        <textarea
                                            className="cd-input resize-none"
                                            rows={2}
                                            placeholder="Brief description of this dashboard..."
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* User Credentials Card */}
                            <div className="cd-card">
                                <h3 className="cd-section-title">
                                    <User size={16} />
                                    Link to Account
                                </h3>
                                <p className="text-xs text-slate-500 mb-4 -mt-3">Provide email and password to link this device. If you don't have an account, one will be created automatically.</p>

                                <div className="flex flex-col gap-4">
                                    <div className="cd-field-group">
                                        <label className="cd-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="cd-input"
                                            placeholder="user@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="cd-field-group">
                                        <label className="cd-label">Password</label>
                                        <input
                                            type="password"
                                            className="cd-input"
                                            placeholder="Min 6 characters (for new users)"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="cd-submit-btn"
                            >
                                {loading ? (
                                    <span className="btn-spinner"></span>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Create Dashboard
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right: Feature Toggles */}
                    <div className="xl:col-span-2 flex flex-col gap-4">
                        <div className="cd-card flex-1">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="cd-section-title mb-0">
                                    <MonitorCheck size={16} />
                                    Dashboard Features
                                </h3>
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                                    style={{ background: '#EFF6FF', color: '#1F3A5F', border: '1px solid #BFDBFE' }}
                                >
                                    {enabledFeatures.length === FEATURES.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {FEATURES.map(feature => {
                                    const Icon = feature.icon;
                                    const active = enabledFeatures.includes(feature.key);
                                    return (
                                        <div
                                            key={feature.key}
                                            onClick={() => toggleFeature(feature.key)}
                                            className="feature-toggle-card"
                                            style={active ? {
                                                background: `${feature.color}0D`,
                                                borderColor: `${feature.color}40`,
                                            } : {}}
                                        >
                                            <div className="feature-icon" style={{ background: active ? `${feature.color}20` : 'rgba(255,255,255,0.04)', color: active ? feature.color : '#475569' }}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="feature-label" style={{ color: active ? '#1E293B' : '#64748B', fontWeight: active ? 700 : 600 }}>{feature.label}</p>
                                                <p className="feature-desc" style={{ color: '#64748B' }}>{feature.desc}</p>
                                            </div>
                                            <div className={`feature-toggle-dot ${active ? 'active' : ''}`} style={active ? { background: feature.color, boxShadow: `0 0 8px ${feature.color}60` } : {}}>
                                                {active && <CheckCircle2 size={14} color="white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-slate-500 mt-4">
                                {enabledFeatures.length} of {FEATURES.length} features enabled
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDashboard;
