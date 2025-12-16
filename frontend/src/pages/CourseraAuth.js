import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import HomePage from './HomePage';
import './CourseraAuth.css';

const CourseraAuth = () => {
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

    // State management
    const [step, setStep] = useState('email'); // email, password, verification, signup, forgot-password, reset-verification, reset-password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

            // Store tokens directly (don't call authLogin as it would make another API call)
            localStorage.setItem('access_token', result.tokens.access);
            localStorage.setItem('refresh_token', result.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Update auth context directly using setAuthData (doesn't make API calls)
            setAuthData(result.user, result.tokens);

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

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const result = await authAPI.completeSignup({
                email,
                full_name: fullName,
                password,
                verification_token: verificationToken
            });

            // Store tokens directly (don't call authLogin as it would make another API call)
            localStorage.setItem('access_token', result.tokens.access);
            localStorage.setItem('refresh_token', result.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Update auth context directly using setAuthData (doesn't make API calls)
            setAuthData(result.user, result.tokens);

            // Redirect to student dashboard
            navigate('/student/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password Handlers
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.sendPasswordResetCode(email);
            setStep('reset-verification');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetVerificationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authAPI.verifyResetCode(email, resetCode);
            if (result.valid) {
                setResetToken(result.reset_token);
                setStep('reset-password');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleResendResetCode = async () => {
        setError('');
        setLoading(true);

        try {
            await authAPI.sendPasswordResetCode(email);
            alert('Verification code sent!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword(email, password, resetToken);
            alert('Password reset successfully! You can now login with your new password.');
            // Reset to login page
            setStep('email');
            setPassword('');
            setConfirmPassword('');
            setResetCode('');
            setResetToken('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
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

                                <div className="forgot-password-link" style={{ marginTop: '16px', textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep('forgot-password')}
                                        className="link-button"
                                        style={{ color: '#0056D2', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
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

                                <div className="form-group">
                                    <label>Confirm Password <span className="required">*</span></label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm password"
                                            minLength="8"
                                            maxLength="72"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <div className="password-strength weak">
                                            Passwords do not match
                                        </div>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <div className="password-strength strong">
                                            ✓ Passwords match
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

                    {/* Forgot Password - Enter Email */}
                    {step === 'forgot-password' && (
                        <div className="auth-content">
                            <h1>Reset your password</h1>
                            <p className="subtitle">Enter your email to receive a verification code</p>

                            <form onSubmit={handleForgotPasswordSubmit}>
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
                                    {loading ? 'Sending...' : 'Send Code'}
                                </button>

                                <div className="login-link" style={{ marginTop: '16px', textAlign: 'center' }}>
                                    <button type="button" onClick={() => setStep('email')} className="link-button">
                                        ← Back to login
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Reset Verification - Enter Code */}
                    {step === 'reset-verification' && (
                        <div className="auth-content">
                            <h1>Enter verification code</h1>
                            <p className="subtitle">We sent a code to <strong>{email}</strong></p>

                            <form onSubmit={handleResetVerificationSubmit}>
                                <div className="form-group">
                                    <label>Verification Code <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        required
                                        autoFocus
                                        className="code-input"
                                    />
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="btn-primary" disabled={loading || resetCode.length !== 6}>
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>

                                <div className="resend-section">
                                    <button type="button" onClick={handleResendResetCode} className="link-button" disabled={loading}>
                                        Resend code
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Reset Password - Enter New Password */}
                    {step === 'reset-password' && (
                        <div className="auth-content">
                            <h1>Create new password</h1>
                            <p className="subtitle">Enter your new password</p>

                            <form onSubmit={handleResetPasswordSubmit}>
                                <div className="form-group">
                                    <label>New Password <span className="required">*</span></label>
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
                                    {password && (
                                        <div className={`password-strength ${getPasswordStrength()}`}>
                                            Password strength: {getPasswordStrength()}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Confirm Password <span className="required">*</span></label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm password"
                                            minLength="8"
                                            maxLength="72"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <div className="password-strength weak">
                                            Passwords do not match
                                        </div>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <div className="password-strength strong">
                                            ✓ Passwords match
                                        </div>
                                    )}
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="btn-primary" disabled={loading || password !== confirmPassword}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseraAuth;
