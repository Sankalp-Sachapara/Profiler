const express = require('express');
const cors = require('cors');

const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const mobileSwaggerUI = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const { socketHandler } = require('./src/socket/index');
const swaggerDocs = require('./src/docs/SwaggerDocs');
const UsersModel = require('./src/model/usersModel');
const { errorLogger, accessLogger } = require('./src/docs/morganConfig');
require('dotenv').config();
const routes = require('./src/routes/index');
const socket = require('./socket');

const PORT = process.env.PORT || 1000;
const { connect } = require('./src/db/conn');
require('./src/seeders/index');
const { badRequest } = require('./src/utils/messages');
const { manager } = require('./src/cron/jobHandler');

app.use(errorLogger);
app.use(accessLogger);
app.use(express.static('public'));

const corsOptions = { origin: process.env.ALLOW_ORIGIN };
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  }),
);
app.use(require('./src/utils/responseHandler'));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return badRequest({ message: 'Invalid Json Formate...!' }, res);
  }
  if (error.type === 'entity.too.large') {
    return badRequest({ message: 'Payload size too large...!' }, res);
  }
  if (error) {
    return badRequest({ message: error.message }, res);
  }
  next();
});

app.use(routes);

connect()
  .then(() => {
    console.log('Database Connection');
    manager.start('needAndQueryExpire');
  })
  .catch((err) => {
    console.log('Database Not Connected = ', err.message);
    manager.stopAll('needAndQueryExpire');
  });

const { ENV } = process.env;
if (ENV === 'DEV') {
  app.use('/api-docs', mobileSwaggerUI.serve, mobileSwaggerUI.setup(swaggerDocs));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });
}

const server = http.createServer(app);
socket.init(server);
const io = socket.getSocketServer();
socketHandler(io);
(async () => {
  await UsersModel.updateMany({}, { $set: { isOnline: false } });

  server.listen(PORT, () => {
    console.log(`Server Running At Port : ${PORT}`);
  });
})();
