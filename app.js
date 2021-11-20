require('dotenv').config()
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
const { env } = require('process');

const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: process.env.SECRET, 
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


mongoose.connect("mongodb+srv://kaanadmin:93589d568380459E@kvkkbeta.26dva.mongodb.net/KVKK?retryWrites=true&w=majority");


const dataSchema = new mongoose.Schema({
  firm:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Firm"
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

const Firm =  mongoose.model('firm',firmSchema);
const KvkkData =  mongoose.model('kvkkdata',dataSchema);
const User =  mongoose.model("User", userSchema);
const FavoriData =  mongoose.model('favori',dataSchema);
const ExtraData =  mongoose.model('extra',dataSchema);

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

const veriGirisiData = [
  //deportman
  ["İnsan Kaynakları","Destek Hizmetleri","Muhasebe","Kurumsal İlişkiler","Bilgi İşlem","Satış","Dijital Pazarlama"],
  //Süreç
  ["Çalışan Özlük Dosyası Oluşturma","Hizmet İçi Eğitim Planlamasi","İşyeri Kişisel Sağlık Dosyası Oluşturma","Mahkeme veya İcra Dairesi Taleplerinin Cevaplandirilması","Özel Sağlık Sigortası Tahsisi","Müşteri Hizmet Dökümü Tutulması","Tedarikçi Hizmet Dosyası Oluşturma"],
  //Veri Kategorisi
  ["Kimlik","İletişim","Lokasyon","Özlük","Hukuki İşlem","Müşteri İşlem","Fiziksel Mekan Güvenliği","İşlem Güvenliği","Risk Yönetimi","Finans","Pazarlama","Görsel ve İşitsel Kayıtlar","Irk ve Etnik Köken","Siyasi Düşünce Bilgileri","Felsefi inanç, Din, Mezhep ve Diğer İnançlar","Kılık ve Kıyafet","Dernek Üyeliği","Vakıf Üyeliği","Sendika Üyeliği","Sağlık Bilgileri","Cinsel Hayat","Ceza Mahkumiyeti ve Güvenlik Tedbirleri","Biometrik Veri","Genetik Veri"],
  //kişisel veri
  ["Ad,Soyad","Adres Bilgisi","Anne-Baba Adı","Bakmakla Yükümlü Olduğu Kişilerin Ad ve Soyad Bilgisi","Banka IBAN Numarası","Dijital İz Verisi","Dijital Pazarlama","Eğitim Verisi","E-Posta","Fatura Bilgileri Verisi","Finansal Veri","Fotoğraf","İmza Beyanı","İzin Belgesi","İnsan Kaynakları","Kamera Kaydı","Konum/Lokasyon Verisi","Kurum Sicil No","Kurum ve Unvan Bilgisi","Mal Bildirimi Bayanı","Meslek","Mesleki Veriler","Müşteri Bilgileri Verisi","Ofis G/Ç Zamanı","Özlük Bilgisi","Pazarlama Verisi","Performans ve Kariyer Gelişim Verisi","Resim","Risk Yönetim Verisi","Seyahat Verisi","Talep/Şikayet Yönetim Bilgisi","Taşıt Verisi","TC Kimlik No ","Tedarikçi Verisi","Telefon Numarası"],
  //özel Nitelikli Kişisel Veri
  ["Adli Sicil Kaydı","Sağlık Raporu","Biyometrik/ Genetik Veri","Üyelik Verisi","Güvenlik Verisi","Hukuki İşlem ve Uyum Verisi","Kılık Kıyafet Verisi"],
  //İşleme Amaçları
  ["Acil Durum Yönetimi Süreçlerinin Yürütülmesi","Bilgi Güvenliği Süreçlerinin Yürütülmesi","Çalışan Adayı / Stajyer / Öğrenci Seçme ve Yerleştirme Süreçlerinin Yürütülmesi","Çalışan Adaylarının Başvuru Süreçlerinin Yönetilmesi","Çalışan Memnuniyeti VE Bağlılığı Süreçlerinin Yürütülmesi","Çalışan İçin İş Akdi Ve Mevzuattan Kaynaklı Yükümlülüklerin Yerine Getirilmesi","Çalışanlar İçin Yan Haklar Ve Menfaatleri Süreçlerinin Yürütülmesi"
    ,"Denetim / Etik Faaliyetlerinin Yürütülmesi"
    ,"Eğitim Faaliyetlerinin Yürütülmesi"
    ,"Erişim Yetkilerinin Yürütülmesi"
    ,"Faaliyetlerin Mevzuata Uygun Yürütülmesi"
    ,"Finans Ve Muhasebe İşlerinin Yürütülmesi"
    ,"Firma / Ürün / Hizmetlere Bağlılık Süreçlerinin Yürütülmesi"
    ,"Fiziksel Mekan Güvenliğinin Temini"
    ,"Görevlendirme Süreçlerinin Yürütülmesi"
    ,"Hukuk İşlerinin Takibi ve Yürütülmesi"
    ,"İç Denetim / Soruşturma / İstihbarat Faaliyetlerinin Yürütülmesi"
    ,"İletişim Faaliyetlerinin Yürütülmesi"
    ,"İnsan Kaynakları Süreçlerinin Planlanması"
    ,"İş FaaliyetlerininYürütülmesi/ Denetimi"
    ,"İş Sağlığı / Güvenliği Faaliyetlerinin Yürütülmesi"
    ,"İş Süreçlerinin İyleştirilmesine Yönelik Önerilerin Alınması ve Değerlendirilmesi"
    ,"İş Sürekliliğinin Sağlanması Faaliyetlerin Yürütülmesi"
    ,"Lojistik Faaliyetlerin Yürütülmesi"
    ,"Mal / Hizmet Satın Alım Süreçlerinin Yürütülmesi"
    ,"Mal / Hizmet Satış Sonrası Destek Hizmetlerinin Yürütülmesi"
    ,"Mal / Hizmet Satış Süreçlerinin Yürütülmesi"
    ,"Mal / Hizmet Üretim ve Operasyon Süreçlerinin Yürütülmesi"
    ,"Müşteri İlişkileri Yönetimi Süreçlerinin Yürütülmesi"
    ,"Müşteri Memnuniyetine Yönelik Aktivitelerin Yürütülmesi"
    ,"Organizasyon ve Etkinlik Yönetimi"
    ,"Pazarlama Analiz Çalışmalarının Yürütülmesi"
    ,"Performans Değerlendirme Süreçlerinin Yürütülmesi"
    ,"Reklam / Kampanya / Promosyon Süreçlerinin Yönetilmesi"
    ,"Risk Yönetimi Süreçlerinin Yürütülmesi"
    ,"Saklama ve Arşiv Faaliyetlerinin Yürütülmesi"
    ,"Sosyal Sorumluluk ve Sivil Toplum Aktivitelerinin Yürütülmesi"
    ,"Sözleşme Süreçlerinin Yürütülmesi"
    ,"Sponsorluk Faaliyetlerinin Yürütülmesi"
    ,"Stratejik Planlama Faaliyetlerinin Yürütülmesi"
    ,"Talep / Şikayetlerin Takibi"
    ,"Taşınır Mal ve Kaynakların Güvenliğinin Temini"
    ,"Tedarik Zinciri Yönetimi Süreçlerinin Yürütülmesi"
    ,"Ücret Politikasının Yürütülmesi"
    ,"Ürün / Hizmetlerin Pazarlama Süreçlerinin Yürütülmesi"
    ,"Veri Sorumlusu Operasyonlarının Güvenliğinin Temini"
    ,"Yabancı Personel Çalışma ve Oturma İzin İşlemleri"
    ,"Yatırım Süreçlerinin Yürütülmesi"
    ,"Yetenek / Kariyer Gelişimi Faaliyetlerinin Yürütülmesi"
    ,"Yetkili Kişi, Kurum ve Kuruluşlara Bilgi Verilmesi"
    ,"Yönetim Faaliyetlerinin Yürütülmesi"
    ,"Ziyaretçi Kayıtlarının Oluşturulması ve Takibi"],
    //ilgili Kişi
    ["Çalışan Adayı","Çalışan","Denek","Habere Konu Kişi","Hissedar / Ortak","Potansiyel Ürün veya Hizmet Alıcısı","Sınav Adayı","Stajyer","Tedarikçi Çalışan","Tedarikçi Yetkilisi","Ürün veya Hizmet Alan Kişi","Veli / Vasi / Temsilci","Ziyaretçi"],
    //HukukiSebebi
    ["Sözleşmenin imzalanması","Kanunlarda öngörülmesi","Açık Rıza alınması","Veri Sorumlusunun Meşru Menfaatleri","Özlük Dosyasının Oluşturulması"],
    //saklama süresi
    ["İşten Ayrılmasından İtibaren 10 yıl","Sözleşmenin Sona Erdiği Tarihten İtibaren","Eğitimin Tamamlanmasından İtibaren 1 yıl","İhalenin Tamamlanmasından İtibaren 10 yıl","Ziyaretin Tamamlanmasından İtibaren 6 ay","Onayın Geri Alındığı Tarihten İtibaren 2 yıl","Faaliyetin Sona Ermesinden İtibaren 10 yıl","Etkinliğin Sona Ermesinden İtibaren 2 yıl","İş İlişkilerinin Sona Ermesinden İtibaren 5 yıl","Pay Defterinin Saklanma Zorunluluğu Sebebiyle Süresiz","Anketin Doldurulduğu Yılın Sona Ermesine Müteakiben 1 yıl","En Az 2 Yıl Olmak Suretiyle İş Davalarına Konu Olabilmesi Sebebiyle 10 Yıl","90 Gün","1 yıl","2 yıl","3 yıl","5 yıl","10 yıl","13 Ay","15 yıl","En Az 20 yıl"],
    //Alıcı-Alıcı Grupları
    ["Gerçek Kişiler veya Özel Hukuk Kişileri","Herkese Açık","Hissedarlar","İş Ortakları","İştirakler ve Bağlı Ortaklıklar","Tedarikçiler","Topluluk Şirketleri","Yetkili Kamu Kurum ve Kuruluşları"],
    //yabancı ülkelere aktarılan veriler
    ["Evet","Hayır"],
    //teknik tedbirler
    ["Yetki Matrisi","Yetki Kontrol","Erişim Logları","Kullanıcı Hesap Yönetimi","Ağ Güvenliği","Uygulama Güvenliği","Şifreleme","Sızma Testi","Saldırı Tespit ve Önleme Sistemleri","Log Kayıtları"],
    // idari tedbirler
    ["Kişisel Veri İşleme Envanteri Hazırlanması","Kurumsal Politikalar (Erişim, Bilgi Güvenliği, Kullanım, Saklama ve İmha vb.)","Sözleşmeler (Veri Sorumlusu - Veri Sorumlusu, Veri Sorumlusu Veri İşleyen Arasında)","Gizlilik Tahhütnameleri","Kurum İçi Periyodik ve/veya Rastgele Denetimler","Risk Analizleri","İş Sözleşmesi, Disiplin Yönetmeliği (Kanuna Uygun Hükümler İlave Edilmesi)","Kurumsal İletişim (Kriz Yönetimi, Kurul ve İlgili Kişiyi Bilgilendirme Süreçleri, İtibar Yönetimi vb.)","Eğitim ve Farkındalık Faaliyetleri (Bilgi Güvenliği ve Kanun)","Veri Sorumluları Sicil Bilgi Sistemine (VERBİS) Bildirim"]

];

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
        message = "";
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
    {res.render("veri-girisi-add",{message:message,name:req.user.name});
      message = "";
    }
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
      message = "";
    }

    if(data){
      message = "'" + req.body.newFirm +"' zaten ekli !";
      res.redirect("/veri-girisi-firm/add");
    }

    else{
      const newFirm =  new Firm({
        user:req.user._id,
        firmName:capitalizeFirstLetter(req.body.newFirm)
      });
      newFirm.save(function(error){
        if(error)
        {
         message = "Bir hata meydana geldi. Lütfen bu hatayı bize bildirin. Hata kodu: 871318"; 
         console.log(error);
         res.render("veri-girisi-firm/add",{firms:localFirmNames,name:req.user.name,message:message});
         message = "";
        }
        else{
         message ="Firma başarıyla eklendi";
         const localFavorities = new FavoriData({
          firm:newFirm._id,
          data:dataSchema.data
        });
        localFavorities.save();
  
       
        const localExtras =  new ExtraData({
          firm:newFirm._id,
          data: dataSchema.data
        });
        localExtras.save();
  
        res.redirect("/veri-girisi-firm");
         
        }
      });

     
    }
  });


  
});

