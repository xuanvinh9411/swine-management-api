'use strict';

const express = require('express');
const router = express.Router();

const asyncHandler = require('../helpers/asyncHandler');
// Assumed existing auth middleware that verifies the access token and sets req.user.
// Adjust the path/name to match your actual project structure.
const { authentication } = require('../auth/authUtils');

const userController = require('../controllers/user.controller');

// ============ PUBLIC ROUTES (no auth required) ============
router.post('/register', asyncHandler(userController.register));
router.get('/verify-email/:token', asyncHandler(userController.verifyemail));
router.post('/forgot-password', asyncHandler(userController.forgotPassword));
router.patch('/reset-password/:token', asyncHandler(userController.resetPassword));

// ============ AUTHENTICATION CHECKPOINT ============
// Everything registered after this line requires a valid access token.
router.use(authentication);

// ============ PROTECTED ROUTES (auth required) ============
router.get('/profile', asyncHandler(userController.getOwnProfile));
router.patch('/profile', asyncHandler(userController.updateOwnProfile));
router.patch('/change-password', asyncHandler(userController.changePassword));
router.delete('/account', asyncHandler(userController.deleteOwnAccount));

module.exports = router;