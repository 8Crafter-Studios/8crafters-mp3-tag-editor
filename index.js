const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
 
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});
 
router.get('/docs',function(req,res){
  res.sendFile(path.join(__dirname+'/docs/index.html'));
});/*
 
router.get('/editor',function(req,res){
  res.sendFile(path.join(__dirname+'/editor/index.html'));
});*/
 
//add the router
// app.configure(function(){
  app.use('/', express.static(__dirname + '/'));
  app.use(express.static(__dirname + '/'));
// });
app.use('/', router);
app.listen(8212);
 
console.log('Running at Port 8212');