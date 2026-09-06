'use strict'
const express = require('express')
const router = express.Router()
const swineController = require('../controller/swine.controller')
const asyncHandler = require('../helpers/asyncHandler')
const { authentication,authenticationV2 } = require('../auth/authUtils')

// authentication 
router.post('/create',asyncHandler(swineController.createSwine))

module.exports = router;
