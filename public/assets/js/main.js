"use strict";


/*--
    preloader
-----------------------------------*/
$(window).on('load', function (event) {
  $('#preloader').delay(500).fadeOut(500);
});

/*--
    Header Sticky
-----------------------------------*/

window.onscroll = function () {
  const left = document.getElementById("header");

  if (left.scrollTop > 50 || self.pageYOffset > 50) {
    left.classList.add("sticky")
  } else {
    left.classList.remove("sticky");
  }
}




/*--
    Menu parent Element Icon
-----------------------------------*/
const $subMenu = document.querySelectorAll('.sub-menu');
$subMenu.forEach(function (subMenu) {
  const menuExpand = document.createElement('span')
  menuExpand.classList.add('menu-icon')
  // menuExpand.innerHTML = '+'
  subMenu.parentElement.insertBefore(menuExpand, subMenu)
  if (subMenu.classList.contains('mega-menu')) {
    subMenu.classList.remove('mega-menu')
    subMenu.querySelectorAll('ul').forEach(function (ul) {
      ul.classList.add('sub-menu')
      const menuExpand = document.createElement('span')
      menuExpand.classList.add('menu-icon')
      menuExpand.innerHTML = '+'
      ul.parentElement.insertBefore(menuExpand, ul)
    })
  }
})

/*--
    Search Js
-----------------------------------*/
var $searchWrap = $('.search-wrap');
var $navSearch = $('.search-btn');
var $searchClose = $('#search-close');

$('.search-btn').on('click', function (e) {
  e.preventDefault();
  $searchWrap.animate({ opacity: 'toggle' }, 500);
  $navSearch.add($searchClose).addClass("open");
});

$('.search-close').on('click', function (e) {
  e.preventDefault();
  $searchWrap.animate({ opacity: 'toggle' }, 500);
  $navSearch.add($searchClose).removeClass("open");
});

function closeSearch() {
  $searchWrap.fadeOut(200);
  $navSearch.add($searchClose).removeClass("open");
}

$(document.body).on('click', function (e) {
  closeSearch();
});

$(".search-btn, .main-search-input").on('click', function (e) {
  e.stopPropagation();
});


/*--
    Mobile Menu 
-----------------------------------*/

/* Get Sibling */
const getSiblings = function (elem) {
  const siblings = []
  let sibling = elem.parentNode.firstChild
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling)
    }
    sibling = sibling.nextSibling
  }
  return siblings
}

/* Slide Up */
const slideUp = (target, time) => {
  const duration = time ? time : 500;
  target.style.transitionProperty = 'height, margin, padding'
  target.style.transitionDuration = duration + 'ms'
  target.style.boxSizing = 'border-box'
  target.style.height = target.offsetHeight + 'px'
  target.offsetHeight
  target.style.overflow = 'hidden'
  target.style.height = 0
  window.setTimeout(() => {
    target.style.display = 'none'
    target.style.removeProperty('height')
    target.style.removeProperty('overflow')
    target.style.removeProperty('transition-duration')
    target.style.removeProperty('transition-property')
  }, duration)
}

/* Slide Down */
const slideDown = (target, time) => {
  const duration = time ? time : 500;
  target.style.removeProperty('display')
  let display = window.getComputedStyle(target).display
  if (display === 'none') display = 'block'
  target.style.display = display
  const height = target.offsetHeight
  target.style.overflow = 'hidden'
  target.style.height = 0
  target.offsetHeight
  target.style.boxSizing = 'border-box'
  target.style.transitionProperty = 'height, margin, padding'
  target.style.transitionDuration = duration + 'ms'
  target.style.height = height + 'px'
  window.setTimeout(() => {
    target.style.removeProperty('height')
    target.style.removeProperty('overflow')
    target.style.removeProperty('transition-duration')
    target.style.removeProperty('transition-property')
  }, duration)
}

/* Slide Toggle */
const slideToggle = (target, time) => {
  const duration = time ? time : 500;
  if (window.getComputedStyle(target).display === 'none') {
    return slideDown(target, duration)
  } else {
    return slideUp(target, duration)
  }
}


