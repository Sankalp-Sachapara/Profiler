const mobileSwaggerJSDocs = require('swagger-jsdoc');

const { PORT } = process.env;

const swaggerOption = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Profiler App Backend Services',
      description: 'Backend system for Profiler mobile application',
      contact: {
        name: 'Patoliya Parth',
        email: 'patoliyaparth@codeedoc.com',
        url: 'https://www.codeedoc.com',
      },
      servers: [`http://localhost:${PORT}`],
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-access-token',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/routes/mobile/v1/*.js', './src/routes/admin/v1/*.js'],
};

const swaggerDocs = mobileSwaggerJSDocs(swaggerOption);

module.exports = swaggerDocs;
