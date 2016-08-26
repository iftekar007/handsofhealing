/**
 * Created by iftekar on 24/5/16.
 */

var CryptoJS = require("crypto");
var express = require('express');
var mailer = require("nodemailer");

//var busboy = require('connect-busboy'); //middleware for form/file upload
//var path = require('path');     //used for file path
//var fs = require('fs-extra');
var app = express();
//app.use(busboy());// create our app w/ express
//var mongoose = require('mongoose'); 				// mongoose for mongodb
var port = process.env.PORT || 0002; 				// set the port
//var database = require('./config/database'); 			// load the database config
//var morgan = require('morgan');
/*var bodyParser = require('body-parser');
var methodOverride = require('method-override');*/

/*// configuration ===============================================================
//mongoose.connect(database.localUrl); 	// Connect to local MongoDB instance. A remoteUrl is also available (modulus.io)

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
//app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request*/


var http = require('http').Server(app);





var bodyParser = require('body-parser');
app.use(bodyParser.json({ parameterLimit: 1000000,
    limit: 1024 * 1024 * 10}));
app.use(bodyParser.urlencoded({ parameterLimit: 1000000,
    limit: 1024 * 1024 * 10, extended: false}));
var multer  = require('multer');
var datetimestamp='';
var filename='';
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {

        //console.log(file);
        filename=file.originalname.split('.')[0].replace(' ','') + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
        cb(null, filename);
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');


app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
//app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request*/

/*app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies*/


// routes ======================================================================
//require('./app/routes.js')(app);

// listen (start app with node nodeserver.js) ======================================




app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


var EventEmitter = require('events').EventEmitter;

const emitter = new EventEmitter()
//emitter.setMaxListeners(100)
// or 0 to turn off the limit
emitter.setMaxListeners(0)


/** API path that will upload the files */
app.post('/uploads', function(req, res) {

    datetimestamp = Date.now();
    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json({error_code:0,filename:filename});
    });
});



var mysql=require('mysql');

var connection =mysql.createConnection({
    host:'influxiq.com',
    user:'influxiq_urbanhe',
    password:'P@ss7890',
    database:'influxiq_hhealing'

});

connection.connect(function(error){

    if(!!error){
        console.log('error')
    } else{
        console.log('connected');
    }

});

app.get('/',function(req,resp){

    connection.query("SELECT * FROM contentmanager ",function(error,rows,fields){

        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
        }

    });

});



app.get('/listcontent', function (req, resp) {
    connection.query("SELECT * FROM contentmanager ",function(error,rows,fields){

        console.log(error);
        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
	    //connection.end();
        }

    });
});


app.get('/contentlistbyid/:id', function (req, resp) {
    connection.query("SELECT * FROM contentmanager where id = ? or parentid = ?",[req.params.id,req.params.id],function(error,rows,fields){

        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
        }

    });
});





app.post('/adddata', function (req, resp) {



   /* res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
*/
    resp.header('Content-type: text/html');
    resp.header("Access-Control-Allow-Origin", "*");  //I have also tried the * wildcard and get the same response
    resp.header("Access-Control-Allow-Credentials: true");
    resp.header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    resp.header('Access-Control-Max-Age: 1000');
    resp.header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
    //resp.send(('name : '+req.body.cname+' content:' +req.body.ctext+' ctype : '+req.body.ctype+'desc :'+req.body.description));
    var content='';
    if(req.body.ctype=='html') content= (req.body.chtml);
    if(req.body.ctype=='text') content= (req.body.ctext);
    if(req.body.ctype=='image') content= req.body.image_url_url;

    ///console.log(JSON.parse(content));
    if(typeof (req.body.parentid)=='undefined') var parentid=0;
    else var parentid=req.body.parentid;
    var addtime=Date.now();

    value1 = {cname: req.body.cname, content: content, ctype: req.body.ctype,description:req.body.description,parentid:parentid,addtime:addtime};
console.log("Insert command");
connection.query('INSERT INTO contentmanager SET ?', value1, function (err,result) {
    if (err) {
        console.log("ERROR IN QUERY");
    } else {
        console.log("Insertion Successful." + result);
        console.log('Inserted ' + result.affectedRows + ' rows');
        resp.send(result);
    }
});
    //resp.send((req));


});


app.post('/addadmin', function (req, resp) {

    var url= 'http://hohspastudio.com/signupactivate/';
    var addtime=Date.now();

    var retstatus = {};

    var crypto = require('crypto');

    var secret = req.body.password;
    var hash = crypto.createHmac('sha256', secret)
        .update('password')
        .digest('hex');

        city='';
        state='';
        zip='';
        if(typeof(req.body.city)!='undefined' && req.body.city!=''){
            city=req.body.city;
        }
        if(typeof(req.body.state)!='undefined' && req.body.state!=''){
            state=req.body.state;
        }
        if(typeof(req.body.zip)!='undefined' && req.body.zip!=''){
            zip=req.body.zip;
        }
   var userrole= req.body.userrole;
  /*  if(req.body.type=='generaluser'){
        uerrole=3;
        status=0;
    }
    if(req.body.type=='siteadmin'){
        uerrole=2;
        status=1;
    }*/
    activelink='';
    value1 = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: hash,
        address: req.body.address,
        phone_no: req.body.phone_no,
        mobile_no: req.body.mobile_no,
        city: city,
        state: state,
        zip: zip,
        status: req.body.status,
        create_time: addtime,
        activelink:activelink
    };
    connection.query("SELECT * FROM user WHERE email = ?",[req.body.email],function(error,rows,fields){

        if(error){
            retstatus = {'error':1,'msg':req.body.zip};
            resp.send(JSON.stringify(retstatus));
            return ;
        }
        else{

            if (rows.length  > 0) {
                retstatus = {'error':1,'msg':'This email already exist.'};
                resp.send(JSON.stringify(retstatus));
                return ;
            }else{
                connection.query('INSERT INTO user SET ?', value1, function (err,result) {
                    if (err) {
                        retstatus = {'error':1,'msg':'Failed internal error.'};
                        resp.send(JSON.stringify(retstatus));
                        return ;
                    } else {

                        value2 = {user_id: result.insertId, role_id: userrole};

                        connection.query('INSERT INTO user_role SET ?', value2, function (err2,result2) {
                            var last_id=result.insertId;
                            condition1={id:last_id};
                            var str =  Math.random() * Math.random();
                           var randomValue= str.toString().replace(".","");
                            str1=randomValue+'_'+last_id;
                            var link=url+str1;
                            var val={activelink:str1};


                            if(req.body.userrole==3) {


                                connection.query('UPDATE user SET ? WHERE ?', [val, condition1], function (error3, rows3, fields3) {

                                });

                                // randomdom_string = base64_encode($account->uid);
                                //  var  link = CUSTOM_URL + '/url/' + randomdom_string;

                                var html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\
                                <html xmlns="http://www.w3.org/1999/xhtml">\
                                <head>\
                                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                                <meta name="viewport" content="width=device-width, initial-scale=1" />\
                                <title>Access Code</title>\
                        <style>\
                        @font-face{\
                        @import url(https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900);\
                        }\
                        </style>\
                            </head>\
                            <body  class="body" style="padding:0; margin:0; display:block; background:#eeebeb; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased;  -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;font-family: \'Raleway\';" bgcolor="#eeebeb">\
                            <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                                <tr>\
                                <td align="center" valign="top" style="background-color:#eeebeb;font-family:Raleway-Regular;" width="100%">\
                                <table cellspacing="0" cellpadding="0" width="600" class="w320" style="width:600px; margin:0 auto;">\
                                <tr>\
                                <td align="center" valign="top">\
                                <table style="margin:0 auto;font-family: \'Raleway\';" cellspacing="0" cellpadding="0" width="100%">\
                                <tr>\
                                <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;font-family:Raleway-Regular;">\
                                <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                                </td>\
                                </tr>\
                                </table>\
                                <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                                <tr>\
                                <td style="background-color:#ffffff; padding-top: 15px;font-family:Raleway-Regular;">\
                                <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;" cellspacing="0" cellpadding="0">\
                                <tr>\
                                <td style="text-align: center;vertical-align: top; font-family: \'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                                Welcome to Hands of Healing\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                                Please verify your email address by clicking the link below:\
                                </td>\
                            </tr>\
                            <tr>\
                            <td style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 20px; padding-top:6px; padding-bottom:10px;">\
                                <span style="font-size:16px; color:#c89f2d;"><a href="' + link + '">' + link + '</a></span>\
                                </td>\
                                </tr>\
                                <tr>\
                                <td style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 30px; text-transform:uppercase;">\
                                Thanks for being a Hands of Healing Customer\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                                -- Hands of Healing Team\
                            </td>\
                            </tr>\
                            </table>\
                            <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                                <tr>\
                                <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                                <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                                </td>\
                                </tr>\
                                <tr>\
                                <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                                <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                                </td>\
                                </tr>\
                                <tr>\
                                <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="font-size:12px;">\
                                &nbsp;\
                            </td>\
                            </tr>\
                            </table>\
                            </td>\
                            </tr>\
                            </table>\
                            </td>\
                            </tr>\
                            </table>\
                            </td>\
                            </tr>\
                            </table>\
                            </body>\
                            </html>';

                                // var mailer = require("nodemailer");

                                var smtpTransport = mailer.createTransport("SMTP", {
                                    service: "Gmail",
                                    auth: {
                                        user: "itplcc40@gmail.com",
                                        pass: "DevelP7@"
                                    }
                                });

                                var mail = {
                                    from: "Admin <samsujdev@gmail.com>",
                                    to: req.body.email,
                                    subject: "Please Verify your Email Address. ",
                                    //text: "Node.js New world for me",
                                    html: html
                                }

                                smtpTransport.sendMail(mail, function (error, response) {
                                    //  resp.send((response.message));
                                    smtpTransport.close();
                                });


                            }



                        });

                        retstatus = {'error':0};
                        resp.send(JSON.stringify(retstatus));
                        return ;
                    }




                });
            }

        }




    });







    //resp.send((req));


});
app.post('/deleteadmin', function (req, resp) {

    connection.query("DELETE  FROM user where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});



app.post('/adminlist', function (req, resp) {
    connection.query("SELECT u.*,ur.role_id FROM user u inner join user_role ur on ur.user_id=u.id   WHERE ur.role_id = ?",[req.body.role_id],function(error,rows,fields){
    //console.log(error);
        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
           // connection.end();
            resp.send(JSON.stringify(rows));

        }

    });
});
app.post('/admindetails', function (req, resp) {

    connection.query("SELECT *  FROM user where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
        }

    });
});
app.post('/adminupdates', function (req, resp) {
   var  value1 = {fname: req.body.fname, lname: req.body.lname, email: req.body.email,address:req.body.address,phone_no:req.body.phone_no,mobile_no:req.body.mobile_no};
    var condition = {id:req.body.id};

    connection.query('UPDATE user SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/adminupdatestatus', function (req, resp) {

    var  value1 = {status: req.body.status};
    var condition = {id:req.body.id};

    connection.query('UPDATE user SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');


        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});


app.post('/contactlist', function (req, resp) {
    var country=
        connection.query("SELECT * FROM contact",function(error,rows,fields){
            console.log(error);
            if(!!error) console.log('error in db call ');
            else{

                console.log('success full query');
                //resp.send('Hello'+rows[0].fname);
                // connection.end();
                resp.send(JSON.stringify(rows));

            }

        });
});
app.post('/deletecontact', function (req, resp) {
    /*
     var  value = {qty: req.body.qty};
     var condition = {userid:req.body.userid,pid:req.body.pid};
     */

    connection.query("DELETE FROM contact WHERE id="+req.body.id,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            resp.send(JSON.stringify(rows));

        }

    });
});

