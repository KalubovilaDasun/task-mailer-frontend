const bcrypt = require('bcryptjs');
const db = require('./db');

async function addEmployee(name, email, plainPassword) {
  try {
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    console.log(`Employee added: ${name} (${email})`);
  } catch (err) {
    console.error('Error adding employee:', err.message);
  } finally {
    process.exit();
  }
}

addEmployee('Dasun Tharinda', 'kaluboviladasun@gmail.com', 'dasun25790');