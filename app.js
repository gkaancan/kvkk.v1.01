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
const { stringify } = require("querystring");

const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

const documentsPath = "public/Dökümanlar/pdf";

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
  firm:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Firm"
  },
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
  },
  data:{        
  departman:[],
  surec:[],
  veriKategorisi:[],
  kisiselVeri:[],
  ozelNitelikliKisiselVeri:[],
  islemeAmaclari:[],
  ilgiliKisi:[],
  hukukiSebebi:[],
  saklamaSuresi:[],
  aliciGruplari:[],
  yabanciUlkelereAktarilanVeriler:[],
  teknikTedbirler:[],
  idariTedbirler:[]
}
});

const firmSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  firmName:String,
  data:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"KvkkData"
  }],
});

const userSchema = new mongoose.Schema({
  name:String,
  username:String,
  firms:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Firm"
  }],
  password:String,
  secret:String
});


userSchema.plugin(passportLocalMongoose,options);
userSchema.plugin(findOrCreate);

const Firm = mongoose.model('firm',firmSchema);
const KvkkData = mongoose.model('kvkkdata',dataSchema);
const User = mongoose.model("User", userSchema);
const FavoriData = mongoose.model('favori',dataSchema);
const ExtraData = mongoose.model('extra',dataSchema);

passport.use(User.createStrategy());



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



var message = ""; 



app.get("/",function(req,res)
{   
    if (req.isAuthenticated())
      res.render("home",{isAuthenticated:req.isAuthenticated(),name:req.user.name});
    else
      res.render("home",{isAuthenticated:req.isAuthenticated()});
    message = "";     
    
     
});

app.get("/veri-girisi-firm",function(req,res)
{
  var localFirmNames =[];
  if (req.isAuthenticated())
  {
     Firm.find({user:req.user._id}).select("firmName , -_id").exec(function(error,firms){
       if(error)
       {
        message = "Bir hata meydana geldi. Lütfen bu hatayı bize bildirin. Hata kodu: 871318"; 
        console.log(error);
        res.render("veri-girisi-firm",{firms:localFirmNames,name:req.user.name,message:message});
       }
       else{ 
      for(let i = 0 ; i < firms.length;i++)  
      {
        localFirmNames.push(firms[i]["firmName"]);
      } 
        
        res.render("veri-girisi-firm",{firms:localFirmNames,name:req.user.name,message:message});
        message = "";
    }
    });
  }  
else
   {
    message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
    res.redirect("/login");
  }
});

app.post("/veri-girisi-firm",function(req,res){
  var address = "veri-girisi";
  if(req.body.add)
    address = address + "-firm/add";
  if(req.body.contiune)
  {
    address = address +"/"+req.body.firms; 
  }
    
  res.redirect(address);

});

app.get("/veri-girisi-firm/add",function(req,res)
{
  if (req.isAuthenticated())
    res.render("veri-girisi-add",{message:message,name:req.user.name});
  else
  {
    message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
    res.redirect("/login");
  }
  message = "";  
});

