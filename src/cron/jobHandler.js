const CronJobManager = require('cron-job-manager');
const { connectionRequestRejectByCron } = require('../controller/mobile/v1/connectionController');
const { needAndQueryExpire } = require('../controller/mobile/v1/needController');

const manager = new CronJobManager();

manager.add(
  'needAndQueryExpire',
  '*/15 * * * *',
  () => {
    needAndQueryExpire();
    connectionRequestRejectByCron();
  },
  {
    start: false,
    timeZone: 'Asia/Kolkata',
  },
);

module.exports = { manager };

