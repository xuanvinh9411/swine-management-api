'use strict'

const { OKE , CREATED ,SuccessResponse } = require('../core/success.response')

class SwineController {

    createSwine = async ( req, res, next) =>{
            new CREATED({
                message : 'Regiserted OK!',
                metadata : await MeatPigHerdService.createMeatPigHead(req.body)
            }).send(res);

    }
}

module.exports = new SwineController()