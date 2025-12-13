import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import HomePage from './HomePage';
import './CourseraAuth.css';

const CourseraAuth = () => {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    // State management
    const [step, setStep] = useState('email'); // email, password, verification, signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Email Entry
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authAPI.checkEmail(email);

            if (result.exists) {
                // Existing user - go to password screen
                setStep('password');
            } else {
                // New user - send verification code
                await authAPI.sendVerificationCode(email);
                setStep('verification');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process email');
        } finally {
            setLoading(false);
        }
    };

    // Step 2a: Password Entry (Existing User)
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Pass email as username since backend accepts both
            const result = await authAPI.login(email, password);

            // Store tokens
            localStorage.setItem('access_token', result.tokens.access);
            localStorage.setItem('refresh_token', result.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Update auth context
            authLogin(result.user, result.tokens.access);

            // Redirect based on role
            const role = result.user.role;
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'staff') navigate('/staff/dashboard');
            else if (role === 'instructor') navigate('/instructor/dashboard');
            else navigate('/student/dashboard');

        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Invalid email or password';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Step 2b: Verification Code Entry (New User)
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authAPI.verifyCode(email, verificationCode);

            if (result.valid) {
                setVerificationToken(result.token);
                setStep('signup');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    // Resend verification code
    const handleResendCode = async () => {
        setError('');
        setLoading(true);

        try {
            await authAPI.sendVerificationCode(email);
            setError(''); // Clear any previous errors
            alert('Verification code sent!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Complete Signup
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authAPI.completeSignup({
                email,
                full_name: fullName,
                password,
                verification_token: verificationToken
            });

            // Store tokens
            localStorage.setItem('access_token', result.tokens.access);
            localStorage.setItem('refresh_token', result.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Update auth context
            authLogin(result.user, result.tokens.access);

            // Redirect to student dashboard
            navigate('/student/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (!password) return '';
        if (password.length < 8) return 'weak';
        if (password.length < 12) return 'medium';
        return 'strong';
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Content - Home Page (Interactive: false) */}
            <div className="absolute inset-0 z-0 h-full w-full pointer-events-none select-none">
                <HomePage />
            </div>

            {/* Backdrop Overlay */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

            <div className="coursera-auth-overlay relative z-50">
                <div className="coursera-auth-modal">
                    <button className="close-button" onClick={() => navigate('/')}>×</button>

                    {/* Step 1: Email Entry */}
                    {step === 'email' && (
                        <div className="auth-content">
                            <h1>Log in or create account</h1>
                            <p className="subtitle">Learn on your own time from top universities and businesses.</p>

                            <form onSubmit={handleEmailSubmit}>
                                <div className="form-group">
                                    <label>Email <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@email.com"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Processing...' : 'Continue'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2a: Password Entry (Existing User) */}
                    {step === 'password' && (
                        <div className="auth-content">
                            <h1>Log in</h1>
                            <p className="subtitle">Welcome back! Please enter your password.</p>

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="form-group">
                                    <label>Email <span className="required">*</span></label>
                                    <div className="email-display">
                                        <span>{email}</span>
                                        <button type="button" onClick={() => setStep('email')} className="edit-btn">
                                            ✎
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password <span className="required">*</span></label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Log In'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2b: Verification Code (New User) */}
                    {step === 'verification' && (
                        <div className="auth-content">
                            <h1>Verify your email</h1>
                            <p className="subtitle">We sent a verification code to <strong>{email}</strong></p>

                            <form onSubmit={handleVerificationSubmit}>
                                <div className="form-group">
                                    <label>Verification Code <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        required
                                        autoFocus
                                        className="code-input"
                                    />
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="btn-primary" disabled={loading || verificationCode.length !== 6}>
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>

                                <div className="resend-section">
                                    <button type="button" onClick={handleResendCode} className="link-button" disabled={loading}>
                                        Resend code
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Complete Signup */}
                    {step === 'signup' && (
                        <div className="auth-content">
                            <h1>Sign up</h1>
                            <p className="subtitle">Learn on your own time from top universities and businesses.</p>

                            <form onSubmit={handleSignupSubmit}>
                                <div className="form-group">
                                    <label>Email <span className="required">*</span></label>
                                    <div className="email-display">
                                        <span>{email}</span>
                                        <button type="button" onClick={() => setStep('email')} className="edit-btn">
                                            ✎
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Full Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password <span className="required">*</span></label>
                                    <p className="field-hint">Between 8 and 72 characters</p>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create password"
                                            minLength="8"
                                            maxLength="72"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {password && (
                                        <div className={`password-strength ${getPasswordStrength()}`}>
                                            Password strength: {getPasswordStrength()}
                                        </div>
                                    )}
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Join for Free'}
                                </button>

                                <div className="login-link">
                                    Already on Coursera? <button type="button" onClick={() => setStep('email')} className="link-button">Log in</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseraAuth;
