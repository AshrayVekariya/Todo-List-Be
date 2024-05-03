const express = require('express');
const router = express.Router();

const { getAllStatusHistory } = require('../controllers/statusHistoryController');

router.post('/get/all',getAllStatusHistory);

module.exports = router;