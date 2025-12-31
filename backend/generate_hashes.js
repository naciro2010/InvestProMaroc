#!/usr/bin/env node
/**
 * Script to generate BCrypt hashes for test passwords
 * Run: node generate_hashes.js
 */

const bcrypt = require('bcryptjs');

const users = {
  'admin': 'admin123',
  'manager': 'manager123',
  'analyst': 'analyst123',
  'controller': 'controller123',
  'user': 'user123',
  'supervisor': 'supervisor123'
};

console.log('BCrypt Password Hashes for InvestPro Maroc\n');
console.log('Use these hashes in the migration file:\n');

Object.entries(users).forEach(([username, password]) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log(`-- ${username}: ${password}`);
  console.log(`'${hash}',\n`);
});

console.log('\nAlternatively, use these SQL UPDATE statements:\n');

Object.entries(users).forEach(([username, password]) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log(`UPDATE users SET password = '${hash}' WHERE username = '${username}';`);
});
