import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronRight, Shield } from 'lucide-react';

const Login = ({ setAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://adas.api.ionode.cloud';
            const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setAuth(true);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Panel — Form */}
            <div className="login-form-panel">
                <div className="login-form-inner">
                    {/* Logo */}
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <Shield size={28} className="login-logo-svg" />
                        </div>
                        <span className="login-logo-text">ADAS</span>
                    </div>

                    <h1 className="login-title">Welcome back</h1>
                    <p className="login-subtitle">Sign in to access your vehicle monitoring dashboard</p>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-wrap">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="auth-input"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-label-row">
                                <label className="form-label">Password</label>
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>
                            <div className="input-wrap">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="auth-btn">
                            {loading ? (
                                <span className="btn-spinner"></span>
                            ) : (
                                <>
                                    Sign In
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-switch-link">Create one</Link>
                    </p>
                </div>
            </div>

            {/* Right Panel — Hero Image */}
            <div className="login-hero-panel">
                <div className="hero-gradient-overlay"></div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot"></span>
                        Live Monitoring Active
                    </div>
                    <h2 className="hero-title">Smart Vehicle<br />Monitoring</h2>
                    <p className="hero-desc">Real-time Battery, GPS & Ignition Tracking for your entire fleet — all in one place.</p>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-num">99.9%</span>
                            <span className="hero-stat-label">Uptime</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-num">500ms</span>
                            <span className="hero-stat-label">Latency</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-num">ESP32</span>
                            <span className="hero-stat-label">Devices</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