app.post("/veri-girisi-firm/add",function(req,res){

  Firm.exists({user:req.user._id,firmName:capitalizeFirstLetter(req.body.newFirm)},function(error,data){
    if (error){
      message = "Bir hata meydana geldi. Lütfen bu hatayı bize bildirin. Hata kodu: 487951"; 
      console.log(error);
      res.render("veri-girisi-firm/add",{firms:localFirmNames,name:req.user.name,message:message});
    }

    if(data){
      message = "'" + req.body.newFirm +"' zaten ekli !";
      res.redirect("/veri-girisi-firm/add");
    }

    else{
      const newFirm = new Firm({
        user:req.user._id,
        firmName:capitalizeFirstLetter(req.body.newFirm)
      });
      newFirm.save(function(error){
        if(error)
        {
         message = "Bir hata meydana geldi. Lütfen bu hatayı bize bildirin. Hata kodu: 871318"; 
         console.log(error);
         res.render("veri-girisi-firm/add",{firms:localFirmNames,name:req.user.name,message:message});
        }
        else{
         message ="Firma başarıyla eklendi";
         res.redirect("/veri-girisi-firm");
        }
      });
    }
  });

  



  // User.findById(req.user._id,function(error,user){
  //   if(error)
  //     {
  //       console.log(error);
  //       message = "Bir hata meydana geldi. Lütfen tekrar deneyin (Hata Kodu:152)";
  //       res.redirect("/veri-girisi-firm");
  //     }
  //     else
  //     {
  //     user.firms.push(newFirm);
  //     user.save();
  //     message ="Firma başarıyla eklendi";
  //     res.redirect("/veri-girisi-firm")
  //     }  
  // });


  // User.find({username:req.user.username},function(err,data){
  //   if(err)
  //   {
  //     console.log(err);
  //     message = "Bir hata meydana geldi. Lütfen tekrar deneyin (Hata Kodu:152)";
  //     res.redirect("/veri-girisi-firm");
  //   }
  //   //kullanıcıyı bulduk
  //   else
  //   {
  //     var localFirmNames = [];
  //     for (let i=0;i<data[0].firms.length;i++)
  //     {
  //       // aynı isimde firma var mı bi bakıyoruz
  //       localFirmNames.push(data[0].firms[i].firmName);
  //     }
  //     if (!localFirmNames.includes(capitalizeFirstLetter(req.body.newFirm)))
  //     {
  //       // buraya kadar geldiyse aynı isimde firma yokmuş demektir. firmayı datasız yaratıyoruz    
  //       const newFirm = new Firm({
  //         firmName:capitalizeFirstLetter(req.body.newFirm)
  //       });  
  //       newFirm.save(); // neden kaydediyoz hiç bir fikrim yok

  //       //firmayı userın içine ekliyoruz
  //       User.findOneAndUpdate({username:req.user.username},{$push:{firms:newFirm}},function(error,result){
  //         if(error)
  //         {
  //           console.log(error);
  //           message = "Bir hata meydana geldi. Lütfen tekrar deneyin (Hata Kodu:151)";
  //           res.redirect("/veri-girisi-firm/add");
  //         }
  //         else
  //         {
  //           console.log(result);
  //           message ="Firma başarıyla eklendi";
  //           res.redirect("/veri-girisi-firm")
  //         }
  //       });
  //     }
  //     else{
  //       message = "'" + req.body.newFirm +"' zaten ekli !";
  //       res.redirect("/veri-girisi-firm/add");
  //     }
  // }
  // });
  
});

app.get("/veri-girisi/:arg",function(req,res)
{
  if(req.isAuthenticated)
   {
    res.render("veri-girisi",{name:req.user.name,message:message});
    message = "";
  }
  else
   {
     message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
    res.redirect("/login");
   }  
});

app.post("/veri-girisi/:arg",function(req,res){
  
  Firm.find({firmName:req.params.arg , user:req.user._id},function(error,firma){
      if(error)
      {
        message = "Bir hata meydana geldi. Lütfen bu hatayı bize bildirin. Hata kodu: 541834"; 
        console.log(error);
        res.render("veri-girisi",{name:req.user.name});
      }
      else
      {
        try
        {
        const localData = new KvkkData({
          user:req.user._id,
          firm:firma._id,
          data:req.body.veriler[0]
              });
        localData.save();

        FavoriData.deleteOne({firm:firma._id}).exec();      

        const localFavorities = new FavoriData({
          user:req.user._id,
          firm:firma._id,
          data:req.body.veriler[1]
        });
        localFavorities.save();

        ExtraData.deleteOne({firm:firma._id}).exec()
        const localExtras = new ExtraData({
          user:req.user._id,
          firm:firma._id,
          data:req.body.veriler[2]
        });
        localExtras.save();
        message= "Verileriniz başarıyla veri envanterinize kaydedildi.";
      }
    
    catch{
      message = "Veriler kaydedilemedi,muhtemelen boş bir veri seti girmeye çalıştırız. Aksi bir durum için lütfen bizi bilgilendirin";
    }
  }
      
  });
 res.redirect("/");        
});

