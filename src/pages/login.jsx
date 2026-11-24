import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, KeyRound, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      const { data } = await axios.post('https://task-mailer-backend.vercel.app/api/login', {
        email,
        password,
      });

      if (data.requireOtp) {
        setStep('otp');
        setInfoMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data } = await axios.post('https://task-mailer-backend.vercel.app/api/verify-otp', {
        email,
        otp,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="avatar-circle">
        {step === 'credentials' ? (
          <User size={36} strokeWidth={1.5} />
        ) : (
          <KeyRound size={34} strokeWidth={1.5} />
        )}
      </div>

      <h1 className="auth-title">{step === 'credentials' ? 'Welcome!' : 'Verify OTP'}</h1>
      <p className="auth-subtitle">
        {step === 'credentials'
          ? 'Sign in to your Personal Assistant'
          : `Enter the 6-digit code sent to ${email}`}
      </p>

      {errorMsg && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div
          className="error-banner"
          style={{
            background: 'rgba(22, 163, 74, 0.12)',
            borderColor: 'rgba(22, 163, 74, 0.4)',
            color: '#166534',
          }}
        >
          <Mail size={16} />
          <span>{infoMsg}</span>
        </div>
      )}

      {step === 'credentials' ? (
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <div className="input-group">
            <Mail size={19} className="input-icon" />
            <input
              type="email"
              placeholder="Personal Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={19} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'SENDING OTP...' : 'LOGIN'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifyOtp}>
          <div className="input-group">
            <KeyRound size={19} className="input-icon" />
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
          </button>

          <button
            type="button"
            className="btn-outline"
            style={{ marginTop: '12px' }}
            onClick={() => {
              setStep('credentials');
              setOtp('');
              setErrorMsg('');
              setInfoMsg('');
            }}
          >
            BACK TO LOGIN
          </button>
        </form>
      )}

      <div className="auth-footer">
        Don&apos;t have an account?
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}