'use strict';

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    var grid = document.querySelector('.grid'),
        scrollBarX = document.querySelector('.scroll-bar');

    //TODO: add loader into grid cos images loading can take a while
    // set layout of images
    var pckry = new Packery(grid, {
      itemSelector: '.grid-item',
      gutter: 10,
      horizontal: true
    });

    // ALL THE INFORMATION ABOUT IMAGES, INCLUDING COMMENTS
    var data = [];
    getData();

    function getData() {
      var xhr = new XMLHttpRequest(),
          data = void 0;
      xhr.onreadystatechange = function () {

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
      var collection = [],
          lastId = getLastId(data);

      for (var i = 0, n = data.length; i < n; i++) {
        collection.push(new ImagePost(data[i]));
      }

      this.getImagePost = function (id) {
        for (var _i = 0, _n = collection.length; _i < _n; _i++) {
          if (collection[_i].id === id) return collection[_i];
        }
      };

      this.addImagePost = function () {};

      function getLastId(data) {
        var id = 0;
        for (var _i2 = 0, _n2 = data.length; _i2 < _n2; _i2++) {
          id = data[_i2].id > id ? data[_i2].id : id;
        }
        return id;
      }
    }

    function ImagePost(data) {
      var _this = this;

      this.id = data.id || null;
      this.imgSmall = data.imgSmall || data.imgBig;
      this.imgBig = data.imgBig;
      this.orientation = data.orientation || 'normal';
      this.likes = data.likes || 0;
      this.dislikes = data.dislikes || 0;
      this.comments = [];

      data.comments && data.comments.forEach(function (comment) {
        _this.comments.push(new Comment(comment.text, comment.nickname, comment.date));
      });

      this.node = putInGrid(this);

      function putInGrid(self) {
        var gridItem = void 0,
            img = void 0,
            hoverBox = void 0,
            icon = void 0;

        gridItem = document.createElement('DIV');

        switch (self.orientation) {
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
        pckry.reloadItems();
        pckry.layout();

        //adjust scrollbar
        adjustScrollBarWidth();

        return gridItem;
      }

      function addIcon(className, dataCount) {
        var icon = document.createElement('I');
        icon.className = 'sprite ' + className;
        icon.setAttribute('data-count', dataCount);

        return icon;
      }
    }

    function Comment(text, nickname, date) {
      return {
        text: text,
        nickname: nickname,
        date: date
      };
    }

    Comment.prototype.getParsedDate = function () {};

    // Enable scroll if grid is wider

    // use closure to keep reference to section
    // if grid is wider returns the difference in percents
    // otherwise returns 100%
    var getGridPercentage = function () {
      var section = document.querySelector('section.main');

      return function () {
        var sectionWidth = section.clientWidth;
        var gridWidth = grid.clientWidth;

        if (gridWidth > sectionWidth) {
          return sectionWidth / gridWidth * 100 + '%';
        } else {
          return 100 + '%';
        }
      };
    }();

    var adjustScrollBarWidth = function adjustScrollBarWidth() {
      scrollBarX.style.width = getGridPercentage();
    };

    adjustScrollBarWidth();

    // event handler for scrollbars

    // use closure to keep track of mouse move
    // and attach event handler to window only once
    var onMove = function () {
      //X for scrollBarX and Y for scrollBarY
      var lastMouseX = null,
          lastMouseY = null,
          marginX = parseFloat(window.getComputedStyle(scrollBarX).marginLeft),
          scrollBoxWidth = scrollBarX.parentNode.clientWidth;

      //get scrollArea
      var scrollAreaX = document.querySelector(scrollBarX.parentNode.getAttribute('data-scroll-area'));

      //actual onMove Handler
      var onMove = function onMove(e) {
        var diff = void 0,
            scrollBar = onMove.currentTarget,
            scrollBarWidth = onMove.scrollBarWidth,
            gridWidth = onMove.gridWidth; //???????????????

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
      var removeScrollListeners = function removeScrollListeners() {
        window.removeEventListener('mousemove', onMove);
        lastMouseX = null;
      };

      window.addEventListener('mouseup', removeScrollListeners);
      window.addEventListener('blur', removeScrollListeners);

      return onMove;
    }();

    scrollBarX.addEventListener('mousedown', function (e) {
      //remember which scrollbar we are currently on
      onMove.currentTarget = e.target;

      //remember width of the scrollbar and width of the grid
      //they are needed for dragging computations
      onMove.scrollBarWidth = e.target.clientWidth;
      onMove.gridWidth = grid.clientWidth;

      window.addEventListener('mousemove', onMove);
    });

    // ADDING NEW IMAGE
    var fileHandler = function () {
      var orientationPopup = document.querySelector('.popup.orientation-chose');

      return function (e) {
        var file = e.target.files[0],
            imgTypePattern = /^image\//,
            reader = void 0;

        // usr didn't upload anything
        if (!file) return;

        // if not of type image
        if (!imgTypePattern.test(file.type)) {
          alert('You must upload an image!');
          return;
        }

        reader = new FileReader();

        reader.onload = function (e) {
          var imgs = orientationPopup.querySelectorAll('img');
          [].forEach.call(imgs, function (img) {
            img.src = e.target.result;
          });

          fadePopup('in', orientationPopup);
        };

        reader.readAsDataURL(file);
      };
    }();

    document.querySelector('input[type="file"]').addEventListener('change', fileHandler);

    // GRID LISTENERS -> POPUP && ADD NEW IMAGE
    var clickListener = function () {
      //closure
      var bigImgPopup = document.querySelector('.popup.big-img'),
          orientationPopup = document.querySelector('.popup.orientation-chose'),
          orientation = void 0;

      // actual listener
      return function (e) {
        var target = e.target;

        // image on main window
        if (target.tagName === 'IMG') {

          fadePopup('in', bigImgPopup);
        } else if (orientation = target.getAttribute('data-orientation')) {

          var imgBig = target.firstElementChild.src;

          new ImagePost({ orientation: orientation, imgBig: imgBig });
          fadePopup('out', orientationPopup);

          // ************* POPUP *****************
          // Like and Dislike buttons
        } else if (hasClass(target, 'image-button') || hasClass(target.parentNode, 'image-button')) {

          // if click on child node
          if (target.tagName === 'I') target = target.parentNode;

          if (hasClass(target, 'clicked')) return;
          // if there is already a clicked button -> unclick it
          var otherClickedButton = bigImgPopup.querySelector('.image-button.clicked');
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
    }();

    document.body.addEventListener('click', clickListener);
  }); //end DOMContentLoaded

  // USEFUL FUNCTIONS
  function fadePopup(direction, node) {
    var transitionDuration = parseFloat(window.getComputedStyle(node).transitionDuration) * 1000;

    if (direction == 'in') {
      node.style.display = 'block';
      node.style.opacity = 0;

      // to enable proper transitioning with minimal delay
      setTimeout(function () {
        node.style.opacity = 1;
      }, 4);
    } else {
      node.style.opacity = 0;

      // transitionDuration
      setTimeout(function () {
        node.style.display = 'none';
      }, transitionDuration);
    }
  }

  function hasClass(elem, className) {
    var classes = elem.className.split(' ');
    return classes.indexOf(className) > -1;
  }

  function removeClass(elem, className) {
    var classes = elem.className.split(' ');
    var index = classes.indexOf(className);
    if (index > -1) classes.splice(index, 1);
    elem.className = classes.join(' ');
  }

  function addClass(elem, className) {
    if (!hasClass(elem, className)) elem.className += ' ' + className;
  }
})();

//TODO: DOM elements, that u manage through JS must have data-
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5lczYuanMiXSwibmFtZXMiOlsiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZ3JpZCIsInF1ZXJ5U2VsZWN0b3IiLCJzY3JvbGxCYXJYIiwicGNrcnkiLCJQYWNrZXJ5IiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwiaG9yaXpvbnRhbCIsImRhdGEiLCJnZXREYXRhIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2UiLCJlIiwiYWxlcnQiLCJJbWFnZUNvbGxlY3Rpb24iLCJvcGVuIiwic2VuZCIsImNvbGxlY3Rpb24iLCJsYXN0SWQiLCJnZXRMYXN0SWQiLCJpIiwibiIsImxlbmd0aCIsInB1c2giLCJJbWFnZVBvc3QiLCJnZXRJbWFnZVBvc3QiLCJpZCIsImFkZEltYWdlUG9zdCIsImltZ1NtYWxsIiwiaW1nQmlnIiwib3JpZW50YXRpb24iLCJsaWtlcyIsImRpc2xpa2VzIiwiY29tbWVudHMiLCJmb3JFYWNoIiwiY29tbWVudCIsIkNvbW1lbnQiLCJ0ZXh0Iiwibmlja25hbWUiLCJkYXRlIiwibm9kZSIsInB1dEluR3JpZCIsInNlbGYiLCJncmlkSXRlbSIsImltZyIsImhvdmVyQm94IiwiaWNvbiIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJzcmMiLCJhbHQiLCJhcHBlbmRDaGlsZCIsImFkZEljb24iLCJpbnNlcnRCZWZvcmUiLCJsYXN0RWxlbWVudENoaWxkIiwicmVsb2FkSXRlbXMiLCJsYXlvdXQiLCJhZGp1c3RTY3JvbGxCYXJXaWR0aCIsImRhdGFDb3VudCIsInNldEF0dHJpYnV0ZSIsInByb3RvdHlwZSIsImdldFBhcnNlZERhdGUiLCJnZXRHcmlkUGVyY2VudGFnZSIsInNlY3Rpb24iLCJzZWN0aW9uV2lkdGgiLCJjbGllbnRXaWR0aCIsImdyaWRXaWR0aCIsInN0eWxlIiwid2lkdGgiLCJvbk1vdmUiLCJsYXN0TW91c2VYIiwibGFzdE1vdXNlWSIsIm1hcmdpblgiLCJwYXJzZUZsb2F0Iiwid2luZG93IiwiZ2V0Q29tcHV0ZWRTdHlsZSIsIm1hcmdpbkxlZnQiLCJzY3JvbGxCb3hXaWR0aCIsInBhcmVudE5vZGUiLCJzY3JvbGxBcmVhWCIsImdldEF0dHJpYnV0ZSIsImRpZmYiLCJzY3JvbGxCYXIiLCJjdXJyZW50VGFyZ2V0Iiwic2Nyb2xsQmFyV2lkdGgiLCJjbGllbnRYIiwic2Nyb2xsTGVmdCIsInJlbW92ZVNjcm9sbExpc3RlbmVycyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ0YXJnZXQiLCJmaWxlSGFuZGxlciIsIm9yaWVudGF0aW9uUG9wdXAiLCJmaWxlIiwiZmlsZXMiLCJpbWdUeXBlUGF0dGVybiIsInJlYWRlciIsInRlc3QiLCJ0eXBlIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImltZ3MiLCJxdWVyeVNlbGVjdG9yQWxsIiwiY2FsbCIsInJlc3VsdCIsImZhZGVQb3B1cCIsInJlYWRBc0RhdGFVUkwiLCJjbGlja0xpc3RlbmVyIiwiYmlnSW1nUG9wdXAiLCJ0YWdOYW1lIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJoYXNDbGFzcyIsIm90aGVyQ2xpY2tlZEJ1dHRvbiIsInJlbW92ZUNsYXNzIiwiYWRkQ2xhc3MiLCJpbmRleE9mIiwicHJldmVudERlZmF1bHQiLCJib2R5IiwiZGlyZWN0aW9uIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiZGlzcGxheSIsIm9wYWNpdHkiLCJzZXRUaW1lb3V0IiwiZWxlbSIsImNsYXNzZXMiLCJzcGxpdCIsImluZGV4Iiwic3BsaWNlIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxDQUFDLFlBQU07QUFDUDs7QUFHQUEsV0FBU0MsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQU07O0FBRWxELFFBQUlDLE9BQU9GLFNBQVNHLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBWDtBQUFBLFFBQ0lDLGFBQWFKLFNBQVNHLGFBQVQsQ0FBdUIsYUFBdkIsQ0FEakI7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QUFHQSxDQTdZRDs7QUErWUEiLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKCgpID0+IHtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XHJcblxyXG4gIGxldCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdyaWQnKSxcclxuICAgICAgc2Nyb2xsQmFyWCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JvbGwtYmFyJyk7XHJcblxyXG4gIC8vVE9ETzogYWRkIGxvYWRlciBpbnRvIGdyaWQgY29zIGltYWdlcyBsb2FkaW5nIGNhbiB0YWtlIGEgd2hpbGVcclxuICAvLyBzZXQgbGF5b3V0IG9mIGltYWdlc1xyXG4gIGxldCBwY2tyeSA9IG5ldyBQYWNrZXJ5KGdyaWQsIHtcclxuICAgIGl0ZW1TZWxlY3RvcjogJy5ncmlkLWl0ZW0nLFxyXG4gICAgZ3V0dGVyOiAxMCxcclxuICAgIGhvcml6b250YWw6IHRydWVcclxuICB9KTtcclxuXHJcblxyXG4gIC8vIEFMTCBUSEUgSU5GT1JNQVRJT04gQUJPVVQgSU1BR0VTLCBJTkNMVURJTkcgQ09NTUVOVFNcclxuICBsZXQgZGF0YSA9IFtdO1xyXG4gIGdldERhdGEoKTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGF0YSgpIHtcclxuICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSwgZGF0YTtcclxuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XHJcblxyXG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCAmJiB4aHIuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGFsZXJ0KCdJbnZhbGlkIFNlcnZlciByZXNwb25zZS4gU29ycnkhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ldyBJbWFnZUNvbGxlY3Rpb24oZGF0YSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsICdkYXRhL2ltYWdlX3Bvc3RzLmpzb24nKTtcclxuICAgIHhoci5zZW5kKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBJbWFnZUNvbGxlY3Rpb24oZGF0YSkge1xyXG4gICAgbGV0IGNvbGxlY3Rpb24gPSBbXSxcclxuICAgICAgICBsYXN0SWQgPSBnZXRMYXN0SWQoZGF0YSk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDAsIG4gPSBkYXRhLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICBjb2xsZWN0aW9uLnB1c2gobmV3IEltYWdlUG9zdChkYXRhW2ldKSk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICB0aGlzLmdldEltYWdlUG9zdCA9IChpZCkgPT4ge1xyXG4gICAgICBmb3IgKGxldCBpID0gMCwgbiA9IGNvbGxlY3Rpb24ubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGNvbGxlY3Rpb25baV0uaWQgPT09IGlkKSByZXR1cm4gY29sbGVjdGlvbltpXTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmFkZEltYWdlUG9zdCA9ICgpID0+IHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TGFzdElkKGRhdGEpIHtcclxuICAgICAgbGV0IGlkID0gMDtcclxuICAgICAgZm9yIChsZXQgaSA9IDAsIG4gPSBkYXRhLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgIGlkID0gKGRhdGFbaV0uaWQgPiBpZCkgPyBkYXRhW2ldLmlkIDogaWQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGlkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gSW1hZ2VQb3N0KGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBkYXRhLmlkIHx8IG51bGw7XHJcbiAgICB0aGlzLmltZ1NtYWxsID0gZGF0YS5pbWdTbWFsbCB8fCBkYXRhLmltZ0JpZztcclxuICAgIHRoaXMuaW1nQmlnID0gZGF0YS5pbWdCaWc7XHJcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gZGF0YS5vcmllbnRhdGlvbiB8fCAnbm9ybWFsJztcclxuICAgIHRoaXMubGlrZXMgPSBkYXRhLmxpa2VzIHx8IDA7XHJcbiAgICB0aGlzLmRpc2xpa2VzID0gZGF0YS5kaXNsaWtlcyB8fCAwO1xyXG4gICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgIGRhdGEuY29tbWVudHMgJiYgZGF0YS5jb21tZW50cy5mb3JFYWNoKChjb21tZW50KSA9PiB7XHJcbiAgICAgIHRoaXMuY29tbWVudHMucHVzaChuZXcgQ29tbWVudChcclxuICAgICAgICBjb21tZW50LnRleHQsXHJcbiAgICAgICAgY29tbWVudC5uaWNrbmFtZSxcclxuICAgICAgICBjb21tZW50LmRhdGVcclxuICAgICAgKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm5vZGUgPSBwdXRJbkdyaWQodGhpcyk7XHJcblxyXG4gICAgZnVuY3Rpb24gcHV0SW5HcmlkKHNlbGYpIHtcclxuICAgICAgbGV0IGdyaWRJdGVtLCBpbWcsIGhvdmVyQm94LCBpY29uO1xyXG5cclxuICAgICAgZ3JpZEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcclxuXHJcbiAgICAgIHN3aXRjaChzZWxmLm9yaWVudGF0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnbGFuZHNjYXBlJzpcclxuICAgICAgICBncmlkSXRlbS5jbGFzc05hbWUgPSAnZ3JpZC1pdGVtIGdyaWQtaXRlbS0td2lkdGgnO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdwb3J0cmFpdCc6XHJcbiAgICAgICAgZ3JpZEl0ZW0uY2xhc3NOYW1lID0gJ2dyaWQtaXRlbSBncmlkLWl0ZW0tLWhlaWdodCc7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgZ3JpZEl0ZW0uY2xhc3NOYW1lID0gJ2dyaWQtaXRlbSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lNRycpO1xyXG4gICAgICBpbWcuc3JjID0gc2VsZi5pbWdTbWFsbDtcclxuICAgICAgaW1nLmFsdCA9ICdJbWFnZSAnICsgc2VsZi5pZDtcclxuICAgICAgZ3JpZEl0ZW0uYXBwZW5kQ2hpbGQoaW1nKTtcclxuXHJcbiAgICAgIGhvdmVyQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XHJcbiAgICAgIGhvdmVyQm94LmNsYXNzTmFtZSA9ICdob3Zlci1ib3gnO1xyXG5cclxuICAgICAgaG92ZXJCb3guYXBwZW5kQ2hpbGQoYWRkSWNvbignc3ByaXRlLWNvbW1lbnQnLCBzZWxmLmNvbW1lbnRzLmxlbmd0aCkpO1xyXG4gICAgICBob3ZlckJveC5hcHBlbmRDaGlsZChhZGRJY29uKCdzcHJpdGUtbGlrZScsIHNlbGYubGlrZXMpKTtcclxuICAgICAgaG92ZXJCb3guYXBwZW5kQ2hpbGQoYWRkSWNvbignc3ByaXRlLWRpc2xpa2UnLCBzZWxmLmRpc2xpa2VzKSk7XHJcblxyXG4gICAgICBncmlkSXRlbS5hcHBlbmRDaGlsZChob3ZlckJveCk7XHJcblxyXG4gICAgICAvLyBpbnNlcnQgYmVmb3JlIHBsYWNlaG9sZGVyIGZvciBhZGRpbmcgaW1hZ2VzXHJcbiAgICAgIGdyaWQuaW5zZXJ0QmVmb3JlKGdyaWRJdGVtLCBncmlkLmxhc3RFbGVtZW50Q2hpbGQpO1xyXG5cclxuICAgICAgLy9yZWRyYXcgUGFja2VyeVxyXG4gICAgICBwY2tyeS5yZWxvYWRJdGVtcygpXHJcbiAgICAgIHBja3J5LmxheW91dCgpO1xyXG5cclxuICAgICAgLy9hZGp1c3Qgc2Nyb2xsYmFyXHJcbiAgICAgIGFkanVzdFNjcm9sbEJhcldpZHRoKCk7XHJcblxyXG4gICAgICByZXR1cm4gZ3JpZEl0ZW07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkSWNvbihjbGFzc05hbWUsIGRhdGFDb3VudCkge1xyXG4gICAgICBsZXQgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0knKTtcclxuICAgICAgaWNvbi5jbGFzc05hbWUgPSAnc3ByaXRlICcgKyBjbGFzc05hbWU7XHJcbiAgICAgIGljb24uc2V0QXR0cmlidXRlKCdkYXRhLWNvdW50JywgZGF0YUNvdW50KTtcclxuXHJcbiAgICAgIHJldHVybiBpY29uO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gQ29tbWVudCh0ZXh0LCBuaWNrbmFtZSwgZGF0ZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdGV4dCxcclxuICAgICAgbmlja25hbWUsXHJcbiAgICAgIGRhdGVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBDb21tZW50LnByb3RvdHlwZS5nZXRQYXJzZWREYXRlID0gKCkgPT4ge1xyXG5cclxuICB9XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAvLyBFbmFibGUgc2Nyb2xsIGlmIGdyaWQgaXMgd2lkZXJcclxuXHJcbiAgLy8gdXNlIGNsb3N1cmUgdG8ga2VlcCByZWZlcmVuY2UgdG8gc2VjdGlvblxyXG4gIC8vIGlmIGdyaWQgaXMgd2lkZXIgcmV0dXJucyB0aGUgZGlmZmVyZW5jZSBpbiBwZXJjZW50c1xyXG4gIC8vIG90aGVyd2lzZSByZXR1cm5zIDEwMCVcclxuICBsZXQgZ2V0R3JpZFBlcmNlbnRhZ2UgPSAoKCkgPT4ge1xyXG4gICAgbGV0IHNlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWN0aW9uLm1haW4nKTtcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBsZXQgc2VjdGlvbldpZHRoID0gc2VjdGlvbi5jbGllbnRXaWR0aDtcclxuICAgICAgbGV0IGdyaWRXaWR0aCA9IGdyaWQuY2xpZW50V2lkdGg7XHJcblxyXG4gICAgICBpZiAoZ3JpZFdpZHRoID4gc2VjdGlvbldpZHRoKSB7XHJcbiAgICAgICAgcmV0dXJuIChzZWN0aW9uV2lkdGggLyBncmlkV2lkdGggKiAxMDApICsgJyUnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAxMDAgKyAnJSc7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSkoKTtcclxuXHJcbiAgbGV0IGFkanVzdFNjcm9sbEJhcldpZHRoID0gKCkgPT4ge1xyXG4gICAgc2Nyb2xsQmFyWC5zdHlsZS53aWR0aCA9IGdldEdyaWRQZXJjZW50YWdlKCk7XHJcbiAgfTtcclxuXHJcbiAgYWRqdXN0U2Nyb2xsQmFyV2lkdGgoKTtcclxuXHJcbiAgLy8gZXZlbnQgaGFuZGxlciBmb3Igc2Nyb2xsYmFyc1xyXG5cclxuICAvLyB1c2UgY2xvc3VyZSB0byBrZWVwIHRyYWNrIG9mIG1vdXNlIG1vdmVcclxuICAvLyBhbmQgYXR0YWNoIGV2ZW50IGhhbmRsZXIgdG8gd2luZG93IG9ubHkgb25jZVxyXG4gIGxldCBvbk1vdmUgPSAoKCkgPT4ge1xyXG4gICAgLy9YIGZvciBzY3JvbGxCYXJYIGFuZCBZIGZvciBzY3JvbGxCYXJZXHJcbiAgICBsZXQgbGFzdE1vdXNlWCA9IG51bGwsXHJcbiAgICAgICAgbGFzdE1vdXNlWSA9IG51bGwsXHJcbiAgICAgICAgbWFyZ2luWCA9IHBhcnNlRmxvYXQod2luZG93LlxyXG4gICAgICAgICAgICAgICAgICBnZXRDb21wdXRlZFN0eWxlKHNjcm9sbEJhclgpLm1hcmdpbkxlZnQpLFxyXG4gICAgICAgIHNjcm9sbEJveFdpZHRoID0gc2Nyb2xsQmFyWC5wYXJlbnROb2RlLmNsaWVudFdpZHRoO1xyXG5cclxuICAgIC8vZ2V0IHNjcm9sbEFyZWFcclxuICAgIGxldCBzY3JvbGxBcmVhWCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JcclxuICAgICAgICAgICAgICAgICAgICAgKHNjcm9sbEJhclgucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2Nyb2xsLWFyZWEnKSk7XHJcblxyXG4gICAgLy9hY3R1YWwgb25Nb3ZlIEhhbmRsZXJcclxuICAgIGxldCBvbk1vdmUgPSAoZSkgPT4ge1xyXG4gICAgICBsZXQgZGlmZixcclxuICAgICAgICAgIHNjcm9sbEJhciA9IG9uTW92ZS5jdXJyZW50VGFyZ2V0LFxyXG4gICAgICAgICAgc2Nyb2xsQmFyV2lkdGggPSBvbk1vdmUuc2Nyb2xsQmFyV2lkdGgsXHJcbiAgICAgICAgICBncmlkV2lkdGggPSBvbk1vdmUuZ3JpZFdpZHRoOy8vPz8/Pz8/Pz8/Pz8/Pz8/XHJcblxyXG4gICAgICAvL3JlbWVtYmVyIGluaXRpYWwgcG9zaXRpb24gb2YgdGhlIG1vdXNlXHJcbiAgICAgIGlmIChsYXN0TW91c2VYID09PSBudWxsKSB7XHJcbiAgICAgICAgbGFzdE1vdXNlWCA9IGUuY2xpZW50WDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgLy8gZ2V0IG1vdXNlIG1vdmVcclxuICAgICAgZGlmZiA9IGUuY2xpZW50WCAtIGxhc3RNb3VzZVg7XHJcbiAgICAgIGxhc3RNb3VzZVggPSBlLmNsaWVudFg7XHJcblxyXG4gICAgICBtYXJnaW5YICs9IGRpZmY7XHJcbiAgICAgIC8vcHJldmVudCBkcmFnZ2luZyB0byBsZWZ0IGlmIG9uIGVkZ2VcclxuICAgICAgaWYgKG1hcmdpblggPD0gMCkge1xyXG4gICAgICAgIHNjcm9sbEJhci5zdHlsZS5tYXJnaW5MZWZ0ID0gbWFyZ2luWCA9IDA7XHJcbiAgICAgICAgLy8gdG8gcHJldmVudCBpbnN1ZmZpY2llbnQgc2Nyb2xsLCB3aGVuIGJyb3dzZXIgcmVuZGVycyBzY3JvbGwgdG8gc2xvd1xyXG4gICAgICAgIHNjcm9sbEFyZWFYLnNjcm9sbExlZnQgPSAwO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgLy9wcmV2ZW50IGRyYWdnaW5nIHRvIHJpZ2h0IGlmIG9uIGVkZ2VcclxuICAgIH0gZWxzZSBpZiAoc2Nyb2xsQmFyV2lkdGggKyBtYXJnaW5YID49IHNjcm9sbEJveFdpZHRoKSB7XHJcbiAgICAgICAgbWFyZ2luWCA9IHNjcm9sbEJveFdpZHRoIC0gc2Nyb2xsQmFyV2lkdGg7XHJcbiAgICAgIH1cclxuICAgICAgc2Nyb2xsQmFyLnN0eWxlLm1hcmdpbkxlZnQgPSBtYXJnaW5YICsgJ3B4JztcclxuXHJcbiAgICAgIC8vYWRqdXN0IGdyaWQgcG9zaXRpb24gZHVlIHRvIHBlcmNlbnRhZ2UgdmFsdWUgb2Ygc2Nyb2xsLWJhciBtYXJnaW5cclxuICAgICAgLy8qKiotPi0+LT4gc2Nyb2xsYmFyLm1hcmdpbkxlZnQgLyBwYXJlbnQud2lkdGggPSAtZ3JpZC5tYXJnaW5MZWZ0IC8gZ3JpZC53aWR0aCA8LTwtPC0qKipcclxuICAgICAgc2Nyb2xsQXJlYVguc2Nyb2xsTGVmdCA9IG1hcmdpblggLyBzY3JvbGxCb3hXaWR0aCAqIGdyaWRXaWR0aDtcclxuICAgIH07XHJcblxyXG4gICAgLy90byBkaXNhYmxlIHNjcm9sbGluZyBvbm1vdXNldXBcclxuICAgIGxldCByZW1vdmVTY3JvbGxMaXN0ZW5lcnMgPSAoKSA9PiB7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdmUpO1xyXG4gICAgICBsYXN0TW91c2VYID0gbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByZW1vdmVTY3JvbGxMaXN0ZW5lcnMpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCByZW1vdmVTY3JvbGxMaXN0ZW5lcnMpO1xyXG5cclxuICAgIHJldHVybiBvbk1vdmU7XHJcbiAgfSkoKTtcclxuXHJcbiAgc2Nyb2xsQmFyWC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xyXG4gICAgLy9yZW1lbWJlciB3aGljaCBzY3JvbGxiYXIgd2UgYXJlIGN1cnJlbnRseSBvblxyXG4gICAgb25Nb3ZlLmN1cnJlbnRUYXJnZXQgPSBlLnRhcmdldDtcclxuXHJcbiAgICAvL3JlbWVtYmVyIHdpZHRoIG9mIHRoZSBzY3JvbGxiYXIgYW5kIHdpZHRoIG9mIHRoZSBncmlkXHJcbiAgICAvL3RoZXkgYXJlIG5lZWRlZCBmb3IgZHJhZ2dpbmcgY29tcHV0YXRpb25zXHJcbiAgICBvbk1vdmUuc2Nyb2xsQmFyV2lkdGggPSBlLnRhcmdldC5jbGllbnRXaWR0aDtcclxuICAgIG9uTW92ZS5ncmlkV2lkdGggPSBncmlkLmNsaWVudFdpZHRoO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdmUpO1xyXG4gIH0pO1xyXG5cclxuXHJcbiAgLy8gQURESU5HIE5FVyBJTUFHRVxyXG4gIGxldCBmaWxlSGFuZGxlciA9ICgoKSA9PiB7XHJcbiAgICBsZXQgb3JpZW50YXRpb25Qb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wb3B1cC5vcmllbnRhdGlvbi1jaG9zZScpO1xyXG5cclxuXHJcbiAgICByZXR1cm4gKGUpID0+IHtcclxuICAgICAgbGV0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXSxcclxuICAgICAgICAgIGltZ1R5cGVQYXR0ZXJuID0gL15pbWFnZVxcLy8sXHJcbiAgICAgICAgICByZWFkZXI7XHJcblxyXG4gICAgICAvLyB1c3IgZGlkbid0IHVwbG9hZCBhbnl0aGluZ1xyXG4gICAgICBpZiAoIWZpbGUpIHJldHVybjtcclxuXHJcbiAgICAgIC8vIGlmIG5vdCBvZiB0eXBlIGltYWdlXHJcbiAgICAgIGlmICghaW1nVHlwZVBhdHRlcm4udGVzdChmaWxlLnR5cGUpKSB7XHJcbiAgICAgICAgYWxlcnQoJ1lvdSBtdXN0IHVwbG9hZCBhbiBpbWFnZSEnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG5cclxuICAgICAgcmVhZGVyLm9ubG9hZCA9IChlKSA9PiB7XHJcbiAgICAgICAgbGV0IGltZ3MgPSBvcmllbnRhdGlvblBvcHVwLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xyXG4gICAgICAgIFtdLmZvckVhY2guY2FsbChpbWdzLCAoaW1nKSA9PiB7XHJcbiAgICAgICAgICBpbWcuc3JjID0gZS50YXJnZXQucmVzdWx0O1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZmFkZVBvcHVwKCdpbicsIG9yaWVudGF0aW9uUG9wdXApO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XHJcbiAgICB9O1xyXG4gIH0pKCk7XHJcblxyXG5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiZmlsZVwiXScpXHJcbiAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZpbGVIYW5kbGVyKTtcclxuXHJcblxyXG5cclxuICAvLyBHUklEIExJU1RFTkVSUyAtPiBQT1BVUCAmJiBBREQgTkVXIElNQUdFXHJcbiAgbGV0IGNsaWNrTGlzdGVuZXIgPSAoKCkgPT4ge1xyXG4gICAgLy9jbG9zdXJlXHJcbiAgICBsZXQgYmlnSW1nUG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9wdXAuYmlnLWltZycpLFxyXG4gICAgICAgIG9yaWVudGF0aW9uUG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9wdXAub3JpZW50YXRpb24tY2hvc2UnKSxcclxuICAgICAgICBvcmllbnRhdGlvbjtcclxuXHJcbiAgICAvLyBhY3R1YWwgbGlzdGVuZXJcclxuICAgIHJldHVybiAoZSkgPT4ge1xyXG4gICAgICBsZXQgdGFyZ2V0ID0gZS50YXJnZXQ7XHJcblxyXG4gICAgICAvLyBpbWFnZSBvbiBtYWluIHdpbmRvd1xyXG4gICAgICBpZiAodGFyZ2V0LnRhZ05hbWUgPT09ICdJTUcnKSB7XHJcblxyXG4gICAgICAgIGZhZGVQb3B1cCgnaW4nLCBiaWdJbWdQb3B1cCk7XHJcblxyXG4gICAgfSBlbHNlIGlmIChvcmllbnRhdGlvbiA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZW50YXRpb24nKSkge1xyXG5cclxuXHJcbiAgICAgIGxldCBpbWdCaWcgPSB0YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQuc3JjO1xyXG5cclxuICAgICAgbmV3IEltYWdlUG9zdCh7b3JpZW50YXRpb24sIGltZ0JpZ30pO1xyXG4gICAgICBmYWRlUG9wdXAoJ291dCcsIG9yaWVudGF0aW9uUG9wdXApO1xyXG5cclxuICAgICAgLy8gKioqKioqKioqKioqKiBQT1BVUCAqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyBMaWtlIGFuZCBEaXNsaWtlIGJ1dHRvbnNcclxuICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnaW1hZ2UtYnV0dG9uJykgfHxcclxuICAgICAgICAgICAgICAgaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpbWFnZS1idXR0b24nKSkge1xyXG5cclxuICAgICAgLy8gaWYgY2xpY2sgb24gY2hpbGQgbm9kZVxyXG4gICAgICAgIGlmICh0YXJnZXQudGFnTmFtZSA9PT0gJ0knKSB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuXHJcblxyXG4gICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdjbGlja2VkJykpIHJldHVybjtcclxuICAgICAgLy8gaWYgdGhlcmUgaXMgYWxyZWFkeSBhIGNsaWNrZWQgYnV0dG9uIC0+IHVuY2xpY2sgaXRcclxuICAgICAgICBsZXQgb3RoZXJDbGlja2VkQnV0dG9uID0gYmlnSW1nUG9wdXAucXVlcnlTZWxlY3RvcignLmltYWdlLWJ1dHRvbi5jbGlja2VkJyk7XHJcbiAgICAgICAgaWYgKG90aGVyQ2xpY2tlZEJ1dHRvbikgcmVtb3ZlQ2xhc3Mob3RoZXJDbGlja2VkQnV0dG9uLCAnY2xpY2tlZCcpO1xyXG4gICAgICAvLyBUT0RPOiAtMSBmb3IgbGlrZXMgb3IgZGlzbGlrZXNcclxuXHJcbiAgICAgIC8vIFwicHJlc3NcIiB0aGUgYnV0dG9uXHJcbiAgICAgICAgYWRkQ2xhc3ModGFyZ2V0LCAnY2xpY2tlZCcpO1xyXG4gICAgICAvLyBUT0RPOiArMSBmb3IgbGlrZXMgb3IgZGlzbGlrZXNcclxuXHJcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnc3ByaXRlLWNsb3NlJykpIHtcclxuICAgICAgICBmYWRlUG9wdXAoJ291dCcsIGJpZ0ltZ1BvcHVwKTtcclxuXHJcbiAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdzZW5kLWJ1dHRvbicpID4gLTEpIHtcclxuICAgICAgLy90byBwcmV2ZW50IGxhYmVsXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pKCk7XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja0xpc3RlbmVyKTtcclxuXHJcbn0pOy8vZW5kIERPTUNvbnRlbnRMb2FkZWRcclxuXHJcbi8vIFVTRUZVTCBGVU5DVElPTlNcclxuZnVuY3Rpb24gZmFkZVBvcHVwKGRpcmVjdGlvbiwgbm9kZSkge1xyXG4gIGxldCB0cmFuc2l0aW9uRHVyYXRpb24gPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUpLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xyXG5cclxuICBpZiAoZGlyZWN0aW9uID09ICdpbicpIHtcclxuICAgIG5vZGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICBub2RlLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG5cclxuICAgIC8vIHRvIGVuYWJsZSBwcm9wZXIgdHJhbnNpdGlvbmluZyB3aXRoIG1pbmltYWwgZGVsYXlcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7IG5vZGUuc3R5bGUub3BhY2l0eSA9IDE7IH0sIDQpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBub2RlLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG5cclxuICAgIC8vIHRyYW5zaXRpb25EdXJhdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7IG5vZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJzsgfSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkge1xyXG4gIGxldCBjbGFzc2VzID0gZWxlbS5jbGFzc05hbWUuc3BsaXQoJyAnKTtcclxuICByZXR1cm4gY2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSB7XHJcbiAgbGV0IGNsYXNzZXMgPSBlbGVtLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xyXG4gIGxldCBpbmRleCA9IGNsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpO1xyXG4gIGlmIChpbmRleCA+IC0xKSBjbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgZWxlbS5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSB7XHJcbiAgaWYgKCFoYXNDbGFzcyhlbGVtLCBjbGFzc05hbWUpKVxyXG4gIGVsZW0uY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcclxufVxyXG5cclxuXHJcbn0pKCk7XHJcblxyXG4vL1RPRE86IERPTSBlbGVtZW50cywgdGhhdCB1IG1hbmFnZSB0aHJvdWdoIEpTIG11c3QgaGF2ZSBkYXRhLVxyXG4iXX0=