app.get("/veri-girisi-son",function(req,res){
  if (req.isAuthenticated())
    res.render("veri-girisi-son",{name:req.user.name,message:message});
  else
  {
    message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
    res.redirect("/login");
  }    
})
 
app.get("/veri-envanteri",function(req,res){
  
  if(req.isAuthenticated())
  {
    Firm.find({user:req.user._id},function(err,data){
      if (err)
      {
        console.log(err);
        message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 186331";
        res.redirect("/");
      }
      else
      {
        var localFirmNames = [];
        for (let i = 0; i < data.length; i++)
        {
          localFirmNames.push(data[i].firmName);
        }
        res.render("veri-envanteri",{firms:localFirmNames,message:message,name:req.user.name});
      }
    })
  }  
  else{
    message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
    res.redirect("/login");
  }
});

app.post("/veri-envanteri",function(req,res){

  let address = "/veri-envanteri/"+req.body.firm;
  res.redirect(address);
});

app.get("/veri-envanteri/:arg",function(req,res)
{
  if (req.isAuthenticated())
  {
    var firmNames = [];
    Firm.find({user:req.user._id},function(error,data){
      if (error)
      {
        console.log(err);
        message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 475452";
        res.redirect("/");
      }
      else
      {
        for (let i = 0 ; i < data.length; i ++)
          firmNames.push(data[i].firmName);
      }
    });
    Firm.find({user:req.user._id,firmName:req.params.arg},function(error,data){
      if (error)
      {
        console.log(err);
        message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 178312";
        res.redirect("/");
        
      }
      else
      {
        KvkkData.find({user:req.user._id,firm:data._id},'data -_id',function(error,kvkk){
          if (error)
          {
            console.log(err);
            message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 797418";
            res.redirect("/");
          }
          else
          {
            console.log(kvkk["data"]);
            res.render("veri-envanteri-datalarla",{firms:firmNames,param:req.params.arg,localData:kvkk,message:message,name:req.user.name});
            message = "";
          }
        })
      }
    })
   
  }

  
});

 
app.post("/veri-envanteri/:arg",function(req,res){
  
 if(req.body.choosefirm)
   res.redirect("/veri-envanteri/"+req.body.choosefirm);
 if(req.body.deleteRowButton)
   {
     var  id = req.body.deleteRowButton-1;
     Firm.find({user:req.user._id,firmName:req.params.arg},function(error,firma){
       if (error)
       {
          
         console.log(error);
         message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 186331";
         res.redirect("/veri-envanteri"+req.params.arg);
       }
       else
       {
        
         KvkkData.find({firm:firma._id},function(error,data){
           if (error)
           {
             console.log(error);
             message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 929431";
             res.redirect("/veri-envanteri"+req.params.arg);
           }
           else
           {
            
             KvkkData.deleteOne({_id:data[id]._id},function(error,result){
               if (error)
                 {
                   console.log(error);
                   message = "Veri silinirken bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 741372";
                   res.redirect("/veri-envanteri"+req.params.arg);
                 }
               else
                 {
                   message="Veri başarıyla silindi";
                   res.redirect("/veri-envanteri/"+req.params.arg);
                 }  
               });
           }
         });
       }
     });
   }  

 if(req.body.deleteFirm)
 {
   Firm.find({user:req.user._id,firmName:req.params.arg},function(error,firma){
     if(error)
     {
      console.log(error);
      message = "Firma silinirken bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 143159";
      res.redirect("/veri-envanteri");
     }
     else
     {
      KvkkData.deleteMany({firm:firma._id}).exec();
      FavoriData.deleteMany({firm:firma._id}).exec();
      ExtraData.deleteMany({firm:firma._id}).exec();
      Firm.deleteOne({user:req.user._id,firmName:req.params.arg}).exec();
      message = "Firma başarıyla silindi";
      res.redirect("/veri-envanteri");
     }
   });
 }
});

