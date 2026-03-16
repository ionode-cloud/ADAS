import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Server, Activity, Clock, Search, PlusCircle,
    Trash2, Wifi, WifiOff, CheckCircle2, AlertCircle,
    MonitorSmartphone, Cpu, Hash, X, MapPin
} from 'lucide-react';

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [deviceName, setDeviceName] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [location, setLocation] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const isAdmin = user.role === 'admin';

    const fetchDevices = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://adas.api.ionode.cloud';
            const res = await axios.get(`${apiUrl}/api/devices`);
            setDevices(res.data);
        } catch (err) {
            console.error('Error fetching devices', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDevices(); }, []);

    const handleAddDevice = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setFormLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://adas.api.ionode.cloud';
            await axios.post(`${apiUrl}/api/devices`,
                { deviceName, deviceId, location }
            );
            setFormSuccess(`Device "${deviceName}" added successfully!`);
            setDeviceName('');
            setDeviceId('');
            setLocation('');
            fetchDevices();
            setTimeout(() => { setFormSuccess(''); setShowForm(false); }, 2000);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to add device.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://adas.api.ionode.cloud';
            await axios.delete(`${apiUrl}/api/devices/${id}`);
            setDevices(prev => prev.filter(d => d._id !== id));
        } catch (err) {
            alert('Failed to delete device.');
        }
    };

    const filtered = devices.filter(d =>
        d.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col slide-in gap-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl device-header-icon">
                        <MonitorSmartphone size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Devices</h1>
                        <p className="text-slate-500 text-sm">{devices.length} registered ESP32 device{devices.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            className="input-field pl-9 text-sm"
                            placeholder="Search devices..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => { setShowForm(f => !f); setFormError(''); setFormSuccess(''); }}
                            className="device-add-btn"
                        >
                            {showForm ? <X size={18} /> : <PlusCircle size={18} />}
                            {showForm ? 'Cancel' : 'Add Device'}
                        </button>
                    )}
                </div>
            </div>

            {/* Add Device Form */}
            {showForm && (
                <div className="device-form-card">
                    <h3 className="device-form-title">
                        <Cpu size={15} /> Register New ESP32 Device
                    </h3>

                    {formError && (
                        <div className="device-alert device-alert-error">
                            <AlertCircle size={15} /> {formError}
                        </div>
                    )}
                    {formSuccess && (
                        <div className="device-alert device-alert-success">
                            <CheckCircle2 size={15} /> {formSuccess}
                        </div>
                    )}

                    <form onSubmit={handleAddDevice} className="device-form-grid">
                        <div className="device-field">
                            <label className="device-label">Device Name</label>
                            <input
                                type="text"
                                className="device-input"
                                placeholder="e.g., Fleet Truck #01"
                                value={deviceName}
                                onChange={e => setDeviceName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="device-field">
                            <label className="device-label">Device ID</label>
                            <input
                                type="text"
                                className="device-input font-mono"
                                placeholder="e.g., DEVICE_001"
                                value={deviceId}
                                onChange={e => setDeviceId(e.target.value)}
                                maxLength={10}
                                required
                            />
                        </div>
                        <div className="device-field">
                            <label className="device-label">Location</label>
                            <input
                                type="text"
                                className="device-input font-mono"
                                placeholder="e.g., New York, NY"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={formLoading} className="device-submit-btn">
                                {formLoading ? <span className="btn-spinner"></span> : <><PlusCircle size={16} /> Add Device</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Device Table */}
            <div className="device-table-wrap flex-1">
                {/* Table Header */}
                <div className="device-table-header">
                    <div className="device-col-1">Device</div>
                    <div className="device-col-2">Device ID</div>
                    <div className="device-col-3">Location</div>
                    <div className="device-col-4">Status</div>
                    <div className="device-col-5">Last Seen</div>
                    <div className="device-col-6"></div>
                </div>

                {/* Rows */}
                <div className="device-table-body">
                    {loading ? (
                        <div className="device-empty-state">
                            <div className="w-7 h-7 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map((device, idx) => {
                            const isOnline = device.status === 'Online';
                            return (
                                <div key={device._id} className={`device-row ${idx % 2 === 0 ? 'device-row-even' : ''}`}>
                                    {/* Name */}
                                    <div className="device-col-1 flex items-center gap-3">
                                        <div className="device-row-icon">
                                            <Server size={16} />
                                        </div>
                                        <span className="font-semibold text-slate-900 text-sm">{device.deviceName}</span>
                                    </div>

                                    {/* Device ID */}
                                    <div className="device-col-2">
                                        <span className="device-mono-badge">
                                            <Hash size={11} />{device.deviceId}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="device-col-3">
                                        <span className="device-mono-badge">
                                            <MapPin size={11} />{device.location}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className="device-col-4">
                                        <span className={`device-status-badge ${isOnline ? 'device-status-online' : 'device-status-offline'}`}>
                                            {isOnline
                                                ? <><Wifi size={12} className="inline -mt-0.5" /> Online</>
                                                : <><WifiOff size={12} className="inline -mt-0.5" /> Offline</>
                                            }
                                        </span>
                                    </div>

                                    {/* Last Seen */}
                                    <div className="device-col-5 flex items-center gap-1.5 text-slate-500 text-xs">
                                        <Clock size={12} />
                                        {new Date(device.lastSeen).toLocaleString()}
                                    </div>

                                    {/* Actions */}
                                    <div className="device-col-6">
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(device._id, device.deviceName)}
                                                className="device-delete-btn"
                                                title="Remove device"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="device-empty-state">
                            <Server size={40} className="text-dark-muted mx-auto mb-3 opacity-40" />
                            <p className="text-slate-800 font-medium mb-1">No devices found</p>
                            <p className="text-slate-500 text-sm">
                                {searchTerm ? 'No results match your search.' : 'Click "Add Device" to register your first ESP32.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeviceList;
