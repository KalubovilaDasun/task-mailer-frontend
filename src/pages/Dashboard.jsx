import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, CheckCircle, Circle, LogOut, AlertCircle, Mail } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`https://task-mailer-backend.vercel.app/api/tasks?userId=${userId}`);
      setTasks(data);
    } catch (err) {
      setErrorMsg('Failed to load tasks.');
    }
  };

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);

    try {
      const { data } = await axios.post('https://task-mailer-backend.vercel.app/api/tasks', {
        userId,
        userName,
        title,
        description,
        supervisorEmail,
      });

      setTasks([data.task, ...tasks]);
      setTitle('');
      setDescription('');

      if (data.emailStatus === 'sent') {
        setStatusMsg('Task added and supervisor notified via email!');
      } else {
        setStatusMsg('Task saved, but supervisor email failed. Check .env credentials.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedStatus = !task.is_completed;
      await axios.patch(`https://task-mailer-backend.vercel.app/api/tasks/${task.id}`, {
        is_completed: updatedStatus,
      });
      setTasks(
        tasks.map((t) => (t.id === task.id ? { ...t, is_completed: updatedStatus } : t))
      );
    } catch (err) {
      setErrorMsg('Failed to update task.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`https://task-mailer-backend.vercel.app/api/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      setErrorMsg('Failed to delete task.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div>
          <h2 className="dash-brand">Personal Assistant</h2>
          <p className="dash-welcome">Welcome, {userName}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <div className="email-form-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '14px' }}>Add New To-Do Task</h3>

        {errorMsg && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div
            className="error-banner"
            style={{
              background: 'rgba(22, 163, 74, 0.12)',
              borderColor: 'rgba(22, 163, 74, 0.4)',
              color: '#166534',
            }}
          >
            <Mail size={16} />
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddTask}>
          <div className="form-field">
            <label>Task Title *</label>
            <input
              type="text"
              placeholder="e.g., Complete weekly API testing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Task Details (Optional)</label>
            <input
              type="text"
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Supervisor Email (Optional - uses default if empty)</label>
            <input
              type="email"
              placeholder="supervisor@company.com"
              value={supervisorEmail}
              onChange={(e) => setSupervisorEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary send-btn" disabled={loading}>
            <Plus size={18} />
            <span>{loading ? 'SAVING & NOTIFYING...' : 'ADD TASK'}</span>
          </button>
        </form>
      </div>

      <div className="email-form-card">
        <h3 style={{ marginBottom: '14px' }}>My Tasks ({tasks.length})</h3>

        {tasks.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#365273', textAlign: 'center', padding: '16px 0' }}>
            No tasks yet. Add your first task above!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.65)',
                  borderRadius: '12px',
                  border: '1px solid rgba(47, 97, 146, 0.2)',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                  onClick={() => handleToggleComplete(task)}
                >
                  {task.is_completed ? (
                    <CheckCircle size={20} color="#16a34a" />
                  ) : (
                    <Circle size={20} color="#2f6192" />
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14.5px',
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                        color: task.is_completed ? '#64748b' : '#1f334d',
                      }}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                  title="Delete Task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}