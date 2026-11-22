const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP Connection on Server Start
transporter.verify((error) => {
  if (error) {
    console.error('SMTP CONNECTION ERROR:', error);
  } else {
    console.log('SMTP Server is ready to send emails.');
  }
});

// OTP තාවකාලිකව ගබඩා කරගැනීමට (විනාඩි 5කින් කල් ඉකුත් වේ)
const otpStore = new Map();

// T-03: User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const userName = name?.trim() || email.split('@')[0];
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [userName, email, passwordHash]
    );

    const token = jwt.sign(
      { id: result.insertId, name: userName, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: result.insertId, name: userName, email },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// T-04: User Login + Send 6-Digit OTP via SMTP
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt, user });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your Login OTP Code - Personal Assistant',
      text: `Hello ${user.name},\n\nYour login verification OTP code is: ${otp}\n\nThis code will expire in 5 minutes.`,
    });

    res.json({
      requireOtp: true,
      message: `OTP sent to ${email}. Please check your inbox.`,
    });
  } catch (err) {
    console.error('LOGIN / OTP ERROR:', err);
    res.status(500).json({ message: 'Failed to send OTP. Check SMTP settings.' });
  }
});

// Verify OTP Endpoint
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ message: 'No OTP found. Please login again.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP has expired. Please login again.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(401).json({ message: 'Invalid OTP code. Please try again.' });
  }

  const { user } = record;
  otpStore.delete(email);

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful.',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// T-05: GET /api/tasks (Fetch tasks for logged-in user)
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(tasks);
  } catch (err) {
    console.error('GET TASKS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

// T-05 & T-06: POST /api/tasks (Add new task + Auto Supervisor Email via SMTP)
app.post('/api/tasks', async (req, res) => {
  try {
    const { userId, userName, title, description, supervisorEmail } = req.body;

    if (!userId || !title?.trim()) {
      return res.status(400).json({ message: 'User ID and task title are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title.trim(), description?.trim() || '']
    );

    const newTask = {
      id: result.insertId,
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || '',
      is_completed: 0,
      created_at: new Date(),
    };

    const targetEmail = supervisorEmail?.trim() || process.env.SUPERVISOR_EMAIL;
    let emailStatus = 'sent';

    if (targetEmail) {
      const today = new Date().toLocaleDateString('en-CA');
      const emailBody = `Date: ${today}\n\nDear Supervisor,\n\nA new task has been added by ${userName || 'Employee'}:\n\nTask: ${newTask.title}\nDetails: ${newTask.description || 'No additional details'}\n\nBest Regards,\n${userName || 'Personal Assistant System'}`;

      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: targetEmail,
          subject: `New Task Added: ${newTask.title}`,
          text: emailBody,
        });
      } catch (mailErr) {
        console.error('EMAIL NOTIFICATION ERROR:', mailErr);
        emailStatus = 'failed';
      }
    }

    res.status(201).json({
      message: 'Task added successfully.',
      task: newTask,
      emailStatus,
    });
  } catch (err) {
    console.error('POST TASK ERROR:', err);
    res.status(500).json({ message: 'Failed to create task.' });
  }
});

// Toggle Task Complete Status
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;
    await db.query('UPDATE tasks SET is_completed = ? WHERE id = ?', [is_completed ? 1 : 0, id]);
    res.json({ message: 'Task updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task.' });
  }
});

// Delete Task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});