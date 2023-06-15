const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 *
 * @param {String} recipient MobileNumber With country code 00 or plus
 * @param {String} OTP The body of the OTP message
 */
exports.sendOtpForRegistration = async (recipient, OTP) =>
  new Promise((res, rej) => {
    client.messages
      .create({
        body: `MDUBN3yZF46 Dear Customer, your One Time Password(OTP) For Profiler App Registration is ${OTP}`,
        from: process.env.TWILIO_MOBILE_NUMBER,
        to: recipient,
      })
      .then((message) => res(message.sid))
      .catch((err) => rej(err));
  });

