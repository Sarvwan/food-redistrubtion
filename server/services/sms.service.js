const twilio = require('twilio');

const sendSMS = async (to, body) => {
  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to
    });
    console.log(`[${new Date().toISOString()}] SMS sent to ${to}: ${message.sid}`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] SMS error:`, error.message);
    return false;
  }
};

module.exports = { sendSMS };