app.post('/userupdatestatus', function (req, resp) {
    retstatus={};
    var  value1 = {status:1};
    var link=req.body.link;
    arr = link.split("_");
    ids=arr[1];
    var condition1 = {activelink:link};
    var condition = {id:ids};

    connection.query('SELECT * FROM user WHERE ?', [condition] ,function(error,rows,fields){
        if(error) {
            retstatus = {'error':1,'msg':'Failed internal error.'};
            resp.send(JSON.stringify(retstatus));
            return;

        }
        else{
            var email=rows[0].email;

          if(rows.length>0){
              connection.query('UPDATE user SET ? WHERE ?', [value1, condition] ,function(error1,rows1,fields1){

                  if(error1) {
                      retstatus = {'error':1,'msg':'Failed internal error.'};
                      resp.send(JSON.stringify(retstatus));
                      return;
                  }
                  else{
                      var html='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\
                          <html xmlns="http://www.w3.org/1999/xhtml">\
                          <head>\
                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                          <meta name="viewport" content="width=device-width, initial-scale=1" />\
                          <title>Sign Up Activation</title>\
                        <style>\
                        @font-face{\
                        @import url(https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900);\
                        }\
                        </style>\
                      </head>\
                      <body  class="body" style="padding:0; margin:0; display:block; background:#eeebeb; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;font-family: \'Raleway\';" bgcolor="#eeebeb">\
                      <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                          <tr>\
                          <td align="center" valign="top" style="background-color:#eeebeb" width="100%">\
                          <table cellspacing="0" cellpadding="0" width="600" class="w320">\
                          <tr>\
                          <td align="center" valign="top">\
                          <table style="margin:0 auto;" cellspacing="0" cellpadding="0" width="100%">\
                          <tr>\
                          <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;">\
                          <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                          </td>\
                          </tr>\
                          </table>\
                          <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                          <tr>\
                          <td style="background-color:#ffffff; padding-top: 15px;font-family: \'Raleway\';">\
                          <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;" cellspacing="0" cellpadding="0">\
                          <tr>\
                          <td style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 24px;">\
                          Your account have been\
                      </td>\
                      </tr>\
                      <tr>\
                      <td style="text-align: center;vertical-align: top; font-family: \'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                          activated successfully !\
                      </td>\
                      </tr>\
                      <tr>\
                      <td style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                          -- Hands of Healing Team\
                      </td>\
                      </tr>\
                      </table>\
                      <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                          <tr>\
                          <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                          <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products/0" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                          </td>\
                          </tr>\
                          <tr>\
                          <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                          <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                          </td>\
                          </tr>\
                          <tr>\
                          <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                      </td>\
                      </tr>\
                      <tr>\
                      <td style="font-size:12px;">\
                          &nbsp;\
                  </td>\
                      </tr>\
                      </table>\
                      </td>\
                      </tr>\
                      </table>\
                      </td>\
                      </tr>\
                      </table>\
                      </td>\
                      </tr>\
                      </table>\
                      </body>\
                      </html>';
                      var smtpTransport = mailer.createTransport("SMTP",{
                          service: "Gmail",
                          auth: {
                              user: "itplcc40@gmail.com",
                              pass: "DevelP7@"
                          }
                      });

                      var mail = {
                          from: "Admin <samsujdev@gmail.com>",
                          to: email,
                          subject: "Your Account Activated",
                          //text: "Node.js New world for me",
                          html: html
                      }

                      smtpTransport.sendMail(mail, function(error, response){
                          //  resp.send((response.message));
                          smtpTransport.close();
                      });

                      console.log('success full query');
                      //resp.send('Hello'+rows[0].fname);
                      retstatus = {'error':0};
                      resp.send(JSON.stringify(retstatus));
                      return;
                  }

              });
          }
          else{
              retstatus = {'error':1,'msg':'user doees not exists.'};
              resp.send(JSON.stringify(retstatus));
              return;
          }

          //  resp.send(retstatus);
        }

        }
    )

});

app.post('/forgotpassword', function (req, resp) {

    connection.query("SELECT *  FROM user where email = ?",[req.body.email],function(error,rows,fields){
        var retstatus={};
        var userdetails={};
        if(error) {
            console.log('error in db call ');
            retstatus = {'error':1,'msg':'Failed internal error.'};
            resp.send(JSON.stringify(retstatus));
            return;

        }
        else{
            var str =  Math.random() * Math.random();
            var randomValue= str.toString().replace(".","");
           /* var randomValue =  Math.random() * Math.random();*/
            value={accesscode:randomValue};
            condition={email:req.body.email};
            if(rows.length>0){
                connection.query('UPDATE user SET ? WHERE ?', [value, condition] ,function(error1,rows1,fields1){

                    if(error1) {
                        retstatus = {'error':1,'msg':'Failed internal error.'};
                        resp.send(JSON.stringify(retstatus));
                        return;
                    }
                    else{
                        var html='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\
                            <html xmlns="http://www.w3.org/1999/xhtml">\
                            <head>\
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                            <meta name="viewport" content="width=device-width, initial-scale=1" />\
                            <title>Access Code</title>\
                        <style>\
                        @font-face{\
                        @import url(https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900);\
                        }\
                        </style>\
                        </head>\
                        <body  class="body" style="padding:0; margin:0; display:block; background:#eeebeb;font-family: \'Raleway\'; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;" bgcolor="#eeebeb">\
                        <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                            <tr>\
                            <td align="center" valign="top" style="background-color:#eeebeb;font-family: \'Raleway\';" width="100%">\
                            <table cellspacing="0" cellpadding="0" width="600" class="w320">\
                            <tr>\
                            <td align="center" valign="top">\
                            <table style="margin:0 auto;" cellspacing="0" cellpadding="0" width="100%">\
                            <tr>\
                            <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;font-family: \'Raleway\';">\
                            <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                            </td>\
                            </tr>\
                            </table>\
                            <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                            <tr>\
                            <td style="background-color:#ffffff; padding-top: 15px;">\
                            <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;font-family: \'Raleway\';" cellspacing="0" cellpadding="0">\
                            <tr>\
                            <td style="text-align: center;vertical-align: top; font-family: \'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                            Welcome to Hands of Healing\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                            The access code to change your password is <span style="color: #000;font-size: 20px;">'+randomValue+'</span>\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 30px; text-transform:uppercase;">\
                            Thanks for being a Hands of Healing Customer.\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                            -- Hands of Healing Team\
                        </td>\
                        </tr>\
                        </table>\
                        <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                            <tr>\
                            <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                            <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                            <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="font-size:12px;">\
                            &nbsp;\
                    </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </body>\
                        </html>';
                        var smtpTransport = mailer.createTransport("SMTP",{
                            service: "Gmail",
                            auth: {
                                user: "itplcc40@gmail.com",
                                pass: "DevelP7@"
                            }
                        });

                        var mail = {
                            from: "Admin <samsujdev@gmail.com>",
                            to: req.body.email,
                            subject: "Access Code For Hands of Healing",
                            //text: "Node.js New world for me",
                            html: html
                        }

                        smtpTransport.sendMail(mail, function(error, response){
                            //  resp.send((response.message));
                            smtpTransport.close();
                        });

                       // console.log('success full query');
                        //resp.send('Hello'+rows[0].fname);
                        retstatus = {'error':0,'userdetails':rows};
                        resp.send(JSON.stringify(retstatus));
                        return;
                    }

                });

            }
                else{
                retstatus = {'error':1,'msg':'Email does not exists'};
                resp.send(JSON.stringify(retstatus));
                return;
                }

          //  console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
           // resp.send(JSON.stringify(rows));
        }

    });
});
app.post('/forgotpassaccesscheck', function (req, resp) {
    var condition={email:req.body.email,accesscode:req.body.access_code};
 // resp.send("SELECT *  FROM user where email='"+req.body.email+"' and accesscode='"+req.body.access_code+"' ");
    connection.query("SELECT *  FROM user where email='"+req.body.email+"' and accesscode='"+req.body.access_code+"'",function(error,rows,fields){
     //   var retstatus={};
        var userdetails={};
        if(error) {
            console.log('error in db call ');
            retstatus = {'error':1,'msg':'Access code does not exists '};
            resp.send(JSON.stringify(retstatus));
            return;

        }
        else{
            retstatus = {'error':0};
            resp.send(JSON.stringify(retstatus));
            return;
        }


    });
});
app.post('/changepasswords',function(req,resp){
    var crypto = require('crypto');
    var retstatus={};
    var secret = req.body.password;
    var hash = crypto.createHmac('sha256', secret)
        .update('password')
        .digest('hex');

    var condition = {id:req.body.user_id};
    var value1 = {password:hash};
    connection.query("SELECT * FROM user WHERE id ="+ req.body.user_id+" AND email ='"+req.body.email+"'" ,function(error,rows,fields){
        // connection.query("SELECT * FROM user WHERE id ="+ req.body.user_id+" AND password ='"+hash+"'" ,function(error,rows,fields){

        if(!!error){
            retstatus = {'error':1,'msg':'Failed internal error.'};
            resp.send(JSON.stringify(retstatus));
            return;
        }
        else{

            console.log(rows.length);

            if (rows.length  > 0) {
                connection.query('UPDATE user SET ? WHERE ?', [value1, condition] , function (err,result) {

                    if (err) {
                        retstatus = {'error':1,'msg':'Failed internal error.'};
                        resp.send(JSON.stringify(retstatus));
                        return;
                    } else {

                    var mailer = require("nodemailer");

                         var smtpTransport = mailer.createTransport("SMTP",{
                         service: "Gmail",
                         auth: {
                         user: "itplcc40@gmail.com",
                         pass: "DevelP7@"
                         }
                         });

                         var mail = {
                         from: "Admin <samsujdev@gmail.com>",
                         to: req.body.email,
                         subject: "Your password has been changed successfully",
                         //text: "Node.js New world for me",
                         html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\
                         <html xmlns="http://www.w3.org/1999/xhtml">\
                             <head>\
                             <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                            <meta name="viewport" content="width=device-width, initial-scale=1" />\
                            <title>Password have been changed successfully</title>\
                        <style>\
                        @font-face{\
                        @import url(https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900);\
                        }\
                        </style>\
                        </head>\
                        <body  class="body" style="padding:0; margin:0; display:block; background:#eeebeb; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;font-family: \'Raleway\';" bgcolor="#eeebeb">\
                        <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                            <tr>\
                            <td align="center" valign="top" style="background-color:#eeebeb" width="100%">\
                            <table cellspacing="0" cellpadding="0" width="600" class="w320">\
                            <tr>\
                            <td align="center" valign="top">\
                            <table style="margin:0 auto;" cellspacing="0" cellpadding="0" width="100%">\
                            <tr>\
                            <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;">\
                            <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                            </td>\
                            </tr>\
                            </table>\
                            <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                            <tr>\
                            <td style="background-color:#ffffff; padding-top: 15px;">\
                            <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;" cellspacing="0" cellpadding="0">\
                            <tr>\
                            <td style="text-align:center; vertical-align:top;raleway-regular;color: #4c4c4c;font-size: 18px;line-height: 24px;" valign="center">\
                            You have changed your\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="text-align: center;vertical-align: top; font-family: \'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                            password successfully !\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                            -- Hands of Healing Team\
                        </td>\
                        </tr>\
                        </table>\
                        <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                            <tr>\
                            <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                            <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                            <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="font-size:12px;">\
                            &nbsp;\
                    </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </body>\
                        </html>'
                         }

                         smtpTransport.sendMail(mail, function(error, response){
                       //  resp.send((response.message));
                         smtpTransport.close();
                         });
                        retstatus = {'error':0};
                        resp.send(JSON.stringify(retstatus));
                        return;

                    }

                    // retstatus = {'error':0};


                });
            }
            else{
                retstatus = {'error':1,'msg':"Email does not exis"};
                resp.send(JSON.stringify(retstatus));
                return;
            }


        }

        //resp.send(JSON.stringify(err));

    });
})

