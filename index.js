const express=require('express');
const app=express();

//connecting server file
let server=require('./server');
let middleware=require('./middleware');

//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalInventory';

let db
MongoClient.connect(url,{useNewUrlParser:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${dbName}`);
});

//Reading Hospital Details
app.get('/hospitaldetails',middleware.checkToken,function(req,res){
    console.log("Reading the data from Hospital collection");
    var hdata=db.collection('Hospital').find().toArray().then(result=>res.json(result));
});

//Reading Ventilators Details
app.get('/ventilatorsdetails',middleware.checkToken,function(req,res){
    console.log("Reading the data from Ventilators collection");
    var vdata=db.collection('Ventilators').find().toArray().then(result=>res.json(result));
});

//Search Ventilators by Status
app.post('/searchventbystatus',middleware.checkToken,function(req,res){
    var status=req.body.status;
    console.log(status);
    var ventilatorsdetails=db.collection('Ventilators').find({"status":status}).toArray().then(result=>res.json(result));
});

//Search Ventilators by Hospital Name
app.post('/searchventbyhospname',middleware.checkToken,function(req,res){
    var hospname=req.body.name;
    console.log(hospname);
    var ventilatorsdetails=db.collection('Ventilators').find({"name":hospname}).toArray().then(result=>res.json(result));
});

//Search Hospital by Name
app.post('/searchhospbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hosp=db.collection('Hospital').find({"name":name}).toArray().then(result=>res.json(result));
});

//Update Ventilator Details
app.put('/updateventdetails',middleware.checkToken,(req,res)=>{
    var ventid={ventilatorId:req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection('Ventilators').updateOne(ventid,newvalues,function(err,result){
        res.json('1 document updated');
        if(err) throw err;
    });
});

//Add Ventilator
app.post('/addvent',middleware.checkToken,(req,res)=>{
    var hid=req.body.hId;
    var ventid=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;

    var item={hId:hid,ventilatorId:ventid,status:status,name:name};
    db.collection('Ventilators').insert(item,function(err,result){
        res.json('1 item inserted');
    });
});

//Delete Ventilator by Vent Id
app.delete('/deleteventbyventid',middleware.checkToken,(req,res)=>{
    var ventid=req.body.ventilatorId;
    console.log(ventid);

    var item={ventilatorId:ventid};
    db.collection('Ventilators').deleteOne(item,function(err,obj){
        if(err) throw err;
        res.json('1 document deleted');
    });
});
app.listen(1100);