"use strict";
var router = require('express').Router(),
    controller = require('cupcoffee').controller

router.get('/helloword', (request, response) => {
    controller.http(request, response).invoke('hello', 'index')
});


module.exports = router;