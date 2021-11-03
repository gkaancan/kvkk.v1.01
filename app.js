const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const fs = require("fs");
const internal = require("stream");

const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

const documentsPath = "public/Dökümanlar/";

const options = {
  errorMessages: {
      MissingPasswordError: 'No password was given',
      AttemptTooSoonError: 'Account is currently locked. Try again later',
      TooManyAttemptsError: 'Account locked due to too many failed login attempts',
      NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
      IncorrectPasswordError: 'Password or username are incorrect',
      IncorrectUsernameError: 'Password or username are incorrect',
      MissingUsernameError: 'No username was given',
      UserExistsError: 'Girdiğiniz e-mail adresi zaten kayıtlı!'
  }
};



app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/KVKK");


const dataSchema = new mongoose.Schema({
  departman:Array,
  surec:Array,
  veriKategorisi:Array,
  kisiselVeri:Array,
  ozelNitelikliKisiselVeri:Array,
  islemeAmaclari:Array,
  ilgiliKisi:Array,
  hukukiSebebi:Array,
  saklamaSuresi:Array,
  aliciGruplari:Array,
  yabanciUlkelereAktarilanVeriler:Array,
  teknikTedbirler:Array,
  idariTedbirler:Array
});

const firmSchema = new mongoose.Schema({
  firmName:String,
  data:Array
});

const userSchema = new mongoose.Schema({
  name:String,
  username:String,
  password:String,
  secret:String
});

userSchema.plugin(passportLocalMongoose,options);
userSchema.plugin(findOrCreate);

const Firm = mongoose.model('firm',firmSchema);
const KvkkData = mongoose.model('kvkkdata',dataSchema);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var firmName = "";

var message = ""; 



app.get("/",function(req,res)
{   message = "";
    if (req.isAuthenticated())
      res.render("home",{isAuthenticated:req.isAuthenticated(),name:req.user.name});
    else
      res.render("home",{isAuthenticated:req.isAuthenticated()});   
    
     
});

app.get("/veri-girisi",function(req,res)
{
  res.render("veri-girisi");
});

app.get("/veri-girisi-firm",function(req,res)
{
  message = "";
  var firms = [];
  Firm.find(function(error,data){
    if (error)
      console.log(error);
    else
    {
      for (let i = 0; i<data.length; i++)
      {
       
        firms.push(data[i].firmName);
        // console.log(firms);
      }
      res.render("veri-girisi-firm",{firms:firms});
    }  
});
  
});

app.post("/veri-girisi-firm",function(req,res){
  var address = "veri-girisi";
  if(req.body.add)
    address = address + "-firm/add";
  if(req.body.contiune)
    firmName = req.body.firms; 
  res.redirect(address);

});

app.get("/veri-girisi-firm/add",function(req,res)
{
  res.render("veri-girisi-add",{message:message})
});

app.post("/veri-girisi-firm/add",function(req,res){
  
  Firm.find(function(error,data){
    if (error)
      console.log(error);
    else 
    {
      let firms = [];
      for (let i = 0; i<data.length; i++)
      {
        firms.push(data[i].firmName);
      }
      let text = capitalizeFirstLetter(req.body.newFirm);
      if(!firms.includes(text))
        {
          Firm.insertMany(new Firm({firmName:text},function(error){
          if (error)
            {console.log(error);}
          else
            {
            console.log("successfuly inserted");}}));  
            res.redirect("/veri-girisi-firm");
            }
      else
        {
          message = "'" + req.body.newFirm +"' zaten ekli !";
          res.redirect("/veri-girisi-firm/add");
        }
    }  
  });

  
});

app.post("/veri-girisi",function(req,res){
  const localData = new KvkkData(req.body);
  

  var dataArray = [localData];
  

  Firm.find({firmName:firmName},function(error,data)
  {
    if (error)
      console.log(error);
    else
      {
        
        for (let i = 0;i<data[0].data.length;i++)
          {
            dataArray.push(data[0].data[i]);
            // console.log("dataArray: ",dataArray);
            // console.log("eklenecek data: ",data[0].data[i]);
            // dataArray.push(data[0].data[i]);
            // console.log("eklenmiş data: ",dataArray);
          }
            console.log("succesfuly finded");
      }

  });

   Firm.updateOne({firmName:firmName},{$addToSet:{data:dataArray}},function(error)
          {
            if (error)
              console.log(error);
            else
               console.log("successfully updated");  
          });

  res.redirect("/");        
  
        
});

app.get("/veri-girisi-son",function(req,res){
  res.render("veri-girisi-son");
})
 
app.get("/veri-envanteri",function(req,res){
  Firm.find(function(error,data){
    if (error)
      console.log(error);
    else
    {
      let firms = [];
      for (let i = 0; i<data.length; i++)
      {
        
        firms.push(data[i].firmName);
        // console.log(firms);
      }
      res.render("veri-envanteri",{firms:firms,message:message});
    }  
  
});
});

app.post("/veri-envanteri",function(req,res){

  let address = "/veri-envanteri/"+req.body.firm;
  res.redirect(address);
});

app.get("/veri-envanteri/:arg",function(req,res)
{
  let param = req.params.arg;
 
  Firm.find({firmName:param},function(error,veri){
    if(error)
      console.log("error");
    else
      {
        Firm.find(function(error,data){
          if (error)
            console.log(error);
          else
          {
            let firms = [];
            for (let i = 0; i<data.length; i++)
            {
              
              firms.push(data[i].firmName);
              // console.log(firms);
            }
            res.render("veri-envanteri-datalarla",{firms:firms,param:param,localData:veri[0].data,message:message});
          }  
        
      });
      }  
  })
  
  
  
});

