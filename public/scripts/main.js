// const { json } = require("body-parser");



//renkler
const starColor = "#c2362c"; //"#c2362c"
const errorColor = "#c2362c"
const liBackgroundOnClick = "rgb(207, 242, 126)";   //"#CFF27E"
const green = "#a5be00";

var isOnStar = false; // farenin starın üzerinde olup olmadığını kontrol eden global değişken
const headerElements = $(".carousel-header").children();

const  serverUrl = "http://localhost:3000/";



//ekle butonuna basılan elemanin li olarak listeye eklenmesi
function addItem(object)
{
    var text = object.parentNode.parentNode.parentNode.getElementsByTagName("input")[0].value.toLowerCase(); 

    const arr = text.split(" ");

    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);

    }
    text = arr.join(" ");

    var ul = object.parentNode.parentNode.getElementsByTagName("ul")[0];

    var liElement = document.createElement("li");
    liElement.innerHTML = text;
    liElement.className = "added";

    var iElement = document.createElement("i");
    iElement.className = "far fa-trash-alt";

    var iElement2 = document.createElement("i");
    iElement2.className = "far fa-star";
    var spanElement = document.createElement("span");
    spanElement.appendChild(iElement2);
    spanElement.appendChild(iElement);
    liElement.appendChild(spanElement);
    ul.appendChild(liElement);
    liElement.style.background = liBackgroundOnClick;
    object.parentNode.parentNode.parentNode.getElementsByTagName("input")[0].value = "";
    search2(object.parentNode.parentNode.parentNode.getElementsByTagName("input")[0]);

    
};
// geri dön butonuna basıldığında searchbarda yazılanı silme
function backToInputs(object)
{
    object.parentNode.parentNode.parentNode.getElementsByTagName("input")[0].value = "";
    search2(object.parentNode.parentNode.parentNode.getElementsByTagName("input")[0]);
};
// tıklanan li nin arkaplan rengini değiştirme
$(".input-panel ul").on("click","li",function()

{
    
    if (!isOnStar)
{
    if (this.style.background == "")
    {
        this.style.background = liBackgroundOnClick;
    }
    else
    {
        this.style.background = "";
    }
} 
});
// yıldızın imleç li üzerinde iken gözükmesi
$(".input-panel ul").on("mouseenter","li",function()
 {
    try {
        this.getElementsByClassName("far fa-star")[0].style.display = "";
    } catch (error) {
        
    } 
    
  });
// yıldızın imleç li üzerinden ayrılınca gözükmemesi
$(".input-panel ul").on("mouseleave","li",function()
{
    try {
        this.getElementsByClassName("far fa-star")[0].style.display = "none";
    } catch (error) {
        
    }
}
);
// favoriye ekleme & çıkarma
$(".input-panel ul ").on("click","li span i",function(){
    if (this.className === "fas fa-star")
    {
        this.className = "far fa-star";
        this.style.color = "";
        
    }
    else
    {
        this.className = "fas fa-star";
        this.style.color = starColor;
    }
        
 });

 // isOnStar'ı değiştiren kısım
 $(".input-panel ul").on("mouseenter","li span i",function()
 {
    isOnStar = true;
 });

 $(".input-panel ul").on("mouseleave","li span i",function()
 {
    isOnStar = false;
 });

 //input bardaki yıldız
 $(".search-star").click(function(){
     if (this.className === "far fa-star search-star")
     {
         this.className = "fas fa-star search-star";
         this.style.color = starColor;
     }
     else
     {
         this.className = "far fa-star search-star"
         this.style.color = "";
     }
 });

 // çöpün üzerine fareyle gelindiğinde hover efekti 
$(".input-panel ul").on("mouseenter","li span .fa-trash-alt",function(){
    this.parentNode.parentNode.style.border = "#c2362c 2px solid";
});
$(".input-panel ul").on("mouseleave","li span .fa-trash-alt",function(){
    this.parentNode.parentNode.style.border = '';
});

// çöpe tıklantığında elementin silinmesi
$(".input-panel ul").on("click","li span .fa-trash-alt",function(){
    this.parentNode.parentNode.remove();
});

// Veri girişi carousel başlıkları aktif olup olmaması

$("#myCarousel").on("slid.bs.carousel",function(){
    var secondaryElement = document.getElementsByClassName("carousel-indicators")[0].getElementsByClassName("secondary")[0].attributes['data-slide-to'].value; // 5 3 gibi bişey dönüyor
    
    for(var i = 0; i < headerElements.length; i++)
    {
        headerElements[i].className = "head";
    }
    headerElements[secondaryElement].className = headerElements[secondaryElement].className + " secondary";
    
});

// headerlara tıklayınca ilgili elementin ekrana gelmesi

$(".carousel-header").on("click","div",function(){
    
    for (var i = 0; i<headerElements.length; i++)
    {
        
        if(headerElements[i].id === this.id)
            {
                $('#myCarousel').carousel(i);
                // headerElements[i].className = "head secondary";
                break
            }
    }

});

