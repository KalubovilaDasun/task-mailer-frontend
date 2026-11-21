import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    const extractedName = email.split('@')[0];
    localStorage.setItem('userName', extractedName);
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
        <span>Go back</span>
      </button>

      <h1 className="auth-title" style={{ marginTop: '24px' }}>
        Sign up
      </h1>
      <p className="auth-subtitle">Create your account to get started</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <Mail size={19} className="input-icon" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <Lock size={19} className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
          </button>
        </div>

        <div className="input-group">
          <Lock size={19} className="input-icon" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <Eye size={19} /> : <EyeOff size={19} />}
          </button>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '8px', marginBottom: '20px' }}
        >
          SIGN UP
        </button>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
      </form>

      <div className="divider">
        <span>Access quickly</span>
      </div>

      <div className="social-buttons">
        <button type="button" className="social-btn">
          <span className="social-icon-circle">G</span>
          <span>Google</span>
        </button>
        <button type="button" className="social-btn">
          <span className="social-icon-circle">f</span>
          <span>Facebook</span>
        </button>
      </div>

      <div className="auth-footer">
        Already have an account?
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}