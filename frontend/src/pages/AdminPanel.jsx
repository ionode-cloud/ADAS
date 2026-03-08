import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Plus, Trash2, ShieldAlert, Cpu, Users, Edit } from 'lucide-react';

const AdminPanel = () => {
    const [devices, setDevices] = useState([]);
    const [newDevice, setNewDevice] = useState({ deviceName: '', deviceId: '', particleId: '' });

    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
    const [editingUser, setEditingUser] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchDevices();
        if (currentUser.role === 'admin') fetchUsers();
    }, []);

    const fetchDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/devices', { headers: { Authorization: `Bearer ${token}` } });
            setDevices(res.data);
        } catch (error) { console.error('Error fetching devices', error); }
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/devices', newDevice, { headers: { Authorization: `Bearer ${token}` } });
            setNewDevice({ deviceName: '', deviceId: '', particleId: '' });
            fetchDevices();
        } catch (error) { alert(error.response?.data?.message || 'Error adding device'); }
    };

    const handleDeleteDevice = async (id) => {
        if (!window.confirm('Delete this device?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/devices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchDevices();
        } catch { alert('Error deleting device'); }
    };

    const handleUploadFirmware = async (e) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('firmware', file);
        setUploadStatus('Uploading...');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/ota/upload-firmware', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setUploadStatus('✓ Upload successful');
            setFile(null);
        } catch (error) { setUploadStatus(error.response?.data?.message || 'Upload failed'); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (error) { console.error('Error fetching users', error); }
    };

    const handleAddOrEditUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingUser) {
                // Validate new password only if admin typed one
                if (newUser.password && newUser.password.length < 6) {
                    return alert('New password must be at least 6 characters.');
                }
                const payload = { email: newUser.email, role: newUser.role };
                if (newUser.password) payload.password = newUser.password;
                await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                if (!newUser.password) return alert('Password is required for new users.');
                await axios.post('http://localhost:5000/api/users', newUser, { headers: { Authorization: `Bearer ${token}` } });
            }
            setNewUser({ email: '', password: '', role: 'user' });
            setEditingUser(null);
            fetchUsers();
        } catch (error) { alert(error.response?.data?.message || 'Error saving user'); }
    };

    const handleEditClick = (user) => { setEditingUser(user); setNewUser({ email: user.email, password: '', role: user.role }); };
    const handleCancelEdit = () => { setEditingUser(null); setNewUser({ email: '', password: '', role: 'user' }); };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchUsers();
        } catch (error) { alert(error.response?.data?.message || 'Error deleting user'); }
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
                    <ShieldAlert className="text-red-500" size={28} /> Admin Control Panel
                </h1>
                <p className="page-subtitle">Manage infrastructure, users, devices, and firmware updates</p>
            </div>

            {/* User Management */}
            {currentUser.role === 'admin' && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={18} className="text-navy" />
                        <h2 className="text-base font-bold text-slate-700 uppercase tracking-widest text-sm">User Management</h2>
                        <div className="flex-1 h-px bg-slate-200 ml-2" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                        {/* User Form */}
                        <SectionCard>
                            <SectionTitle icon={editingUser ? <Edit size={17} className="text-amber-500" /> : <Plus size={17} className="text-navy" />}>
                                {editingUser ? 'Edit User' : 'New User'}
                            </SectionTitle>
                            <form onSubmit={handleAddOrEditUser} className="space-y-4">
                                <div><Label>Email</Label>
                                    <input type="email" className="input-field" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Password {editingUser && <span className="text-slate-400 normal-case font-normal">(leave blank to keep)</span>}</Label>
                                    <input
                                        type="password"
                                        className="input-field"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required={!editingUser}
                                        minLength={editingUser ? (newUser.password.length > 0 ? 6 : undefined) : 6}
                                        placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                                    />
                                </div>
                                <div><Label>Role</Label>
                                    <select className="input-field" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                        <option value="user">User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2 pt-1">
                                    <button type="submit" className="primary-btn w-full">
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </button>
                                    {editingUser && (
                                        <button type="button" onClick={handleCancelEdit} className="secondary-btn w-full">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </SectionCard>

                        {/* User Table */}
                        <div className="saas-card xl:col-span-3 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800">System Users</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="saas-table">
                                    <thead><tr>
                                        <th>Email</th><th>Role</th>{currentUser.role === 'admin' && <th>Password</th>}<th className="text-right">Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user._id}>
                                                <td className="font-medium text-slate-800">{user.email}</td>
                                                <td>
                                                    <span className={user.role === 'admin' ? 'badge-warning' : 'badge-info'}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                {currentUser.role === 'admin' && (
                                                    <td className="font-mono text-slate-500 tracking-widest text-sm select-none">••••••••</td>
                                                )}
                                                <td className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleEditClick(user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr><td colSpan={currentUser.role === 'admin' ? 4 : 3} className="py-12 text-center text-slate-400 font-medium">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Infrastructure */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Cpu size={18} className="text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-700 uppercase tracking-widest text-sm">Devices & Infrastructure</h2>
                    <div className="flex-1 h-px bg-slate-200 ml-2" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    {/* Device Form */}
                    <SectionCard>
                        <SectionTitle icon={<Plus size={17} className="text-navy" />}>Register Device</SectionTitle>
                        <form onSubmit={handleAddDevice} className="space-y-4">
                            <div><Label>Device Name</Label>
                                <input type="text" className="input-field" value={newDevice.deviceName} onChange={e => setNewDevice({ ...newDevice, deviceName: e.target.value })} required />
                            </div>
                            <div><Label>Device UID</Label>
                                <input type="text" className="input-field font-mono text-sm" value={newDevice.deviceId} onChange={e => setNewDevice({ ...newDevice, deviceId: e.target.value })} required />
                            </div>
                            <div><Label>Particle Account ID</Label>
                                <input type="text" className="input-field font-mono text-sm" value={newDevice.particleId} onChange={e => setNewDevice({ ...newDevice, particleId: e.target.value })} required />
                            </div>
                            <button type="submit" className="primary-btn w-full mt-2">Add Device</button>
                        </form>
                    </SectionCard>

                    {/* OTA Firmware */}
                    <SectionCard>
                        <SectionTitle icon={<Cpu size={17} className="text-amber-500" />}>OTA Firmware Update</SectionTitle>
                        <form onSubmit={handleUploadFirmware} className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-300 hover:bg-amber-50/40 transition-colors bg-slate-50">
                                <Upload className="w-9 h-9 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm text-slate-500 mb-2">Drop .bin file or click to browse</p>
                                <input
                                    type="file" accept=".bin"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                />
                            </div>
                            {file && <p className="text-xs text-amber-600 font-medium truncate">📎 {file.name}</p>}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-xl text-white transition-all"
                                style={{ background: '#F59E0B', boxShadow: '0 4px 14px rgba(245,158,11,0.3)', opacity: !file ? 0.5 : 1, cursor: !file ? 'not-allowed' : 'pointer' }}
                                disabled={!file}
                            >
                                <Upload size={16} /> Push Update to Fleet
                            </button>
                            {uploadStatus && (
                                <p className={`text-sm text-center font-medium ${uploadStatus.includes('success') || uploadStatus.includes('✓') ? 'text-emerald-600' : 'text-amber-600'}`}>{uploadStatus}</p>
                            )}
                        </form>
                    </SectionCard>

                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
