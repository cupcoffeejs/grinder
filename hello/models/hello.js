"use strict";

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "hello",
        {
            count: DataTypes.INTEGER,
            name: DataTypes.STRING
        }, {
            createdAt: 'created',
            updatedAt: 'modified',
            deletedAt: false
        })
};