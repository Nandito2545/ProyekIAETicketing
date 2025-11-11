// File: user-service/hashPassword.js

import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Script ini akan menanyakan password baru di terminal
rl.question('Masukkan password BARU untuk admin: ', (password) => {
  if (!password) {
    console.log('Password tidak boleh kosong.');
    rl.close();
    return;
  }

  // Generate hash (10 putaran)
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error generating hash:', err);
    } else {
      console.log('\n============================================================');
      console.log('BERHASIL. Hash baru Anda adalah:');
      console.log(hash);
      console.log('============================================================');
      console.log('\nSalin hash di atas dan jalankan query SQL di database Anda.');
    }
    rl.close();
  });
});