//butona basıldığında seçilenleri belli bir formatta oluşturma
function defineChosens()
{
    var veri = 
    {
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
    };
    
    //departman
    for (var i=0; i<document.getElementsByName("departman")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("departman")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["departman"].push(liElement.innerText);
        }
    }
    //süreç
    for (var i=0; i<document.getElementsByName("süreç")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("süreç")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["surec"].push(liElement.innerText);
        }
    }
    //veri kategorisi
    for (var i=0; i<document.getElementsByName("veriKategorisi")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("veriKategorisi")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["veriKategorisi"].push(liElement.innerText);
        }
    }
    //kişisel veri
    for (var i=0; i<document.getElementsByName("kişiselVeri")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("kişiselVeri")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["kisiselVeri"].push(liElement.innerText);
        }
    }
    //özel nitelikli kişisel veri
    for (var i=0; i<document.getElementsByName("özelNitelikliKişiselVeri")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("özelNitelikliKişiselVeri")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["ozelNitelikliKisiselVeri"].push(liElement.innerText);
        }
    }
    //işleme amaçları
    for (var i=0; i<document.getElementsByName("işlemeAmaçları")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("işlemeAmaçları")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["islemeAmaclari"].push(liElement.innerText);
        }
    }
    //ilgili kişi
    for (var i=0; i<document.getElementsByName("ilgiliKişi")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("ilgiliKişi")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["ilgiliKisi"].push(liElement.innerText);
        }
    }

    //hukuki sebebi
    for (var i=0; i<document.getElementsByName("hukukiSebebi")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("hukukiSebebi")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
            {
            veri["hukukiSebebi"].push(liElement.innerText);
            }
    }

    //saklama Süresi
    for (var i=0; i<document.getElementsByName("saklamaSuresi")[0].getElementsByTagName("li").length; i++)
        {
            var liElement = document.getElementsByName("saklamaSuresi")[0].getElementsByTagName("li")[i];
            if(liElement.style.background === liBackgroundOnClick)
                {
                veri["saklamaSuresi"].push(liElement.innerText);
                }
        }

    //alıcı grupları
    for (var i=0; i<document.getElementsByName("alıcıGrupları")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("alıcıGrupları")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["aliciGruplari"].push(liElement.innerText);
        }
    }

    //yabanci Ulkelere Aktarilan Veriler
    for (var i=0; i<document.getElementsByName("yabanciUlkelereAktarilanVeriler")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("yabanciUlkelereAktarilanVeriler")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["yabanciUlkelereAktarilanVeriler"].push(liElement.innerText);
        }
    }

    //teknik tedbirler
    for (var i=0; i<document.getElementsByName("teknikTedbirler")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("teknikTedbirler")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["teknikTedbirler"].push(liElement.innerText);
        }
    }
    //idari tedbirler
    for (var i=0; i<document.getElementsByName("idariTedbirler")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("idariTedbirler")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            veri["idariTedbirler"].push(liElement.innerText);
        }
    }



      $.ajax({
          url:serverUrl + "veri-girisi",
          type: "POST",
          data: veri,
          success: function (msg,status) {
             console.log("success");
             console.log(status);
             window.location.replace("veri-girisi-son");

             
         },
         error: function (jqXHR, status, err) {
             alert("Veriler işlenirken bir sorunla karşılaşıldı.");
             console.log(status);
             console.log(err);

         }

      });

}

// veri envanterinde rowa tıklandığında rengi değişmesi ve butonun düzenlemeleri
$(".veri-envanteri-section tbody").on("click","tr",function(){
    var button = document.getElementsByName("deleteRowButton")[0];
    if (this.className !== "table-active")
    {
    button.className = "btn btn-warning";
    button.type = "submit";   
    var trElements = this.parentNode.getElementsByTagName("tr")
    for (let i = 0; i< trElements.length;i++)
    {
        trElements[i].className = "table-secondary";
        if(this === trElements[i])
            button.value = i+1; 
    }
    this.className = "table-active";
    }
    else
    {
        this.className = "";
        button.className = "btn btn-inactive";
        button.type = "button";
    }
})

//register şifreler eşleşti mi diye kontrol 
const letter = document.getElementById("letter");
const capital = document.getElementById("capital");
const number = document.getElementById("number");
const len = document.getElementById("length");
const match = document.getElementById("match");

$("#password").on("keyup",isMatch);
$("#re_password").on("keyup",isMatch);

function isMatch()
{
    if ($("#password").val() === $("#re_password").val() && $("#password").val() !== "" && $("#re_password") !== "")
    {
        match.classList.add("valid");
        match.classList.remove("invalid");
    }
    else
    {
        match.classList.add("invalid");
        match.classList.remove("valid");
    }
}

