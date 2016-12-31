var mongoose = require('mongoose');
var HRMMongoose = require('../models/SchemaHRM.js');
var moment = require('moment');
var config = require('../config.json');
var store = require('../store');
var routerMap = {
    // always use lower case!
    'hrmhours': hrmHours, //http://127.0.0.1:3002/hrms/hrmHours
    'hrmminutes': hrmMinutes //http://127.0.0.1:3002/hrms/hrmMinutes
};

exports.get = function (req, res, next) {
    var target = req.params.target,        
        route = routerMap[target];
    console.log("api.js target:" + target);
    
    if (route) {
        console.log("hrms.js route:" + route);
        res.send(route(req, res));
        console.log("hrms.js route:" + route);
    } else {
        res.send(404);
    }
};

exports.hrmmins = hrmMinutes;
exports.hrmhours = hrmHours;

  /**
  * Decrement stored data
  * @method decr
  * @param {string} key Data key
  */
function hrmMinutes(req, next) {
    
    console.log("hrm mins :");
    
    var args = JSON.parse(req);
    var startdatetime = moment(args.StartTime).utc();    
    
    var fulldate = moment(args.CurrTime).utc(); 
    var date = moment(fulldate.utc()).utc().format();
    
    var minNum = moment(date).minutes();
    var secNum = moment(date).seconds();        //date.get('second');
    var miliNum = moment(date).milliseconds();  //date.get('millisecond');
    
    //set min, sec,mili to zero before query
    date = moment(date).minutes(0);                    //date.set('minute', 0);
    date = moment(date).seconds(0);                    //date.set('second', 0);
    date = moment(date).milliseconds(0);               //date.set('millisecond', 0);
    var userid = store.get('curruser');
    var query = { "hrmhour" : date, "patient" : userid };

    console.log("         "+fulldate.utc().format());

    HRMMongoose.findOne(query, function (err, hrmdoc) {
        if (err) return next(err);
        
        if (hrmdoc) {
            //update this doc only with the new data related to the minutes
            //console.log('         hour doc (exists)');
            //Check first that if the minute already existing
            var query2 = { "_id" : hrmdoc._id, "minutes.minute" : minNum };
            
            var projection = { "minutes.$": 1 }
            HRMMongoose.findOne(query2, projection, function (err, mindoc) {
                if (err) return next(err);
                if (mindoc) {
                    //now check for the seconds, if second do't exist add it, otherwise just return.
                    //because of the divergent array error use tmpdoc instead of mindoc for the save purpose
                    var i = 0;
                    var j = 0;
                    var secdocs
                    for (i = 0; i < hrmdoc.minutes.length; ++i) {
                        if (hrmdoc.minutes[i].minute == minNum) {
                            secdocs = hrmdoc.minutes[i].seconds;
                            for (j = 0; j < secdocs.length; ++j) {
                                if (secdocs[j].sec == secNum) {
                                    //console.log("   sec doc (exists)");
                                    return;
                                }
                            }
                            secdocs.push({
                                sec : secNum, hbeat : args.HeartbeatValue, 
                                hrVary: args.HbeatVaribility, evcount: args.EventCount
                            });
                            break;
                        }
                    }
                    
                    //console.log(secdocs);
                    //console.log("\n");
                    hrmdoc.markModified('minutes');
                    var newsecArr = secdocs;
                    if (typeof newsecArr === "object") hrmdoc.minutes[i].seconds = newsecArr;
                    hrmdoc.save(function (err, tmp) {
                        if (err) throw err;
                        console.log("         secs add for " + tmp._id + "\n");
                    });
                } else {//if minute is not existing
                    //console.log('    min doc (not exists)');
                    var minArr = hrmdoc.minutes;
                    minArr.push({
                        minute : minNum,
                        seconds  : [{
                                sec : secNum, hbeat : args.HeartbeatValue, 
                                hrVary: args.HbeatVaribility, evcount: args.EventCount
                            }]
                    });
                    var newMinArr = minArr;
                    if (typeof newMinArr === "object") hrmdoc.minutes = newMinArr;
                    hrmdoc.save(function (err, tmp) {
                        if (err) return handleError(err);
                        console.log("         min add for" + tmp._id + "\n");
                    });
                }
            });
        } 
        else {
            //console.log('    hour doc (not exists)');
            var hdoc = new HRMMongoose();
            
            if (!(args.DeviceSerial && args.ManufacID)) {
                hdoc.device = {
                    hwrevision: "",
                    swrevision: "",
                    manufacture: "",
                    modelnum: "",
                    deviceserial: ""
                }
            } else {
                hdoc.device = {
                    hwrevision  : args.HWRevision,
                    swrevision  : args.SWRevision,
                    manufacture : args.ManufacID,
                    modelnum    : args.ModelNum,
                    deviceserial: args.DeviceSerial
                }
            };            
            hdoc.minutes = {
                minute : minNum,
                seconds : [{   sec : secNum,                     hbeat : args.HeartbeatValue, 
                             hrvary: args.HbeatVaribility,     evcount: args.EventCount
                          }]
            };
            
            hdoc.minuteavg = 0;
            hdoc.patient = store.get('curruser');
            hdoc.hrmhour = date.utc().format();
            hdoc.startAt = startdatetime.utc().format();
            hdoc.endedAt = fulldate.utc().format();
            //console.log('tdoc is as: %s', tdoc.toString());
            HRMMongoose.create(hdoc, function (err, docn){
                if (err) return handleError(err);                
                console.log("          new hour doc " + docn._id + "\n");
            });
        }
    });
};
function hrmHours(req, next) {
    
    //It will be used in case the request is coming from the c#client pusher service in the form of JSON data
    console.log("hrm hours :");
    
    var args = JSON.parse(req);
    
    
    var fulldate = moment(args.CurrTime).utc();
    var date = moment(fulldate.utc()).utc().format();
    
    //console.log("curr date :" + args.CurrTime);
    console.log("         " + date);    
    //set min, sec, mili to zero before query
    date = moment(date).minutes(0);                    //date.set('minute', 0);
    date = moment(date).seconds(0);                    //date.set('second', 0);
    date = moment(date).milliseconds(0);               //date.set('millisecond', 0);
    
    var userid = store.get('curruser');
    var query = { "hrmhour" : date, "patient" : userid };
        
    var deviceDoc;
    if (args.DeviceSerial || args.ManufacID || args.ModelNum) {
        deviceDoc = {
            hwrevision  : args.HWRevision,
            swrevision  : args.SWRevision,
            manufacture : args.ManufacID,
            modelnum    : args.ModelNum,
            deviceserial: args.DeviceSerial
        }
    } //else { //console.log("not initialized device doc");};

    var updatedoc = { device: deviceDoc };
    var options = { new: true }; //To return the document with the modifications made on the update
    
    //console.log("update doc is"+ updatedoc);

    HRMMongoose.findOneAndUpdate(query, updatedoc, options, function (err, hrmhrdoc) {
        if (err) return next(err);
        console.log("         updated for " + hrmhrdoc._id + "\n");        
    });
};

/*<minute>
 *  console.log("..HRM( StartTime:" + senseData.StartTime + "  CurrTime:" + senseData.CurrTime + 
                " Event Count:" + senseData.EventCount + "  HeartRate:" + senseData.HeartbeatValue + 
                "  Heartrate Varibility:" + senseData.HbeatVaribility + " )");
 * <hour>
 * console.log("..HRM( Currtime:" + senseData.CurrTime + " DeviceSerial:" + senseData.DeviceSerial +
                "  Hardware Rev:" + senseData.HWRevision + "  Software Rev:" + senseData.SWRevision + 
                "  manufacture:" + senseData.ManufacID + "  ModelNum:" + senseData.ModelNum + " )");
 */