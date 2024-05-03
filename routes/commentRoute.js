const express = require('express');
const router = express.Router();

const { createComment, getAllComment, getCommentById, updateComment, deleteComment } = require('../controllers/commentController');

router.post('/add', createComment);

router.get('/get/all', getAllComment);

router.get('/get/:id', getCommentById);

router.put('/update/:id', updateComment);

router.delete('/delete/:id', deleteComment);

module.exports = router;