app.get("/login",function(req,res){
  res.render("login",{message:message});
  message = "";
});

app.post("/login",function(req,res){
  
  const tempUser = new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(tempUser,function(error)
  {
    if (error)
      {
        console.log(error);
        res.redirect("/login");
      }
    else
      {
        message = "Kullanıcı adı veya şifre hatalı"; 
        // ,{failureRedirect: '/login'}
          passport.authenticate("local",{failureRedirect: '/login'})(req, res, function(){
           
          res.redirect("/");
        });
      }
  
      
  });
});

app.get("/register",function(req,res){
  res.render("register",{message,message});
  message = "";
});

app.post("/register", function(req, res){
    
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
  if (!req.isAuthenticated())
    {
    message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
    res.redirect("/login");
    }
  else
  {
    fs.readdir(documentsPath, (err, files) => {
      if(err)
        console.log(err);
      else
      { 
        var filesArray = [];
        for(let i = 0; i <files.length;i++)
        {
          filesArray.push({filesName:files[i].slice(11,-4),
                          filesDate:files[i].slice(0,10)});
        }
        res.render("dökümanlar",{filesArray:filesArray,name:req.user.name});
      }  

    });
     
  }
    
});

app.post("/documents",function(req,res){
  res.redirect("/");
});

app.get("/documents/:arg",function(req,res){
  if (req.isAuthenticated())
  {
  const path = req.params.arg+".pdf";
  const pdfString = "<object data='/Dökümanlar/pdf/" +path+"' type='application/pdf' width='100%' height='100%'></object>";
  const buttonString = " <button type='button' id='downloadPdf' class='btn btn-outline-danger'onclick='downloadDocument("+'"'+path+'"' +","+'"'+'pdf'+'"'+")'>PDF Belgesi Olarak İndir</button> "+
                        "<button type='button' class='btn btn-outline-primary' id='downloadWord'onclick='downloadDocument("+'"'+path+'"' +","+'"'+'word'+'"'+")'>Word Belgesi Olarak İndir</button>"
  res.render("döküman",{document:req.params.arg,pdfString:pdfString,buttonString:buttonString,name:req.user.name});
  }
  else
  {
    {
      message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
      res.redirect("/login");
      }
  }
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



// async function createData(data,firmId)
// {
//   const newData = new KvkkData({
//     firm:firmId,
//     data:data
//   });
//   data.save();

//   await Firm.findById(firmId,function(error,firma){
//     if (error)
//       {console.log(error)}
//     else
//     {
//       firma.data.push(newData);
//       firma.data.save();
//     }  
//   })
// }

// async function createFirm(firmName,userId)
// {
//   const newFirm = new Firm({
//     user:userId,
//     firmName:firmName
//   });
//   newFirm.save();

//   await User.findById(userId,function(error,user){
//     if(error)
//     user.firm.push(newFirm);
//     user.save();
    
//   });


// };

// async function updateFavorities(favorities,firmId)
// {
//   await Firm.findOneAndUpdate({_id:firmId},{favorities:favorities});
// };

// async function updateExtraData(extraData,firmId)
// {
//   const newData = new KvkkData(
//     {
//      firm:firmId,
//      Data:extraData
//     }
//   )
//   newData.save();

//   await Firm.findOneAndUpdate({_id:firmId},{extraData:extraData});
// };

// async function getData(firmId)
// {
//   return await Firm.findById(firmId).
//                                   populate("data");
// };

// async function getFirmNames(userId)
// {
//   return await User.findById(userId).populate("firms","firmName");
// };