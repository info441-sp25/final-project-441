import express from 'express';
var router = express.Router();

import userRouter from './controllers/users.js';
import courseRouter from './controllers/courses.js';

router.use('/users', userRouter);
router.use('/course', courseRouter);

export default router;