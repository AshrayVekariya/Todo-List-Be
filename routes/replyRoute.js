const express = require('express');
const { createCommentReply, getAllReply, getReplyById, deleteReply, updateReply } = require('../controllers/replyController');
const router = express.Router();

router.post('/add', createCommentReply);

router.get('/get/all', getAllReply);

router.get('/get/:id', getReplyById);

router.put('/update/:id', updateReply);

router.delete('/delete/:id', deleteReply);

module.exports = router;