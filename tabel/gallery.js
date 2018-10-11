var md5 = require('md5');
var mongoose 			=	require('mongoose'),
	Schema 				=	mongoose.Schema,
	LoginSchema 		=	new Schema({
	   nama 		: { type : String},
	   email		: { type : String},
	   password		: { type : String},
	   bod		: { type : String},
	   alamat		: { type : String},
	   foto		: { type : String},
	   file		: { type : String}
	});

LoginSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
    	var password = this.password;
    	user.password = md5(password);
    	next();
    } else {
        return next();
    }
});

LoginSchema.methods.comparePassword = function (passw, cb) {
var galery = this.password,
	index = passw;

	console.log('dari galery:'+ galery);
	console.log('dari index:'+ index);

	if (galery == index) {
		console.log('password berhasil masuk');
		return cb(null, "isMatch");
		
	}else{
		console.log('password salah');
		return cb("err");
	}

};

module.exports = mongoose.model('login', LoginSchema);
