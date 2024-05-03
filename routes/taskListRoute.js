const express = require('express');
const router = express.Router();
const multer = require('multer');

const { createTask, getAllTaskList, getTaskListById, updateTaskList, deleteTaskList, uploadImage } = require('../controllers/taskListController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/taskImages'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '.jpg'); }
});

const upload = multer({ storage: storage });

router.post('/add', createTask);

router.post('/get/all', getAllTaskList);

router.get('/get/:id', getTaskListById);

router.put('/update/:id', updateTaskList);

router.delete('/delete/:id', deleteTaskList);

router.post('/upload/image', upload.any('image'), uploadImage)

module.exports = router;