app.post('/userchangepassword',function(req,resp){
    var crypto = require('crypto');
    var retstatus={};
    var secret = req.body.original_password;
    var hash = crypto.createHmac('sha256', secret)
        .update('password')
        .digest('hex');

    var secretpassword = req.body.password;
    var newpassword = crypto.createHmac('sha256', secretpassword)
        .update('password')
        .digest('hex');
    var condition = {id:req.body.user_id};
    var value1 = {password:newpassword};
    connection.query("SELECT * FROM user WHERE id ="+ req.body.user_id+" AND password ='"+hash+"'" ,function(error,rows,fields){
   // connection.query("SELECT * FROM user WHERE id ="+ req.body.user_id+" AND password ='"+hash+"'" ,function(error,rows,fields){

        if(!!error){
            retstatus = {'error':1,'msg':'Failed internal error.'};
            resp.send(JSON.stringify(retstatus));
            return;
        }
        else{

            console.log(rows.length);

            if (rows.length  > 0) {
                connection.query('UPDATE user SET ? WHERE ?', [value1, condition] , function (err,result) {

                    if (err) {
                        retstatus = {'error':1,'msg':'Failed internal error.'};
                        resp.send(JSON.stringify(retstatus));
                        return;
                    } else {

                       var mailer = require("nodemailer");

                        var smtpTransport = mailer.createTransport("SMTP",{
                            service: "Gmail",
                            auth: {
                                user: "itplcc40@gmail.com",
                                pass: "DevelP7@"
                            }
                        });

                        var mail = {
                            from: "Admin <samsujdev@gmail.com>",
                            to: req.body.user_mail,
                            subject: "Your password has been changed successfully",
                            //text: "Node.js New world for me",
                            html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\
                         <html xmlns="http://www.w3.org/1999/xhtml">\
                             <head>\
                             <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                            <meta name="viewport" content="width=device-width, initial-scale=1" />\
                            <title>Password have been changed successfully</title>\
                        <style>\
                        @font-face{\
                        @import url(https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900);\
                        }\
                        </style>\
                        </head>\
                        <body  class="body" style="padding:0; margin:0; display:block; background:#eeebeb; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;font-family: \'Raleway\';" bgcolor="#eeebeb">\
                        <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                            <tr>\
                            <td align="center" valign="top" style="background-color:#eeebeb" width="100%">\
                            <table cellspacing="0" cellpadding="0" width="600" class="w320">\
                            <tr>\
                            <td align="center" valign="top">\
                            <table style="margin:0 auto;" cellspacing="0" cellpadding="0" width="100%">\
                            <tr>\
                            <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;">\
                            <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                            </td>\
                            </tr>\
                            </table>\
                            <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                            <tr>\
                            <td style="background-color:#ffffff; padding-top: 15px;">\
                            <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;" cellspacing="0" cellpadding="0">\
                            <tr>\
                            <td style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 24px;font-family: \'Raleway\';">\
                            You have changed your\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="text-align: center;vertical-align: top; font-family: \'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                            password changed successfully !\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                            -- Hands of Healing Team\
                        </td>\
                        </tr>\
                        </table>\
                        <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                            <tr>\
                            <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                            <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                            <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                            </td>\
                            </tr>\
                            <tr>\
                            <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="font-size:12px;">\
                            &nbsp;\
                    </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </td>\
                        </tr>\
                        </table>\
                        </body>\
                        </html>'
                        }

                        smtpTransport.sendMail(mail, function(error, response){
                           // resp.send((response.message));
                            smtpTransport.close();
                        });
                        retstatus = {'error':0};
                        resp.send(JSON.stringify(retstatus));
                        return;

                    }

                   // retstatus = {'error':0};


                });
            }
        else{
                retstatus = {'error':1,'msg':"Old password is invalid"};
                resp.send(JSON.stringify(retstatus));
                return;
        }


        }

        //resp.send(JSON.stringify(err));

    });
})


app.post('/addrole', function (req, resp) {

    var addtime=Date.now();
    var role_status=1;

    value1 = {role: req.body.role, addtime: addtime, role_status: role_status};
    console.log("Insert command");
    connection.query('INSERT INTO role SET ?', value1, function (err,result) {
        if (err) {
            console.log("ERROR IN QUERY");
        } else {
            console.log("Insertion Successful." + result);
            console.log('Inserted ' + result.affectedRows + ' rows');
            resp.send(result);
           // connection.end();
        }
    });
    //resp.send((req));


});

