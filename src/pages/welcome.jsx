import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="welcome-content">
        <div className="avatar-circle">
          <User size={36} strokeWidth={1.5} />
        </div>
        <h1 className="auth-title">Welcome</h1>
        <p className="auth-subtitle">
          Log in to your account or create a<br />new one to get started.
        </p>
        <div className="welcome-buttons">
          <button
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            LOGIN
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/signup')}
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
}