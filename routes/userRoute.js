const express = require('express');
const router = express.Router();
const multer = require('multer');

const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/profileImages'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '.jpg'); }
});

const upload = multer({ storage: storage });

router.post('/create', upload.single('profilePicture'), createUser);

router.post('/get/all', getAllUsers);

router.get('/get/:id', getUserById);

router.put('/update/:id', upload.single('profilePicture'), updateUser);

router.delete('/delete/:id', deleteUser);

module.exports = router;


// verifyToken(['Admin'])