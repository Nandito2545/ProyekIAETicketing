const nodemailer = require('nodemailer');

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Gagal membuat akun tes: ' + err.message);
    return;
  }

  console.log('====================================================');
  console.log('Kredensial Ethereal Anda (SIMPAN INI!):');
  console.log('====================================================');
  console.log('User: ' + account.user);
  console.log('Pass: ' + account.pass);
  console.log('Host: ' + account.smtp.host);
  console.log('Port: ' + account.smtp.port);
  console.log('====================================================');
  console.log('Salin nilai-nilai ini ke file notification-service/.env Anda');
});