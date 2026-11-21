import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
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

      <div className="avatar-circle">
        <User size={36} strokeWidth={1.5} />
      </div>

      <h1 className="auth-title">Welcome!</h1>
      <p className="auth-subtitle">Please login to your account</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <Mail size={19} className="input-icon" />
          <input
            type="email"
            placeholder="Email ID"
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

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <button type="button" className="forgot-link">
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="btn-primary">
          LOGIN
        </button>
      </form>

      <div className="divider">
        <span>or continue with</span>
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
        Don&apos;t have an account?
        <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}