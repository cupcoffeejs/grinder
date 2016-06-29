"use strict";

module.exports = ({view, model}) => {

    /**
     * var scaffold
     * @description Disable/enable scaffold
     * @type {boolean}
     */
    this.scaffold = false;

    /**
     *
     * @param a
     * @param b
     * @param c
     * @param d
     * @returns {*}
     */
    this.index = (a, b, c, ...d)=> {
        var message = "",
            date = new Date();

        if (date.getHours() >= 5 && date.getHours() <= 11) {
            message = "Good morning"
        }
        else if (date.getHours() >= 12 && date.getHours() <= 17) {
            message = "Good afternoon"
        }
        else {
            message = "Good night"
        }

        return view.render({message, a, b, c, d})
    }


    this.get_database = ()=> {
        model.hello.findOne().then((hello) => {
            if (hello) {
                hello.count = hello.get().count + 1;

                hello.save().then(function () {
                    view.render(hello.get()).send()
                })
            }
        })
    }

    /**
     * @param {*}
     * @param name
     * @returns {*}
     */
    this.post_database = ({name}) => {
        model.hello.findOne().then((hello) => {
            if (hello) {
                hello.count = hello.get().count + 1;
                hello.name = name;

                hello.save().then(function () {
                    view.render(hello.get()).send()
                })
            }
        })

        return true;
    }

    /**
     * @param error
     * @param message
     * @returns {*}
     */
    this.errors = (error, message)=> {
        console.error('HELLO, ERROR:' + error);
        console.error(message);
        return view.render()
    }

    /**
     *
     * @param message
     * @returns {*}
     */
    this.error404 = (message)=> {
        console.error('HELLO, ERROR');
        console.error(message);
        return view.render()
    }

    return this;
};