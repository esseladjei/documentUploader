var mongoose = require('mongoose');
var express = require('express');
var app = express();
mongoose.Promise = require('bluebird');;
class ModelInitializer {
    static initializeModel() {
        return new Promise((resolve, reject) => {
            var remoteConnectionString = 'unknown';
            var localConnectionString = 'mongodb://localhost/ZLabdb';
            let connectionString = ( app.get('env') === 'development' || app.get('env') === 'test') ? localConnectionString : remoteConnectionString;
            mongoose.connect(connectionString, { useCreateIndex: true, useNewUrlParser: true });
            var db = mongoose.connection;
            db.on('error', (e) => {
                if (reject) {
                    reject('Could not establish connection to database server:' + e);
                }
            });
            db.once('open', (e) => {
                if (resolve) {
                    resolve('Mongodb Connection successful!');
                }
            });
        })
    }
}
module.exports = ModelInitializer;