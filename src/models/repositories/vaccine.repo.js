'use strict';

const MeatPigHerd = require('../meatPigHerd.model');
const { getselectData, unGetselectData, convertToObjectIdMongdb } = require('../../utils/index');

/*
tạo đàn  
update đàn
delete đàn
create vaccine 
update vaccine
delete vaccine
*/

const createMeatPigHeard =  ({vaccine_id, pen_id, birth_date, quantity, weaning_date, morther, note }) => {
    try {
        
        return  MeatPigHerd.create({
            pen_id: pen_id,
            birth_date,
            weaning_date,
            quantity,
            morther,
            note,
            vaccine_id,
        });
    } catch (error) {
        console.error(error);
    }

};

module.exports = {
    createMeatPigHeard,
};