/*--
Offcanvas/Collapseable Menu 
-----------------------------------*/
const offCanvasMenu = function (selector) {

  const $offCanvasNav = document.querySelector(selector),
    $subMenu = $offCanvasNav.querySelectorAll('.sub-menu');
  $subMenu.forEach(function (subMenu) {
    const menuExpand = document.createElement('span')
    menuExpand.classList.add('menu-expand')
    // menuExpand.innerHTML = '+'
    subMenu.parentElement.insertBefore(menuExpand, subMenu)
    if (subMenu.classList.contains('mega-menu')) {
      subMenu.classList.remove('mega-menu')
      subMenu.querySelectorAll('ul').forEach(function (ul) {
        ul.classList.add('sub-menu')
        const menuExpand = document.createElement('span')
        menuExpand.classList.add('menu-expand')
        menuExpand.innerHTML = '+'
        ul.parentElement.insertBefore(menuExpand, ul)
      })
    }
  })

  $offCanvasNav.querySelectorAll('.menu-expand').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault()
      const parent = this.parentElement
      if (parent.classList.contains('active')) {
        parent.classList.remove('active');
        parent.querySelectorAll('.sub-menu').forEach(function (subMenu) {
          subMenu.parentElement.classList.remove('active');
          slideUp(subMenu)
        })
      } else {
        parent.classList.add('active');
        slideDown(this.nextElementSibling)
        getSiblings(parent).forEach(function (item) {
          item.classList.remove('active')
          item.querySelectorAll('.sub-menu').forEach(function (subMenu) {
            subMenu.parentElement.classList.remove('active');
            slideUp(subMenu)
          })
        })
      }
    })
  })
}
offCanvasMenu('.offcanvas-menu');

/*--
  magnificPopup video view 
-----------------------------------*/
$('.popup-video').magnificPopup({
  type: 'iframe'
});

/*--
 Lightbox Gallery
-----------------------------------*/

lightbox.option({
  'wrapAround': true
});

/*--    
    Counter Up
-----------------------------------*/

$('.counter').counterUp({
  delay: 10,
  time: 1500,
});

var swiper = new Swiper(".hero-slide", {
  effect: "fade",
  loop: "true",
  autoplay: {
    delay: 3000
  },
  // direction: "vertical",
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});



/*--
Mousemove Parallax
-----------------------------------*/
var b = document.getElementsByTagName("BODY")[0];

b.addEventListener("mousemove", function (event) {
  parallaxed(event);

});

function parallaxed(e) {
  var amountMovedX = (e.clientX * -0.1 / 8);
  var amountMovedY = (e.clientY * -0.1 / 8);
  var x = document.getElementsByClassName("parallaxed");
  var i;
  for (i = 0; i < x.length; i++) {
    x[i].style.transform = 'translate(' + amountMovedX + 'px,' + amountMovedY + 'px)'
  }
}


/*--    
  Testimonial
-----------------------------------*/
var swiper = new Swiper(".author-images-active .swiper-container", {
  loop: true,
  spaceBetween: 0,
  slidesPerView: 1,
  effect: "fade",
  watchSlidesVisibility: true,
  watchSlidesProgress: true,
});
var swiper2 = new Swiper(".testimonial-content-active .swiper-container", {
  loop: true,
  spaceBetween: 0,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  thumbs: {
    swiper: swiper,
  },
});




/*--    
  Progress Bar
-----------------------------------*/

if ($('.progress-line').length) {
  $('.progress-line').appear(function () {
    var el = $(this);
    var percent = el.data('width');
    $(el).css('width', percent + '%');
  }, { accY: 0 });
}


/*--
    AOS
-----------------------------------*/
AOS.init({
  duration: 1200,
  once: true,
});


/*-- For schedule section plus minus button
--------------------------------*/

$('.plus-icon-1').on('click', function () {
  $('.plus-icon-1').toggleClass("active").find(".plus-icon-shape").toggleClass("active-plus");
});

