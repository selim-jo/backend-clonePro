const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const User = require('../schemas/user');
const CompanyUser = require('../schemas/companyuser');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.SECRET_KEY;
const authMiddleware = require('../middlewares/auth-middleware');
const Bcrypt = require('bcrypt');

// console.log(process.env.SECRET_KEY)

//회원가입 양식
const postUsersSchema = Joi.object({
  userid: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{2,8}$')).required().email(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{4,12}$')).required(),
  confirmpassword: Joi.string().required(),
  username: Joi.string().required(),
  profileimage: Joi.string(),
  position: Joi.number().required(),
});

// 회원가입 양식2
const postUsersSchema2 = Joi.object({
  userid: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{2,8}$')).required().email(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{4,12}$')).required(),
  confirmpassword: Joi.string().required(),
  profileimage: Joi.string(),
  address: Joi.string().required(),
  companyname: Joi.string().required(),
  intro: Joi.string().required(),
  image: Joi.string().required(),
});

//회원가입 - 개인
router.post('/user/signup', async (req, res) => {
  try {
    const {
      userid,
      password,
      confirmpassword,
      username,
      profileimage,
      position,
    } = await postUsersSchema.validateAsync(req.body);
    console.log({ userid, password, confirmpassword, profileimage });

    if (password !== confirmpassword) {
      return res.status(400).send({
        errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
      });
    }

    const exitstUsers = await User.find({ userid });
    if (exitstUsers.length) {
      return res.status(400).send({
        errorMessage: '중복된 아이디가 존재합니다.',
      });
    }

    const exitstUsers3 = await CompanyUser.find({ userid });
    if (exitstUsers3.length) {
      return res.status(400).send({
        errorMessage: '중복된 아이디가 존재합니다.',
      });
    }

    const salt = await Bcrypt.genSalt(Number(process.env.SaltKEY));
    const hashPassword = await Bcrypt.hash(password, salt);

    const user = new User({ userid, password: hashPassword, profileimage });
    await user.save();
    res.status(201).send({
      success: true,
      iscompany: false,
      msg: '회원가입을 성공하였습니다',
    });
  } catch (error) {
    return res.status(400).send(
      console.error(error)
      // errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
    );
  }
});

//회원가입 - 기업
router.post('/user/company/signup', async (req, res) => {
  try {
    const {
      userid,
      password,
      confirmpassword,
      companyname,
      profileimage,
      intro,
      image,
      address,
    } = await postUsersSchema2.validateAsync(req.body);

    if (password !== confirmpassword) {
      return res.status(400).send({
        errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
      });
    }

    const exitstUsers = await User.find({ userid });
    if (exitstUsers.length) {
      return res.status(400).send({
        errorMessage: '중복된 아이디가 존재합니다.',
      });
    }

    const exitstUsers2 = await CompanyUser.find({ userid });
    if (exitstUsers2.length) {
      return res.status(400).send({
        errorMessage: '중복된 아이디가 존재합니다.',
      });
    }

    const salt = await Bcrypt.genSalt(Number(process.env.SaltKEY));
    const hashPassword = await Bcrypt.hash(password, salt);

    const cp_user = new CompanyUser({
      userid,
      password: hashPassword,
      profileimage,
      companyname,
      intro,
      image,
      address,
    });
    await cp_user.save();
    res.status(201).send({
      success: true,
      iscompany: true,
      msg: '회원가입을 성공하였습니다',
    });
  } catch (error) {
    return res.status(400).send(
      console.error(error)
      // errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
    );
  }
});

//로그인
router.post('/user/login', async (req, res) => {
  const { userid, password } = req.body;
  const user = await User.findOne({ userid });
  const cp_user = await CompanyUser.findOne({ userid });

  console.log(user, 'cp_user:', cp_user);

  let iscompany = '';

  if (user) {
    iscompany = false;
  }

  if (cp_user) {
    iscompany = true;
  }

  if (!user && !cp_user) {
    return res.status(400).send({
      errorMessage: '아이디 또는 비밀번호를 확인해주세요.',
    });
  }

  let validPassword = '';

  if (user) {
    validPassword = await Bcrypt.compare(password, user.password);
  }

  if (cp_user) {
    validPassword = await Bcrypt.compare(password, cp_user.password);
  }

  console.log(validPassword);

  if (!validPassword) {
    return res.send('비밀번호가 틀렸습니다..');
  }

  let token = '';

  if (user) {
    token = jwt.sign({ userid: user.userid }, process.env.SECRET_KEY);
  }

  if (cp_user) {
    token = jwt.sign({ userid: cp_user.userid }, process.env.SECRET_KEY);
  }

  res.send({
    token: token,
    success: true,
    iscompany: iscompany,
    msg: '로그인에 성공 하였습니다.',
  });
});

// 유저 조회 (편의용)
router.get('/userlist', async (req, res) => {
  const user_list = await User.find();

  res.send({
    success: '정보 조회가 성공하였습니다.',

    user_list,
  });
});

module.exports = router;
