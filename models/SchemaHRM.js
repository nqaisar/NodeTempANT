var mongoose = require('mongoose');

var SchemaHRMSecond = new mongoose.Schema({
           sec : { type: Number, required: true  }, //seconds will be handled here
         hbeat : { type: Number, required: true  },
         hrvary: { type: Number, required: false },
        evcount: { type: Number, required: false }//event count
      }, { _id : false, versionKey: false}
    );

var SchemaHRMMinute = new mongoose.Schema({
        minute : { type: Number, required: true }, //seconds will be handled here
        seconds : [SchemaHRMSecond]
    }, 
    { _id : false, versionKey: true }
);

var SchemaHRM = new mongoose.Schema({
            patient: { type: String, ref: 'User' },
            device: {
                hwrevision: { type: String, required: false },
                swrevision: { type: String, required: false },
                manufacture: { type: String, required: false },
                modelnum: { type: String, required: false },
                deviceserial: { type: String, required: false },
            },
            hrmhour: { type: Date, required: true }, // we shall store only YYYY-MM-DD and hour. Before storing we shall nullify the minutes, seconds and milliseconds.
            startAt: { type: Date, required: true },
            endedAt: { type: Date, required: false},
            minutes: [ SchemaHRMMinute ],
            minuteavg: Number  
});

module.exports = mongoose.model('Pulse', SchemaHRM);
