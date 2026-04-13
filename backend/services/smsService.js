const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${to}`, // India country code
    });

    console.log('SMS sent:', response.sid);
    return true;

  } catch (error) {
    console.error('Twilio SMS Error:', error.message);
    return false;
  }
};

module.exports = sendSMS;