$('.plus-icon-2').on('click', function () {
  $('.plus-icon-2').toggleClass("active").find(".plus-icon-shape").toggleClass("active-plus");
});

$('.plus-icon-3').on('click', function () {
  $('.plus-icon-3').toggleClass("active").find(".plus-icon-shape").toggleClass("active-plus");
});

/*--
    Countdown
-----------------------------------*/
function makeTimer($endDate, $this, $format) {
  var today = new Date();
  var BigDay = new Date($endDate),
    msPerDay = 24 * 60 * 60 * 1000,
    timeLeft = (BigDay.getTime() - today.getTime()),
    e_daysLeft = timeLeft / msPerDay,
    daysLeft = Math.floor(e_daysLeft),
    e_hrsLeft = (e_daysLeft - daysLeft) * 24,
    hrsLeft = Math.floor(e_hrsLeft),
    e_minsLeft = (e_hrsLeft - hrsLeft) * 60,
    minsLeft = Math.floor((e_hrsLeft - hrsLeft) * 60),
    e_secsLeft = (e_minsLeft - minsLeft) * 60,
    secsLeft = Math.floor((e_minsLeft - minsLeft) * 60);

  var yearsLeft = 0;
  var monthsLeft = 0
  var weeksLeft = 0;

  if ($format != 'short') {
    if (daysLeft > 365) {
      yearsLeft = Math.floor(daysLeft / 365);
      daysLeft = daysLeft % 365;
    }

    if (daysLeft > 30) {
      monthsLeft = Math.floor(daysLeft / 30);
      daysLeft = daysLeft % 30;
    }
    if (daysLeft > 7) {
      weeksLeft = Math.floor(daysLeft / 7);
      daysLeft = daysLeft % 7;
    }
  }

  var yearsLeft = yearsLeft < 10 ? "0" + yearsLeft : yearsLeft,
    monthsLeft = monthsLeft < 10 ? "0" + monthsLeft : monthsLeft,
    weeksLeft = weeksLeft < 10 ? "0" + weeksLeft : weeksLeft,
    daysLeft = daysLeft < 10 ? "0" + daysLeft : daysLeft,
    hrsLeft = hrsLeft < 10 ? "0" + hrsLeft : hrsLeft,
    minsLeft = minsLeft < 10 ? "0" + minsLeft : minsLeft,
    secsLeft = secsLeft < 10 ? "0" + secsLeft : secsLeft,
    yearsText = yearsLeft > 1 ? 'Years' : 'Year',
    monthsText = monthsLeft > 1 ? 'Months' : 'month',
    weeksText = weeksLeft > 1 ? 'Weeks' : 'Week',
    daysText = daysLeft > 1 ? 'Days' : 'Day',
    hourText = hrsLeft > 1 ? 'Hours' : 'Hour',
    minsText = minsLeft > 1 ? 'Minutes' : 'Minute',
    secText = secsLeft > 1 ? 'Seconds' : 'Second';

  var $markup = {
    wrapper: $this.find('.countdown__item'),
    year: $this.find('.yearsLeft'),
    month: $this.find('.monthsLeft'),
    week: $this.find('.weeksLeft'),
    day: $this.find('.daysLeft'),
    hour: $this.find('.hoursLeft'),
    minute: $this.find('.minsLeft'),
    second: $this.find('.secsLeft'),
    yearTxt: $this.find('.yearsText'),
    monthTxt: $this.find('.monthsText'),
    weekTxt: $this.find('.weeksText'),
    dayTxt: $this.find('.daysText'),
    hourTxt: $this.find('.hoursText'),
    minTxt: $this.find('.minsText'),
    secTxt: $this.find('.secsText')
  }

  var elNumber = $markup.wrapper.length;
  $this.addClass('item-' + elNumber);
  $($markup.year).html(yearsLeft);
  $($markup.yearTxt).html(yearsText);
  $($markup.month).html(monthsLeft);
  $($markup.monthTxt).html(monthsText);
  $($markup.week).html(weeksLeft);
  $($markup.weekTxt).html(weeksText);
  $($markup.day).html(daysLeft);
  $($markup.dayTxt).html(daysText);
  $($markup.hour).html(hrsLeft);
  $($markup.hourTxt).html(hourText);
  $($markup.minute).html(minsLeft);
  $($markup.minTxt).html(minsText);
  $($markup.second).html(secsLeft);
  $($markup.secTxt).html(secText);
}

