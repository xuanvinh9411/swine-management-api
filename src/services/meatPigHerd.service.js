'use strict';
const { createMeatPigHeard } = require('../models/repositories/meatPigHerd.repo');
class MeatPigHerdService {
    static createMeatPigHead = async ({vaccine_id,pen_id,morther,birth_date,quantity,note}) =>{
        try {
            console.log('pen_id,morther,birth_date,quantity,note',pen_id,morther,birth_date,quantity,note);
            if(!pen_id) throw new Error('Missing required field: pen_id');
            if(!morther) throw new Error('Missing required field: morther');
            if(!birth_date) throw new Error('Missing required field: birth_date');
            if(!quantity) throw new Error('Missing required field: quantity');
            const body = await createMeatPigHeard({
                                    pen_id,
                                    morther,
                                    birth_date,
                                    quantity,
                                    vaccine_id,
                                    note : note });
            return body;
        } catch (error) {
            console.error(error.message);
        }
    };    

}

module.exports = MeatPigHerdService;