app.get("/veri-girisi/:arg",function(req,res)
{
  if(req.isAuthenticated())
   {
    Firm.find({firmName:req.params.arg,user:req.user._id},function(error,firma){
      if(error){console.log(error);}
      else{
        ExtraData.find({firm:firma[0]._id},function(error,extras){
          if(error){console.log(error);}
          else
          {
            FavoriData.find({firm:firma[0]._id},function(error,favoris){
              if(error){console.log(error);}
              else
              {
                
                res.render("veri-girisi",{name:req.user.name,message:message,data:veriGirisiData,favoris:favoris[0].data,extras:extras[0].data});
                message = "";
              }
            });
          }
        });

      }
    }); 
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
            const localData = new KvkkData({
              firm:firma[0]._id,
              data:req.body.veriler["veri"] || []
                  });
            localData.save();

            console.log(req.body.veriler["favori"]);
            FavoriData.updateOne({firm:firma[0]._id},{data:req.body.veriler["favori"] || []},function(error,result){
              if(error){console.log("favori",error)}
              console.log("favori",result);
            });
            ExtraData.updateOne({firm:firma[0]._id},{data:req.body.veriler["added"] || []},function(error,result){
              if(error){console.log("extra",error)}
              console.log("extra",result);});
          res.redirect("/veri-girisi-son");                
  }
  });


      
});

