import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, PlusSquare, Settings, Database, LogOut, Menu, X, Car, Cpu } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const userEmail = user.email || '';
    const userInitial = userEmail.charAt(0).toUpperCase() || 'U';
    const isAdmin = user.role === 'admin';

    const allNavLinks = [
        { path: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { path: '/devices', icon: <Server size={18} />, label: 'Devices' },
        { path: '/create-dashboard', icon: <PlusSquare size={18} />, label: 'Create Dashboard' },
        { path: '/infrastructure', icon: <Cpu size={18} />, label: 'OTA' },

        { path: '/logs', icon: <Database size={18} />, label: 'Data Logs' },
        { path: '/admin', icon: <Settings size={18} />, label: 'Admin Panel' },
    ];

    const navLinks = isAdmin
        ? allNavLinks
        : allNavLinks.filter(link => link.path === '/' || link.path === '/devices');

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#F5F7FA' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static top-0 left-0 z-50 h-full w-64 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ background: 'linear-gradient(180deg, #1F3A5F 0%, #274C77 100%)', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F59E0B' }}>
                            <Car size={18} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-wide">ADAS System</span>
                    </div>
                    <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X size={22} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1">Main Menu</p>
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/8'
                                    }`}
                                style={isActive ? { background: 'rgba(245,158,11,0.2)', borderLeft: '3px solid #F59E0B', paddingLeft: '9px' } : {}}
                            >
                                <span className={isActive ? 'text-amber-400' : ''}>{link.icon}</span>
                                {link.label}
                                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: '#F59E0B' }}>
                            {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{userEmail || 'User'}</p>
                            <p className="text-white/40 text-[10px]">Signed in</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-300 hover:text-red-200 transition-colors"
                        style={{ ':hover': { background: 'rgba(239,68,68,0.12)' } }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main panel */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-white shrink-0 flex items-center px-4 lg:px-6 justify-between" style={{ borderBottom: '1px solid #F1F5F9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
                    <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
                        <Menu size={22} />
                    </button>

                    <div className="lg:flex-1">
                        <p className="text-xs text-slate-400 hidden lg:block">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            System Online
                        </div>
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #1F3A5F, #274C77)' }}
                            title={userEmail}
                        >
                            {userInitial}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <div className="h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
