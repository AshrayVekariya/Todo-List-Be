const express = require('express');
const router = express.Router();
const multer = require('multer');

const { createSubTask, getAllSubTask, getSubTaskById, updateSubTask, deleteSubTask } = require('../controllers/subTaskController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/taskImages'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '.jpg'); }
});

const upload = multer({ storage: storage });

router.post('/add', upload.single('taskImage'), createSubTask);

router.post('/get/all', getAllSubTask);

router.get('/get/:id', getSubTaskById);

router.put('/update/:id', upload.single('taskImage'), updateSubTask);

router.delete('/delete/:id', deleteSubTask);

module.exports = router;