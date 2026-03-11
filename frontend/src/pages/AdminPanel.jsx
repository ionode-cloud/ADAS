import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ShieldAlert, Users, Edit, Eye, EyeOff } from 'lucide-react';

const AdminPanel = () => {


    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
    const [editingUser, setEditingUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (currentUser.role === 'admin') fetchUsers();
    }, []);



    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://adas-4cqb.onrender.com/api/users', { headers: { Authorization: `Bearer ${token}` } });
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
                await axios.put(`https://adas-4cqb.onrender.com/api/users/${editingUser._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                if (!newUser.password) return alert('Password is required for new users.');
                if (newUser.password.length < 6) return alert('Password must be at least 6 characters.');
                await axios.post('https://adas-4cqb.onrender.com/api/users', newUser, { headers: { Authorization: `Bearer ${token}` } });
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
            await axios.delete(`https://adas-4cqb.onrender.com/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="input-field pr-10"
                                            value={newUser.password || ''}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                            required={!editingUser}
                                            minLength={6}
                                            placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
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
                                                    <td className="font-mono text-slate-500 tracking-widest text-sm select-none">
                                                        {user.plainPassword || '••••••••'}
                                                    </td>
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


        </div>
    );
};

export default AdminPanel;
