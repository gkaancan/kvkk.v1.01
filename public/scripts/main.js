// const { json } = require("body-parser");

//renkler
var starColor = "#c2362c"; //"#c2362c"
var liBackgroundOnClick = "rgb(207, 242, 126)";   //"#CFF27E"


var isOnStar = false; // farenin starın üzerinde olup olmadığını kontrol eden global değişken
var headerElements = $(".carousel-header").children();

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
    object.parentNode.parentNode.parentNode.getElementsByTagName("input")[0].value = "";
};
// geri dön butonuna basıldığında searchbarda yazılanı silme
function backToInputs(object)
{
    object.parentNode.parentNode.getElementsByTagName("input")[0].value = "";
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
$(".input-panel ul li span").on("click","i",function(){
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
 $(".input-panel ul li span").on("mouseenter","i",function()
 {
    isOnStar = true;
 });

 $(".input-panel ul li span").on("mouseleave","i",function()
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

 // çöpün üzerine fareyle gelindiğinde hover efekti çalışmıyor aq
$(".input-panel ul li span").on("mouseenter",".fa-trash-alt",function(){
    console.log("hover");
});
// bu da çalışmıyor 
$(".fa-trash-alt").mouseenter(function(){
    console.log("ads");
});

// Veri girişi carousel başlıkları aktif olup olmaması

$("#myCarousel").on("slid.bs.carousel",function(){
    var activeElement = document.getElementsByClassName("carousel-indicators")[0].getElementsByClassName("active")[0].attributes['data-slide-to'].value; // 5 3 gibi bişey dönüyor
    
    for(var i = 0; i < headerElements.length; i++)
    {
        headerElements[i].className = "head";
    }
    headerElements[activeElement].className = headerElements[activeElement].className + " active";
    
});

// headerlara tıklayınca ilgili elementin ekrana gelmesi

$(".carousel-header").on("click","div",function(){
    
    for (var i = 0; i<headerElements.length; i++)
    {
        
        if(headerElements[i].id === this.id)
            {
                $('#myCarousel').carousel(i);
                // headerElements[i].className = "head active";
                break
            }
    }

});

//butona basıldığında seçilenleri belli bir formatta oluşturma
function defineChosens()
{
    var data = {
        departman:[],
        süreç:[],
        veriKategorisi:[],
        kişiselVeri:[],
        özelNitelikliKişiselVeri:[],
        işlemeAmaçları:[],
        ilgiliKişi:[],
        alıcıGrupları:[],
        teknikTedbirler:[],
        idariTedbirler:[]
    }

    //departman
    for (var i=0; i<document.getElementsByName("departman")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("departman")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["departman"].push(liElement.innerText);
        }
    }
    //süreç
    for (var i=0; i<document.getElementsByName("süreç")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("süreç")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["süreç"].push(liElement.innerText);
        }
    }
    //veri kategorisi
    for (var i=0; i<document.getElementsByName("veriKategorisi")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("veriKategorisi")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["veriKategorisi"].push(liElement.innerText);
        }
    }
    //kişisel veri
    for (var i=0; i<document.getElementsByName("kişiselVeri")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("kişiselVeri")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["kişiselVeri"].push(liElement.innerText);
        }
    }
    //özel nitelikli kişisel veri
    for (var i=0; i<document.getElementsByName("özelNitelikliKişiselVeri")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("özelNitelikliKişiselVeri")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["özelNitelikliKişiselVeri"].push(liElement.innerText);
        }
    }
    //işleme amaçları
    for (var i=0; i<document.getElementsByName("işlemeAmaçları")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("işlemeAmaçları")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["işlemeAmaçları"].push(liElement.innerText);
        }
    }
    //ilgili kişi
    for (var i=0; i<document.getElementsByName("ilgiliKişi")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("ilgiliKişi")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["ilgiliKişi"].push(liElement.innerText);
        }
    }
    //alıcı grupları
    for (var i=0; i<document.getElementsByName("alıcıGrupları")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("alıcıGrupları")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["alıcıGrupları"].push(liElement.innerText);
        }
    }
    //teknik tedbirler
    for (var i=0; i<document.getElementsByName("teknikTedbirler")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("teknikTedbirler")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["teknikTedbirler"].push(liElement.innerText);
        }
    }
    //idari tedbirler
    for (var i=0; i<document.getElementsByName("idariTedbirler")[0].getElementsByTagName("li").length; i++)
    {
        var liElement = document.getElementsByName("idariTedbirler")[0].getElementsByTagName("li")[i];
        if(liElement.style.background === liBackgroundOnClick)
        {
            data["idariTedbirler"].push(liElement.innerText);
        }
    }

    // localStorage.setItem("data",JSON.stringify(data));
}

