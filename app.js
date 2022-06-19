const dotenv = require('dotenv'); // 설정파일
dotenv.config();
const express = require('express');
const app = express();
const connect = require('./schemas/');
const pageRouter = require('./routes/page');
// const {sequelize} = require('./models');
const nodemailer = require('nodemailer');
const cors = require('cors');
const morgan = require('morgan');
const port = 3000;
const router = express.Router();
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
const postsRouter = require('./routes/posts');
const companyRouter = require('./routes/company');
const socketRouter = require('./socket');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output');


connect();

app.use(morgan('dev'));
app.use(cors());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use('/api', [usersRouter, commentsRouter, postsRouter, companyRouter, socketRouter]);

app.get('/', (req, res) => {
  res.send('헬로 월드');
});

app.get('/api', (req, res) => {
  res.send('api창');
});

app.listen(port, () => {
  console.log(port, '포트가 켜졌습니다.');
});





