"use strict";

module.exports = ({router, controller}) => {
    router.get('/helloword', (request, response) => {
        controller.http(request, response).invoke('hello', 'index')
    });

    return router;
};