#! /usr/bin/node

var opt = require('optimist').argv,
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    util = require('util'),
    validator = require('validator'),
    merge = require('utils-merge'),
    inquirer = require('inquirer'),
    create = require('./create.js')(),
    config = require('./config.js')();


var packageJson;

var getPackage = (error) => {
    try {
        return JSON.parse(fs.readFileSync('./package.json').toString());
    }
    catch (e) {
        if (error) {
            console.error(' ERROR: package.json not found.\n Before you run this application you need to set the package.json. To make it, run \'npm init\'.')
            return undefined;
        }
    }
}

switch (opt['_'][0]) {
    case 'create':
        packageJson = getPackage(true);
        if (packageJson) {
            create.flags(packageJson, (data) => {
                create.exec(packageJson, data)
            })
        }
        break;

    case 'config':
        packageJson = getPackage(true);
        if (packageJson) {
            create.flags(packageJson, (data) => {
                config.create(data)
            })
        }
        break;

    default:
        if (opt.v || opt.version) {
            console.log(require('./package.json')['version']);
            return
        }

        inquirer.prompt([
            {
                type: 'list',
                name: 'menu',
                message: 'What do you want me to do?',
                choices: [
                    {
                        name: 'Create a new project, now!',
                        value: 'create'
                    },
                    {
                        name: 'Set an existing project!',
                        value: 'config'
                    },
                    {
                        name: 'Nothing, bye.',
                        value: 'exit'
                    }
                ]
            }
        ]).then(function (answers) {
            switch (answers.menu) {
                case 'create':
                    packageJson = getPackage(true);
                    if (packageJson) {
                        create.cli(packageJson, (data) => {
                            create.exec(packageJson, data)
                        })
                    }

                    break;
                case 'config':
                    packageJson = getPackage(false);
                    if (packageJson) {
                        config.cli(packageJson);
                    }

                    break;
                case 'exit':
                    console.log('Bye, bye...');
                    break;
            }
        });
        break;
}



