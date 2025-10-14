const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testSMTP() {
  console.log('🔍 Testing SMTP Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('- SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('- SMTP_SECURE:', process.env.SMTP_SECURE || '❌ NOT SET');
  console.log('- SMTP_USER:', process.env.SMTP_USER ? '✅ SET' : '❌ NOT SET');
  console.log('- SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET');
  console.log('- CONTACT_EMAIL:', process.env.CONTACT_EMAIL || '❌ NOT SET');
  console.log();

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP_USER or SMTP_PASS not configured!');
    process.exit(1);
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('📧 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.CONTACT_NAME || 'Portfolio Test'}" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: 'Test Email from Portfolio Contact Form',
      html: `
        <h1>✅ SMTP Test Successful!</h1>
        <p>This is a test email from your portfolio contact form.</p>
        <p>If you're receiving this, your SMTP configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      `,
      text: 'SMTP Test Successful! Your email configuration is working.'
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Sent to:', process.env.CONTACT_EMAIL || process.env.SMTP_USER);
    console.log('\n🎉 All tests passed! Your SMTP is configured correctly.');
    
  } catch (error) {
    console.error('\n❌ SMTP Test Failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Possible issues:');
      console.error('   1. Wrong email or password');
      console.error('   2. Gmail: Need to use App Password (not regular password)');
      console.error('   3. Enable "Less secure app access" or use OAuth2');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n💡 Connection failed. Check:');
      console.error('   1. SMTP host and port are correct');
      console.error('   2. Firewall/network allows SMTP connections');
      console.error('   3. Internet connection is working');
    }
    
    process.exit(1);
  }
}

testSMTP();

