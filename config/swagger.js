const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
        title: '接口文档',
        version: '1.0.0',
        description: '这是一个使用 JWT 鉴权的 Koa 接口文档~'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
         ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        ApiKeyAuth: []
      }
    ]
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(options);

module.exports = swaggerDocs