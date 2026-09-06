'use strict'

const apikeyModel = require("../models/apikey.model")

const findByUserId = async(userID)=>{
    return await apikeyModel.findOne({user: userID});
}

exports = {
    findByUserId
}   