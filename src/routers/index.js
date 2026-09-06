'use strict'
const express = require('express')
const router = express.Router()

const swineRouter = require('./swine.router')

module.exports.init = (app) =>{
    // app.use(apiKey);
    app.use('/api/swine',swineRouter);
    app.get('/', (req, res) => {
        res.send('Hello SI');
    });

    app.use(router)
}