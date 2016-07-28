<!--var addtime = Date.now();
var crypto = require('crypto');

var secret = req.body.password;
var hash = crypto.createHmac('sha256', secret)
.update('password')
.digest('hex');
value1 = {
fname: req.body.fname,
lname: req.body.lname,
email: req.body.email,
password: hash,
address: req.body.address,
phone_no: req.body.phone_no,
mobile_no: req.body.mobile_no,
status: 1,
create_time: addtime
};
console.log("Insert command");
connection.query('INSERT INTO user SET ?', value1, function (err, result) {
if (err) {
resp.send("ERROR IN QUERY");
} else {
console.log("Insertion Successful." + result);
console.log('Inserted ' + result.affectedRows + ' rows');
//  connection.end();
resp.send(result);

}
});-->