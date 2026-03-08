import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Download, Calendar, FileText } from 'lucide-react';

const DataLogs = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deviceData, setDeviceData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/dashboards', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDashboards(res.data);
                if (res.data.length > 0) setSelectedDeviceId(res.data[0].deviceId);
            } catch (error) {
                console.error('Error fetching dashboards', error);
            }
        };
        fetchDashboards();
    }, []);

    useEffect(() => {
        if (!selectedDeviceId) return;
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/history/${selectedDeviceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDeviceData(res.data);
            } catch (error) {
                console.error('Error fetching history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [selectedDeviceId]);

    const handleDownload = async () => {
        if (!selectedDeviceId) return;
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:5000/api/download?deviceId=${selectedDeviceId}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(new Blob([response.data]));
            link.setAttribute('download', `DeviceData_${selectedDeviceId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file', error);
            alert('Failed to download data');
        }
    };

    return (
        <div className="h-full flex flex-col slide-in gap-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <Database className="text-navy" size={28} /> Telemetry Logs
                    </h1>
                    <p className="page-subtitle">Review historical device data and export records</p>
                </div>
            </div>

            {/* Filter Card */}
            <div className="saas-card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-navy mb-4 flex items-center gap-2">
                    <FileText size={13} /> Filter & Export
                </p>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="cd-label mb-1.5 block">Device</label>
                        <select className="input-field" value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)}>
                            {dashboards.map(d => (
                                <option key={d._id} value={d.deviceId}>{d.dashboardName} ({d.deviceId})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <label className="cd-label mb-1.5 block">Start Date</label>
                        <div className="relative">
                            <input type="date" className="input-field pl-10" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <label className="cd-label mb-1.5 block">End Date</label>
                        <div className="relative">
                            <input type="date" className="input-field pl-10" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                    </div>

                    <button onClick={handleDownload} className="primary-btn flex items-center gap-2 h-[42px] px-5">
                        <Download size={16} /> Export .XLSX
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="saas-card flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800">Recent Records</h3>
                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-500 font-medium">
                        {deviceData.length} records
                    </span>
                </div>
                <div className="overflow-auto flex-1">
                    {loading ? (
                        <div className="h-full flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#E2E8F0', borderTopColor: '#F59E0B' }}></div>
                        </div>
                    ) : (
                        <table className="saas-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Ignition</th>
                                    <th>Battery SOC</th>
                                    <th>Battery Temp</th>
                                    <th>Voltage</th>
                                    <th>GPS Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deviceData.map((data, index) => (
                                    <tr key={index}>
                                        <td className="text-slate-500 text-xs">{new Date(data.timestamp).toLocaleString()}</td>
                                        <td>
                                            <span className={data.ignitionStatus === 'ON' ? 'badge-success' : 'badge-danger'}>
                                                {data.ignitionStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${Math.min(data.batterySOC, 100)}%`, background: data.batterySOC > 20 ? '#1F3A5F' : '#EF4444' }} />
                                                </div>
                                                <span className="text-slate-700 font-medium">{data.batterySOC}%</span>
                                            </div>
                                        </td>
                                        <td className="text-slate-700">{data.batteryTemperature}°C</td>
                                        <td className="text-slate-700">{data.batteryVoltage}V</td>
                                        <td className="text-slate-400 text-xs font-mono">{data.gpsLatitude}, {data.gpsLongitude}</td>
                                    </tr>
                                ))}
                                {deviceData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center text-slate-400 font-medium">No telemetry data found for this device.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataLogs;
