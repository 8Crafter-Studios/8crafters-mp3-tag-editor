if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {name: this.name};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});
const debugMode = false;
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const process = require('process')
// console.log(process)
// import('./assets/js/JSONB').then(m=>console.log(m), e=>console.error(e.toString(), e.stack));
app.use(express.static('public'))
var exec = require('child_process').exec;
// console.log(exec)
function execute(command, callback){
    return new Promise(async(resolve, reject)=>exec(command, function(error, stdout, stderr){ resolve(callback(stdout, error, stderr)); }));
};/*
 console.log(app.locals.execute)
 app.get('/', (req, res) => {
  res.render('index', { app: app });
});*/
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const network = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!network[name]) {
                network[name] = [];
            }
            network[name].push(net.address);
        }
    }
}

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});
 
router.get('/docs',function(req,res){
  res.sendFile(path.join(__dirname+'/docs/index.html'));
});


router.get('/console_run',function(req,res){
  res.sendFile(path.join(__dirname+'/docs/index.html'));
});




/*
 
router.get('/editor',function(req,res){
  res.sendFile(path.join(__dirname+'/editor/index.html'));
});*/
 
//add the router
// app.configure(function(){
  app.use('/', express.static(__dirname + '/'));
  app.use(express.static(__dirname + '/'));
// });
app.use(express.static(__dirname + '/editor'));
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// should only be used during private testing, the rest of the time it should be commented out
if(debugMode){router.post('/console', async function(req, res) {/*
  const user_id = req.body.id;
  const token = req.body.token;
  const geo = req.body.geo;

  res.send({
    'user_id': user_id,
    'token': token,
    'geo': geo
  });*/
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  console.log((req.body))
  let result = undefined;
  try{
    result = eval(JSON.parse(req.body).code)
  }catch(e){
    console.error(e.toString(), e.stack);
    res.status(500);
    res.statusCode = 500;
    res.send({
      "message": e.toString()+" "+e.stack,
      "error": (e),
    });
    return;
  }
  // console.log(res);
 
  res.status(200);
  res.statusCode = 200;
  res.send({"message": "Recieved", "result": await result})
  
})};
app.use('/', router);
app.listen(8212);
if(!!!network.en0){
  network.en0=[]
}
 
console.log(network)
console.log(`Running at Port ${network.en0[0]}:8212`);
module.exports={app, router, path, exec, execute: execute};
// console.log(JSON.stringify(new Error()));
// console.log(Object.getOwnPropertyNames(new SyntaxError("a")));