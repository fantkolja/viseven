(function() {
'use strict';

const Scrollbar = require('./scrollbar.es6.js');

let grid = document.querySelector('.grid');
// set layout of images
let pckry = new Packery(grid, {
  itemSelector: '.grid-item',
  gutter: 10,
  horizontal: true
});

let scrollX = new Scrollbar(document.querySelector('.scroll-bar'), 'h');
scrollX.adjustSize();

function ImageCollection(data) {
  let collection = [];
  let lastId = getLastId(data);

  function getLastId(data) {
    let id = 0;
    for (let i = 0, n = data.length; i < n; i++) {
      id = (data[i].id > id) ? data[i].id : id;
    }
    return id;
  }

  for (let i = 0, n = data.length; i < n; i++) {
    collection.push(new ImagePost(data[i]));
  }

  this.getImagePost = (id) => {
    for (let i = 0, n = collection.length; i < n; i++) {
      if (collection[i].id === id) return collection[i];
    }

    console.log('No image post with id:', id);
  };

  this.addImagePost = (imgInfoObj) => {
    if (!imgInfoObj.id) imgInfoObj.id = ++lastId;
    let imagePost = new ImagePost(imgInfoObj);
    collection.push(imagePost);
  };
}

ImageCollection.prototype.evaluate = function(id, isLike, isPlus, target) {
  let imgPost = this.getImagePost(id);
  let imgSmall = document.querySelector('[data-id="' + id + '"]');
  let evaluation = isLike ? 'like' : 'dislike';
  let iconSmall = imgSmall.nextElementSibling.querySelector('.sprite-' + evaluation);
  let currentValue;

  // remember my evaluation
  imgPost.myEvaluation = evaluation;

  // results in 'likes' || 'dislikes'
  if (isPlus) currentValue = ++imgPost[evaluation + 's'];
  else currentValue = --imgPost[evaluation + 's'];

  iconSmall.setAttribute('data-count', currentValue);
  target.firstElementChild.setAttribute('data-count', currentValue);
}

/**
 * Adds comment to the post with set id
 * @param {Number}
 * @param {Object} of type {text, nickname, date}
 * @returns
 */
ImageCollection.prototype.addComment = function(id, comment) {
  let post = this.getImagePost(id);
  post.comments.unshift(new Comment(
    comment.text,
    comment.nickname,
    comment.date
  ));
  post.showComments(id);
}

function ImagePost(data) {
  this.id = data.id || null;
  this.imgSmall = data.imgSmall || data.imgBig;
  this.imgBig = data.imgBig;
  this.orientation = data.orientation || 'normal';
  this.likes = data.likes || 0;
  this.dislikes = data.dislikes || 0;
  this.comments = [];
  this.myEvaluation = null // my "like" || "dislike"

  //sort comments due to date
  data.comments && data.comments.sort((a, b) => {
    return b.date - a.date;
  });

  data.comments && data.comments.forEach((comment) => {
    this.comments.push(new Comment(
      comment.text,
      comment.nickname,
      comment.date
    ));
  });

  this.node = putInGrid(this);
}

function putInGrid(self) {
  let gridItem, img, hoverBox, icon;

  function addIcon(className, dataCount) {
    let icon = document.createElement('I');
    icon.className = 'sprite ' + className;
    icon.setAttribute('data-count', dataCount);
    return icon;
  }

  gridItem = document.createElement('DIV');

  switch(self.orientation) {
    case 'landscape':
    gridItem.className = 'grid-item grid-item--width';
    break;

    case 'portrait':
    gridItem.className = 'grid-item grid-item--height';
    break;

    default:
    gridItem.className = 'grid-item';
  }

  img = document.createElement('IMG');
  img.src = self.imgSmall;
  img.alt = 'Image ' + self.id;
  img.setAttribute('data-id', self.id);
  gridItem.appendChild(img);

  hoverBox = document.createElement('DIV');
  hoverBox.className = 'hover-box';

  hoverBox.appendChild(addIcon('sprite-comment', self.comments.length));
  hoverBox.appendChild(addIcon('sprite-like', self.likes));
  hoverBox.appendChild(addIcon('sprite-dislike', self.dislikes));

  gridItem.appendChild(hoverBox);

  // insert before placeholder for adding images
  grid.insertBefore(gridItem, grid.lastElementChild);

  //redraw Packery
  pckry.reloadItems()
  pckry.layout();

  //adjust scrollbar
  scrollX.adjustSize();

  return gridItem;
}


ImagePost.prototype.showComments = (function() {
  let commentsDiv = document.querySelector('.comments')
  return function(id) {
    // clear div
    commentsDiv.innerHTML = '';
    this.comments.forEach((comment) => {
      comment.putOnPage(commentsDiv);
    });
    // update icons and comments number
    document.querySelector('.popup-comments h2 span')
    .textContent = this.comments.length;

    if (id) {
      this.node.querySelector('.sprite-comment')
      .setAttribute('data-count', this.comments.length);
    }
  };
})();

function Comment(text, nickname, date) {
  this.text = text;
  this.nickname = nickname;
  this.date = parseDate(new Date(date));
}

function parseDate(date) {
  let minutes = date.getMinutes();
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  let hours = date.getHours();
  let dayPart = (hours > 12) ? 'PM' : 'AM';
  hours = (hours > 12) ? hours - 12 : hours;

  let oneDay = 24*60*60*1000;
  let diff, diffDays, diffMonth, diffYear, now = new Date();

  diffDays = Math.round((now - date) / oneDay);
  diffYear = now.getFullYear() - date.getFullYear();

  if (diffDays > 365) {
    let year = (diffYear == 1) ? ' year' : ' years';
    diff = diffYear + year + ' ago';
  } else if (diffDays > 31) {
    diffMonth = now.getMonth() - date.getMonth();
    if (diffYear) diffMonth += 12;
    let month = (diffMonth == 1) ? ' month' : ' months';
    diff = diffMonth + month + ' ago';
  } else if (diffDays > 1) {
    diff = diffDays + ' days ago';
  } else if (diffDays == 1) {
    diff = 'Yesterday';
  } else {
    diff = 'Today';
  }

  return diff + ' ' + hours + ':' + minutes + ' ' + dayPart;
}

Comment.prototype.putOnPage = function(parentNode) {
  function createSpan(className, textContent) {
    let span = document.createElement('SPAN');
    span.className = className;
    span.textContent = textContent;
    return span;
  }

  let comment = document.createElement('DIV');
  comment.className = 'comment';

  comment.appendChild(createSpan('nickname', this.nickname));
  comment.appendChild(createSpan('date', this.date));

  let text = document.createElement('DIV');
  text.className = 'comment-text';
  text.appendChild(createSpan('', this.text));
  comment.appendChild(text);

  parentNode.appendChild(comment);
};

module.exports = ImageCollection;

}());
