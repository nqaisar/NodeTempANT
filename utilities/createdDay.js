var moment = require('moment');
// add a "created" property to our documents
module.exports = function (schema) {
    var date = moment.utc();
    
    //set min, sec,mili to zero before query
    date = moment(date).hours(0);                    //date.set('minute', 0);
    date = moment(date).minutes(0);                    //date.set('minute', 0);
    date = moment(date).seconds(0);                    //date.set('second', 0);
    date = moment(date).milliseconds(0);               //date.set('millisecond', 0);
    schema.add({ createdDay: { type: Date, default: date } })
}