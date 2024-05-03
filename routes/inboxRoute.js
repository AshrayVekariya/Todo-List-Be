const express = require('express');
const router = express.Router();

const { getAllNotification, deletNotification, updateNotification } = require('../controllers/inboxController');

router.post('/get/all', getAllNotification);

router.put('/update/:id', updateNotification)

router.delete('/delete/:id', deletNotification);

module.exports = router;