(() => {
'use strict';


document.addEventListener('DOMContentLoaded', () => {

  let grid = document.querySelector('.grid'),
      scrollBarX = document.querySelector('.scroll-bar');

  //TODO: add loader into grid cos images loading can take a while
  // set layout of images
  let pckry = new Packery(grid, {
    itemSelector: '.grid-item',
    gutter: 10,
    horizontal: true
  });


  // ALL THE INFORMATION ABOUT IMAGES, INCLUDING COMMENTS
  let data = [];
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
        new ImageCollection(data);
      }
    };

    xhr.open('GET', 'data/image_posts.json');
    xhr.send();
  }

  function ImageCollection(data) {
    let collection = [],
        lastId = getLastId(data);

    for (let i = 0, n = data.length; i < n; i++) {
      collection.push(new ImagePost(data[i]));
    }



    this.getImagePost = (id) => {
      for (let i = 0, n = collection.length; i < n; i++) {
        if (collection[i].id === id) return collection[i];
      }
    };

    this.addImagePost = () => {

    }

    function getLastId(data) {
      let id = 0;
      for (let i = 0, n = data.length; i < n; i++) {
        id = (data[i].id > id) ? data[i].id : id;
      }
      return id;
    }
  }

  function ImagePost(data) {
    this.id = data.id || null;
    this.imgSmall = data.imgSmall || data.imgBig;
    this.imgBig = data.imgBig;
    this.orientation = data.orientation || 'normal';
    this.likes = data.likes || 0;
    this.dislikes = data.dislikes || 0;
    this.comments = [];

    data.comments && data.comments.forEach((comment) => {
      this.comments.push(new Comment(
        comment.text,
        comment.nickname,
        comment.date
      ));
    });

    this.node = putInGrid(this);

    function putInGrid(self) {
      let gridItem, img, hoverBox, icon;

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
      adjustScrollBarWidth();

      return gridItem;
    }

    function addIcon(className, dataCount) {
      let icon = document.createElement('I');
      icon.className = 'sprite ' + className;
      icon.setAttribute('data-count', dataCount);

      return icon;
    }
  }

  function Comment(text, nickname, date) {
    return {
      text,
      nickname,
      date
    };
  }

  Comment.prototype.getParsedDate = () => {

  }








  // Enable scroll if grid is wider

  // use closure to keep reference to section
  // if grid is wider returns the difference in percents
  // otherwise returns 100%
  let getGridPercentage = (() => {
    let section = document.querySelector('section.main');

    return () => {
      let sectionWidth = section.clientWidth;
      let gridWidth = grid.clientWidth;

      if (gridWidth > sectionWidth) {
        return (sectionWidth / gridWidth * 100) + '%';
      } else {
        return 100 + '%';
      }
    };
  })();

  let adjustScrollBarWidth = () => {
    scrollBarX.style.width = getGridPercentage();
  };

  adjustScrollBarWidth();

  // event handler for scrollbars

  // use closure to keep track of mouse move
  // and attach event handler to window only once
  let onMove = (() => {
    //X for scrollBarX and Y for scrollBarY
    let lastMouseX = null,
        lastMouseY = null,
        marginX = parseFloat(window.
                  getComputedStyle(scrollBarX).marginLeft),
        scrollBoxWidth = scrollBarX.parentNode.clientWidth;

    //get scrollArea
    let scrollAreaX = document.querySelector
                     (scrollBarX.parentNode.getAttribute('data-scroll-area'));

    //actual onMove Handler
    let onMove = (e) => {
      let diff,
          scrollBar = onMove.currentTarget,
          scrollBarWidth = onMove.scrollBarWidth,
          gridWidth = onMove.gridWidth;//???????????????

      //remember initial position of the mouse
      if (lastMouseX === null) {
        lastMouseX = e.clientX;
        return;
      }
      // get mouse move
      diff = e.clientX - lastMouseX;
      lastMouseX = e.clientX;

      marginX += diff;
      //prevent dragging to left if on edge
      if (marginX <= 0) {
        scrollBar.style.marginLeft = marginX = 0;
        // to prevent insufficient scroll, when browser renders scroll to slow
        scrollAreaX.scrollLeft = 0;
        return;
      //prevent dragging to right if on edge
    } else if (scrollBarWidth + marginX >= scrollBoxWidth) {
        marginX = scrollBoxWidth - scrollBarWidth;
      }
      scrollBar.style.marginLeft = marginX + 'px';

      //adjust grid position due to percentage value of scroll-bar margin
      //***->->-> scrollbar.marginLeft / parent.width = -grid.marginLeft / grid.width <-<-<-***
      scrollAreaX.scrollLeft = marginX / scrollBoxWidth * gridWidth;
    };

    //to disable scrolling onmouseup
    let removeScrollListeners = () => {
      window.removeEventListener('mousemove', onMove);
      lastMouseX = null;
    };

    window.addEventListener('mouseup', removeScrollListeners);
    window.addEventListener('blur', removeScrollListeners);

    return onMove;
  })();

  scrollBarX.addEventListener('mousedown', (e) => {
    //remember which scrollbar we are currently on
    onMove.currentTarget = e.target;

    //remember width of the scrollbar and width of the grid
    //they are needed for dragging computations
    onMove.scrollBarWidth = e.target.clientWidth;
    onMove.gridWidth = grid.clientWidth;

    window.addEventListener('mousemove', onMove);
  });


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



  // GRID LISTENERS -> POPUP && ADD NEW IMAGE
  let clickListener = (() => {
    //closure
    let bigImgPopup = document.querySelector('.popup.big-img'),
        orientationPopup = document.querySelector('.popup.orientation-chose'),
        orientation;

    // actual listener
    return (e) => {
      let target = e.target;

      // image on main window
      if (target.tagName === 'IMG') {

        fadePopup('in', bigImgPopup);

    } else if (orientation = target.getAttribute('data-orientation')) {


      let imgBig = target.firstElementChild.src;

      new ImagePost({orientation, imgBig});
      fadePopup('out', orientationPopup);

      // ************* POPUP *****************
      // Like and Dislike buttons
    } else if (hasClass(target, 'image-button') ||
               hasClass(target.parentNode, 'image-button')) {

      // if click on child node
        if (target.tagName === 'I') target = target.parentNode;


        if (hasClass(target, 'clicked')) return;
      // if there is already a clicked button -> unclick it
        let otherClickedButton = bigImgPopup.querySelector('.image-button.clicked');
        if (otherClickedButton) removeClass(otherClickedButton, 'clicked');
      // TODO: -1 for likes or dislikes

      // "press" the button
        addClass(target, 'clicked');
      // TODO: +1 for likes or dislikes

      } else if (hasClass(target, 'sprite-close')) {
        fadePopup('out', bigImgPopup);

      } else if (target.className.indexOf('send-button') > -1) {
      //to prevent label
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