app.get('/rolelist', function (req, resp) {
    connection.query("SELECT * FROM role ",function(error,rows,fields){

        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
});
app.post('/deleterole', function (req, resp) {

    connection.query("DELETE  FROM user_role where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});

app.post('/roledetails', function (req, resp) {

    connection.query("SELECT ur.*,r.role  FROM user_role ur join role r on r.id=ur.role_id where ur.id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
        }

    });
});
app.post('/roleupdates', function (req, resp) {
    var  value1 = {role: req.body.role};
    var condition = {id:req.body.id};

    connection.query('UPDATE role SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});

app.post('/addcategory', function (req, resp) {
    var addtime=Date.now();
    var status=1;

    value1 = {cat_name: req.body.cat_name, cat_url: req.body.cat_url, cat_desc: req.body.cat_desc,parent_cat:req.body.parent_cat,cat_image:req.body.file,priority:req.body.priority,status:status,create_time:addtime};
    console.log("Insert command");
    connection.query('INSERT INTO category SET ?', value1, function (err,result) {
        if (err) {
            resp.send("ERROR IN QUERY");
        } else {
            console.log("Insertion Successful." + result);
            console.log('Inserted ' + result.affectedRows + ' rows');
            //  connection.end();
            resp.send(result);

        }
    });
});

app.get('/categorylist', function (req, resp) {
    connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){

        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
});
app.get('/servicecategorylist', function (req, resp) {
    // var cond='NULL';

    //SELECT c.*, p.cat_name as parent_catename FROM category c LEFT JOIN category p ON c.parent_cat = p.id

    connection.query("SELECT * from category where parent_cat=12 order by priority desc ", function(error,rows,fields){

        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
});
app.get('/productcategorylist', function (req, resp) {
    // var cond='NULL';

    //SELECT c.*, p.cat_name as parent_catename FROM category c LEFT JOIN category p ON c.parent_cat = p.id

    connection.query("SELECT * from category where id!=12 and parent_cat!=12 and status=1 ", function(error,rows,fields){

        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
});

app.get('/parentcategorylist', function (req, resp) {
   // var cond='NULL';

    //SELECT c.*, p.cat_name as parent_catename FROM category c LEFT JOIN category p ON c.parent_cat = p.id

    connection.query("SELECT * from category ", function(error,rows,fields){

        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
});

app.post('/categorydetails', function (req, resp) {

    connection.query("SELECT *  FROM category where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
        }

    });
});
app.post('/categoryupdates', function (req, resp) {
    value1 = {cat_name: req.body.cat_name, cat_url: req.body.cat_url, cat_desc: req.body.cat_desc,parent_cat:req.body.parent_cat,cat_image:req.body.file,priority:req.body.priority};
    var condition = {id:req.body.id};

    connection.query('UPDATE category SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/categoryupdatestatus', function (req, resp) {
    var  value1 = {status: req.body.status};
    var condition = {id:req.body.id};

    connection.query('UPDATE category SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});

app.post('/deletecategory', function (req, resp) {

    connection.query("DELETE  FROM category where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});

app.post('/addproduct', function (req, resp) {
    var addtime=Date.now();
    var status=1;

    value1 = {product_name: req.body.product_name, product_desc: req.body.product_desc, category_id: req.body.category_id,product_file:req.body.file,status:status,priority:req.body.priority,price:req.body.price,is_featured:1,addfile:req.body.addfile};
    console.log("Insert command");
    connection.query('INSERT INTO product SET ?', value1, function (err,result) {
        if (err) {
            resp.send("ERROR IN QUERY");
        } else {
            console.log("Insertion Successful." + result);
            console.log('Inserted ' + result.affectedRows + ' rows');
            //  connection.end();
            resp.send(result);

        }
    });
});

app.get('/productlist', function (req, resp) {
    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT p.*,c.cat_name  FROM product p inner join category c on p.category_id=c.id", function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
           // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})
app.post('/allproductlist', function (req, resp) {
 /*   var str;
    if(req.body.id==0){
        str='';
    }
    else{
        str=" and p.category_id="+req.body.id;
    }
*///console.log("SELECT p.*,c.cat_name,c.cat_image,c.id as catid FROM category c  join product p on p.category_id=c.id where c.parent_cat!=12  "+str);
    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT p.*,c.cat_name,c.cat_image,c.id as catid FROM category c  left join product p on p.category_id=c.id where c.parent_cat!=12 and p.category_id!=12  ", function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})
app.post('/allproductlistbycategory', function (req, resp) {
    var str;
     if(req.body.id==0){
     str='';
     }
     else{
     str=" and p.category_id="+req.body.id;
     }
    /*
     *///console.log("SELECT p.*,c.cat_name,c.cat_image,c.id as catid FROM category c  join product p on p.category_id=c.id where c.parent_cat!=12  "+str);
    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT p.*,c.cat_name,c.cat_image,c.id as catid FROM category c  left join product p on p.category_id=c.id where c.parent_cat!=12 and p.category_id!=12 "+str, function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})
app.get('/serviceproductlist', function (req, resp) {

    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT p.*,c.cat_name,c.cat_image,c.id as catid FROM product p left join category c on p.category_id=c.id where c.parent_cat=12 and p.status=1 order by p.category_id", function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})
app.post('/serviceproductlistbycategory', function (req, resp) {

    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT p.*,c.cat_name,c.cat_image,c.cat_desc,c.id as catid FROM category c  join product p on p.category_id=c.id where c.id =?",[req.body.id], function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})



app.post('/productdetails', function (req, resp) {

    connection.query("SELECT *  FROM product where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
        }

    });
});
app.post('/productupdates', function (req, resp) {
    value1 = {product_name: req.body.product_name, product_desc: req.body.product_desc, category_id: req.body.category_id,product_file:req.body.file,priority:req.body.priority,price:req.body.price,addfile:req.body.addfile};
    var condition = {id:req.body.id};

    connection.query('UPDATE product SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/deleteproduct', function (req, resp) {

    connection.query("DELETE  FROM product where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/productupdatefeature', function (req, resp) {
    var  value1 = {is_featured: req.body.is_featured};
    var condition = {id:req.body.id};

    connection.query('UPDATE product SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/productupdatestatus', function (req, resp) {
    var  value1 = {status: req.body.status};
    var condition = {id:req.body.id};

    connection.query('UPDATE product SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});


app.post('/addnewsletter', function (req, resp) {
    var addtime=Date.now();
    var status=1;

    value1 = {newsletter_name: req.body.newsletter_name, newsletter_desc: req.body.newsletter_desc,newsletter_file:req.body.file,status:status,priority:req.body.priority};
    console.log("Insert command");
    connection.query('INSERT INTO newsletter SET ?', value1, function (err,result) {
        if (err) {
            resp.send("ERROR IN QUERY");
        } else {
            console.log("Insertion Successful." + result);
            console.log('Inserted ' + result.affectedRows + ' rows');
            //  connection.end();
            resp.send(result);

        }
    });
});

app.get('/newsletterlist', function (req, resp) {
    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT * FROM newsletter", function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})
app.post('/newsletterupdatestatus', function (req, resp) {
    var  value1 = {status: req.body.status};
    var condition = {id:req.body.id};

    connection.query('UPDATE newsletter SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/deletenewsletter', function (req, resp) {

    connection.query("DELETE  FROM newsletter where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/newsletterdetails', function (req, resp) {

    connection.query("SELECT *  FROM newsletter where id = ?",[req.body.id],function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send(JSON.stringify(rows));
        }

    });
});
app.post('/newsletterupdates', function (req, resp) {
    value1 = {newsletter_name: req.body.newsletter_name, newsletter_desc: req.body.newsletter_desc,newsletter_file:req.body.file,priority:req.body.priority};
    var condition = {id:req.body.id};

    connection.query('UPDATE newsletter SET ? WHERE ?', [value1, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});

app.post('/orderlist', function (req, resp) {
    var condition='';
    if(typeof(req.body.ueser_id)!='undefined'){
        condition=" where o.id ="+req.body.userid;
    }
    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT o.*,IFNULL(u.fname,o.`bill_name`) as newfname,IFNULL(u.lname,'') as newlname FROM order_details o left join user u on o.user_id=u.id "+condition, function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})

app.post('/accountorderlist', function (req, resp) {

    // connection.query("SELECT `c`.*,IFNULL(`p`.`cat_name`,'') AS `parent_name` FROM `category` AS `c` LEFT JOIN `category` AS `p` ON `p`.id = `c`.`parent_cat` ",function(error,rows,fields){
    connection.query("SELECT o.*,u.fname,u.lname FROM order_details o join user u on o.user_id=u.id where o.user_id="+req.body.userid, function (error, rows, fields) {
        if (!!error) console.log('error in db call ');
        else {

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // console.log(JSON.stringify(rows.category_id))
            resp.send(JSON.stringify(rows));
            //connection.end();
        }

    });
})
app.post('/orderupdatestatus', function (req, resp) {
    var  value = {order_status: req.body.status};
    var condition = {id:req.body.id};

    connection.query('UPDATE order_details SET ? WHERE ?', [value, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});


app.post('/login', function (req, resp) {
    var retstatus = {};

    var crypto = require('crypto');

    var secret = req.body.password;
    var hash = crypto.createHmac('sha256', secret)
        .update('password')
        .digest('hex');



    connection.query("SELECT * FROM user WHERE email = ? AND password = ?",[req.body.email,hash],function(error,rows,fields){

        if(!!error){
            retstatus = {'error':1,'msg':'Failed internal error.'};
            resp.send(JSON.stringify(retstatus));
            return;
        }
        else{

            if (rows.length  > 0) {
                        if (rows[0].status==1) {

                            connection.query("SELECT u.*,ur.role_id,r.role FROM user u inner join user_role ur on ur.user_id=u.id  inner join role r on r.id=ur.role_id  WHERE u.email = ? AND u.password = ?",[req.body.email,hash],function(error1,rows1,fields1){
                                if(!!error1){
                                    retstatus = {'error':1,'msg':'Failed internal error.'};
                                    resp.send(JSON.stringify(retstatus));
                                    return;
                                }
                                else{
                                    //console.log(rows1);
                                    retstatus = {'error':0,'res':rows1};
                                    resp.send(JSON.stringify(retstatus));
                                    return;
                                }
                            });

                        }
                        else{
                            retstatus = {'error':1,'msg':'Your account is blocked.'};
                            resp.send(JSON.stringify(retstatus));
                            return;
                        }


            }else{
                retstatus = {'error':1,'msg':'Invalid username/password.'};
                resp.send(JSON.stringify(retstatus));

                return;
            }

        }


    });

});

app.post('/addtocart', function (req, resp) {
    var  value = {userid: req.body.userid,pid:req.body.pid,qty:req.body.qty};
    pid=req.body.pid;
    userid=req.body.userid;
    qty=req.body.qty;
   // var condition = {id:req.body.id};
    console.log(2);
    arr=[];
    connection.query('CALL addtocart5('+pid+','+qty+','+userid+')',
        function(err,rows){
            if (err) throw err;

            connection.query("SELECT p.*,ca.cat_name,ca.parent_cat,c.pid,c.qty FROM cart c  join product p on p.id=c.pid left join category ca on ca.id=p.category_id where c.userid = "+userid+" GROUP BY c.pid  ", function (error, rows, fields) {
                if (!!error) console.log('error in db call ');
                else {


                    resp.send(JSON.stringify(rows));
                   // resp.send("SELECT p.*,c.pid,c.qty FROM cart c  join product p on p.id=c.pid where c.userid = '"+userid+"' GROUP BY c.pid ");
                    //connection.end();
                }

            });
        }
    );
});

app.post('/cartdetails', function (req, resp) {
    userid=req.body.userid;
            connection.query("SELECT p.*,ca.cat_name,ca.parent_cat,c.pid,c.qty FROM cart c  join product p on p.id=c.pid left join category ca on ca.id=p.category_id where c.userid = "+userid+" GROUP BY c.pid ", function (error, rows, fields) {
                if (!!error) console.log('error in db call ');
                else {
                    resp.send(JSON.stringify(rows));
                    // resp.send("SELECT p.*,c.pid,c.qty FROM cart c  join product p on p.id=c.pid where c.userid = '"+userid+"' GROUP BY c.pid ");
                    //connection.end();
                }

            });
});

app.post('/updatecartuser', function (req, resp) {
    var  value = {userid: req.body.newuserid};
    var condition = {userid:req.body.olduserid};

    connection.query('UPDATE cart SET ? WHERE ?', [value, condition] ,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            resp.send("success");
        }

    });
});
app.post('/updatecart', function (req, resp) {
    userid=req.body.userid;
/*
    var  value = {qty: req.body.qty};
    var condition = {userid:req.body.userid,pid:req.body.pid};
*/
    connection.query("UPDATE cart SET qty = "+req.body.qty+" WHERE userid="+req.body.userid+" and pid="+req.body.pid ,function(error1,rows1,fields1){

        if(error1) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            connection.query("SELECT p.*,ca.cat_name,ca.parent_cat,c.pid,c.qty FROM cart c  join product p on p.id=c.pid left join category ca on ca.id=p.category_id where c.userid = "+userid+" GROUP BY c.pid ", function (error, rows, fields) {
                if (!!error) console.log('error in db call ');
                else {
                    resp.send(JSON.stringify(rows));
                    // resp.send("SELECT p.*,c.pid,c.qty FROM cart c  join product p on p.id=c.pid where c.userid = '"+userid+"' GROUP BY c.pid ");
                    //connection.end();
                }

            });
        }

    });
});
app.post('/removecart', function (req, resp) {
    userid=req.body.userid;
/*
    var  value = {qty: req.body.qty};
    var condition = {userid:req.body.userid,pid:req.body.pid};
*/

    connection.query("DELETE FROM cart WHERE userid="+req.body.userid+" and pid="+req.body.pid,function(error1,rows1,fields1){

        if(error1) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            connection.query("SELECT p.*,ca.cat_name,ca.parent_cat,c.pid,c.qty FROM cart c  join product p on p.id=c.pid left join category ca on ca.id=p.category_id where c.userid = "+userid+" GROUP BY c.pid", function (error, rows, fields) {
                if (!!error) console.log('error in db call ');
                else {
                    resp.send(JSON.stringify(rows));
                    // resp.send("SELECT p.*,c.pid,c.qty FROM cart c  join product p on p.id=c.pid where c.userid = '"+userid+"' GROUP BY c.pid ");
                    //connection.end();
                }

            });
        }

    });
});
app.post('/allremovecart', function (req, resp) {
    /*
     var  value = {qty: req.body.qty};
     var condition = {userid:req.body.userid,pid:req.body.pid};
     */

    connection.query("DELETE FROM cart WHERE userid="+req.body.userid,function(error,rows,fields){

        if(error) {
            console.log('error in db call ');

            resp.send("failed");
        }
        else{

            resp.send(JSON.stringify(rows));

        }

    });
});

app.post('/statelist', function (req, resp) {
    var country=
    connection.query("SELECT * FROM state WHERE i_cnt_id = ?",[req.body.country_id],function(error,rows,fields){
        console.log(error);
        if(!!error) console.log('error in db call ');
        else{

            console.log('success full query');
            //resp.send('Hello'+rows[0].fname);
            // connection.end();
            resp.send(JSON.stringify(rows));

        }

    });
});

app.post('/addorder', function (req, resp) {
    var addtime=Date.now();
    var status=1;
    var  stat={};
   var product_details=JSON.parse(req.body.product_det);
//console.log(product_details);

    value1 = {
        user_id:req.body.user_id,
        transaction_id:req.body.transaction_id,
        order_time:addtime,
        order_subtotal:req.body.subtotal,
        order_total:req.body.total,
        tax:req.body.tax,
        shipping_charge:req.body.shipping_charge,
        order_status:1,
        bill_name:req.body.bill_name,
        bill_company:req.body.bill_company,
        bill_address:req.body.bill_address,
        bill_address2:req.body.bill_address2,
        bill_city:req.body.bill_city,
        bill_country:254,
        bill_state:req.body.bill_state,
        bill_zip:req.body.bill_zip,
        bill_phone:req.body.bill_phone,
        bill_email:req.body.bill_email,
        ship_name:req.body.ship_name,
        ship_company:req.body.ship_company,
        ship_address:req.body.ship_address,
        ship_address2:req.body.ship_address2,
        ship_city:req.body.ship_city,
        ship_country:254,
        ship_state:req.body.ship_state,
        ship_zip:req.body.ship_zip,
        ship_phone:req.body.ship_phone,
        affiliate_id:0,
        aff_commission_type:0,
        aff_commission_value:0,
        aff_commission_amount:0

    };


  //  console.log(req.body.product_det);
    connection.query('INSERT INTO order_details SET ?', value1, function (err,result) {
        if (err) {
            stat={'error':1,'msg':'ERROR IN QUERY'};
            resp.send(stat);
            return;
        } else {
           // console.log("Insertion Successful." + result);
           // console.log('Inserted ' + result.insertId + ' rows');
            var order_id=result.insertId;

            for(res in product_details){
            var   value = {
                    order_id:order_id,
                    product_id:product_details[res].id,
                    product_name:product_details[res].product_name,
                    product_price:product_details[res].price,
                    quantity:product_details[res].qty,

                };
                connection.query('INSERT INTO order_product_details SET ?', value, function (err1,result1) {





                });
            }


            //  connection.end();


        }
        var extend = require('extend');
        connection.query("SELECT od.*,sb.s_st_name as billstate,ss.s_st_name as shipstate FROM order_details  od join state sb  on sb.id=od.bill_state join state ss on ss.id=od.ship_state   WHERE od.id = ?",[order_id],function(error,rows,fields){
            console.log(error);
            if(!!error) console.log('error in db call ');
            else{

                if (rows.length  > 0) {
                    var orderDet = rows[0];

                    connection.query("SELECT opd.*,p.category_id,c.cat_name FROM order_product_details AS opd INNER JOIN product AS p ON p.id = opd.product_id INNER JOIN category AS c ON c.id = p.category_id WHERE order_id = ?",[order_id],function(error2,rows2,fields2){
                        if(rows2.length > 0){
                            var orderProduct = rows2;

                        }else{
                            var orderProduct = [];
                        }

                        extend(orderDet, orderDet, {orderProduct:orderProduct});

                        retstatus = orderDet;

                        var  product='';
                        var subtotal=0.00;
                        var i=1;
                        for(x in orderProduct){
                            subtotal = parseFloat(subtotal)+parseFloat(parseFloat(orderProduct[x].product_price)*parseFloat(orderProduct[x].quantity));
                            product +='<tr>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">'+i+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">'+orderProduct[x].cat_name+' - '+orderProduct[x].product_name+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">'+orderProduct[x].quantity+'</td>\
                    \<td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%">$'+orderProduct[x].product_price.toFixed(2)+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "><span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(orderProduct[x].product_price*orderProduct[x].quantity).toFixed(2)+'</span></td>\
                    </tr>';
                            i++;
                        }


                        var html;
                        html ='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitio.dtd">\
                        <html xmlns="http://www.w3.org/1999/xhtml">\
                        <head>\
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                        <meta name="viewport" content="width=device-width, initial-scale=1" />\
                        <title>Order Details</title>\
                        <style>\
                        @font-face{\
                        @import url(https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900);\
                        }\
                        </style>\
                    </head>\
                    <body  class="body" style="padding:0; margin:0; display:block; background:#eeebeb; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;font-family: \'Raleway\';" bgcolor="#eeebeb">\
                    <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                        <tr>\
                        <td align="center" valign="top" style="background-color:#eeebeb" width="100%">\
                        <table cellspacing="0" cellpadding="0" width="600" class="w320">\
                        <tr>\
                        <td align="center" valign="top">\
                        <table style="margin:0 auto;" cellspacing="0" cellpadding="0" width="100%">\
                        <tr>\
                        <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;">\
                        <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                        </td>\
                        </tr>\
                        </table>\
                        <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                        <tr>\
                        <td style="background-color:#ffffff; padding-top: 15px;">\
                        <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;" cellspacing="0" cellpadding="0">\
                        <tr>\
                        <td colspan="2" style="text-align: center;vertical-align: top; font-family: \'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                        Your Order Details\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="text-align:left; vertical-align:top;font-family: \'Raleway\'; color: #4c4c4c;font-size: 16px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                        <span style="font-size: 24px; line-height:26px; color: #000;">Invoice 00'+retstatus.id+'</span><br>\
                    <span>'+timeConverter(retstatus.order_time)+'</span>\
                    </td>\
                    <td style="text-align:right; vertical-align:top;font-family: \'Raleway\'; color: #4c4c4c;font-size: 16px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                        <span>Order ID: '+retstatus.id+'</span><br>\
                    <span>Order Date: '+timeConverter(retstatus.order_time)+'</span>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2">\
                        <table style="margin:5px auto; width: 100% !important;padding: 0px 10px; background:#f3f3f3;" cellspacing="0" cellpadding="0">\
                        <tr>\
                        <td style="width:48%;padding:25px 0 0 2%;" align="left" valign="top">\
                        <span style="background:#e59205;width:89%;padding:8px 0 7px 5%; text-transform: uppercase;font-weight: bold; font-size:18px;color:#fff;display:block;font-family: \'Raleway\';">Billed To</span>\
                    </td>\
                    <td style="width:48%;padding:25px 2% 0 0;" align="right" valign="top">\
                        <span style="background:#e59205; text-transform: uppercase;font-weight: bold;width:89%;padding:8px 0 7px 5%;font-size:18px;color:#fff;text-align:left;display:block;font-family: \'Raleway\';">Shipped To</span>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="width:48%;padding:0px 0 0 2%;" align="left" valign="top">\
                        <table style="border:solid 1px #e0e0e0;font-size:14px;color:#4c4c4c;padding:0%; background:#fff; background-color:#fff;font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="5" width="94%">\
                        <tbody><tr>\
                        <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Name : '+retstatus.bill_name+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Address : '+retstatus.bill_address+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">City : '+retstatus.bill_city+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">State : '+retstatus.billstate+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Zip : '+retstatus.bill_zip+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Email : <a href="mailto:'+retstatus.bill_email+'" target="_blank">'+retstatus.bill_email+'</a></td>\
                    </tr>\
                    </tbody></table>\
                    </td>\
                    <td style="width:48%;padding:0px 2% 0 0;font-family: \'Raleway\';" align="right" valign="top">\
                        <table style="border:solid 1px #e0e0e0;font-size:14px;color:#4c4c4c;padding:0%; background:#fff; background-color:#fff;font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="5" width="94%">\
                        <tbody><tr>\
                        <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Name : '+retstatus.ship_name+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Address : '+retstatus.ship_address+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">City : '+retstatus.ship_city+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">State : '+retstatus.shipstate+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Zip : '+retstatus.ship_zip+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">&nbsp;</td>\
                    </tr>\
                    </tbody></table>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" align="center" valign="middle">\
                        <table style="margin:25px 0;border:solid 1px #c6c6c6;border-bottom:none;font-size:13px; color:#4c4c4c; background:#fff; background-color:#fff;font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="0" width="96%">\
                        <tbody><tr>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%;text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="left" valign="middle" width="15%">Item</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="left" valign="middle" width="40%">Name</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="10%">Qty</th>\
                        \<th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="15%">Price</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="20%">Amount</th>\
                        </tr>'+product+'\
                    <tr>\
                      <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px">Sub total</span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "> <span style="display:inline-block;text-align:right;width:76px">$'+subtotal.toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                      <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Shipping </span> </td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% ">\                        \
                    <span style="display:inline-block;text-align:right;width:76px;font-family: \'Raleway\';"> $'+parseFloat(retstatus.shipping_charge).toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Tax Rate </span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "><span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(retstatus.tax).toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                     <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Total </span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "> <span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(retstatus.order_total).toFixed(2)+'</span></td>\
                    </tr>\
                    </tbody>\
                        </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 30px; text-transform:uppercase;">\
                        <a style="font-family: \'Raleway\';color: #4c4c4c;" href="http://hohspastudio.com/appointment">Book Your Appointment Online Now!</a>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                        -- Hands of Healing Team\
                    </td>\
                    </tr>\
                    </table>\
                    <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                        <tr>\
                        <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                        <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                        <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                        </td>\
                        </tr>\
                       <tr>\
                        <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="font-size:12px;">\
                        &nbsp;\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </body>\
                    </html>'



                        var smtpTransport = mailer.createTransport("SMTP", {
                            service: "Gmail",
                            auth: {
                                user: "itplcc40@gmail.com",
                                pass: "DevelP7@"
                            }
                        });

                        var mail = {
                            from: "Admin <samsujdev@gmail.com>",
                            to: retstatus.bill_email,
                            subject: "Order Details",
                            //text: "Node.js New world for me",
                            html: html
                        }

                        smtpTransport.sendMail(mail, function (error, response) {
                            //  resp.send((response.message));
                            smtpTransport.close();
                        });
                        stat = {'error':0,'order_id':order_id};
                        resp.send(JSON.stringify(stat));
                        return;
                        // resp.send(JSON.stringify(retstatus.bill_email));
                        // return;

                    });






                }else{

                    stat = {'error':1,'msg':'Failed internal error.'};
                    resp.send(JSON.stringify(stat));
                    return;
                }

            }

        });

    });


});

app.post('/orderdetails', function (req, resp) {

    var extend = require('extend');
        connection.query("SELECT * FROM order_details WHERE id = ?",[req.body.order_id],function(error,rows,fields){
            console.log(error);
            if(!!error) console.log('error in db call ');
            else{

                if (rows.length  > 0) {
                    var orderDet = rows[0];

                    connection.query("SELECT opd.*,p.category_id,c.cat_name FROM order_product_details AS opd INNER JOIN product AS p ON p.id = opd.product_id INNER JOIN category AS c ON c.id = p.category_id WHERE order_id = ?",[req.body.order_id],function(error2,rows2,fields2){
                        if(rows2.length > 0){
                            var orderProduct = rows2;

                        }else{
                            var orderProduct = [];
                        }

                        extend(orderDet, orderDet, {orderProduct:orderProduct});

                        retstatus = orderDet;

                        resp.send(JSON.stringify(retstatus));
                        return;

                    });






                }else{

                    retstatus = {'error':1,'msg':'Failed internal error.'};
                    resp.send(JSON.stringify(retstatus));
                    return;
                }

            }

        });
});

app.post('/duplicatemail', function (req, resp) {
  var  stat={};
    var extend = require('extend');
    connection.query("SELECT od.*,sb.s_st_name as billstate,ss.s_st_name as shipstate FROM order_details  od join state sb  on sb.id=od.bill_state join state ss on ss.id=od.ship_state   WHERE od.id = ?",[req.body.order_id],function(error,rows,fields){
        console.log(error);
        if(!!error) console.log('error in db call ');
        else{

            if (rows.length  > 0) {
                var orderDet = rows[0];

                connection.query("SELECT opd.*,p.category_id,c.cat_name FROM order_product_details AS opd INNER JOIN product AS p ON p.id = opd.product_id INNER JOIN category AS c ON c.id = p.category_id WHERE order_id = ?",[req.body.order_id],function(error2,rows2,fields2){
                    if(rows2.length > 0){
                        var orderProduct = rows2;

                    }else{
                        var orderProduct = [];
                    }

                    extend(orderDet, orderDet, {orderProduct:orderProduct});

                    retstatus = orderDet;

                    var  product='';
                    var subtotal=0.00;
                    var i=1;
                    for(x in orderProduct){
                        subtotal = parseFloat(subtotal)+parseFloat(parseFloat(orderProduct[x].product_price)*parseFloat(orderProduct[x].quantity));
                        product +='<tr>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="left" valign="middle" width="15%">'+i+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="left" valign="middle" width="40%">'+orderProduct[x].cat_name+' - '+orderProduct[x].product_name+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="right" valign="middle" width="10%">'+orderProduct[x].quantity+'</td>\
                    \<td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="right" valign="middle" width="15%">$'+orderProduct[x].product_price.toFixed(2)+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="right" valign="middle" width="20% "><span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(orderProduct[x].product_price*orderProduct[x].quantity).toFixed(2)+'</span></td>\
                    </tr>';
                        i++;
                    }


                    var html;
                     html ='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitio.dtd">\
                        <html xmlns="http://www.w3.org/1999/xhtml">\
                        <head>\
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                        <meta name="viewport" content="width=device-width, initial-scale=1" />\
                        <title>Order Details</title>\
                        <style>\
                        @font-face{\
                        @import url(https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900);\
                        }\
                        </style>\
                        </style>\
                    </head>\
                    <body class="body" style="padding:0; margin:0; display:block; background:#eeebeb; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased;\
                        -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;" bgcolor="#eeebeb">\
                    <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                        <tr>\
                        <td align="center" valign="top" style="background-color:#eeebeb; font-family:\'Raleway\';" width="100%">\
                        <table cellspacing="0" cellpadding="0" width="600" class="w320">\
                        <tr>\
                        <td align="center" valign="top">\
                        <table style="margin:0 auto;" cellspacing="0" cellpadding="0" width="100%">\
                        <tr>\
                        <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;">\
                        <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                        </td>\
                        </tr>\
                        </table>\
                        <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                        <tr>\
                        <td style="background-color:#ffffff; padding-top: 15px;">\
                        <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;"cellspacing="0" cellpadding="0">\
                        <tr>\
                        <td colspan="2" style="text-align: center;vertical-align: top; font-family:\'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                        Your Order Details\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="text-align:left; vertical-align:top;font-family: \'Raleway\'; font-weight: 400; color: #4c4c4c;font-size: 16px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                        <span style="font-size: 24px; line-height:26px; color: #000;">Invoice 00'+retstatus.id+'</span><br>\
                    <span>'+timeConverter(retstatus.order_time)+'</span>\
                    </td>\
                    <td style="text-align:right; vertical-align:top; font-family: \'Raleway\'; font-weight: 400; color: #4c4c4c;font-size: 16px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                        <span>Order ID: '+retstatus.id+'</span><br>\
                    <span>Order Date: '+timeConverter(retstatus.order_time)+'</span>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2">\
                        <table style="margin:5px auto; width: 100% !important;padding: 0px 10px; background:#f3f3f3;" cellspacing="0" cellpadding="0">\
                        <tr>\
                        <td style="width:48%;padding:25px 0 0 2%;" align="left" valign="top">\
                        <span style="background:#e59205;width:89%;padding:8px 0 7px 5%; text-transform: uppercase;font-weight: bold; font-size:18px;color:#fff;display:block; font-family: \'Raleway\'; font-weight: 400;">Billed To</span>\
                    </td>\
                    <td style="width:48%;padding:25px 2% 0 0;" align="right" valign="top">\
                        <span style="background:#e59205; text-transform: uppercase;font-weight: bold;width:89%;padding:8px 0 7px 5%;font-size:18px;color:#fff;text-align:left;display:block; font-family: \'Raleway\'; font-weight: 400;">Shipped To</span>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="width:48%;padding:0px 0 0 2%" align="left" valign="top">\
                        <table style="border:solid 1px #e0e0e0;font-size:14px;color:#4c4c4c;padding:0%; background:#fff; background-color:#fff; font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="5" width="94%">\
                        <tbody><tr>\
                        <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">Name : '+retstatus.bill_name+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">Address : '+retstatus.bill_address+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: font-family: \'Raleway\';">City : '+retstatus.bill_city+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">State : '+retstatus.billstate+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">Zip : '+retstatus.bill_zip+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">Email : <a href="mailto:'+retstatus.bill_email+'" target="_blank">'+retstatus.bill_email+'</a></td>\
                    </tr>\
                    </tbody></table>\
                    </td>\
                    <td style="width:48%;padding:0px 2% 0 0" align="right">\
                        <table style="border:solid 1px #e0e0e0;font-size:14px;color:#4c4c4c;padding:0%; background:#fff; background-color:#fff; font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="5" width="94%">\
                        <tbody><tr>\
                        <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">Name : '+retstatus.ship_name+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">Address : '+retstatus.ship_address+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">City : '+retstatus.ship_city+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">State : '+retstatus.shipstate+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">Zip : '+retstatus.ship_zip+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px; font-family: \'Raleway\';">&nbsp;</td>\
                    </tr>\
                    </tbody></table>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" align="center" valign="middle">\
                        <table style="margin:25px 0;border:solid 1px #c6c6c6;border-bottom:none;font-size:13px; color:#4c4c4c; background:#fff; background-color:#fff;font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="0" width="96%">\
                        <tbody><tr>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%;text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="left" valign="middle" width="15%">Item</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="left" valign="middle" width="40%">Name</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="10%">Qty</th>\
                        \<th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="15%">Price</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="20%">Amount</th>\
                        </tr>'+product+'\
                    <tr>\
                      <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px">Sub total</span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="right" valign="middle" width="20% "> <span style="display:inline-block;text-align:right;width:76px">$'+subtotal.toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                      <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%; font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Shipping </span> </td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% ">\                        <span style="display:inline-block;text-align:right;width:76px"> $'+parseFloat(retstatus.shipping_charge).toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Tax Rate </span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "><span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(retstatus.tax).toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                     <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Total </span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "> <span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(retstatus.order_total).toFixed(2)+'</span></td>\
                    </tr>\
                    </tbody>\
                        </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 30px; text-transform:uppercase;">\
                        <a style="font-family: \'Raleway\';color: #4c4c4c;" href="http://hohspastudio.com/appointment">Book Your Appointment Online Now!</a>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                        -- Hands of Healing Team\
                    </td>\
                    </tr>\
                    </table>\
                    <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                        <tr>\
                        <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                        <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                        <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                        </td>\
                        </tr>\
                       <tr>\
                        <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="font-size:12px;">\
                        &nbsp;\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </body>\
                    </html>'



                    var smtpTransport = mailer.createTransport("SMTP", {
                        service: "Gmail",
                        auth: {
                            user: "itplcc40@gmail.com",
                            pass: "DevelP7@"
                        }
                    });

                    var mail = {
                        from: "Admin <samsujdev@gmail.com>",
                        to: retstatus.bill_email,
                        subject: "Order Details",
                        //text: "Node.js New world for me",
                        html: html
                    }

                    smtpTransport.sendMail(mail, function (error, response) {
                        //  resp.send((response.message));
                        smtpTransport.close();
                    });
                    stat = {'error':0};
                    resp.send(JSON.stringify(stat));
                    return;
                   // resp.send(JSON.stringify(retstatus.bill_email));
                   // return;

                });






            }else{

                stat = {'error':1,'msg':'Failed internal error.'};
                resp.send(JSON.stringify(stat));
                return;
            }

        }

    });
});
app.post('/printpdf', function (req, resp) {
    var  stat={};
    var extend = require('extend');
    connection.query("SELECT od.*,sb.s_st_name as billstate,ss.s_st_name as shipstate FROM order_details  od join state sb  on sb.id=od.bill_state join state ss on ss.id=od.ship_state   WHERE od.id = ?",[req.body.order_id],function(error,rows,fields){
        console.log(error);
        if(!!error) console.log('error in db call ');
        else{

            if (rows.length  > 0) {
                var orderDet = rows[0];

                connection.query("SELECT opd.*,p.category_id,c.cat_name FROM order_product_details AS opd INNER JOIN product AS p ON p.id = opd.product_id INNER JOIN category AS c ON c.id = p.category_id WHERE order_id = ?",[req.body.order_id],function(error2,rows2,fields2){
                    if(rows2.length > 0){
                        var orderProduct = rows2;

                    }else{
                        var orderProduct = [];
                    }

                    extend(orderDet, orderDet, {orderProduct:orderProduct});

                    retstatus = orderDet;

                    var  product='';
                    var subtotal=0.00;
                    var i=1;
                    for(x in orderProduct){
                        subtotal = parseFloat(subtotal)+parseFloat(parseFloat(orderProduct[x].product_price)*parseFloat(orderProduct[x].quantity));
                        product +='<tr>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">'+i+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">'+orderProduct[x].cat_name+' - '+orderProduct[x].product_name+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">'+orderProduct[x].quantity+'</td>\
                    \<td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%">$'+orderProduct[x].product_price.toFixed(2)+'</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "><span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(orderProduct[x].product_price*orderProduct[x].quantity).toFixed(2)+'</span></td>\
                    </tr>';
                        i++;
                    }


                    var html;
                    html ='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitio.dtd">\
                        <html xmlns="http://www.w3.org/1999/xhtml">\
                        <head>\
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
                        <meta name="viewport" content="width=device-width, initial-scale=1" />\
                        <title>Order Details</title>\
                        <link href=\'https://fonts.googleapis.com/css?family=Raleway:400,600,700,500,800,900\'>\
                        <style>\
                        @media screen{\
                         .webfont {\
                         font-family: ‘Raleway’, Arial, sans-serif !important;\
                         }\
                         }\
                        </style>\
                        </head>\
                    <body  class="body" style="padding:0; margin:0; display:block; background:#eeebeb; -webkit-text-size-adjust:none; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none;width: 100%; height: 100%; color: #6f6f6f; font-weight: 400; font-size: 18px;font-family: \'Raleway\';" bgcolor="#eeebeb">\
                    <table align="center" cellpadding="0" cellspacing="0" width="100%">\
                        <tr>\
                        <td align="center" valign="top" style="background-color:#eeebeb" width="100%">\
                        <table cellspacing="0" cellpadding="0" width="600" class="w320">\
                        <tr>\
                        <td align="center" valign="top">\
                        <table style="margin:0 auto;" cellspacing="0" cellpadding="0" width="100%">\
                        <tr>\
                        <td style="text-align: center; padding-top: 10px; padding-bottom: 10px;">\
                        <a href="#"><img class="w320" width="311"  src="http://hohspastudio.com/images/img-emaillogohandsoghealing.png" alt="company logo" /></a>\
                        </td>\
                        </tr>\
                        </table>\
                        <table cellspacing="0" cellpadding="0" class="force-full-width" bgcolor="#ffffff" >\
                        <tr>\
                        <td style="background-color:#ffffff; padding-top: 15px;">\
                        <table style="margin:0 auto; width: 100% !important;padding: 0px 10px;"cellspacing="0" cellpadding="0">\
                        <tr>\
                        <td colspan="2" style="text-align: center;vertical-align: top; font-family: \'Raleway\'; font-size: 30px;color: #be4622;text-transform: uppercase;font-weight: bold;padding-top: 9px;">\
                        Your Order Details\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="text-align:left; vertical-align:top;font-family: \'Raleway\'; color: #4c4c4c;font-size: 16px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                        <span style="font-size: 24px; line-height:26px; color: #000;">Invoice 00'+retstatus.id+'</span><br>\
                    <span>'+timeConverter(retstatus.order_time)+'</span>\
                    </td>\
                    <td style="text-align:right; vertical-align:top;font-family: \'Raleway\'; color: #4c4c4c;font-size: 16px;line-height: 24px; padding-top:10px; padding-bottom:10px;">\
                        <span>Order ID: '+retstatus.id+'</span><br>\
                    <span>Order Date: '+timeConverter(retstatus.order_time)+'</span>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2">\
                        <table style="font-family: \'Raleway\'; margin:5px auto; width: 100% !important;padding: 0px 10px; background:#f3f3f3;" cellspacing="0" cellpadding="0">\
                        <tr>\
                        <td style="width:48%;padding:25px 0 0 2%;font-family: \'Raleway\';" align="left" valign="top">\
                        <span style="background:#e59205;width:89%;padding:8px 0 7px 5%; text-transform: uppercase;font-weight: bold; font-size:18px;color:#fff;display:block">Billed To</span>\
                    </td>\
                    <td style="width:48%;padding:25px 2% 0 0;font-family: \'Raleway\';" align="right" valign="top">\
                        <span style="background:#e59205; text-transform: uppercase;font-weight: bold;width:89%;padding:8px 0 7px 5%;font-size:18px;color:#fff;text-align:left;display:block">Shipped To</span>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="width:48%;padding:0px 0 0 2%;font-family: \'Raleway\';" align="left" valign="top">\
                        <table style="border:solid 1px #e0e0e0;font-size:14px;color:#4c4c4c;padding:0%; background:#fff; background-color:#fff;" border="0" cellpadding="0" cellspacing="5" width="94%">\
                        <tbody><tr>\
                        <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Name : '+retstatus.bill_name+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Address : '+retstatus.bill_address+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">City : '+retstatus.bill_city+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">State : '+retstatus.billstate+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Zip : '+retstatus.bill_zip+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Email : <a href="mailto:'+retstatus.bill_email+'" target="_blank">'+retstatus.bill_email+'</a></td>\
                    </tr>\
                    </tbody></table>\
                    </td>\
                    <td style="width:48%;padding:0px 2% 0 0" align="right">\
                        <table style="border:solid 1px #e0e0e0;font-size:14px;color:#4c4c4c;padding:0%; background:#fff; background-color:#fff;font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="5" width="94%">\
                        <tbody><tr>\
                        <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Name : '+retstatus.ship_name+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Address : '+retstatus.ship_address+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">City : '+retstatus.ship_city+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">State : '+retstatus.shipstate+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">Zip : '+retstatus.ship_zip+'</td>\
                    </tr>\
                    <tr>\
                    <td style="background:#fff;width:90%;padding:6px;font-family: \'Raleway\';">&nbsp;</td>\
                    </tr>\
                    </tbody></table>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" align="center" valign="middle">\
                        <table style="margin:25px 0;border:solid 1px #c6c6c6;border-bottom:none;font-size:13px; color:#4c4c4c; background:#fff; background-color:#fff;font-family: \'Raleway\';" border="0" cellpadding="0" cellspacing="0" width="96%">\
                        <tbody><tr>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%;text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="left" valign="middle" width="15%">Item</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="left" valign="middle" width="40%">Name</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="10%">Qty</th>\
                        \<th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="15%">Price</th>\
                        <th style="background:#e59205;color:#fff;font-size:14px;padding:10px 2%; text-transform: uppercase;font-weight: bold;font-family: \'Raleway\';" align="right" valign="middle" width="20%">Amount</th>\
                        </tr>'+product+'\
                    <tr>\
                      <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px">Sub total</span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "> <span style="display:inline-block;text-align:right;width:76px">$'+subtotal.toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                      <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Shipping </span> </td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% ">\                        <span style="display:inline-block;text-align:right;width:76px"> $'+parseFloat(retstatus.shipping_charge).toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Tax Rate </span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "><span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(retstatus.tax).toFixed(2)+'</span></td>\
                    </tr>\
                    <tr>\
                     <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="15%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="left" valign="middle" width="40%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="10%">&nbsp;</td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="15%"><span style="display:inline-block;padding-right:5px;text-align:right;width:76px"> Total </span></td>\
                    <td style="border-bottom:solid 1px #c6c6c6;padding:8px 2%;font-family: \'Raleway\';" align="right" valign="middle" width="20% "> <span style="display:inline-block;text-align:right;width:76px">$'+parseFloat(retstatus.order_total).toFixed(2)+'</span></td>\
                    </tr>\
                    </tbody>\
                        </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" style="text-align:center; vertical-align:top;font-family: \'Raleway\';color: #4c4c4c;font-size: 18px;line-height: 30px; text-transform:uppercase;">\
                        Thanks for your order\
                    </td>\
                    </tr>\
                    <tr>\
                    <td colspan="2" style="text-align:right;vertical-align:top;padding-top: 7px; padding-bottom: 15px; font-family: \'Raleway\';">\
                        -- Hands of Healing Team\
                    </td>\
                    </tr>\
                    </table>\
                    <table cellspacing="0" cellpadding="0" bgcolor="#1a1a1a" style="width: 100% !important;">\
                        <tr>\
                        <td style="font-size: 13px; text-align: center; padding: 15px 10px; color: rgb(255, 255, 255); font-family: \'Raleway\';">\
                        <a href="http://hohspastudio.com/treatmentandservices" style="color: #fff; text-decoration: none;">Treatments and Services</a> | <a href="http://hohspastudio.com/products" style="color: #fff; text-decoration: none;">Products</a> | <a href="http://hohspastudio.com/aboutus" style="color: #fff; text-decoration: none;">About the Spa</a> | <a href="http://hohspastudio.com/reviews" style="color: #fff; text-decoration: none;">Reviews</a> | <a href="http://hohspastudio.com/newsletter" style="color: #fff; text-decoration: none;">Newsletter</a> | <a href="http://hohspastudio.com/locations" style="color: #fff; text-decoration: none;">Locations</a> | <a href="http://hohspastudio.com/contactus" style="color: #fff; text-decoration: none;">Contact</a>\
                        </td>\
                        </tr>\
                        <tr>\
                        <td style="width: 100%;text-align: center; margin: 16px auto;margin-top: 26px; font-family: \'Raleway\';">\
                        <a href="https://twitter.com/hohspa" target="_blank"><img src="http://hohspastudio.com/images/tink.jpg" alt="#"></a><a href="https://www.facebook.com/HandsofHealingMassageandSpaStudio/" target="_blank"><img src="http://hohspastudio.com/images/fink.jpg" alt="#"></a><a href="http://www.yelp.com/biz/hands-of-healing-massage-and-spa-studio-hayward" target="_blank"><img src="http://hohspastudio.com/images/yink.jpg" alt="#"></a><a href="https://plus.google.com/101955857908281504686" target="_blank"><img src="http://hohspastudio.com/images/gink.jpg" alt="#"></a>\
                        </td>\
                        </tr>\
                       <tr>\
                        <td style="color:#f0f0f0; font-size: 14px; text-align:center; padding-bottom:4px;padding-top: 10px; font-family: \'Raleway\';">\
                    © Copyright 2016 Hands of Healing. All Rights Reserved.\
                    </td>\
                    </tr>\
                    <tr>\
                    <td style="font-size:12px;">\
                        &nbsp;\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </td>\
                    </tr>\
                    </table>\
                    </body>\
                    </html>'



                   /* var wkhtmltopdf = require('wkhtmltopdf');

                    var fs = require('fs-extra');
// URL
                    var conversion = require("phantom-html-to-pdf")();
                    conversion({ html: "<h1>Hello World</h1>" }, function(err, pdf) {
                        console.log(pdf.logs);
                        console.log(pdf.numberOfPages);
                        pdf.stream.pipe(res);
                    });*/
                    stat = {'error':0};
                    resp.send(JSON.stringify(html));
                    return;
                    // resp.send(JSON.stringify(retstatus.bill_email));
                    // return;

                });






            }else{

                stat = {'error':1,'msg':'Failed internal error.'};
                resp.send(JSON.stringify(stat));
                return;
            }

        }

    });
});

app.post('/contactsubmit', function (req, resp) {
    var contact_time=Date.now();

    var retstatus = {};


    value = {
        fullname: req.body.fullname,
        email: req.body.email,
        phone:req.body. phone,
        message: req.body.message,
        contact_time: contact_time,
    };
                connection.query('INSERT INTO contact SET ?', value, function (err,result) {
                    if (err) {
                        retstatus = {'error':1,'msg':'Failed internal error.'};
                        resp.send(JSON.stringify(retstatus));
                        return ;
                    } else {
                        retstatus = {'error':0};
                        resp.send(JSON.stringify(retstatus));
                        return ;
                    }
                });

});



app.get('/checkauthorize', function (req, resp) {


/*var AuhorizeNet = require('authorize-net');
var client = new AuthorizeNet({
  API_LOGIN_ID: '8bC9Kr3T',
  TRANSACTION_KEY: '9rmaS8y47c2x9BUZ'
});
var Gateways = require('42-cent');
//var client = Gateways.use('Authorize.Net', credentials);
var order={'amount':'9.88'};
var creditcard= {'creditCardNumber':'4111111111111111','expirationMonth':'12','expirationYear':'2017','cvv':'123'};
client.submitTransaction(order,creditcard);*/



var service=require('node-authorize-net')('8bC9Kr3T','9rmaS8y47c2x9BUZ');
 
    service.authCaptureTransaction(9.33, 4111111111111111, 2018, 11).then(function (transaction) {
        
        //process the response 
        
        //assert.equal(transaction.transactionResponse.responseCode, '1');
resp.send(transaction);
    });



/*var AuthorizeRequest = require('auth-net-request');

var Request = new AuthorizeRequest({
  api: '8bC9Kr3T',
  key: '9rmaS8y47c2x9BUZ',
  cert: './authonet/cert.pem',
  rejectUnauthorized: false, // true
  requestCert: true, // false
  agent: false ,
  sandbox: true 
});

Request.send('createTransaction', Request, false, function(err, response) {

resp.send(response+'error'+err);
});*/




    /*var AuthorizeGateway = require('node_modules/authorize-net/lib/AuthorizeNetGateway.js');


    var AuhorizeNet = require('authorize-net');
    var client = new AuthorizeNet({
        API_LOGIN_ID: '8bC9Kr3T',
        TRANSACTION_KEY: '9rmaS8y47c2x9BUZ'
    });

    var service = AuthorizeGateway(client);*/

   /* var amount = 0.99;
    var cardNumber = '5454545454545454';
    var expirationYear = '2017';
    var expirationMonth = '01';

    service.authCaptureTransaction(amount, cardNumber, expirationYear, expirationMonth).then(function (transaction) {
        assert.equal(transaction.transactionResponse.responseCode, '1');
        //console.log(transaction);
    });*/

});


app.get('/test1/:id', function (req, resp) {
    var Yelp = require('yelp');

    var yelp = new Yelp({
        consumer_key: 'hdBUFs80ILJSk0nL97utZg',
        consumer_secret: '8atwQjpsMLlzSMjNXwt7oPqv9oY',
        token: 'rT23s5jOHxh_ziKfGTaNBUc8hHr8vzs7',
        token_secret: 'wYmKBj-b7Waxx4nZTUKv1YIiCG4',
    });

    yelp.business(req.params.id, function(err, data) {
        if (err) return console.log(error);
        resp.send(data.reviews);
    });


});


app.post('/upload',function(req, res){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log(req.body.Filedata);
    console.log(JSON.stringify(req));



    var tmp_path = req.files.Filedata.path;
    // set where the file should actually exists
    var target_path = './uploads/' + req.files.Filedata.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) {
                throw err;
            }else{
                var profile_pic = req.files.userPhoto.name;
                //use profile_pic to do other stuffs like update DB or write rendering logic here.
            };
        });
    });
});
function getstate(id){

        connection.query("SELECT state FROM state WHERE_id = ?",[id],function(error,rows,fields){
            console.log(error);
            if(!!error) console.log('error in db call ');
            else{

                console.log('success full query');
                //resp.send('Hello'+rows[0].fname);
                // connection.end();
                resp.send(JSON.stringify(rows[0]));

            }

        });
}



    function timeConverter(UNIX_timestamp){
       // var a = new Date(UNIX_timestamp * 1000);
        var a = new Date(UNIX_timestamp);
       // var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
       // var date = a.getDate()+1;
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = month + ' ' + date + ',  ' + year ;
        return time;
    }

 function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
    // return [ date.getFullYear(), mnth, day ].join("-");
    return new Date(date).getTime() / 1000
}
var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)


})

//app.listen(port);

/*app.listen(port);
console.log("App listening on port " + port);*/