app.post("/veri-envanteri/:arg",function(req,res){
  message = "";
  if(req.body.choosefirm)
    res.redirect("/veri-envanteri/"+req.body.choosefirm);
  if(req.body.deleteRowButton)
    {
      let id;
      let localData = [];
      Firm.find({firmName:req.params.arg},function(error,data){
        if(error)
          console.log("error")
        else
          {
            id = req.body.deleteRowButton-1;
            localData.push(data[0].data[id]);
            // KvkkData.deleteOne({_id:data[0].data[id]._id},function(error){
            //    if (error)
            //      console.log(error);
            //    else
            //      ("silindi");  
            //  });
            Firm.updateOne({firmName:req.params.arg},{$pullAll:{data:localData}},function(error)
          {
            if (error)
            {
              console.log(error);
              message = "Veri silinirken bir sorunla karşılaştık. Lütfen tekrar deneyin";
            }  
            else
            {
               console.log("successfully updated");
               message = "Seçtiğiniz veri başarıyla silindi.";
            }     
          });
            
            res.redirect("/veri-envanteri/"+req.params.arg); 
          }  
      });
    }

    if(req.body.deleteFirm)
    {
      Firm.deleteOne({firmName:req.params.arg},function(error)
      {
        if (error)
        {
          console.log("an error was occured when the firm is deleted");
          message = "Bir hata oluştu lütfen tekrar deneyin."
        }
        else
        {
          console.log("firm was deleted succesfuly");
          message = "Seçtiğiniz firma başarı ile silindi."
          res.redirect("/veri-envanteri");
        }
      })
      
    }
});

app.get("/login",function(req,res){
  res.render("login",{message:message});
});

app.post("/login",function(req,res){
  const user = new User({
    username:req.body.login_input,
    password:req.body.login_password
  });
  
   req.login(user,function(error){
     console.log(user);
     if (error)
     {
       console.log(error);
       res.redirect("/login");
     }
     else
     {
       message = "";
       // ,{failureRedirect: '/login'}
       passport.authenticate("local")(req, res, function(){
         res.redirect("/");
       });
     }
   })

});

app.get("/register",function(req,res){
  res.render("register",{message,message});
});

app.post("/register", function(req, res){
    console.log(req.body.password.match(/[a-z]/g));
    if(req.body.password !== req.body.re_password)
    {
      message = "Girdiğiniz şifre, tekrarı ile uyuşmuyor.";
      res.redirect("/register");
    }
    else if(req.body.password.match(/[a-z]/g) && req.body.password.match(/[A-Z]/g) && req.body.password.match(/[0-9]/g) && req.body.password.length < 8) 
    {
      message = "Girdiğiniz şifre, belirtilen özelliklerde değil.";
      res.redirect("/register");
    }
    else
    {
      
      User.register({username:req.body.username, name:req.body.name}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          message = err;
          res.redirect("/register");
        } 
        else 
        {
          // const email = "kaancan-9@hotmail.com"; // The user's email address
          // app.emailPasswordAuth.resendConfirmation(email);
           message = "";
           passport.authenticate("local")(req, res, function(){
          res.redirect("/");
           });
        }
      });
    }//mavi kahve mor sarı bordo sarı
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.get("/documents",function(req,res){
  message = "";
  if (req.isAuthenticated())
    res.render("dökümanlar",{isAuthenticated:req.isAuthenticated(),name:req.user.name});
  else
  {
    fs.readdir(documentsPath, (err, files) => {
      if(err)
        console.log(err);
      else
      { 
        var htmlString = "";
        for(let i = 0; i <files.length;i++)
        {
          htmlString = htmlString +"<p>"+files[i]+"</p>";
        }

        res.render("dökümanlar",{isAuthenticated:req.isAuthenticated(),htmlString:htmlString});
      }  

    });
     
  }
    
});

app.post("/documents",function(req,res){
  res.redirect("/");
});
app.get("/documents/:arg",function(req,res){
  fs.readFile(documentsPath+"/"+req.params.arg,function(error,data){
    if (error)
      {
        console.log(error);
      }
    else
      {
        res.render("döküman",{document:req.params.arg,data:data});
      }  
  });
  
  
});



app.listen(3000,function()
{
  console.log("Server started on port 3000");
});







//verilen kelimenin ilk harflerini büyük harf yapan metod
function capitalizeFirstLetter(text)
{
    let str = text;

//split the above string into an array of strings 
//whenever a blank space is encountered

let arr = str.split(" ");

//loop through each element of the array and capitalize the first letter.


for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);

}

//Join all the elements of the array back into a string 
//using a blankspace as a separator 
let str2 = arr.join(" ");
return str2;
}

// fs.readdir(documentsPath, (err, files) => {
//   if(err)
//     console.log(err);
//   else
//   { 
//     var htmlString = "<div id='page-1' class='document-active'>"
//     for(let i = 0; i <files.length;i++)
//     {
//       htmlString = htmlString +"<p>"+files[i]+"</p>";
//       if (i%10 === 0 && i!== 0)
//       {
//         let x = Number(i/10) + Number(1);
//         htmlString = htmlString + "</div>" + "<div id='page-"+x+"' class='document-deactive'>";
//       }
//     }
//     htmlString = htmlString + "</div>";