$('.countdown').each(function () {
  var $this = $(this);
  var $endDate = $(this).data('countdown');
  var $format = $(this).data('format');
  setInterval(function () {
    makeTimer($endDate, $this, $format);
  }, 0);
});


// Gijgo Date Picker

$('#datepicker').datepicker({
  icons: {
    rightIcon: '<i class="fas fa-angle-down"></i>'
  },
  format: 'dd mmmm yyyy',
  uiLibrary: 'bootstrap5',
  iconsLibrary: 'fontawesome',
});


// function updateCurrentTime() {
//     const now = new Date();
//     const formattedTime = now.toLocaleTimeString();
//     document.getElementById('current-time').textContent = formattedTime;
//   }

// setInterval(updateCurrentTime, 1000);


if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  // Constraints - specify the media types you want to access (e.g., video and audio)
  const constraints = { video: true };

  let mediaStream = null;

  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const videoElement = document.getElementById('videoElement');

  if (startButton) {
    startButton.addEventListener('click', function () {
      // Access the webcam
      navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
          mediaStream = stream;
          videoElement.srcObject = stream;
        })
        .catch(function (error) {
          console.error('Error accessing the webcam:', error);
        });
    });
  }
  if (stopButton) {
    stopButton.addEventListener('click', function () {
      if (mediaStream) {
        const tracks = mediaStream.getTracks();

        tracks.forEach(function (track) {
          track.stop(); // Stop each track in the media stream
        });

        videoElement.srcObject = null; // Clear the video element's source
      }
    });
  }
} else {
  console.error('getUserMedia is not supported by your browser');
}


function toggleEditMode() {
  const inputs = document.querySelectorAll('#eventContainer input');
  inputs.forEach(input => input.disabled = !input.disabled);
}

function saveChanges() {
  const inputs = document.querySelectorAll('#eventContainer input');
  inputs.forEach(input => input.disabled = true);

  // Prepare the data to send
  const data = {
    location: document.getElementById('locationInput').value,
    date: document.getElementById('dateInput').value,
    starts: document.getElementById('startsInput').value,
    ends: document.getElementById('endsInput').value
  };

  // Send a POST request to save the changes
  fetch('/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        console.log('Changes saved successfully!');
      } else {
        console.error('Failed to save changes:', response.statusText);
      }
    })
    .catch(error => {
      console.error('An error occurred while saving changes:', error);
    });
}

function copyWebsiteLink() {
  var link = window.location.href; // Get the current website URL

  var tempInput = document.createElement('input');
  tempInput.setAttribute('value', link);
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  // Show alert message
  alert('Website link copied to clipboard');

  // You can perform any other action here
}

var msgBtn = document.getElementsByClassName("msgBtn");

// TODO research on getById() for the button and any other data inputs
Array.from(msgBtn).forEach(function (element) {
  element.addEventListener('click', function (e) {
    e.preventDefault();
    let content = this.parentNode.childNodes[1].value
    // NEVER TRUST THE CLIENT
    // let summary = this.parentNode.parentNode.parentNode.childNodes[41].childNodes[1].innerHTML
    // let user = this.parentNode.parentNode.parentNode.childNodes[41].childNodes[3].innerHTML

    // TODO POST message
    // TODO update to only include message attributes
    // TODO check if we need the event ID
    const eventIdRoute = window.location.pathname;
    fetch(`${eventIdRoute}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'content': content
      })
    })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        window.location.reload(true);
        // TODO update the html with the new message

      })
  })
})

