/*
 * Flickr photo request script.
 */
 
 var gallery = [],
 counter = 0,
 tempSearch = [], 
 scroll, 
 paging = 1,
 FLICKR_API_URL = "https://api.flickr.com/services/rest/?";
 var searchField=document.getElementById('searchField'),
 searchBtn=document.getElementById('searchBtn'),
 galleryBtn=document.getElementById('galleryBtn'),
 loadmoreBtn=document.getElementById('loadmoreBtn');
 var RATION_OPTION={
        SMALL_SIZE:'z',
        MEDIUM_SIZE:'c',
        LARG_SIZE:'b',
        XLARG_SIZE:'h'
}

var options = {
  "api_key": "9a47071b610a000ef87123931e2c5d30",
  "method": "flickr.photos.search",
  "format": "json",
  "page": "1",
  "per_page": "21",
  "nojsoncallback": "1",
  "text": "", 
      // Method to set the new search keyword.
      changeKeyword: function(val) { 
        this.text = val;
        deActiveBtn();
      },
      // Method to set the next page (+1 page every time).
      nextPage: function() { 
        this.page = paging;
        deActiveBtn();
      },
      // The current number of thumbnails by the search results.
      currentNum: function() { 
        return this.per_page * this.page;
      }
    }

// Reveal the size of a photo that fits the current resolution 
var setBestSize = function() {
  var winHeight = window.innerHeight;
  var bestSize;
  if( winHeight >= 1600) bestSize = RATION_OPTION.XLARG_SIZE; 
  else if (winHeight >= 1024) bestSize = RATION_OPTION.LARG_SIZE;
  else if (winHeight >= 800)  bestSize = RATION_OPTION.MEDIUM_SIZE; 
  else bestSize = RATION_OPTION.SMALL_SIZE;
  return bestSize;
};

// Add /Enter/ key event in the text field to run a search when PressEnterKey on the field
searchField.addEventListener("keyup", function(e) {
  e.preventDefault();
  if (e.keyCode == 13) {
    newSearchRequest();
  }
});

// load more
function loadMoreRequest()
{  
  paging++; //next page
  options.nextPage();  
  //console.log(options);
  getFlickrRequest(resultData);
}

// Start a new search function.
function newSearchRequest() 
{
  paging=1; //reset 
  options.nextPage(); 
  options.changeKeyword(searchField.value); 
  getFlickrRequest(resultData)
}


// AJAX function to request photos through Flickr's API.
var getFlickrRequest = function(returnData) {
  var url, xhr;
  url = generateFlickrURL();
  //console.log(url);
  // Avoid a request if the search text field is empty.
  if (searchField.value != '') {
    xhr = new XMLHttpRequest();
    xhr.onload = function() {
      returnData(this.response);
      //console.log(this.response);
      activeBtn();
    };
    xhr.open('get', url, true);
    xhr.send();
  } else {
    activeBtn();
    loadmoreBtn.style.display = 'none';
  }
};
// URL generator
function generateFlickrURL() {
  var url = FLICKR_API_URL;
  var keys = Object.keys(options);
  keys.forEach(function(key, index) {
    if(typeof options[key]!=='function')
      url += key + '=' + options[key] + "&";
  });
  return url.substring(0, url.length - 1);;
}

// Enable buttons /sok//ladda mer/ 
function activeBtn() {
  searchBtn.value = 'Sök';
  loadmoreBtn.value = 'Ladda Mer';
  searchBtn.removeAttribute('disabled');
  loadmoreBtn.removeAttribute('disabled');
}

// Disable buttons /sok//ladda mer/
function deActiveBtn() {
  searchBtn.value = 'Vänta..';
  loadmoreBtn.value = 'Vänta..';
  searchBtn.disabled = 'true';
  loadmoreBtn.disabled = 'true';
}

// Function to set multible Attributes through loop.
function setAttributes(element, attrs) {
  for (var key in attrs) {
    element.setAttribute(key, attrs[key]);
  }
}

// AJAX responding results (data)
function resultData(data) {
  var jsonObj = JSON.parse(data);  
  var photoObj = jsonObj.photos.photo;
  //  Check availability to show load more button.
  loadmoreBtn.style.display = (+jsonObj.photos.total > options.currentNum() )? 'block' : 'none';
  // Clear the previous search to view the new search results, if the user has a new search request.
  if (options.page == '1')
    document.getElementById('mainView').innerHTML = "";
  var mainView = document.getElementById("mainView");
  var cls = '',
  divElement;
  // Append retrived photos element by element to the view area. 
  for (var i in photoObj) {
    if (photoObj.hasOwnProperty(i)) {
      cls = '';
      divElement = document.createElement("div");
      setAttributes(divElement, {
        'class': '',
        'style': 'background-image:url(https://farm' + photoObj[i].farm + '.staticflickr.com/' + photoObj[i].server + '/' + photoObj[i].id + '_' + photoObj[i].secret + '_m.jpg);',
        'photoid': photoObj[i].id
      });

      divElement.innerHTML = '<span></span><span>i galleriet</span>';
      // Check if current photo are already selected or not to set a highlight class to this thumbnails.
      if (typeof gallery[photoObj[i].id] !== 'undefined') divElement.setAttribute('class', 'active'); 
      // Appendchild are used to keep eventlistener function when click load more and not lost the event by InnrHTML method.
      mainView.appendChild(divElement);
      // Gallery will copy the details of current photo object, so no need to make new Flickr request.
      tempSearch[photoObj[i].id] = photoObj[i]; 
    }
  }
  // /step/ variable will help /loadmore option/ to add events to the new elements thumbnails and avoid previous loaded thumbnails. 
  updateSelectEvents()
}

