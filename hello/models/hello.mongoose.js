"use strict";

module.exports = ({Schema}) => {
    /**********************************
     * Schema
     * ********************************/
    var userSchema = new Schema({
        name: String,
        count: Number,
        created_at: Date,
        updated_at: Date
    });

    /**********************************
     * Collection Name
     * ********************************/
    userSchema.name = 'Users';

    /**********************************
     * Before Save
     * ********************************/
    userSchema.pre('save', function (next) {
        var currentDate = new Date();

        if (!this.created_at) {
            this.created_at = currentDate;
        }
        else {
            this.updated_at = currentDate;
        }

        next();
    });

    return userSchema;
};