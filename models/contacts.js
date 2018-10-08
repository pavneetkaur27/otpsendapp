var  mongoose =  require('mongoose');

var contactlist =mongoose.Schema({
        Firstname                 : String,
        Lastname                  :String ,
        ContactNo                 : String,
        otpno                     : String,
        time                      : { type : Date},
        isOtpSend                 : Boolean
    }
);

module.exports = mongoose.model('contactlists',contactlist);