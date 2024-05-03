const express = require('express');
const router = express.Router();

const { createPriority, getAllPriority, getPriorityById, updatePriority, deletePriority } = require('../controllers/priorityController');

router.post('/add', createPriority);

router.post('/get/all', getAllPriority);

router.get('/get/:id', getPriorityById);

router.put('/update/:id', updatePriority);

router.delete('/delete/:id', deletePriority);

module.exports = router;