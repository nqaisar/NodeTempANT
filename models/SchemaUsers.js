var mongoose = require('mongoose');
var createdDate = require('../utilities/createdDate');
var validEmail = require('../utilities/validate/email');


var SchemaUsers = new mongoose.Schema({
      _id   : { type: String, lowercase: true, trim: true, validate: validEmail }
    , name  : { first: String, last: String }
    , age   : { type: Number, required: false }    
    , salt  : { type: String, required: false }   
    , hash  : { type: String, required: false }
});

// add created date property will be saved to the db
SchemaUsers.plugin(createdDate);

// properties that do not get saved to the db
SchemaUsers.virtual('fullname').get(function () {
    return this.name.first + ' ' + this.name.last;
});

module.exports = mongoose.model('User', SchemaUsers);