//register kısmında geçerli bir e mail kullanıp kullanılmadığını kontrol etme
$("#email").on("focusout", validate);

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
function validate() {
    const $result = $("#result");
    const $email = $("#email");

    $result.text("");
  
    if (validateEmail($email.val())) {
        $result.hide(100);
        $email.css("border-color",green);
        
    } else {
      $result.show(100);
      if($email.val() !== "") 
        $result.text($email.val() + " geçerli bir e-mail adresi değil");
      else
        $result.text($email.val() + " Lütfen bir e-mail adresi girin");  
      $result.css("color", errorColor);
      $email.css("border-color",errorColor);
    }
    return false;
  }
  
//uygun şifre girilip girilmediğini kontrol eden kısım



 

$("#password").on("focus",function(){
    $(".warningMessages").show(100);
});

function checkConditions()
{   
    return (letter.className == "valid" && capital.className == "valid" && number.className == "valid" && len.className == "valid" &&  match.className == "valid");   
}

$("#password").on("keyup",function(){
    var lowerCaseLetters = /[a-z]/g;
    if($("#password").val().match(lowerCaseLetters)) {
      letter.classList.remove("invalid");
      letter.classList.add("valid");
      
    } else {
      letter.classList.remove("valid");
      letter.classList.add("invalid");
      
  }
  
    // Validate capital letters
    var upperCaseLetters = /[A-Z]/g;
    if($("#password").val().match(upperCaseLetters)) {
      capital.classList.remove("invalid");
      capital.classList.add("valid");
      
    } else {
      capital.classList.remove("valid");
      capital.classList.add("invalid");
      
    }
  
    // Validate numbers
    var numbers = /[0-9]/g;
    if($("#password").val().match(numbers)) {
      number.classList.remove("invalid");
      number.classList.add("valid");
      
    } else {
      number.classList.remove("valid");
      number.classList.add("invalid");
      
    }
  
    // Validate length
    if($("#password").val().length >= 8) {
      len.classList.remove("invalid");
      len.classList.add("valid");
      
    } else {
      len.classList.remove("valid");
      len.classList.add("invalid");
      
    }

    
    if (checkConditions())
    {
        $("#re_password").css("border-color",green);
        $("#password").css("border-color",green);
    }
    else
    {
        $(".warningMessages").show(100);
        $("#re_password").css("border-color",errorColor);
        $("#password").css("border-color",errorColor);
    }
});

$("#re_password").on("keyup",function(){
    if (checkConditions())
    {
        $("#re_password").css("border-color",green);
        $("#password").css("border-color",green);
    }
    else
    {
        $(".warningMessages").show(100);
        $("#re_password").css("border-color",errorColor);
        $("#password").css("border-color",errorColor);
    }
})
  



//döküman arama 
function searchDocuments() {
    // Declare variables
    var input,filter,a,i,txtValue;
    var isExist = false;
    input = document.getElementById('searchBar');
    filter = input.value.toUpperCase('tr-TR');
    elementArray = $(".card-body .docs p");
    var spanElement = document.getElementById("messageElement");
    
  if (filter === "")
    $(".card-footer i").css("display","");
  else
    $(".card-footer i").css("display","none");
  
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < elementArray.length; i++) {
      a = elementArray[i];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        elementArray[i].style.display = "";
        isExist = true;
      } else {
        elementArray[i].style.display = "none";
      }
    }
    if (isExist){
        spanElement.innerText = "";
    }
    else
        spanElement.innerText = "Dökümanlar arasında '"+input.value+"' bulunamadı.";     
  }
//dökümanlardan birine tıkladığımızda seçili duruma getirme
$("#dökümanlar .docs p").on("click",function(){
var pElements = $("#dökümanlar .docs").children();
for(let i = 0 ; i < pElements.length;i++)
{
    pElements[i].classList.remove("active-document");
}
this.classList.add("active-document");
document.getElementById("showDocument").disabled = false;
document.getElementById("showDocument").classList.add("btn-success")
});



function postDocument()// buradan devam
{

    const chosen = document.getElementsByClassName("active-document")[0].innerText;
    
    $.ajax({
        url:serverUrl + "documents",
        type: "POST",
        data: chosen,
        success: function (msg,status) {
           console.log("success");
           console.log(status);
           window.location.replace("documents/"+chosen);

           
       },
       error: function (jqXHR, status, err) {
           alert("Dosya gösterilirken bir sorunla karşılaştık");
           console.log(status);
           console.log(err);

       }

    });

}
//dökümanlar --  numaralara tıklandığında sayfalar arası geçiş -- iptal ettim

// $("#dökümanlar ul li").on("click",function(){
// for (let i = 0; i< $("#dökümanlar .card-body").children().length;i++)
//     {
//         $("#dökümanlar ul").children()[i].className = "li-deactive";
//         $("#dökümanlar .card-body").children()[i].className = "document-deactive";
//     }
//     this.className = "li-active";
//     let activePage = "page-"+this.innerText;
    
//     document.getElementById(activePage).className = "document-active";
// });