const express = require('express');
const router = express.Router();

const { createStatus, getAllStatus, getStatusById, updateStatus, deleteStatus } = require('../controllers/statusController');

router.post('/add', createStatus);

router.post('/get/all', getAllStatus);

router.get('/get/:id', getStatusById);

router.put('/update/:id', updateStatus);

router.delete('/delete/:id', deleteStatus);

module.exports = router;