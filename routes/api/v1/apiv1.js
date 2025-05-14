import express from 'express';
var router = express.Router();

import userRouter from './controllers/users.js';

router.use('/user', userRouter);