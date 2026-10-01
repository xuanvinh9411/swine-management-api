'use strict';
const express = require('express');
const router = express.Router();

const swineRouter = require('./swine.router');
const userRouter = require('./user.router');

module.exports.init = (app) =>{
    // app.use(apiKey);
    app.use('/api/swine',swineRouter);
    app.use('/api/users',userRouter);
    app.get('/', (req, res) => {
        res.send('Hello SI');
    });

    app.use(router);
};