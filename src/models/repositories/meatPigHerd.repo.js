'use strict'

const { MeatPigHerd } = require('../MeatPigHerd.model')
const { Types } = require('mongoose')
const { getselectData ,unGetselectData,convertToObjectIdMongdb } = require('../../utils/index')

/*
tạo đàn  
update đàn
delete đàn
create vaccine 
update vaccine
delete vaccine
*/

const createMeatPigHeard = async({pen_id,birth_date,quantity,note}) =>{
    return await MeatPigHerd.create({
        pen_id : convertToObjectIdMongdb(pen_id),
        birth_date,
        weaning_date,
        quantity,
        morther,
        note
    })
}

module.exports = {
  createMeatPigHeard
}