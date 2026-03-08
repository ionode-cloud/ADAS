import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Activity, Download } from 'lucide-react';

const MAX_HISTORY = 100;

const CarSensorSystem = () => {
    const [sensors, setSensors] = useState({ front: 3.0, back: 3.0, left: 3.0, right: 3.0 });
    const [isConnected, setIsConnected] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [history, setHistory] = useState([]);
    const tableRef = useRef(null);

    useEffect(() => {
        setIsConnected(true);
        if (!isRunning) return;
        const interval = setInterval(() => {
            setSensors(prev => {
                const sides = ['front', 'back', 'left', 'right'];
                const side = sides[Math.floor(Math.random() * sides.length)];
                const drift = (Math.random() - 0.5) * 1.5;
                const newVal = Number(Math.max(0.2, Math.min(4.0, prev[side] + drift)).toFixed(1));
                const next = { ...prev, [side]: newVal };

                // Save snapshot to history
                const overallMin = Math.min(next.front, next.back, next.left, next.right);
                const overallStatus =
                    overallMin <= 0.6 ? 'STOP' :
                    overallMin <= 1.5 ? 'WARNING' : 'SAFE';

                setHistory(h => [
                    {
                        time: new Date().toLocaleTimeString(),
                        front: next.front,
                        back: next.back,
                        left: next.left,
                        right: next.right,
                        status: overallStatus,
                        id: Date.now(),
                    },
                    ...h
                ].slice(0, MAX_HISTORY));

                return next;
            });
        }, 800);
        return () => clearInterval(interval);
    }, [isRunning]);

    const getSensorStatus = (distance) => {
        if (distance <= 0.6) return { color: 'bg-red-500',     textColor: 'text-red-500',     wave: 'border-red-500',     alert: 'STOP',    alertColor: '#EF4444' };
        if (distance <= 1.5) return { color: 'bg-yellow-500',  textColor: 'text-amber-500',   wave: 'border-yellow-500',  alert: 'WARNING', alertColor: '#F59E0B' };
        return                      { color: 'bg-emerald-500',  textColor: 'text-emerald-500', wave: 'border-emerald-500', alert: 'SAFE',    alertColor: '#10B981' };
    };

    const renderRadarWaves = (distance, directionClass) => {
        const status = getSensorStatus(distance);
        const speed = distance <= 0.6 ? '0.5s' : distance <= 1.5 ? '1s' : '2s';
        return (
            <div className={`absolute ${directionClass} pointer-events-none flex items-center justify-center`}>
                {[0, 0.3, 0.6].map((delay, i) => (
                    <div key={i}
                        className={`absolute w-full h-full rounded-full border-2 ${status.wave} opacity-0 animate-radar-wave`}
                        style={{ animationDuration: speed, animationDelay: `${delay}s` }}
                    />
                ))}
            </div>
        );
    };

    const isStopCritical = Object.values(sensors).some(d => d <= 0.6);

    // CSV export
    const handleExport = () => {
        const header = 'Time,Front (m),Back (m),Left (m),Right (m),Status\n';
        const rows = history.map(r => `${r.time},${r.front},${r.back},${r.left},${r.right},${r.status}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sensor_history_${Date.now()}.csv`;
        link.click();
    };

    const statusBadge = (status) => {
        if (status === 'STOP')    return <span className="badge-danger">STOP</span>;
        if (status === 'WARNING') return <span className="badge-warning">WARNING</span>;
        return <span className="badge-success">SAFE</span>;
    };

    return (
        <div className="flex flex-col gap-6 slide-in pb-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="text-amber-500" size={26} /> Proximity Sensor Radar
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Live 360° collision avoidance — history saved automatically</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Start / Stop button */}
                    <button
                        onClick={() => setIsRunning(r => !r)}
                        className="flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-xl transition-all"
                        style={isRunning
                            ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }
                            : { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }
                        }
                    >
                        <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {isRunning ? 'Stop Readings' : 'Start Readings'}
                    </button>

                    <div className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {isConnected ? 'Sensors Active' : 'Offline'}
                    </div>
                </div>
            </div>

            {/* STOP Banner */}
            {isStopCritical && (
                <div className="rounded-xl p-4 flex items-center justify-center gap-3 animate-pulse" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <ShieldAlert className="text-red-500 w-8 h-8 shrink-0" />
                    <span className="text-red-600 font-extrabold text-xl tracking-widest">⚠ STOP — COLLISION IMMINENT</span>
                    <ShieldAlert className="text-red-500 w-8 h-8 shrink-0" />
                </div>
            )}

            {/* Radar Visualization */}
            <div className="saas-card relative overflow-hidden flex items-center justify-center min-h-[480px]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(31,58,95,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(31,58,95,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none rounded-2xl" />

                {/* Car */}
                <div className="relative w-[180px] h-[380px] flex items-center justify-center z-10">
                    <img
                        src="https://img.icons8.com/isometric/500/car.png"
                        alt="Vehicle"
                        className="w-[140px] h-auto rounded-3xl"
                        style={{ filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))' }}
                    />
                    {renderRadarWaves(sensors.front, "-top-24 w-[250px] h-[150px]")}
                    {renderRadarWaves(sensors.back,  "-bottom-24 w-[250px] h-[150px]")}
                    {renderRadarWaves(sensors.left,  "-left-28 w-[150px] h-[300px]")}
                    {renderRadarWaves(sensors.right, "-right-28 w-[150px] h-[300px]")}

                    {[['front','-top-1'],['back','-bottom-1'],['left','-left-1'],['right','-right-1']].map(([side, pos]) => (
                        <div key={side}
                            className={`absolute ${pos} w-4 h-4 rounded-full ${getSensorStatus(sensors[side]).color} shadow-lg transition-colors duration-300`}
                            style={{ boxShadow: `0 0 12px ${getSensorStatus(sensors[side]).alertColor}` }}
                        />
                    ))}
                </div>

                {/* Sensor panels */}
                <div className="absolute top-6 left-6 grid gap-4">
                    <SensorPanel label="Front" distance={sensors.front} status={getSensorStatus(sensors.front)} />
                    <SensorPanel label="Left"  distance={sensors.left}  status={getSensorStatus(sensors.left)} />
                </div>
                <div className="absolute top-6 right-6 grid gap-4">
                    <SensorPanel label="Rear"  distance={sensors.back}  status={getSensorStatus(sensors.back)} />
                    <SensorPanel label="Right" distance={sensors.right} status={getSensorStatus(sensors.right)} />
                </div>
            </div>

            {/* History Table */}
            <div className="saas-card overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Sensor Reading History</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Last {history.length} of {MAX_HISTORY} readings (auto-updating every 0.8s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setHistory([])}
                            disabled={history.length === 0}
                            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
                            style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}
                        >
                            🗑 Clear
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={history.length === 0}
                            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
                            style={{ background: '#F59E0B', color: '#fff', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Scrollable table */}
                <div ref={tableRef} className="overflow-auto" style={{ maxHeight: '320px' }}>
                    <table className="saas-table">
                        <thead className="sticky top-0 z-10" style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th>#</th>
                                <th>Time</th>
                                <th>Front (m)</th>
                                <th>Back (m)</th>
                                <th>Left (m)</th>
                                <th>Right (m)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                                        Waiting for sensor data...
                                    </td>
                                </tr>
                            )}
                            {history.map((row, idx) => (
                                <tr key={row.id} className={row.status === 'STOP' ? 'bg-red-50' : row.status === 'WARNING' ? 'bg-amber-50' : ''}>
                                    <td className="font-mono text-slate-400 text-xs">{history.length - idx}</td>
                                    <td className="font-mono text-slate-600 text-xs">{row.time}</td>
                                    <td>
                                        <DistCell value={row.front} />
                                    </td>
                                    <td>
                                        <DistCell value={row.back} />
                                    </td>
                                    <td>
                                        <DistCell value={row.left} />
                                    </td>
                                    <td>
                                        <DistCell value={row.right} />
                                    </td>
                                    <td>{statusBadge(row.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/* Sensor panel card */
const SensorPanel = ({ label, distance, status }) => (
    <div className="bg-white border border-slate-100 rounded-xl p-4 min-w-[130px] flex flex-col items-center shadow-card">
        <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">{label}</span>
        <span className={`text-2xl font-mono font-bold ${status.textColor}`}>{distance.toFixed(1)}m</span>
        <span className={`text-[10px] uppercase tracking-widest mt-1 font-bold ${status.alert === 'STOP' ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
            {status.alert}
        </span>
    </div>
);

/* Color-coded distance cell */
const DistCell = ({ value }) => {
    const color = value <= 0.6 ? '#DC2626' : value <= 1.5 ? '#D97706' : '#059669';
    return (
        <span className="font-mono font-semibold text-sm" style={{ color }}>
            {value.toFixed(1)}
        </span>
    );
};

export default CarSensorSystem;
