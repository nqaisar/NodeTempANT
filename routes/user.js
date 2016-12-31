var mongoose = require('mongoose');
var UserMongoose = require('../models/SchemaUsers.js');
var moment = require('moment');
var config = require('../config.json'),
    store = require('../store'),
    routerMap = {
        // always use lower case!
        'newuser': userRegister, //http://127.0.0.1:3002/user/newuser?
        'loginuser': userLogin
    }; 
//it is associated with the GET request
exports.get = function (req, res, next) {
    var target = req.params.target,        
        route = routerMap[target];
    console.log("user.js target:" + target);
    if (route) {
        console.log("user.js route:" + route);
        res.send(route(req, res));
    } else {
        res.send(404);
    }
};

exports.newuser = userRegister;
exports.loginuser = userLogin;

function userLogin(req, next) {    
    var args = JSON.parse(req);
    store.set("curruser", args.EmailID);
    console.log(args.EmailID + " login");
} 
function userRegister(req, next) {
    console.log("User");
    var args = JSON.parse(req);
    var email = args.EmailID;
    UserMongoose.findOne({ "_id" : email }, function (err, tmpdoc) {
        if (err) return next(err);
        
        if (tmpdoc) {
                //console.log('    hour doc (exists)');
        } 
        else{
                    //console.log('    user doc (not exists)');
                    //create new tmp doc
                        var udoc = new UserMongoose();
                        udoc._id        = args.EmailID,
                        udoc.name.first = args.FirstName;
                        udoc.name.last  = args.LastName;
                        udoc.age        = args.Age;                        
            UserMongoose.create(udoc, function (err, docn) {
                        if (err) return handleError(err);
                        console.log("       added " + docn._id+"\n\n");
                    });
           }
    });
};