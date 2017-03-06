// TODO: add popup "onblur"
// TODO: inputs.addPlaceholders() - > both, ('nickname') -> nickname
(() => {
'use strict';

const Scrollbar = require('./modules/scrollbar.es6.js');
const ImageCollection = require('./modules/image-collection.es6.js');

// ALL THE INFORMATION ABOUT IMAGES, INCLUDING COMMENTS
let imageCollection = {};
getData();

function getData() {
  let xhr = new XMLHttpRequest(), data;
  xhr.onreadystatechange = () => {

    if (xhr.readyState == 4 && xhr.status == 200) {
      try {
        data = JSON.parse(xhr.response);
      } catch (e) {
        alert('Invalid Server response. Sorry!');
      }
      imageCollection = new ImageCollection(data);
    }
  };

  xhr.open('GET', 'data/image_posts.json');
  xhr.send();
}

document.addEventListener('DOMContentLoaded', () => {
  //TODO: add loader into grid cos images loading can take a while

  // ADDING NEW IMAGE
  let fileHandler = (() => {
    let orientationPopup = document.querySelector('.popup.orientation-chose');

    return (e) => {
      let file = e.target.files[0],
          imgTypePattern = /^image\//,
          reader;

      // usr didn't upload anything
      if (!file) return;

      // if not of type image
      if (!imgTypePattern.test(file.type)) {
        alert('You must upload an image!');
        return;
      }

      reader = new FileReader();

      reader.onload = (e) => {
        let imgs = orientationPopup.querySelectorAll('img');
        [].forEach.call(imgs, (img) => {
          img.src = e.target.result;

        });

        fadePopup('in', orientationPopup);
      };

      reader.readAsDataURL(file);
    };
  })();


  document.querySelector('input[type="file"]')
  .addEventListener('change', fileHandler);

  // FORM VALIDATION.
  // It's custom validation to get wider support in styling placeholders
  let inputs = document.querySelector('.popup-comments');
  inputs.nicknameNode = document.getElementById('nickname');
  inputs.commentNode = document.getElementById('comment');
  inputs.nicknameLabel = document.querySelector('[for="nickname"]');
  inputs.commentLabel = document.querySelector('[for="comment"]');
  inputs.placeholders = {
    nickname: inputs.nicknameLabel.getAttribute('data-placeholder'),
    comment: inputs.commentLabel.getAttribute('data-placeholder')
  };
  inputs.button = document.querySelector('.send-button');

  let blurHandler = (() => {
    let placeholders = inputs.placeholders;

    return (e) => {
      let tgt = e.target;
      if (tgt.tagName !== 'INPUT') return;
      let label = tgt.nextElementSibling;

      if (!tgt.value) {
        tgt.style.borderColor = 'red';
        label.style.color = 'red';
        // add placeholder
        label.setAttribute('data-placeholder', placeholders[tgt.id]);
      } else {
        tgt.style.borderColor = '';
        // delete placeholder
        label.setAttribute('data-placeholder', '');
      }
    };
  })();

  inputs.addEventListener('blur', blurHandler, true);

  function inputHandler(e) {
    let nickname = inputs.nicknameNode;
    let comment = inputs.commentNode;
    let tgt = e.target;
    let button = inputs.button;

    if (tgt.value) {
      tgt.style.borderColor = '';
    }

    if (!tgt.value) {
      button.style.cursor = '';
    }

    if (nickname.value && comment.value) {
      button.style.cursor = 'pointer';
    }
  }

  inputs.addEventListener('input', inputHandler);


  // GRID LISTENERS -> POPUP && ADD NEW IMAGE
  let clickListener = (() => {
    //closure
    let bigImgPopup = document.querySelector('.popup.big-img');
    let imgBig = bigImgPopup.querySelector('.image-big');
    let likeIcon = bigImgPopup.querySelector('.sprite-like');
    let dislikeIcon = bigImgPopup.querySelector('.sprite-dislike');
    let commentsNumber = bigImgPopup.querySelector('h2 span');
    let orientationPopup = document.querySelector('.popup.orientation-chose');
    let orientation;

    function showBigImgPopup(target) {
      let id = +target.getAttribute('data-id');
      let imgPost = imageCollection.getImagePost(id);

      imgBig.style.backgroundImage = 'url(' + imgPost.imgBig + ')';
      likeIcon.setAttribute('data-count', imgPost.likes);
      dislikeIcon.setAttribute('data-count', imgPost.dislikes);
      // if 1 of btton was pressed by user it should remain pressed
      if (imgPost.myEvaluation == 'like') {
        addClass(likeIcon.parentNode, 'clicked');
      } else if (imgPost.myEvaluation == 'dislike') {
        addClass(dislikeIcon.parentNode, 'clicked');
      }

      // commentsNumber.textContent = imgPost.comments.length;
      imgPost.showComments(id);
      fadePopup('in', bigImgPopup);

      // remember id of the current image
      bigImgPopup.currentId = id;
    }

    function createNewImgPost(imgBig, orientation) {
      imageCollection.addImagePost({imgBig, orientation});
      fadePopup('out', orientationPopup);
    }

    // tgt -> click target
    function handleBigImgButtons(tgt) {
    // if click on child node
      if (tgt.tagName === 'I') tgt = tgt.parentNode;

      if (hasClass(tgt, 'clicked')) return;
    // if there is already a clicked button -> unclick it
      let otherClickedButton = bigImgPopup.querySelector('.image-button.clicked');
      let isLike = hasClass(tgt, 'like');

      if (otherClickedButton) {
        // -1 for likes or dislikes
        removeClass(otherClickedButton, 'clicked');
        imageCollection.evaluate(bigImgPopup.currentId, !isLike, false, otherClickedButton);
      }

      // "press" the button
      addClass(tgt, 'clicked');
      // +1 for likes or dislikes
      imageCollection.evaluate(bigImgPopup.currentId, isLike, true, tgt);
    }

    function addComment() {
      let nickname = inputs.nicknameNode.value;
      let text = inputs.commentNode.value;
      if (!nickname || !comment) return;

      //clear inputs
      inputs.nicknameNode.value = inputs.commentNode.value = '';
      inputs

      let date = new Date();
      imageCollection.addComment(bigImgPopup.currentId, {
        text,
        nickname,
        date
      });
    }

    function clearPopup() {
      // unclick like buttons
      let clickedButton = bigImgPopup.querySelector('.clicked');
      if (clickedButton) removeClass(clickedButton, 'clicked');

      // remove current input values and styling
      let nickname = inputs.nicknameNode;
      let comment = inputs.commentNode;
      let nicknamePlaceholder = inputs.placeholders.nickname;
      let commentPlaceholder = inputs.placeholders.comment;
      let nicknameLabel = inputs.nicknameLabel;
      let commentLabel = inputs.commentLabel;

      nickname.value = comment.value = '';
      nickname.style.borderColor =
      comment.style.borderColor = '';
      nicknameLabel.style.color = commentLabel.style.color = '';
      inputs.button.style.cursor = '';

      // add placeholders
      nicknameLabel.setAttribute('data-placeholder', nicknamePlaceholder);
      commentLabel.setAttribute('data-placeholder', commentPlaceholder);
    }

    // actual listener
    return (e) => {
      let target = e.target;

      // click on images on main window
      if (target.tagName === 'IMG') {
        showBigImgPopup(target);

      // click on orientation images on popup
      } else if (orientation = target.getAttribute('data-orientation')) {

        createNewImgPost(target.firstElementChild.src, orientation);

      // ************* POPUP *****************
      // Like and Dislike buttons
      } else if (hasClass(target, 'image-button') ||
               hasClass(target.parentNode, 'image-button')) {

        handleBigImgButtons(target);

      } else if (hasClass(target, 'sprite-close')) {
        clearPopup();
        fadePopup('out', bigImgPopup);

      //to prevent focusing input
    } else if (hasClass(target, 'send-button') ||
               hasClass(target.parentNode, 'send-button')) {
        addComment();
        e.preventDefault();
      }
    };
  })();

  document.body.addEventListener('click', clickListener);

});//end DOMContentLoaded


// USEFUL FUNCTIONS
function fadePopup(direction, node) {
  let transitionDuration = parseFloat(window.getComputedStyle(node).transitionDuration) * 1000;

  if (direction == 'in') {
    node.style.display = 'block';
    node.style.opacity = 0;

    // to enable proper transitioning with minimal delay
      setTimeout(() => { node.style.opacity = 1; }, 4);
  } else {
    node.style.opacity = 0;

    // transitionDuration
    setTimeout(() => { node.style.display = 'none'; }, transitionDuration);
  }
}

function hasClass(elem, className) {
  let classes = elem.className.split(' ');
  return classes.indexOf(className) > -1;
}

function removeClass(elem, className) {
  let classes = elem.className.split(' ');
  let index = classes.indexOf(className);
  if (index > -1) classes.splice(index, 1);
  elem.className = classes.join(' ');
}

function addClass(elem, className) {
  if (!hasClass(elem, className))
  elem.className += ' ' + className;
}


})();

//TODO: DOM elements, that u manage through JS must have data-
