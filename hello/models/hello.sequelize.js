"use strict";

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        /**********************************
         * Table name
         * ********************************/
        "hello",

        /**********************************
         * Schema
         * ********************************/
        {
            count: DataTypes.INTEGER,
            name: DataTypes.STRING
        })
};