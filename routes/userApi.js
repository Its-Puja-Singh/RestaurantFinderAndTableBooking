const express = require('express');
const router = express.Router();
const {authMiddleware,isAdmin}= require('../middleware/authMiddleware');
const { registerRules, updateRules, loginRules, resetPasswordRules, validate } = require('../Helper/inputValidationHelper');
const multer = require('multer');
const {
  getAllUsers,
  registerUser,
  activateAccount,
  regenerateToken,
  login,
  getUserData,
  updateProfile,
  pictureUpdate,
  forgetPassword,
  changePassword,
  resetPassword,
  forgetTokenVerification,
} = require('../controller/userController');
const { storage } = require('../../helper/imageUploadHelper');

const upload = multer({ storage });

router.get('/', authMiddleware, isAdmin, getAllUsers);
// Get logged user data
router.get('/userData', authMiddleware, getUserData);
// register user
router.post('/register', upload.none(), registerRules(), validate, registerUser);
// verify user
router.get('/activation/:verificationEmailToken', activateAccount);
// Regenerate Token
router.post('/verify', upload.none(), regenerateToken);
// forgetPassword
router.post('/forgetPassword', upload.none(), forgetPassword);
// changePassword
router.get('/forgetPassword/:forgotPasswordToken', forgetTokenVerification);
// redirect to the post route
router.post('/forgetPassword/:forgotPasswordToken', resetPasswordRules(), changePassword);
// resetPassword
router.post('/resetPassword', authMiddleware, resetPasswordRules(), resetPassword);
// Login user
router.post('/login', upload.none(), loginRules(), validate, login);
// Update user
router.put('/update', upload.none(), authMiddleware, updateRules(), validate, updateProfile);
// profile picture update
router.put('/pictureUpdate', authMiddleware, pictureUpdate);

module.exports = userApi;
