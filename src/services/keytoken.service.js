'use strict';

const apikeyModel = require('../models/apikey.model');

const findByUserId = (userID)=>{
    return  apikeyModel.findOne({user: userID});
};

exports = {
    findByUserId,
};   