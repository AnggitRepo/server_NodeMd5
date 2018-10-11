var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var md5 = require('md5');
var sha1 = require('sha1');
var gallery     = require('./tabel/gallery');
var http = require('http');
var port        = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost:27017/tsm', { useNewUrlParser: true });

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
}); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var apiRoutes = express.Router();
app.use('/api/v1', apiRoutes);
///////untuk kode header code/////////

apiRoutes.get('/', function(req, res) {
  res.send('Hello World');
});

var tandatangan = sha1("dataregistrasi");
// console.log('tandatangan :'+ tandatangan);
apiRoutes.post('/', function(req, res) {
  var signa = req.body.signature;
  if (tandatangan === signa) {
      var headerkode = req.body.HeaderCode,
          headercode={
            "login":1001,       //untuk data masukan email dan password
            "registrasi":1002,  //registrasi pengguna nama, email dll
            "tampil":1003,       //tampil data
            "edit":1004
          }
      //bagian untuk login auth
      if (headercode.login == headerkode) {
        console.log('login');
          gallery.findOne({
            email : req.body.data.email
          }, function(err, user) {
            if (err) throw err;
            if (!user) {
              res.send({success: false, msg: 'Pengguna Tidak Diketahui.'});
            } else {
              console.log('nama ada');
              user.comparePassword(md5(req.body.data.password), function (err, isMatch) {
                if (isMatch && !err) {
                  res.json({success: true, msg: 'success Login '});
                } else {
                  res.send({success: false, msg: 'Password Salah.'});
                }
              });
            }
          });
      }
      //bagian untuk registrasi
      else if (headercode.registrasi == headerkode) {
        console.log('registrasi');
        var nama = req.body.data.nama,
            email    = req.body.data.email,
            password = req.body.data.password,
            bod  = req.body.data.bod,
            alamat   = req.body.data.alamat,
            foto   = req.body.data.foto,
            file   = req.body.data.file ; 
         gallery.create({ 
          nama     : nama,
          email     : email,
          password : password,
          bod : bod,
          alamat : alamat,
          foto : foto,
          file : file
        },

          function (err, small)
          {
            if (err)
            {
             console.dir(err);
           }
           res.json({status:200, errorMessage: null, message: 'success'});
         });  

      }
      //bagian untuk kesalahan
      else if (headercode.tampil == headerkode) {
        gallery.find((err, recs) =>
          {
            if (err)
            {
              res.json({status:204, errorMessage: err});
           }
           res.json({status:200, errorMessage: null, records:recs});
         });
      }
      //bagian untuk edit
      else if (headercode.edit == headerkode) {
        console.log('halaman edit');
          gallery.findById({ _id: req.body.data.id }, (err, recs) =>
          {
            if (err)
            {
             console.dir(err);
           }
           else
           {
             recs.nama     = req.body.data.nama  || recs.nama;
             recs.email     = req.body.data.email  || recs.email;
             recs.bod        = req.body.data.bod     || recs.bod;
             recs.alamat      = req.body.data.alamat || recs.alamat;
             recs.foto     = req.body.data.foto  || recs.foto;
             recs.file     = req.body.data.file  || recs.file;

             recs.save((err, recs) =>
             {
              if (err)
              {
               res.status(500).send(err)
             }
             res.json({ data: recs });
           });
           }
         });
      }
      //bagian untuk kesalahan
      else{
        console.log('error 404');
        res.json({status:404, errorMessage: error, message: 'failed'});
      }
  }
  else{
    console.log('error');
    res.json({status:404, errorMessage: error, message: 'failed'});
  }

});


app.listen(port);
console.log('listing di port :' + port);