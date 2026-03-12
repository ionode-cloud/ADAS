import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronRight, UserPlus, ShieldCheck, RotateCcw } from 'lucide-react';

const STEPS = { INFO: 'info', OTP: 'otp', DONE: 'done' };

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(searchParams.get('step') === 'otp' ? STEPS.OTP : STEPS.INFO);
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/auth/register`, { email, password, role: 'user' });
            setStep(STEPS.OTP);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/auth/send-otp`, { email });
            setCountdown(60);
            setSuccess('OTP resent successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            document.getElementById('otp-5')?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return setError('Please enter all 6 digits.');
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/auth/verify-otp`, { email, otp: code });
            setStep(STEPS.DONE);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
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
                            <UserPlus size={26} className="login-logo-svg" />
                        </div>
                        <span className="login-logo-text">ADAS</span>
                    </div>

                    {/* Step: Registration Info */}
                    {step === STEPS.INFO && (
                        <>
                            <h1 className="login-title">Create Account</h1>
                            <p className="login-subtitle">Join the ADAS fleet management platform</p>

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="auth-form">
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div className="input-wrap">
                                        <Mail size={18} className="input-icon" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="auth-input"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="input-wrap">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="auth-input"
                                            placeholder="Min 6 characters"
                                            required
                                            minLength={6}
                                        />
                                        <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>


                                <button type="submit" disabled={loading} className="auth-btn">
                                    {loading ? <span className="btn-spinner"></span> : (
                                        <> Send OTP Code <ChevronRight size={18} /> </>
                                    )}
                                </button>
                            </form>

                            <p className="auth-switch">
                                Already have an account?{' '}
                                <Link to="/login" className="auth-switch-link">Sign in</Link>
                            </p>
                        </>
                    )}

                    {/* Step: OTP Verification */}
                    {step === STEPS.OTP && (
                        <>
                            <h1 className="login-title">Verify Email</h1>
                            <p className="login-subtitle">
                                We sent a 6-digit code to <strong className="text-navy" style={{ color: '#1F3A5F' }}>{email}</strong>
                            </p>

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="auth-success">
                                    <ShieldCheck size={16} />
                                    <span>{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="auth-form">
                                <div className="otp-group" onPaste={handleOtpPaste}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`otp-input ${digit ? 'otp-filled' : ''}`}
                                            autoFocus={i === 0}
                                        />
                                    ))}
                                </div>

                                <button type="submit" disabled={loading || otp.join('').length < 6} className="auth-btn">
                                    {loading ? <span className="btn-spinner"></span> : (
                                        <><ShieldCheck size={18} /> Verify Code</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleResendOtp}
                                    disabled={countdown > 0 || loading}
                                >
                                    <RotateCcw size={14} />
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                </button>
                            </form>

                            <p className="auth-switch">
                                Wrong email?{' '}
                                <button className="auth-switch-link" onClick={() => { setStep(STEPS.INFO); setOtp(['', '', '', '', '', '']); }}>
                                    Go back
                                </button>
                            </p>
                        </>
                    )}

                    {/* Step: Success */}
                    {step === STEPS.DONE && (
                        <div className="auth-done">
                            <div className="done-icon">
                                <ShieldCheck size={40} />
                            </div>
                            <h2 className="done-title">Email Verified!</h2>
                            <p className="done-desc">Your account is ready. You can now sign in to the ADAS Dashboard.</p>
                            <button className="auth-btn" onClick={() => navigate('/login')}>
                                Go to Login <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel — Hero */}
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

export default Register;
