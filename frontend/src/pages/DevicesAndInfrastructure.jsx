import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Plus, Cpu } from 'lucide-react';

const DevicesAndInfrastructure = () => {
    const [devices, setDevices] = useState([]);

    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [gitLink, setGitLink] = useState('');

    const [selectedDevice, setSelectedDevice] = useState('');
    const [deviceStatus, setDeviceStatus] = useState(null);
    const [isLoading, setIsLoading] = useState({ check: false, link: false, upload: false });

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://adas-fcgb.onrender.com/api/devices', { headers: { Authorization: `Bearer ${token}` } });
            setDevices(res.data);
        } catch (error) { console.error('Error fetching devices', error); }
    };

    const handleCheckDevice = async () => {
        if (!selectedDevice) return alert("Please select a device first");
        setIsLoading(prev => ({ ...prev, check: true }));
        setUploadStatus('Checking device status...');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`https://adas-fcgb.onrender.com/api/ota/check-device?device=${selectedDevice}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeviceStatus(res.data.online);
            setUploadStatus(res.data.online ? '✓ Device is ONLINE' : '⚠ Device is OFFLINE');
        } catch (error) {
            setUploadStatus('Error checking device');
        } finally {
            setIsLoading(prev => ({ ...prev, check: false }));
        }
    };

    const handleUpdateViaLink = async () => {
        if (!selectedDevice) return alert("Please select a device first");
        if (!gitLink) return alert("Please enter firmware URL");

        setIsLoading(prev => ({ ...prev, link: true }));
        setUploadStatus('Updating firmware from link...');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`https://adas-fcgb.onrender.com/api/ota/update-link/${selectedDevice}`, { url: gitLink }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUploadStatus(`✓ ${res.data}`);
            setGitLink('');
        } catch (error) {
            setUploadStatus(error.response?.data?.message || 'Update failed');
        } finally {
            setIsLoading(prev => ({ ...prev, link: false }));
        }
    };

    const handleUploadFirmware = async () => {
        if (!selectedDevice) return alert("Please select a device first");
        if (!file) return alert("Please select a .bin file");

        const formData = new FormData();
        formData.append('firmware', file);

        setIsLoading(prev => ({ ...prev, upload: true }));
        setUploadStatus('Uploading firmware...');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`https://adas-fcgb.onrender.com/api/ota/upload/${selectedDevice}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setUploadStatus(`✓ ${res.data}`);
            setFile(null);
        } catch (error) {
            setUploadStatus(error.response?.data?.message || 'Upload failed');
        } finally {
            setIsLoading(prev => ({ ...prev, upload: false }));
        }
    };

    const SectionCard = ({ children }) => (
        <div className="saas-card p-6">{children}</div>
    );

    const SectionTitle = ({ icon, children }) => (
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">{icon}{children}</h2>
    );

    const Label = ({ children }) => (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{children}</label>
    );

    return (
        <div className="h-full flex flex-col space-y-6 slide-in pb-10">
            {/* Header */}
            <div>
                <h1 className="page-title flex items-center gap-3">
                    <Cpu className="text-emerald-600" size={28} /> OTA
                </h1>
                <p className="page-subtitle">Manage device registrations and over-the-air firmware updates</p>
            </div>

            {/* Infrastructure */}
            <div>
                <div className="mx-auto">
                    {/* OTA Firmware Control Panel */}
                    <SectionCard>
                        <SectionTitle icon={<Cpu size={17} className="text-amber-500" />}>ESP32 OTA Update Panel</SectionTitle>

                        <div className="space-y-6">
                            {/* Device Selection & Check */}
                            <div>
                                <Label>Select Device</Label>
                                <select
                                    className="input-field mb-2"
                                    value={selectedDevice}
                                    onChange={(e) => { setSelectedDevice(e.target.value); setDeviceStatus(null); setUploadStatus(''); }}
                                >
                                    <option value="">-- Choose a device --</option>
                                    {devices.map(d => (
                                        <option key={d._id} value={d.deviceId}>{d.deviceName} ({d.deviceId})</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleCheckDevice}
                                    className={`ota-btn ${isLoading.check ? 'loading-fill' : ''}`}
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#f59e0b' }}
                                    disabled={!selectedDevice || isLoading.check}
                                >
                                    <span>🔍 Check Device Status</span>
                                    {isLoading.check && (
                                        <div className="ota-dots absolute right-4">
                                            <div className="ota-dot"></div><div className="ota-dot"></div><div className="ota-dot"></div>
                                        </div>
                                    )}
                                </button>
                                {deviceStatus !== null && (
                                    <p className={`mt-2 font-bold ${deviceStatus ? 'text-green-600' : 'text-red-600'}`}>
                                        {deviceStatus ? 'Device is ONLINE' : 'Device is OFFLINE'}
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <hr className="border-slate-200" />

                            {/* GitHub Link Update */}
                            <div>
                                <Label>Update via GitHub Link</Label>
                                <input
                                    type="text"
                                    className="input-field mb-2"
                                    placeholder="Paste firmware .bin URL here"
                                    value={gitLink}
                                    onChange={e => setGitLink(e.target.value)}
                                />
                                <button
                                    onClick={handleUpdateViaLink}
                                    className={`ota-btn ${isLoading.link ? 'loading-shimmer' : ''} ${!deviceStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#f59e0b' }}
                                    disabled={!deviceStatus || isLoading.link || !gitLink}
                                >
                                    <span>🚀 Update from Link</span>
                                    {isLoading.link && <div className="ota-bounce-ball absolute right-4"></div>}
                                </button>
                            </div>

                            {/* Divider */}
                            <hr className="border-slate-200" />

                            {/* Local File Upload */}
                            <div>
                                <Label>Upload .bin File</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-300 hover:bg-amber-50/40 transition-colors bg-slate-50 mb-2">
                                    <Upload className="w-9 h-9 text-slate-400 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500 mb-2">Drop .bin file or click to browse</p>
                                    <input
                                        type="file" accept=".bin"
                                        onChange={e => setFile(e.target.files[0])}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                    />
                                </div>
                                {file && <p className="text-xs text-amber-600 font-medium truncate mb-2">📎 {file.name}</p>}
                                <button
                                    onClick={handleUploadFirmware}
                                    className={`ota-btn ota-btn-primary ${isLoading.upload ? 'loading' : ''} ${(!deviceStatus || !file) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    style={{ width: '100%', padding: '12px', background: '#F59E0B' }}
                                    disabled={!deviceStatus || !file || isLoading.upload}
                                >
                                    <span>📤 Upload & Update</span>
                                    {isLoading.upload && (
                                        <div className="ota-dots absolute right-4">
                                            <div className="ota-dot"></div><div className="ota-dot"></div><div className="ota-dot"></div>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Status Message */}
                            {uploadStatus && (
                                <div className="bg-slate-100 p-3 rounded-lg font-bold text-slate-700 text-center">
                                    {uploadStatus}
                                </div>
                            )}
                        </div>
                    </SectionCard>

                </div>
            </div>
        </div>
    );
};

export default DevicesAndInfrastructure;
