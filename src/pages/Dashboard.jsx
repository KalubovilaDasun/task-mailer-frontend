import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, CheckCircle, AlertCircle, LogOut, X } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const today = new Date();
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  const formattedDate = today.toLocaleDateString('en-CA');

  const [showInitialPopup, setShowInitialPopup] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState(`${currentMonth} task log`);
  const [taskContent, setTaskContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenEmailForm = () => {
    setShowInitialPopup(false);
    setShowEmailForm(true);
    setErrorMsg('');
  };

  const handleSendEmail = (e) => {
    e.preventDefault();

    if (!recipientEmail.trim() || !subject.trim() || !taskContent.trim()) {
      setErrorMsg('Please fill out all fields in the email form before sending.');
      return;
    }

    const fullEmailBody = `${formattedDate}\n\nDear Sir,\n\n${taskContent.trim()}\n\nBest Regards,\n${userName}`;

    console.log({
      to: recipientEmail,
      subject,
      body: fullEmailBody,
    });

    setErrorMsg('');
    setShowEmailForm(false);
    setShowFeedbackPopup(true);
    setTaskContent('');
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div>
          <h2 className="dash-brand">TaskMailer</h2>
          <p className="dash-welcome">Welcome, {userName}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <main className="dashboard-main">
        {!showEmailForm && (
          <div className="dash-card">
            <div className="avatar-circle">
              <Mail size={34} strokeWidth={1.5} />
            </div>
            <h1 className="dash-title">Daily Task Log</h1>
            <p className="dash-subtitle">
              Today: <strong>{formattedDate}</strong>
            </p>
            <button className="btn-primary" onClick={handleOpenEmailForm}>
              ENTER TODAY TASK
            </button>
          </div>
        )}

        {showEmailForm && (
          <form className="email-form-card" onSubmit={handleSendEmail}>
            <div className="email-form-header">
              <h3>New Task Log Email</h3>
              <button
                type="button"
                className="close-icon-btn"
                onClick={() => setShowEmailForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-field">
              <label>To (Sir / Manager Email)</label>
              <input
                type="email"
                placeholder="manager@company.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="email-body-box">
              <div className="auto-text-block">
                <p>{formattedDate}</p>
                <p style={{ marginTop: '8px' }}>Dear Sir,</p>
              </div>

              <textarea
                className="task-textarea"
                rows="6"
                placeholder="Type your tasks for today here..."
                value={taskContent}
                onChange={(e) => setTaskContent(e.target.value)}
              />

              <div className="auto-text-block">
                <p>Best Regards,</p>
                <p><strong>{userName}</strong></p>
              </div>
            </div>

            <button type="submit" className="btn-primary send-btn">
              <Send size={16} />
              <span>SEND EMAIL</span>
            </button>
          </form>
        )}
      </main>

      {showInitialPopup && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">
              <Mail size={32} />
            </div>
            <h3>Enter today task</h3>
            <p>Ready to submit your daily task log for {formattedDate}?</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleOpenEmailForm}>
                Enter Today Task
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowInitialPopup(false)}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackPopup && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon success-icon">
              <CheckCircle size={36} />
            </div>
            <h3>Email Sent Successfully!</h3>
            <p>Your task log for today has been sent.</p>
            <button
              className="btn-primary"
              onClick={() => setShowFeedbackPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}