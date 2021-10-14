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
    var button = object.parentNode.parentNode.getElementsByTagName("button")[0];
    var button2 = object.parentNode.parentNode.getElementsByTagName("button")[1];
    var glass = object.parentNode.getElementsByTagName("i")[1];
    
    if (filter === "")
      glass.style.display = "";
    else
      glass.style.display = "none";


    // Loop through all list items, and hide those who don't match the search query
  if(favori)
    {
      
    for (i = 0; i < li.length; i++) {
      a = li[i];
      txtValue = a.textContent || a.innerText;

      if ((txtValue.toLocaleUpperCase('tr-TR').indexOf(filter) > -1) && (li[i].getElementsByTagName("i")[0].className === "fas fa-star") ){
        li[i].style.display = "";
        p.innerHTML = "";
        button.style.display = "none";
        button2.style.display = "none";
      } else {
        li[i].style.display = "none";
        counter++;

      }
      if (counter === li.length)
      {
        
        p.innerText = "Favoriler arasında '" + input.value + "' bulunamadı."; 
        button.style.display = "";
        button2.style.display = "";
        
      }}}
    

  else
    {
      for (i = 0; i < li.length; i++) {
        a = li[i];
        txtValue = a.textContent || a.innerText;
  
        if (txtValue.toLocaleUpperCase('tr-TR').indexOf(filter) > -1){
          li[i].style.display = "";
          p.innerHTML = "";
          button.style.display = "none";
          button2.style.display = "none";
        } else {
          li[i].style.display = "none";
          counter++;
  
        }
        if (counter === li.length)
        {
          
          p.innerText = "'" + input.value + "' bulunamadı."; 
          button.style.display = "";
          button2.style.display = "";
    }}}
  }



  function pulse(object)
  {
    var fav = object;
    if (fav.className === "fas fa-star search-star")
    {
      favori = false;
    }  
    else
    {
      favori = true;
    }

    search2(object.parentNode.getElementsByTagName("input")[0]);
  }