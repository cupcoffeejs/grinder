var opt = require('optimist').argv,
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    util = require('util'),
    execSync = require('child_process').execSync,
    validator = require('validator'),
    merge = require('utils-merge'),
    inquirer = require('inquirer'),
    config = require('./config.js')(),
    ncp = require('ncp').ncp;


module.exports = () => {

    this.flags = (pack) => {
        var cache = {}

        if (!opt['_'][1] && !opt.name && !pack.name) {
            console.log('ERROR: You need to define a name for your application')
            return false;
        }

        cache.app = {};
        cache.app.env = (opt.env) ? opt.env : 'production';
        cache.app[cache.app.env] = {};
        cache.app[cache.app.env].port = (opt.port) ? opt.port : '80';

        if (opt.database) {
            cache.app[cache.app.env].database = opt.database;
        }

        if (opt.db) {
            cache.app[cache.app.env].database = opt.db;
        }

        return true;
    }

    this.cli = (pack, callback) => {
        var cache = {};

        inquirer.prompt([
            {
                type: 'input',
                name: 'hostname',
                message: 'What is the hostname of your application?',
                default: () => {
                    return 'localhost';
                }
            },
            {
                type: 'input',
                name: 'port',
                message: 'On which port you want run the application?',
                default: () => {
                    return 80;
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
                ]
            },
            {
                type: 'list',
                name: 'database',
                message: 'What type of database you want to use',
                choices: [
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
                ]
            }
        ]).then((answers) => {
            cache.app = {};
            cache.app.env = answers.env;
            cache.app[cache.app.env] = {};
            cache.app[cache.app.env].port = answers.port;
            if (answers.database) {
                cache.app[cache.app.env].hostname = answers.hostname;
                cache.app[cache.app.env].database = {};
                cache.app[cache.app.env].database.config = {};
                cache.app[cache.app.env].database.config.dialect = answers.database;

                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'host',
                        message: 'What is the database host?',
                        default: () => {
                            return 'localhost'
                        }
                    },
                    {
                        type: 'input',
                        name: 'schema',
                        message: 'What is the database name you want to use?',
                        validate: function (value) {
                            return value ? true : 'You must define a name of a database';
                        }
                    },
                    {
                        type: 'input',
                        name: 'username',
                        message: 'What username database?',
                        default: () => {
                            return 'root'
                        }
                    },
                    {
                        type: 'password',
                        name: 'password',
                        message: 'What is the database password?'
                    }
                ]).then((answers) => {
                    cache.app[cache.app.env].database.config.host = answers.host;
                    cache.app[cache.app.env].database.schema = answers.schema;
                    cache.app[cache.app.env].database.username = answers.username;
                    cache.app[cache.app.env].database.password = answers.password;

                    callback(cache);
                })
            }
            else {
                callback(cache);
            }
        });
    }

    this.exec = (pack, cache) => {
        console.log('Creating index.js...');

        fs.writeFile('./index.js', "require('cupcoffee').start();", (err) => {
            if (err) throw err;
            else {
                console.log('index.js ......................... OK!');

                config.create(cache, (cache)=> {

                    ncp(__dirname + '/hello', './app', function (err) {
                        if (err) {
                            return console.error(err);
                        }

                        console.log('Downloading CupCoffee MVC modules...');

                        var npm = 'npm install --save cupcoffee';

                        if (cache.app[cache.app.env].database) {
                            if (cache.app[cache.app.env].database.config.dialect == 'mysql') {
                                npm += ' mysql';
                            }
                            else if (cache.app[cache.app.env].database.config.dialect == 'sqlite') {
                                npm += ' sqlite3';
                            }
                            else if (cache.app[cache.app.env].database.config.dialect == 'mssql') {
                                npm += ' tedious';
                            }
                            else if (cache.app[cache.app.env].database.config.dialect == 'postgres') {
                                npm += ' pg pg-hstore';
                            }
                        }

                        if (execSync(npm)) {
                            console.log(' ......................... Download completed');
                            console.log('Setting package.json...')
                            if (pack.name) {
                                pack.scripts = {
                                    "start": "node ."
                                }

                                fs.writeFile('./package.json', JSON.stringify(pack, null, 2), (err) => {
                                    if (err) throw err;
                                    else {
                                        console.log("Good luck!");
                                    }
                                })
                            }
                            else {
                                console.log("Good luck!");
                            }
                        }
                    });
                });
            }
        });

    }

    return this;
}