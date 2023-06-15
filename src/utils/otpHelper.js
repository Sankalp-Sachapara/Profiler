const api = require('./otpCore');

const APP_SSID = process.env.UNIFONIC_APP_SSID;
const SENDER_ID = process.env.UNIFONIC_SENDER;

/**
 *
 * @param {String} recipient without country code 00 or plus
 * @param {String} body The body of the message
 */
exports.sendOtp = (recipient, body) => {
  const req = `/SMS/messages?AppSid=${APP_SSID}&Body=${body}&SenderID=${SENDER_ID}&Recipient=${recipient.replace(
    '+',
    '',
  )}&responseType=JSON&MessageID=${new Date().getMilliseconds()}&baseEncode=true&statusCallback=sent&async=false`;

  api
    .post(req)
    .then((res) => {
      console.log('🚀 ~ file: otpHelper.js ~ line 32 ~ .then ~ res', res);
    })
    .catch((err) => {
      console.log('🚀 ~ file: otpHelper.js ~ line 35 ~ sendOtp ~ err', err);
    });
};
