var express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var models = require('../models');
var path = require('path');
var mongoose = require('mongoose');
var fs = require('fs');
var request = require('request');
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: 'ef24afe4',
    apiSecret: 'x23r5YgTFltOCznR'
}, {debug: true});

const contactlist = require('../models/contacts');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'OtpSendApp',sent:false });
});

//route for redirecting to user list
router.get('/userlist',function (req,res) {
    models.contacts.find({}, function (err, list) {
        if (err)
            return res.send(err);
        else {
            res.render('user/userlist',{users:list,title: 'OtpSendApp'});
        }
    })
});

//route for redirecting to a particular user selected
router.get('/userinfo/:id',function (req,res) {
    var userid=req.params.id;
    req.session.userid=userid;
    models.contacts.findOne({_id:userid}, function (err, user) {
        if (err)
            return res.send(err);
        else {
            console.log("-------------------------------------"+user);
           res.render('user/userdetails',{user:user,title: 'OtpSendApp'})
        }
    })
});

//route for redirecting to compose otp
router.get('/composemessage',function (req,res) {
    var otpno=Math.floor(100000 + Math.random() * 900000);
    var msg="Hi.  Your  OTP  is: "+otpno;
    req.session.otpno=otpno;
    res.render('user/sendmessage',{message:msg,title: 'OtpSendApp'});
});

//test numbers at which messages are to be send need to be verified first at nexmo account because i have not buyed the paid version.
//route for redirecting when user click on send button.
router.post('/composemessage',function (req,res) {
    userid=req.session.userid;
    otpno=req.session.otpno;
  //  req.session.isOtpSend=true;
   // console.log("-------------"+Date.now()+"---"+userid+"-----"+otpno);
    models.contacts.update({_id:userid},{isOtpSend:true,otpno:otpno,time:Date.now()},function (err,res) {
        if(err){
            return res.send(err);
        }else {
            models.contacts.findOne({_id: userid}, function (err, user) {
                if (err) {
                    user.send(err);
                } else {
                    nexmo.message.sendSms(
                        'Virtual',user.ContactNo, req.body.msg, //instead of user.contact name only registered test numbers on nexmo will get sms like 918168226727
                        {type: 'unicode'},
                        function (err, responseData) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(responseData);
                            }
                        }
                    );
                }
            });
           //
        }
    });
    res.render('index', {title: 'OtpSendApp', sent: true});
});

//route for redirecting to user list which are already sent otp messages
router.get('/sentmessages',function (req,res) {
    models.contacts.find({isOtpSend:true}).sort({time:1}).exec(function (err, list) {
        if (err)
            return res.send(err);
        else {
            res.render('user/messagessend',{users:list});
        }
    })
});

module.exports = router;
