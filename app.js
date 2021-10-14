const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/KVKK");

var firms = []; // firma isimleri
var message = ""; 




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.get("/",function(req,res)
{
    res.render("home");
});

app.get("/veri-girisi",function(req,res)
{
  res.render("veri-girisi");
});

app.get("/veri-girisi-firm",function(req,res)
{
  message = "";
  res.render("veri-girisi-firm",{firms:firms});
});

app.get("/veri-girisi-firm/add",function(req,res)
{
  res.render("veri-girisi-add",{message:message})
});

app.post("/veri-girisi-firm/add",function(req,res){
  
  if(!firms.includes(req.body.newFirm))
  {
    firms.push(req.body.newFirm);
    res.redirect("/veri-girisi-firm");
  }else
    {
      message = "'" + req.body.newFirm +"' zaten ekli !";
      res.redirect("/veri-girisi-firm/add");
    }

});



app.post("/veri-girisi",function(req,res){
  
  // console.log(JSON.parse(localStorage.getItem("data")));
  // res.redirect("veri-girisi");
  console.log(req.body);

});

app.post("/veri-girisi-firm",function(req,res){
  var address = "veri-girisi"
  if(req.body.add)
    address = address + "-firm/add";
  res.redirect(address);  
});

app.get("/veri-envanteri",function(req,res){
  res.render("veri-envanteri",{firms:firms});
});

app.post("/veri-envanteri",function(req,res){
  let address = "/veri-envanteri/"+req.body.firm;
  res.redirect(address);
});

app.get("/veri-envanteri/:arg",function(req,res)
{
  console.log(req.params);
  let param = req.params.arg;
  res.render("veri-envanteri-datalarla",{firms:firms,param:param});
});

app.post("veri-envanteri/:arg",function(req,res){

});


app.listen(3000,function()
{
  console.log("Server started on port 3000");
});