app.get("/veri-girisi-son",function(req,res){
  if (req.isAuthenticated())
  {
    res.render("veri-girisi-son",{name:req.user.name,message:message});
    message = "";
  }  
  else
  {
    message = "Bu sayfayı sadece kayıtlı kullanıcılar görüntüleyebilir.";
    res.redirect("/login");
  }    
});

app.post("/veri-girisi-son",function(req,res){
  if (req.body.addNewData)
    res.redirect("/veri-girisi-firm");
  else if (req.body.dataInventory)
    res.redirect("/veri-envanteri");
  else if (req.body.mainMenu)
    res.redirect("/");    
});

app.get("/veri-envanteri",function(req,res){
  
  if(req.isAuthenticated())
  {
    Firm.find({user:req.user._id},function(err,data){
      if (err)
      {
        console.log("error",err);
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
        message = "";
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
        console.log(error);
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
        console.log(error);
        message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 178312";
        res.redirect("/");
        
      }
      else
      {
        KvkkData.find({firm:data[0]._id},'data -_id',function(error,kvkk){
          if (error)
          {
            console.log(error);
            message = "Bir hata meydana geldi. Bu hatayı lütfen bize bildirin. Hata kodu: 797418";
            res.redirect("/");
          }
          else
          {
            res.render("veri-envanteri-datalarla",{firms:firmNames,param:req.params.arg,localData:kvkk,message:message,name:req.user.name});
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
        
         KvkkData.find({firm:firma[0]._id},function(error,data){
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


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}





app.listen(port,function()
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