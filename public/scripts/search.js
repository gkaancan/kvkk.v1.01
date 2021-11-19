var favori = false;



function search2(object) 
{
    
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = object 
    filter = input.value.toLocaleUpperCase('tr-TR');
    ul = object.parentNode.parentNode.getElementsByTagName("ul")[0]; 
    li = ul.getElementsByTagName('li');
    var counter = 0;
    var p = object.parentNode.parentNode.getElementsByTagName("p")[0];

    var buttonAdd =object.parentNode.parentNode.getElementsByTagName("button")[0];
    var buttonFavori = object.parentNode.parentNode.getElementsByTagName("button")[1];
    var buttonBack = object.parentNode.parentNode.getElementsByTagName("button")[2];

    
    // var glass = object.parentNode.getElementsByTagName("i")[1];
    
    // if (filter === "")
    //   glass.style.display = "";
    // else
    //   glass.style.display = "none";


    // Loop through all list items, and hide those who don't match the search query
  if(favori)
    {
      
    for (i = 0; i < li.length; i++) {
      a = li[i];
      txtValue = a.textContent || a.innerText;

      if ((txtValue.toLocaleUpperCase('tr-TR').indexOf(filter) > -1) && (li[i].getElementsByTagName("i")[0].className === "far fa-star favori") ){
        li[i].style.display = "";
        p.innerHTML = "";
        buttonAdd.style.display = "none";
        buttonFavori.style.display = "none";
        buttonBack.style.display = "none";
      } else {
        li[i].style.display = "none";
        counter++;
      }
      if (counter === li.length)
      {
        if (!(input.value === ""))
      {
        p.innerText = "Favoriler arasında '" + input.value + "' bulunamadı."; 
        buttonAdd.style.display = "none";
        buttonFavori.style.display = "";
        buttonBack.style.display = "";
      }
        else
        {
          p.innerText = "Favori listenize henüz bir şey eklemediniz.";
          buttonAdd.style.display = "none";
          buttonFavori.style.display = "none";
          buttonBack.style.display = "none";
        }
        
      }}}
    

  else
    {
      for (i = 0; i < li.length; i++) {
        a = li[i];
        txtValue = a.textContent || a.innerText;
  
        if (txtValue.toLocaleUpperCase('tr-TR').indexOf(filter) > -1){
          li[i].style.display = "";
          p.innerHTML = "";
          buttonFavori.style.display="none";
          buttonAdd.style.display = "none";
          buttonBack.style.display = "none";
        } else {
          li[i].style.display = "none";
          counter++;
  
        }
        if (counter === li.length)
        {
          
          p.innerText = "'" + input.value + "' bulunamadı."; 
          buttonAdd.style.display = "";
          buttonBack.style.display = "";
          buttonFavori.style.display = "none";
    }}}
  }



  function pulse(object)
  {
    

    if (object.classList.contains("favori-deactive"))
    {
      object.classList.add("favori-active");
      object.classList.remove("favori-deactive");
      favori = true;
    }

      

    else
    {
     object.classList.add("favori-deactive");
     object.classList.remove("favori-active")
     favori = false;
    }
    search2(object.parentNode.getElementsByTagName("input")[0]);
  }