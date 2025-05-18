import express from 'express';
var router = express.Router();

import userRouter from './controllers/users.js';
import courseRouter from './controllers/courses.js';

router.use('/user', userRouter);
router.use('/course', courseRouter);