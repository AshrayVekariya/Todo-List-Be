const express = require('express');
const router = express.Router();

const userRouter = require('./userRoute');
const authenticationRouter = require('./authentication');
const priorityRouter = require('./priorityRoute');
const statusRouter = require('./statusRoute');
const taskList = require('./taskListRoute');
const subTaskRouter = require('./subTaskRoute');
const commentRouter = require('./commentRoute');
const replyRouter = require('./replyRoute');
const statusHistoryRouter = require('./statusHistoryRoute');
const inboxRouter = require('./inboxRoute');

router.use('/user', userRouter);
router.use('/authentication', authenticationRouter);
router.use('/priority', priorityRouter);
router.use('/status', statusRouter);
router.use('/taskList', taskList);
router.use('/subTask', subTaskRouter);
router.use('/comment', commentRouter);
router.use('/reply', replyRouter);
router.use('/statusHistory', statusHistoryRouter);
router.use('/inbox', inboxRouter);

module.exports = router;

