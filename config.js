var opt = require('optimist').argv,
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    util = require('util'),
    execSync = require('child_process').execSync,
    validator = require('validator'),
    merge = require('utils-merge'),
    inquirer = require('inquirer');

module.exports = () => {

    this.create = (data, callback) => {
        console.log('Creating cupcoffee.json...');
        fs.writeFile('./cupcoffee.json', JSON.stringify(data, null, 2), (err) => {
            if (err) throw err;
            else {
                console.log('cupcoffee.json ......................... OK!');

                if (callback) {
                    callback(data)
                }
            }
        })
    }

    this.get = () => {
        try {
            return JSON.parse(fs.readFileSync('./cupcoffee.json').toString());
        }
        catch (e) {
            return false;
        }
    }

    this.cli = (pack) => {
        var cache = this.get();
        var cacheApp = cache.app;
        var cacheEnv = {};
        if (cacheApp.env) {
            cacheEnv = cache[cacheApp.env] ? cache[cacheApp.env] : {};
        }

        inquirer.prompt([
            {
                type: 'input',
                name: 'hostname',
                message: 'What is the hostname of your application?',
                default: () => {
                    return cacheEnv.hostname ? cacheEnv.hostname : 'localhost';
                }
            },
            {
                type: 'input',
                name: 'port',
                message: 'On which port you want run the application?',
                default: () => {
                    return cacheEnv.port ? cacheEnv.port : 80;
                },
                validate: function (value) {
                    if (validator.isNumeric(value.toString())) {
                        return true;
                    }

                    return 'Use only numbers';
                }
            },
            {
                type: 'list',
                name: 'env',
                message: 'In what environment you are in that moment?',
                choices: [
                    {
                        name: 'Development',
                        value: 'development'
                    },
                    {
                        name: 'Production',
                        value: 'production'
                    }
                ],
                default: () => {
                    return cacheApp.env ? cacheApp.env : 'development';
                }
            },
            {
                type: 'list',
                name: 'type',
                message: 'What type of database you want to use',
                choices: [
                    {
                        name: 'MongoDB',
                        value: 'mongodb'
                    },
                    {
                        name: 'MySQL',
                        value: 'mysql'
                    },
                    {
                        name: 'PostgreSQL',
                        value: 'postgres'
                    },
                    {
                        name: 'SQLite',
                        value: 'sqlite'
                    },
                    {
                        name: 'MSSQL',
                        value: 'mssql'
                    },
                    {
                        name: 'Do not use any database!',
                        value: false
                    }
                ],
                default: () => {
                    if (cacheEnv.database && cacheEnv.database.type) {
                        return cacheEnv.database.type
                    }

                    return false;
                }
            }
        ]).then((answers) => {
            cache.app = {};
            cache.app.env = answers.env;
            cache.app[cache.app.env] = {};
            cache.app[cache.app.env].port = answers.port;
            if (answers.database) {
                cache.app[cache.app.env].database = {};
                cache.app[cache.app.env].database.type = answers.type;

                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'host',
                        message: 'What is the database host?',
                        default: () => {
                            if (cacheEnv.database && cacheEnv.database.host) {
                                return cacheEnv.database.host
                            }

                            return 'localhost';
                        }
                    },
                    {
                        type: 'input',
                        name: 'name',
                        message: 'What is the database name you want to use?',
                        validate: function (value) {
                            return value ? true : 'You must define a name of a database';
                        },
                        default: () => {
                            if (cacheEnv.database && cacheEnv.database.name && cacheEnv.database.config.name) {
                                return cacheEnv.database.config.name
                            }

                        }

                    },
                    {
                        type: 'input',
                        name: 'username',
                        message: 'What username database?',
                        default: () => {
                            if (cacheEnv.database && cacheEnv.database.username && cacheEnv.database.config.username) {
                                return cacheEnv.database.config.username
                            }

                            return 'root';
                        }
                    },
                    {
                        type: 'password',
                        name: 'password',
                        message: 'What is the database password? (Press enter to not change)'
                    }
                ]).then((answers) => {
                    if (!cache.app) {
                        cache.app = {};
                    }
                    cache.app[cache.app.env].database.host = answers.host;
                    cache.app[cache.app.env].database.name = answers.name;
                    cache.app[cache.app.env].database.username = answers.username;

                    if (answers.password) {
                        cache.app[cache.app.env].database.password = answers.password;
                    }

                    this.create(cache);
                })
            }
            else {
                this.create(cache);
            }
        });
    }

    return this;

}