function updateSelectEvents()
{
  var newElements = document.querySelectorAll('div#mainView div');
  var step = parseInt(options.per_page * (paging - 1));
  // add click event to the retrived element/s.
  for (var j = (+step); j < newElements.length; j++) {
    newElements[j].addEventListener("click", selectPhotoFunction, true);
  }
  // Scroll down to show new thumbnails if load more requested.  
  if (step > 0) {
    var element = document.querySelector('#mainView');
    scroll = setInterval("scrollit()", 10); 
  }
}

//  Function to set active the selected thumbnail , /increase,decrease/ and to show the current counter number.
function selectPhotoFunction() {
  if (!this.classList.contains('active')) { 
    var temp = this.getAttribute("photoid");
    gallery[temp] = tempSearch[temp];
    this.classList.toggle('active');
    counter++;
  } else { 
    this.classList.toggle('active');
    delete gallery[this.getAttribute("photoid")];
    counter--;
  }
  galleryBtn.value = 'Visa Galleri (' + counter + ')';
};

// View gallery in new layer.
function viewGallery() {
  var content = document.querySelector("#galleryDisplay>div");
  var mainView = document.querySelector("#galleryDisplay");
  var shadow = document.getElementById("shadow2");
  mainView.style.display = 'block';
  content.innerHTML = '';
  // loop through selected photos to view them in separate layer (like a gallery)
  for (var i in gallery) {
    content.innerHTML += '<div photoid="' + gallery[i].id + '" style="background-image:url(https://farm' + gallery[i].farm + '.staticflickr.com/' + gallery[i].server + '/' + gallery[i].id + '_' + gallery[i].secret + '_m.jpg);" onclick="viewSingle(\'' + gallery[i].id + '\')"/><span></span></div>';
  }
  fadeIn(mainView);
  shadow.style.display = 'block';
}

// View the selected photo in larger format.
function viewSingle(ids) {
  var continer = document.getElementById('continer');
  var shadow = document.getElementById('shadow1');
  // Get the larger format of the selcted photo.
  var img = '<img src="https://farm' + gallery[ids].farm + '.staticflickr.com/' + gallery[ids].server + '/' + gallery[ids].id + '_' + gallery[ids].secret + '_' + setBestSize() + '.jpg" id="c' + gallery[ids].id + '" class="mainimage"/>';
  document.getElementById('tempImage').innerHTML = img;
  var imgselector = document.querySelector('.mainimage');
  // Function to wait image loading before view it.
  imgselector.addEventListener("load", function() {
    fadeIn(continer);
    shadow.style.display = 'block';
    // Adjust the photo in the center of the screen.
    continer.style.top = Math.round((window.innerHeight - imgselector.height) / 2) + 'px';
    continer.style.left = Math.round((window.innerWidth - imgselector.width) / 2) + 'px';
  });
}

// Hiding shadow layers.
function closeSingle(num) {
  var continer = (num == '1') ? document.getElementById('continer') : document.getElementById('galleryDisplay');
  var shadow = document.getElementById('shadow' + num);
  fadeOut(continer);
  shadow.style.display = 'none';
}

/*  
 * Next are  aditional functions to do some of animations/motions to view new elements/layers in nice way to the users.
 */

// Fade out function.
function fadeOut(element) {
  element.style.opacity = 1;
  (function fade() {
    if ((element.style.opacity -= 0.1) < 0) {
      element.style.display = 'none';
      element.classList.add('ifnone');
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

// Fade in function.
function fadeIn(element, display) {
  if (element.classList.contains('ifnone')) {
    element.classList.remove('ifnone');
  }
  element.style.opacity = 0;
  element.style.display = display || "block";

  (function fade() {
    var val = parseFloat(element.style.opacity);
    if (!((val += 0.1) > 1)) {
      element.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
}

var timeout=0;
function scrollit() {
  var element = document.querySelector('#mainView');
  var steps = Math.round(element.offsetHeight / 32);
  element.scrollTop += steps;
  // console.log('S Top '+ element.scrollTop);
  if (+element.scrollTop + +element.offsetHeight > Math.round(element.scrollHeight-20) || timeout==50)
    { clearInterval(scroll); timeout=0;}
  else 
    timeout++;
}
