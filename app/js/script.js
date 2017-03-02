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
      var collection = [];
      for (var i = 0, n = data.length; i < n; i++) {
        collection.push(new ImagePost(data[i]));
      }
      //TODO: Get last id. DO we need ID?


      this.getImagePost = function (id) {
        for (var _i = 0, _n = collection.length; _i < _n; _i++) {
          if (collection[_i].id === id) return collection[_i];
        }
      };
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

    // GRID LISTENERS -> POPUP && ADD NEW IMAGE
    var clickListener = function () {
      //closure
      var popup = document.querySelector('.popup'),
          popupTransitionDuration = parseFloat(window.getComputedStyle(popup).transitionDuration) * 1000;

      function fadePopup(direction) {
        if (direction == 'in') {
          popup.style.display = 'block';
          popup.style.opacity = 0;

          // to enable proper transitioning with minimal delay
          setTimeout(function () {
            popup.style.opacity = 1;
          }, 4);
        } else {
          popup.style.opacity = 0;

          // transitionDuration
          setTimeout(function () {
            popup.style.display = 'none';
          }, popupTransitionDuration);
        }
      }

      // actual listener
      return function (e) {
        var target = e.target;

        // image on main window
        if (target.tagName === 'IMG') {
          fadePopup('in');

          // ************* POPUP *****************
          // Like and Dislike buttons
        } else if (hasClass(target, 'image-button') || hasClass(target.parentNode, 'image-button')) {

          // if click on child node
          if (target.tagName === 'I') target = target.parentNode;

          if (hasClass(target, 'clicked')) return;
          // if there is already a clicked button -> unclick it
          var otherClickedButton = popup.querySelector('.image-button.clicked');
          if (otherClickedButton) removeClass(otherClickedButton, 'clicked');
          // TODO: -1 for likes or dislikes

          // "press" the button
          addClass(target, 'clicked');
          // TODO: +1 for likes or dislikes
        } else if (hasClass(target, 'sprite-close')) {
          fadePopup('out');
        } else if (target.className.indexOf('send-button') > -1) {
          //to prevent label
          e.preventDefault();
        }
      };
    }();

    document.body.addEventListener('click', clickListener);
  }); //end DOMContentLoaded

  // USEFUL FUNCTIONS
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5lczYuanMiXSwibmFtZXMiOlsiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZ3JpZCIsInF1ZXJ5U2VsZWN0b3IiLCJzY3JvbGxCYXJYIiwicGNrcnkiLCJQYWNrZXJ5IiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwiaG9yaXpvbnRhbCIsImRhdGEiLCJnZXREYXRhIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2UiLCJlIiwiYWxlcnQiLCJJbWFnZUNvbGxlY3Rpb24iLCJvcGVuIiwic2VuZCIsImNvbGxlY3Rpb24iLCJpIiwibiIsImxlbmd0aCIsInB1c2giLCJJbWFnZVBvc3QiLCJnZXRJbWFnZVBvc3QiLCJpZCIsImltZ1NtYWxsIiwiaW1nQmlnIiwib3JpZW50YXRpb24iLCJsaWtlcyIsImRpc2xpa2VzIiwiY29tbWVudHMiLCJmb3JFYWNoIiwiY29tbWVudCIsIkNvbW1lbnQiLCJ0ZXh0Iiwibmlja25hbWUiLCJkYXRlIiwibm9kZSIsInB1dEluR3JpZCIsInNlbGYiLCJncmlkSXRlbSIsImltZyIsImhvdmVyQm94IiwiaWNvbiIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJzcmMiLCJhbHQiLCJhcHBlbmRDaGlsZCIsImFkZEljb24iLCJpbnNlcnRCZWZvcmUiLCJsYXN0RWxlbWVudENoaWxkIiwicmVsb2FkSXRlbXMiLCJsYXlvdXQiLCJhZGp1c3RTY3JvbGxCYXJXaWR0aCIsImRhdGFDb3VudCIsInNldEF0dHJpYnV0ZSIsInByb3RvdHlwZSIsImdldFBhcnNlZERhdGUiLCJnZXRHcmlkUGVyY2VudGFnZSIsInNlY3Rpb24iLCJzZWN0aW9uV2lkdGgiLCJjbGllbnRXaWR0aCIsImdyaWRXaWR0aCIsInN0eWxlIiwid2lkdGgiLCJvbk1vdmUiLCJsYXN0TW91c2VYIiwibGFzdE1vdXNlWSIsIm1hcmdpblgiLCJwYXJzZUZsb2F0Iiwid2luZG93IiwiZ2V0Q29tcHV0ZWRTdHlsZSIsIm1hcmdpbkxlZnQiLCJzY3JvbGxCb3hXaWR0aCIsInBhcmVudE5vZGUiLCJzY3JvbGxBcmVhWCIsImdldEF0dHJpYnV0ZSIsImRpZmYiLCJzY3JvbGxCYXIiLCJjdXJyZW50VGFyZ2V0Iiwic2Nyb2xsQmFyV2lkdGgiLCJjbGllbnRYIiwic2Nyb2xsTGVmdCIsInJlbW92ZVNjcm9sbExpc3RlbmVycyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ0YXJnZXQiLCJjbGlja0xpc3RlbmVyIiwicG9wdXAiLCJwb3B1cFRyYW5zaXRpb25EdXJhdGlvbiIsInRyYW5zaXRpb25EdXJhdGlvbiIsImZhZGVQb3B1cCIsImRpcmVjdGlvbiIsImRpc3BsYXkiLCJvcGFjaXR5Iiwic2V0VGltZW91dCIsInRhZ05hbWUiLCJoYXNDbGFzcyIsIm90aGVyQ2xpY2tlZEJ1dHRvbiIsInJlbW92ZUNsYXNzIiwiYWRkQ2xhc3MiLCJpbmRleE9mIiwicHJldmVudERlZmF1bHQiLCJib2R5IiwiZWxlbSIsImNsYXNzZXMiLCJzcGxpdCIsImluZGV4Iiwic3BsaWNlIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxDQUFDLFlBQU07QUFDUDs7QUFHQUEsV0FBU0MsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQU07O0FBRWxELFFBQUlDLE9BQU9GLFNBQVNHLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBWDtBQUFBLFFBQ0lDLGFBQWFKLFNBQVNHLGFBQVQsQ0FBdUIsYUFBdkIsQ0FEakI7O0FBR0E7QUFDQTtBQUNBLFFBQUlFLFFBQVEsSUFBSUMsT0FBSixDQUFZSixJQUFaLEVBQWtCO0FBQzVCSyxvQkFBYyxZQURjO0FBRTVCQyxjQUFRLEVBRm9CO0FBRzVCQyxrQkFBWTtBQUhnQixLQUFsQixDQUFaOztBQU9BO0FBQ0EsUUFBSUMsT0FBTyxFQUFYO0FBQ0FDOztBQUVBLGFBQVNBLE9BQVQsR0FBbUI7QUFDakIsVUFBSUMsTUFBTSxJQUFJQyxjQUFKLEVBQVY7QUFBQSxVQUFnQ0gsYUFBaEM7QUFDQUUsVUFBSUUsa0JBQUosR0FBeUIsWUFBTTs7QUFFN0IsWUFBSUYsSUFBSUcsVUFBSixJQUFrQixDQUFsQixJQUF1QkgsSUFBSUksTUFBSixJQUFjLEdBQXpDLEVBQThDO0FBQzVDLGNBQUk7QUFDRk4sbUJBQU9PLEtBQUtDLEtBQUwsQ0FBV04sSUFBSU8sUUFBZixDQUFQO0FBQ0QsV0FGRCxDQUVFLE9BQU9DLENBQVAsRUFBVTtBQUNWQyxrQkFBTSxpQ0FBTjtBQUNEO0FBQ0QsY0FBSUMsZUFBSixDQUFvQlosSUFBcEI7QUFDRDtBQUNGLE9BVkQ7O0FBWUFFLFVBQUlXLElBQUosQ0FBUyxLQUFULEVBQWdCLHVCQUFoQjtBQUNBWCxVQUFJWSxJQUFKO0FBQ0Q7O0FBRUQsYUFBU0YsZUFBVCxDQUF5QlosSUFBekIsRUFBK0I7QUFDN0IsVUFBSWUsYUFBYSxFQUFqQjtBQUNBLFdBQUssSUFBSUMsSUFBSSxDQUFSLEVBQVdDLElBQUlqQixLQUFLa0IsTUFBekIsRUFBaUNGLElBQUlDLENBQXJDLEVBQXdDRCxHQUF4QyxFQUE2QztBQUMzQ0QsbUJBQVdJLElBQVgsQ0FBZ0IsSUFBSUMsU0FBSixDQUFjcEIsS0FBS2dCLENBQUwsQ0FBZCxDQUFoQjtBQUNEO0FBQ0Q7OztBQUlBLFdBQUtLLFlBQUwsR0FBb0IsVUFBQ0MsRUFBRCxFQUFRO0FBQzFCLGFBQUssSUFBSU4sS0FBSSxDQUFSLEVBQVdDLEtBQUlGLFdBQVdHLE1BQS9CLEVBQXVDRixLQUFJQyxFQUEzQyxFQUE4Q0QsSUFBOUMsRUFBbUQ7QUFDakQsY0FBSUQsV0FBV0MsRUFBWCxFQUFjTSxFQUFkLEtBQXFCQSxFQUF6QixFQUE2QixPQUFPUCxXQUFXQyxFQUFYLENBQVA7QUFDOUI7QUFDRixPQUpEO0FBS0Q7O0FBRUQsYUFBU0ksU0FBVCxDQUFtQnBCLElBQW5CLEVBQXlCO0FBQUE7O0FBQ3ZCLFdBQUtzQixFQUFMLEdBQVV0QixLQUFLc0IsRUFBTCxJQUFXLElBQXJCO0FBQ0EsV0FBS0MsUUFBTCxHQUFnQnZCLEtBQUt1QixRQUFMLElBQWlCdkIsS0FBS3dCLE1BQXRDO0FBQ0EsV0FBS0EsTUFBTCxHQUFjeEIsS0FBS3dCLE1BQW5CO0FBQ0EsV0FBS0MsV0FBTCxHQUFtQnpCLEtBQUt5QixXQUFMLElBQW9CLFFBQXZDO0FBQ0EsV0FBS0MsS0FBTCxHQUFhMUIsS0FBSzBCLEtBQUwsSUFBYyxDQUEzQjtBQUNBLFdBQUtDLFFBQUwsR0FBZ0IzQixLQUFLMkIsUUFBTCxJQUFpQixDQUFqQztBQUNBLFdBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7O0FBRUE1QixXQUFLNEIsUUFBTCxJQUFpQjVCLEtBQUs0QixRQUFMLENBQWNDLE9BQWQsQ0FBc0IsVUFBQ0MsT0FBRCxFQUFhO0FBQ2xELGNBQUtGLFFBQUwsQ0FBY1QsSUFBZCxDQUFtQixJQUFJWSxPQUFKLENBQ2pCRCxRQUFRRSxJQURTLEVBRWpCRixRQUFRRyxRQUZTLEVBR2pCSCxRQUFRSSxJQUhTLENBQW5CO0FBS0QsT0FOZ0IsQ0FBakI7O0FBUUEsV0FBS0MsSUFBTCxHQUFZQyxVQUFVLElBQVYsQ0FBWjs7QUFFQSxlQUFTQSxTQUFULENBQW1CQyxJQUFuQixFQUF5QjtBQUN2QixZQUFJQyxpQkFBSjtBQUFBLFlBQWNDLFlBQWQ7QUFBQSxZQUFtQkMsaUJBQW5CO0FBQUEsWUFBNkJDLGFBQTdCOztBQUVBSCxtQkFBV2hELFNBQVNvRCxhQUFULENBQXVCLEtBQXZCLENBQVg7O0FBRUEsZ0JBQU9MLEtBQUtaLFdBQVo7QUFDRSxlQUFLLFdBQUw7QUFDQWEscUJBQVNLLFNBQVQsR0FBcUIsNEJBQXJCO0FBQ0E7O0FBRUEsZUFBSyxVQUFMO0FBQ0FMLHFCQUFTSyxTQUFULEdBQXFCLDZCQUFyQjtBQUNBOztBQUVBO0FBQ0FMLHFCQUFTSyxTQUFULEdBQXFCLFdBQXJCO0FBVkY7O0FBYUFKLGNBQU1qRCxTQUFTb0QsYUFBVCxDQUF1QixLQUF2QixDQUFOO0FBQ0FILFlBQUlLLEdBQUosR0FBVVAsS0FBS2QsUUFBZjtBQUNBZ0IsWUFBSU0sR0FBSixHQUFVLFdBQVdSLEtBQUtmLEVBQTFCO0FBQ0FnQixpQkFBU1EsV0FBVCxDQUFxQlAsR0FBckI7O0FBRUFDLG1CQUFXbEQsU0FBU29ELGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWDtBQUNBRixpQkFBU0csU0FBVCxHQUFxQixXQUFyQjs7QUFFQUgsaUJBQVNNLFdBQVQsQ0FBcUJDLFFBQVEsZ0JBQVIsRUFBMEJWLEtBQUtULFFBQUwsQ0FBY1YsTUFBeEMsQ0FBckI7QUFDQXNCLGlCQUFTTSxXQUFULENBQXFCQyxRQUFRLGFBQVIsRUFBdUJWLEtBQUtYLEtBQTVCLENBQXJCO0FBQ0FjLGlCQUFTTSxXQUFULENBQXFCQyxRQUFRLGdCQUFSLEVBQTBCVixLQUFLVixRQUEvQixDQUFyQjs7QUFFQVcsaUJBQVNRLFdBQVQsQ0FBcUJOLFFBQXJCOztBQUVBO0FBQ0FoRCxhQUFLd0QsWUFBTCxDQUFrQlYsUUFBbEIsRUFBNEI5QyxLQUFLeUQsZ0JBQWpDOztBQUVBO0FBQ0F0RCxjQUFNdUQsV0FBTjtBQUNBdkQsY0FBTXdELE1BQU47O0FBRUE7QUFDQUM7O0FBRUEsZUFBT2QsUUFBUDtBQUNEOztBQUVELGVBQVNTLE9BQVQsQ0FBaUJKLFNBQWpCLEVBQTRCVSxTQUE1QixFQUF1QztBQUNyQyxZQUFJWixPQUFPbkQsU0FBU29ELGFBQVQsQ0FBdUIsR0FBdkIsQ0FBWDtBQUNBRCxhQUFLRSxTQUFMLEdBQWlCLFlBQVlBLFNBQTdCO0FBQ0FGLGFBQUthLFlBQUwsQ0FBa0IsWUFBbEIsRUFBZ0NELFNBQWhDOztBQUVBLGVBQU9aLElBQVA7QUFDRDtBQUNGOztBQUVELGFBQVNWLE9BQVQsQ0FBaUJDLElBQWpCLEVBQXVCQyxRQUF2QixFQUFpQ0MsSUFBakMsRUFBdUM7QUFDckMsYUFBTztBQUNMRixrQkFESztBQUVMQywwQkFGSztBQUdMQztBQUhLLE9BQVA7QUFLRDs7QUFFREgsWUFBUXdCLFNBQVIsQ0FBa0JDLGFBQWxCLEdBQWtDLFlBQU0sQ0FFdkMsQ0FGRDs7QUFXQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFJQyxvQkFBcUIsWUFBTTtBQUM3QixVQUFJQyxVQUFVcEUsU0FBU0csYUFBVCxDQUF1QixjQUF2QixDQUFkOztBQUVBLGFBQU8sWUFBTTtBQUNYLFlBQUlrRSxlQUFlRCxRQUFRRSxXQUEzQjtBQUNBLFlBQUlDLFlBQVlyRSxLQUFLb0UsV0FBckI7O0FBRUEsWUFBSUMsWUFBWUYsWUFBaEIsRUFBOEI7QUFDNUIsaUJBQVFBLGVBQWVFLFNBQWYsR0FBMkIsR0FBNUIsR0FBbUMsR0FBMUM7QUFDRCxTQUZELE1BRU87QUFDTCxpQkFBTyxNQUFNLEdBQWI7QUFDRDtBQUNGLE9BVEQ7QUFVRCxLQWJ1QixFQUF4Qjs7QUFlQSxRQUFJVCx1QkFBdUIsU0FBdkJBLG9CQUF1QixHQUFNO0FBQy9CMUQsaUJBQVdvRSxLQUFYLENBQWlCQyxLQUFqQixHQUF5Qk4sbUJBQXpCO0FBQ0QsS0FGRDs7QUFJQUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFFBQUlZLFNBQVUsWUFBTTtBQUNsQjtBQUNBLFVBQUlDLGFBQWEsSUFBakI7QUFBQSxVQUNJQyxhQUFhLElBRGpCO0FBQUEsVUFFSUMsVUFBVUMsV0FBV0MsT0FDWEMsZ0JBRFcsQ0FDTTVFLFVBRE4sRUFDa0I2RSxVQUQ3QixDQUZkO0FBQUEsVUFJSUMsaUJBQWlCOUUsV0FBVytFLFVBQVgsQ0FBc0JiLFdBSjNDOztBQU1BO0FBQ0EsVUFBSWMsY0FBY3BGLFNBQVNHLGFBQVQsQ0FDQUMsV0FBVytFLFVBQVgsQ0FBc0JFLFlBQXRCLENBQW1DLGtCQUFuQyxDQURBLENBQWxCOztBQUdBO0FBQ0EsVUFBSVgsU0FBUyxTQUFUQSxNQUFTLENBQUN0RCxDQUFELEVBQU87QUFDbEIsWUFBSWtFLGFBQUo7QUFBQSxZQUNJQyxZQUFZYixPQUFPYyxhQUR2QjtBQUFBLFlBRUlDLGlCQUFpQmYsT0FBT2UsY0FGNUI7QUFBQSxZQUdJbEIsWUFBWUcsT0FBT0gsU0FIdkIsQ0FEa0IsQ0FJZTs7QUFFakM7QUFDQSxZQUFJSSxlQUFlLElBQW5CLEVBQXlCO0FBQ3ZCQSx1QkFBYXZELEVBQUVzRSxPQUFmO0FBQ0E7QUFDRDtBQUNEO0FBQ0FKLGVBQU9sRSxFQUFFc0UsT0FBRixHQUFZZixVQUFuQjtBQUNBQSxxQkFBYXZELEVBQUVzRSxPQUFmOztBQUVBYixtQkFBV1MsSUFBWDtBQUNBO0FBQ0EsWUFBSVQsV0FBVyxDQUFmLEVBQWtCO0FBQ2hCVSxvQkFBVWYsS0FBVixDQUFnQlMsVUFBaEIsR0FBNkJKLFVBQVUsQ0FBdkM7QUFDQTtBQUNBTyxzQkFBWU8sVUFBWixHQUF5QixDQUF6QjtBQUNBO0FBQ0Y7QUFDRCxTQU5DLE1BTUssSUFBSUYsaUJBQWlCWixPQUFqQixJQUE0QkssY0FBaEMsRUFBZ0Q7QUFDbkRMLG9CQUFVSyxpQkFBaUJPLGNBQTNCO0FBQ0Q7QUFDREYsa0JBQVVmLEtBQVYsQ0FBZ0JTLFVBQWhCLEdBQTZCSixVQUFVLElBQXZDOztBQUVBO0FBQ0E7QUFDQU8sb0JBQVlPLFVBQVosR0FBeUJkLFVBQVVLLGNBQVYsR0FBMkJYLFNBQXBEO0FBQ0QsT0EvQkQ7O0FBaUNBO0FBQ0EsVUFBSXFCLHdCQUF3QixTQUF4QkEscUJBQXdCLEdBQU07QUFDaENiLGVBQU9jLG1CQUFQLENBQTJCLFdBQTNCLEVBQXdDbkIsTUFBeEM7QUFDQUMscUJBQWEsSUFBYjtBQUNELE9BSEQ7O0FBS0FJLGFBQU85RSxnQkFBUCxDQUF3QixTQUF4QixFQUFtQzJGLHFCQUFuQztBQUNBYixhQUFPOUUsZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0MyRixxQkFBaEM7O0FBRUEsYUFBT2xCLE1BQVA7QUFDRCxLQXhEWSxFQUFiOztBQTBEQXRFLGVBQVdILGdCQUFYLENBQTRCLFdBQTVCLEVBQXlDLFVBQUNtQixDQUFELEVBQU87QUFDOUM7QUFDQXNELGFBQU9jLGFBQVAsR0FBdUJwRSxFQUFFMEUsTUFBekI7O0FBRUE7QUFDQTtBQUNBcEIsYUFBT2UsY0FBUCxHQUF3QnJFLEVBQUUwRSxNQUFGLENBQVN4QixXQUFqQztBQUNBSSxhQUFPSCxTQUFQLEdBQW1CckUsS0FBS29FLFdBQXhCOztBQUVBUyxhQUFPOUUsZ0JBQVAsQ0FBd0IsV0FBeEIsRUFBcUN5RSxNQUFyQztBQUNELEtBVkQ7O0FBWUE7QUFDQSxRQUFJcUIsZ0JBQWlCLFlBQU07QUFDekI7QUFDQSxVQUFJQyxRQUFRaEcsU0FBU0csYUFBVCxDQUF1QixRQUF2QixDQUFaO0FBQUEsVUFDSThGLDBCQUEwQm5CLFdBQVdDLE9BQU9DLGdCQUFQLENBQXdCZ0IsS0FBeEIsRUFBK0JFLGtCQUExQyxJQUFnRSxJQUQ5Rjs7QUFHQSxlQUFTQyxTQUFULENBQW1CQyxTQUFuQixFQUE4QjtBQUM1QixZQUFJQSxhQUFhLElBQWpCLEVBQXVCO0FBQ3JCSixnQkFBTXhCLEtBQU4sQ0FBWTZCLE9BQVosR0FBc0IsT0FBdEI7QUFDQUwsZ0JBQU14QixLQUFOLENBQVk4QixPQUFaLEdBQXNCLENBQXRCOztBQUVBO0FBQ0VDLHFCQUFXLFlBQU07QUFBRVAsa0JBQU14QixLQUFOLENBQVk4QixPQUFaLEdBQXNCLENBQXRCO0FBQTBCLFdBQTdDLEVBQStDLENBQS9DO0FBQ0gsU0FORCxNQU1PO0FBQ0xOLGdCQUFNeEIsS0FBTixDQUFZOEIsT0FBWixHQUFzQixDQUF0Qjs7QUFFQTtBQUNBQyxxQkFBVyxZQUFNO0FBQUVQLGtCQUFNeEIsS0FBTixDQUFZNkIsT0FBWixHQUFzQixNQUF0QjtBQUErQixXQUFsRCxFQUFvREosdUJBQXBEO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLGFBQU8sVUFBQzdFLENBQUQsRUFBTztBQUNaLFlBQUkwRSxTQUFTMUUsRUFBRTBFLE1BQWY7O0FBRUE7QUFDQSxZQUFJQSxPQUFPVSxPQUFQLEtBQW1CLEtBQXZCLEVBQThCO0FBQzVCTCxvQkFBVSxJQUFWOztBQUdGO0FBQ0E7QUFDRCxTQU5DLE1BTUssSUFBSU0sU0FBU1gsTUFBVCxFQUFpQixjQUFqQixLQUNBVyxTQUFTWCxPQUFPWCxVQUFoQixFQUE0QixjQUE1QixDQURKLEVBQ2lEOztBQUV0RDtBQUNFLGNBQUlXLE9BQU9VLE9BQVAsS0FBbUIsR0FBdkIsRUFBNEJWLFNBQVNBLE9BQU9YLFVBQWhCOztBQUc1QixjQUFJc0IsU0FBU1gsTUFBVCxFQUFpQixTQUFqQixDQUFKLEVBQWlDO0FBQ25DO0FBQ0UsY0FBSVkscUJBQXFCVixNQUFNN0YsYUFBTixDQUFvQix1QkFBcEIsQ0FBekI7QUFDQSxjQUFJdUcsa0JBQUosRUFBd0JDLFlBQVlELGtCQUFaLEVBQWdDLFNBQWhDO0FBQzFCOztBQUVBO0FBQ0VFLG1CQUFTZCxNQUFULEVBQWlCLFNBQWpCO0FBQ0Y7QUFFQyxTQWpCSSxNQWlCRSxJQUFJVyxTQUFTWCxNQUFULEVBQWlCLGNBQWpCLENBQUosRUFBc0M7QUFDM0NLLG9CQUFVLEtBQVY7QUFFRCxTQUhNLE1BR0EsSUFBSUwsT0FBT3pDLFNBQVAsQ0FBaUJ3RCxPQUFqQixDQUF5QixhQUF6QixJQUEwQyxDQUFDLENBQS9DLEVBQWtEO0FBQ3pEO0FBQ0V6RixZQUFFMEYsY0FBRjtBQUNEO0FBQ0YsT0FsQ0Q7QUFtQ0QsS0F4RG1CLEVBQXBCOztBQTBEQTlHLGFBQVMrRyxJQUFULENBQWM5RyxnQkFBZCxDQUErQixPQUEvQixFQUF3QzhGLGFBQXhDO0FBRUQsR0FqVEQsRUFKTyxDQXFUSjs7QUFFSDtBQUNBLFdBQVNVLFFBQVQsQ0FBa0JPLElBQWxCLEVBQXdCM0QsU0FBeEIsRUFBbUM7QUFDakMsUUFBSTRELFVBQVVELEtBQUszRCxTQUFMLENBQWU2RCxLQUFmLENBQXFCLEdBQXJCLENBQWQ7QUFDQSxXQUFPRCxRQUFRSixPQUFSLENBQWdCeEQsU0FBaEIsSUFBNkIsQ0FBQyxDQUFyQztBQUNEOztBQUVELFdBQVNzRCxXQUFULENBQXFCSyxJQUFyQixFQUEyQjNELFNBQTNCLEVBQXNDO0FBQ3BDLFFBQUk0RCxVQUFVRCxLQUFLM0QsU0FBTCxDQUFlNkQsS0FBZixDQUFxQixHQUFyQixDQUFkO0FBQ0EsUUFBSUMsUUFBUUYsUUFBUUosT0FBUixDQUFnQnhELFNBQWhCLENBQVo7QUFDQSxRQUFJOEQsUUFBUSxDQUFDLENBQWIsRUFBZ0JGLFFBQVFHLE1BQVIsQ0FBZUQsS0FBZixFQUFzQixDQUF0QjtBQUNoQkgsU0FBSzNELFNBQUwsR0FBaUI0RCxRQUFRSSxJQUFSLENBQWEsR0FBYixDQUFqQjtBQUNEOztBQUVELFdBQVNULFFBQVQsQ0FBa0JJLElBQWxCLEVBQXdCM0QsU0FBeEIsRUFBbUM7QUFDakMsUUFBSSxDQUFDb0QsU0FBU08sSUFBVCxFQUFlM0QsU0FBZixDQUFMLEVBQ0EyRCxLQUFLM0QsU0FBTCxJQUFrQixNQUFNQSxTQUF4QjtBQUNEO0FBR0EsQ0ExVUQ7O0FBNFVBIiwiZmlsZSI6InNjcmlwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIigoKSA9PiB7XHJcbid1c2Ugc3RyaWN0JztcclxuXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xyXG5cclxuICBsZXQgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmlkJyksXHJcbiAgICAgIHNjcm9sbEJhclggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsLWJhcicpO1xyXG5cclxuICAvL1RPRE86IGFkZCBsb2FkZXIgaW50byBncmlkIGNvcyBpbWFnZXMgbG9hZGluZyBjYW4gdGFrZSBhIHdoaWxlXHJcbiAgLy8gc2V0IGxheW91dCBvZiBpbWFnZXNcclxuICBsZXQgcGNrcnkgPSBuZXcgUGFja2VyeShncmlkLCB7XHJcbiAgICBpdGVtU2VsZWN0b3I6ICcuZ3JpZC1pdGVtJyxcclxuICAgIGd1dHRlcjogMTAsXHJcbiAgICBob3Jpem9udGFsOiB0cnVlXHJcbiAgfSk7XHJcblxyXG5cclxuICAvLyBBTEwgVEhFIElORk9STUFUSU9OIEFCT1VUIElNQUdFUywgSU5DTFVESU5HIENPTU1FTlRTXHJcbiAgbGV0IGRhdGEgPSBbXTtcclxuICBnZXREYXRhKCk7XHJcblxyXG4gIGZ1bmN0aW9uIGdldERhdGEoKSB7XHJcbiAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksIGRhdGE7XHJcbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xyXG5cclxuICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09IDQgJiYgeGhyLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICBhbGVydCgnSW52YWxpZCBTZXJ2ZXIgcmVzcG9uc2UuIFNvcnJ5IScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXcgSW1hZ2VDb2xsZWN0aW9uKGRhdGEpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHhoci5vcGVuKCdHRVQnLCAnZGF0YS9pbWFnZV9wb3N0cy5qc29uJyk7XHJcbiAgICB4aHIuc2VuZCgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gSW1hZ2VDb2xsZWN0aW9uKGRhdGEpIHtcclxuICAgIGxldCBjb2xsZWN0aW9uID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMCwgbiA9IGRhdGEubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgIGNvbGxlY3Rpb24ucHVzaChuZXcgSW1hZ2VQb3N0KGRhdGFbaV0pKTtcclxuICAgIH1cclxuICAgIC8vVE9ETzogR2V0IGxhc3QgaWQuIERPIHdlIG5lZWQgSUQ/XHJcblxyXG5cclxuXHJcbiAgICB0aGlzLmdldEltYWdlUG9zdCA9IChpZCkgPT4ge1xyXG4gICAgICBmb3IgKGxldCBpID0gMCwgbiA9IGNvbGxlY3Rpb24ubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGNvbGxlY3Rpb25baV0uaWQgPT09IGlkKSByZXR1cm4gY29sbGVjdGlvbltpXTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIEltYWdlUG9zdChkYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gZGF0YS5pZCB8fCBudWxsO1xyXG4gICAgdGhpcy5pbWdTbWFsbCA9IGRhdGEuaW1nU21hbGwgfHwgZGF0YS5pbWdCaWc7XHJcbiAgICB0aGlzLmltZ0JpZyA9IGRhdGEuaW1nQmlnO1xyXG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IGRhdGEub3JpZW50YXRpb24gfHwgJ25vcm1hbCc7XHJcbiAgICB0aGlzLmxpa2VzID0gZGF0YS5saWtlcyB8fCAwO1xyXG4gICAgdGhpcy5kaXNsaWtlcyA9IGRhdGEuZGlzbGlrZXMgfHwgMDtcclxuICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICBkYXRhLmNvbW1lbnRzICYmIGRhdGEuY29tbWVudHMuZm9yRWFjaCgoY29tbWVudCkgPT4ge1xyXG4gICAgICB0aGlzLmNvbW1lbnRzLnB1c2gobmV3IENvbW1lbnQoXHJcbiAgICAgICAgY29tbWVudC50ZXh0LFxyXG4gICAgICAgIGNvbW1lbnQubmlja25hbWUsXHJcbiAgICAgICAgY29tbWVudC5kYXRlXHJcbiAgICAgICkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5ub2RlID0gcHV0SW5HcmlkKHRoaXMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHB1dEluR3JpZChzZWxmKSB7XHJcbiAgICAgIGxldCBncmlkSXRlbSwgaW1nLCBob3ZlckJveCwgaWNvbjtcclxuXHJcbiAgICAgIGdyaWRJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XHJcblxyXG4gICAgICBzd2l0Y2goc2VsZi5vcmllbnRhdGlvbikge1xyXG4gICAgICAgIGNhc2UgJ2xhbmRzY2FwZSc6XHJcbiAgICAgICAgZ3JpZEl0ZW0uY2xhc3NOYW1lID0gJ2dyaWQtaXRlbSBncmlkLWl0ZW0tLXdpZHRoJztcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAncG9ydHJhaXQnOlxyXG4gICAgICAgIGdyaWRJdGVtLmNsYXNzTmFtZSA9ICdncmlkLWl0ZW0gZ3JpZC1pdGVtLS1oZWlnaHQnO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGdyaWRJdGVtLmNsYXNzTmFtZSA9ICdncmlkLWl0ZW0nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdJTUcnKTtcclxuICAgICAgaW1nLnNyYyA9IHNlbGYuaW1nU21hbGw7XHJcbiAgICAgIGltZy5hbHQgPSAnSW1hZ2UgJyArIHNlbGYuaWQ7XHJcbiAgICAgIGdyaWRJdGVtLmFwcGVuZENoaWxkKGltZyk7XHJcblxyXG4gICAgICBob3ZlckJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xyXG4gICAgICBob3ZlckJveC5jbGFzc05hbWUgPSAnaG92ZXItYm94JztcclxuXHJcbiAgICAgIGhvdmVyQm94LmFwcGVuZENoaWxkKGFkZEljb24oJ3Nwcml0ZS1jb21tZW50Jywgc2VsZi5jb21tZW50cy5sZW5ndGgpKTtcclxuICAgICAgaG92ZXJCb3guYXBwZW5kQ2hpbGQoYWRkSWNvbignc3ByaXRlLWxpa2UnLCBzZWxmLmxpa2VzKSk7XHJcbiAgICAgIGhvdmVyQm94LmFwcGVuZENoaWxkKGFkZEljb24oJ3Nwcml0ZS1kaXNsaWtlJywgc2VsZi5kaXNsaWtlcykpO1xyXG5cclxuICAgICAgZ3JpZEl0ZW0uYXBwZW5kQ2hpbGQoaG92ZXJCb3gpO1xyXG5cclxuICAgICAgLy8gaW5zZXJ0IGJlZm9yZSBwbGFjZWhvbGRlciBmb3IgYWRkaW5nIGltYWdlc1xyXG4gICAgICBncmlkLmluc2VydEJlZm9yZShncmlkSXRlbSwgZ3JpZC5sYXN0RWxlbWVudENoaWxkKTtcclxuXHJcbiAgICAgIC8vcmVkcmF3IFBhY2tlcnlcclxuICAgICAgcGNrcnkucmVsb2FkSXRlbXMoKVxyXG4gICAgICBwY2tyeS5sYXlvdXQoKTtcclxuXHJcbiAgICAgIC8vYWRqdXN0IHNjcm9sbGJhclxyXG4gICAgICBhZGp1c3RTY3JvbGxCYXJXaWR0aCgpO1xyXG5cclxuICAgICAgcmV0dXJuIGdyaWRJdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZEljb24oY2xhc3NOYW1lLCBkYXRhQ291bnQpIHtcclxuICAgICAgbGV0IGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdJJyk7XHJcbiAgICAgIGljb24uY2xhc3NOYW1lID0gJ3Nwcml0ZSAnICsgY2xhc3NOYW1lO1xyXG4gICAgICBpY29uLnNldEF0dHJpYnV0ZSgnZGF0YS1jb3VudCcsIGRhdGFDb3VudCk7XHJcblxyXG4gICAgICByZXR1cm4gaWNvbjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIENvbW1lbnQodGV4dCwgbmlja25hbWUsIGRhdGUpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRleHQsXHJcbiAgICAgIG5pY2tuYW1lLFxyXG4gICAgICBkYXRlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgQ29tbWVudC5wcm90b3R5cGUuZ2V0UGFyc2VkRGF0ZSA9ICgpID0+IHtcclxuXHJcbiAgfVxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgLy8gRW5hYmxlIHNjcm9sbCBpZiBncmlkIGlzIHdpZGVyXHJcblxyXG4gIC8vIHVzZSBjbG9zdXJlIHRvIGtlZXAgcmVmZXJlbmNlIHRvIHNlY3Rpb25cclxuICAvLyBpZiBncmlkIGlzIHdpZGVyIHJldHVybnMgdGhlIGRpZmZlcmVuY2UgaW4gcGVyY2VudHNcclxuICAvLyBvdGhlcndpc2UgcmV0dXJucyAxMDAlXHJcbiAgbGV0IGdldEdyaWRQZXJjZW50YWdlID0gKCgpID0+IHtcclxuICAgIGxldCBzZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VjdGlvbi5tYWluJyk7XHJcblxyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgbGV0IHNlY3Rpb25XaWR0aCA9IHNlY3Rpb24uY2xpZW50V2lkdGg7XHJcbiAgICAgIGxldCBncmlkV2lkdGggPSBncmlkLmNsaWVudFdpZHRoO1xyXG5cclxuICAgICAgaWYgKGdyaWRXaWR0aCA+IHNlY3Rpb25XaWR0aCkge1xyXG4gICAgICAgIHJldHVybiAoc2VjdGlvbldpZHRoIC8gZ3JpZFdpZHRoICogMTAwKSArICclJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gMTAwICsgJyUnO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pKCk7XHJcblxyXG4gIGxldCBhZGp1c3RTY3JvbGxCYXJXaWR0aCA9ICgpID0+IHtcclxuICAgIHNjcm9sbEJhclguc3R5bGUud2lkdGggPSBnZXRHcmlkUGVyY2VudGFnZSgpO1xyXG4gIH07XHJcblxyXG4gIGFkanVzdFNjcm9sbEJhcldpZHRoKCk7XHJcblxyXG4gIC8vIGV2ZW50IGhhbmRsZXIgZm9yIHNjcm9sbGJhcnNcclxuXHJcbiAgLy8gdXNlIGNsb3N1cmUgdG8ga2VlcCB0cmFjayBvZiBtb3VzZSBtb3ZlXHJcbiAgLy8gYW5kIGF0dGFjaCBldmVudCBoYW5kbGVyIHRvIHdpbmRvdyBvbmx5IG9uY2VcclxuICBsZXQgb25Nb3ZlID0gKCgpID0+IHtcclxuICAgIC8vWCBmb3Igc2Nyb2xsQmFyWCBhbmQgWSBmb3Igc2Nyb2xsQmFyWVxyXG4gICAgbGV0IGxhc3RNb3VzZVggPSBudWxsLFxyXG4gICAgICAgIGxhc3RNb3VzZVkgPSBudWxsLFxyXG4gICAgICAgIG1hcmdpblggPSBwYXJzZUZsb2F0KHdpbmRvdy5cclxuICAgICAgICAgICAgICAgICAgZ2V0Q29tcHV0ZWRTdHlsZShzY3JvbGxCYXJYKS5tYXJnaW5MZWZ0KSxcclxuICAgICAgICBzY3JvbGxCb3hXaWR0aCA9IHNjcm9sbEJhclgucGFyZW50Tm9kZS5jbGllbnRXaWR0aDtcclxuXHJcbiAgICAvL2dldCBzY3JvbGxBcmVhXHJcbiAgICBsZXQgc2Nyb2xsQXJlYVggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgIChzY3JvbGxCYXJYLnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXNjcm9sbC1hcmVhJykpO1xyXG5cclxuICAgIC8vYWN0dWFsIG9uTW92ZSBIYW5kbGVyXHJcbiAgICBsZXQgb25Nb3ZlID0gKGUpID0+IHtcclxuICAgICAgbGV0IGRpZmYsXHJcbiAgICAgICAgICBzY3JvbGxCYXIgPSBvbk1vdmUuY3VycmVudFRhcmdldCxcclxuICAgICAgICAgIHNjcm9sbEJhcldpZHRoID0gb25Nb3ZlLnNjcm9sbEJhcldpZHRoLFxyXG4gICAgICAgICAgZ3JpZFdpZHRoID0gb25Nb3ZlLmdyaWRXaWR0aDsvLz8/Pz8/Pz8/Pz8/Pz8/P1xyXG5cclxuICAgICAgLy9yZW1lbWJlciBpbml0aWFsIHBvc2l0aW9uIG9mIHRoZSBtb3VzZVxyXG4gICAgICBpZiAobGFzdE1vdXNlWCA9PT0gbnVsbCkge1xyXG4gICAgICAgIGxhc3RNb3VzZVggPSBlLmNsaWVudFg7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGdldCBtb3VzZSBtb3ZlXHJcbiAgICAgIGRpZmYgPSBlLmNsaWVudFggLSBsYXN0TW91c2VYO1xyXG4gICAgICBsYXN0TW91c2VYID0gZS5jbGllbnRYO1xyXG5cclxuICAgICAgbWFyZ2luWCArPSBkaWZmO1xyXG4gICAgICAvL3ByZXZlbnQgZHJhZ2dpbmcgdG8gbGVmdCBpZiBvbiBlZGdlXHJcbiAgICAgIGlmIChtYXJnaW5YIDw9IDApIHtcclxuICAgICAgICBzY3JvbGxCYXIuc3R5bGUubWFyZ2luTGVmdCA9IG1hcmdpblggPSAwO1xyXG4gICAgICAgIC8vIHRvIHByZXZlbnQgaW5zdWZmaWNpZW50IHNjcm9sbCwgd2hlbiBicm93c2VyIHJlbmRlcnMgc2Nyb2xsIHRvIHNsb3dcclxuICAgICAgICBzY3JvbGxBcmVhWC5zY3JvbGxMZWZ0ID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIC8vcHJldmVudCBkcmFnZ2luZyB0byByaWdodCBpZiBvbiBlZGdlXHJcbiAgICB9IGVsc2UgaWYgKHNjcm9sbEJhcldpZHRoICsgbWFyZ2luWCA+PSBzY3JvbGxCb3hXaWR0aCkge1xyXG4gICAgICAgIG1hcmdpblggPSBzY3JvbGxCb3hXaWR0aCAtIHNjcm9sbEJhcldpZHRoO1xyXG4gICAgICB9XHJcbiAgICAgIHNjcm9sbEJhci5zdHlsZS5tYXJnaW5MZWZ0ID0gbWFyZ2luWCArICdweCc7XHJcblxyXG4gICAgICAvL2FkanVzdCBncmlkIHBvc2l0aW9uIGR1ZSB0byBwZXJjZW50YWdlIHZhbHVlIG9mIHNjcm9sbC1iYXIgbWFyZ2luXHJcbiAgICAgIC8vKioqLT4tPi0+IHNjcm9sbGJhci5tYXJnaW5MZWZ0IC8gcGFyZW50LndpZHRoID0gLWdyaWQubWFyZ2luTGVmdCAvIGdyaWQud2lkdGggPC08LTwtKioqXHJcbiAgICAgIHNjcm9sbEFyZWFYLnNjcm9sbExlZnQgPSBtYXJnaW5YIC8gc2Nyb2xsQm94V2lkdGggKiBncmlkV2lkdGg7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vdG8gZGlzYWJsZSBzY3JvbGxpbmcgb25tb3VzZXVwXHJcbiAgICBsZXQgcmVtb3ZlU2Nyb2xsTGlzdGVuZXJzID0gKCkgPT4ge1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3ZlKTtcclxuICAgICAgbGFzdE1vdXNlWCA9IG51bGw7XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgcmVtb3ZlU2Nyb2xsTGlzdGVuZXJzKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgcmVtb3ZlU2Nyb2xsTGlzdGVuZXJzKTtcclxuXHJcbiAgICByZXR1cm4gb25Nb3ZlO1xyXG4gIH0pKCk7XHJcblxyXG4gIHNjcm9sbEJhclguYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHtcclxuICAgIC8vcmVtZW1iZXIgd2hpY2ggc2Nyb2xsYmFyIHdlIGFyZSBjdXJyZW50bHkgb25cclxuICAgIG9uTW92ZS5jdXJyZW50VGFyZ2V0ID0gZS50YXJnZXQ7XHJcblxyXG4gICAgLy9yZW1lbWJlciB3aWR0aCBvZiB0aGUgc2Nyb2xsYmFyIGFuZCB3aWR0aCBvZiB0aGUgZ3JpZFxyXG4gICAgLy90aGV5IGFyZSBuZWVkZWQgZm9yIGRyYWdnaW5nIGNvbXB1dGF0aW9uc1xyXG4gICAgb25Nb3ZlLnNjcm9sbEJhcldpZHRoID0gZS50YXJnZXQuY2xpZW50V2lkdGg7XHJcbiAgICBvbk1vdmUuZ3JpZFdpZHRoID0gZ3JpZC5jbGllbnRXaWR0aDtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3ZlKTtcclxuICB9KTtcclxuXHJcbiAgLy8gR1JJRCBMSVNURU5FUlMgLT4gUE9QVVAgJiYgQUREIE5FVyBJTUFHRVxyXG4gIGxldCBjbGlja0xpc3RlbmVyID0gKCgpID0+IHtcclxuICAgIC8vY2xvc3VyZVxyXG4gICAgbGV0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBvcHVwJyksXHJcbiAgICAgICAgcG9wdXBUcmFuc2l0aW9uRHVyYXRpb24gPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBvcHVwKS50cmFuc2l0aW9uRHVyYXRpb24pICogMTAwMDtcclxuXHJcbiAgICBmdW5jdGlvbiBmYWRlUG9wdXAoZGlyZWN0aW9uKSB7XHJcbiAgICAgIGlmIChkaXJlY3Rpb24gPT0gJ2luJykge1xyXG4gICAgICAgIHBvcHVwLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIHBvcHVwLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG5cclxuICAgICAgICAvLyB0byBlbmFibGUgcHJvcGVyIHRyYW5zaXRpb25pbmcgd2l0aCBtaW5pbWFsIGRlbGF5XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgcG9wdXAuc3R5bGUub3BhY2l0eSA9IDE7IH0sIDQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBvcHVwLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG5cclxuICAgICAgICAvLyB0cmFuc2l0aW9uRHVyYXRpb25cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgcG9wdXAuc3R5bGUuZGlzcGxheSA9ICdub25lJzsgfSwgcG9wdXBUcmFuc2l0aW9uRHVyYXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWN0dWFsIGxpc3RlbmVyXHJcbiAgICByZXR1cm4gKGUpID0+IHtcclxuICAgICAgbGV0IHRhcmdldCA9IGUudGFyZ2V0O1xyXG5cclxuICAgICAgLy8gaW1hZ2Ugb24gbWFpbiB3aW5kb3dcclxuICAgICAgaWYgKHRhcmdldC50YWdOYW1lID09PSAnSU1HJykge1xyXG4gICAgICAgIGZhZGVQb3B1cCgnaW4nKTtcclxuXHJcblxyXG4gICAgICAvLyAqKioqKioqKioqKioqIFBPUFVQICoqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vIExpa2UgYW5kIERpc2xpa2UgYnV0dG9uc1xyXG4gICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdpbWFnZS1idXR0b24nKSB8fFxyXG4gICAgICAgICAgICAgICBoYXNDbGFzcyh0YXJnZXQucGFyZW50Tm9kZSwgJ2ltYWdlLWJ1dHRvbicpKSB7XHJcblxyXG4gICAgICAvLyBpZiBjbGljayBvbiBjaGlsZCBub2RlXHJcbiAgICAgICAgaWYgKHRhcmdldC50YWdOYW1lID09PSAnSScpIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG5cclxuXHJcbiAgICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2NsaWNrZWQnKSkgcmV0dXJuO1xyXG4gICAgICAvLyBpZiB0aGVyZSBpcyBhbHJlYWR5IGEgY2xpY2tlZCBidXR0b24gLT4gdW5jbGljayBpdFxyXG4gICAgICAgIGxldCBvdGhlckNsaWNrZWRCdXR0b24gPSBwb3B1cC5xdWVyeVNlbGVjdG9yKCcuaW1hZ2UtYnV0dG9uLmNsaWNrZWQnKTtcclxuICAgICAgICBpZiAob3RoZXJDbGlja2VkQnV0dG9uKSByZW1vdmVDbGFzcyhvdGhlckNsaWNrZWRCdXR0b24sICdjbGlja2VkJyk7XHJcbiAgICAgIC8vIFRPRE86IC0xIGZvciBsaWtlcyBvciBkaXNsaWtlc1xyXG5cclxuICAgICAgLy8gXCJwcmVzc1wiIHRoZSBidXR0b25cclxuICAgICAgICBhZGRDbGFzcyh0YXJnZXQsICdjbGlja2VkJyk7XHJcbiAgICAgIC8vIFRPRE86ICsxIGZvciBsaWtlcyBvciBkaXNsaWtlc1xyXG5cclxuICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdzcHJpdGUtY2xvc2UnKSkge1xyXG4gICAgICAgIGZhZGVQb3B1cCgnb3V0Jyk7XHJcblxyXG4gICAgICB9IGVsc2UgaWYgKHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZignc2VuZC1idXR0b24nKSA+IC0xKSB7XHJcbiAgICAgIC8vdG8gcHJldmVudCBsYWJlbFxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KSgpO1xyXG5cclxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tMaXN0ZW5lcik7XHJcblxyXG59KTsvL2VuZCBET01Db250ZW50TG9hZGVkXHJcblxyXG4vLyBVU0VGVUwgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIGhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkge1xyXG4gIGxldCBjbGFzc2VzID0gZWxlbS5jbGFzc05hbWUuc3BsaXQoJyAnKTtcclxuICByZXR1cm4gY2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSB7XHJcbiAgbGV0IGNsYXNzZXMgPSBlbGVtLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xyXG4gIGxldCBpbmRleCA9IGNsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpO1xyXG4gIGlmIChpbmRleCA+IC0xKSBjbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgZWxlbS5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSB7XHJcbiAgaWYgKCFoYXNDbGFzcyhlbGVtLCBjbGFzc05hbWUpKVxyXG4gIGVsZW0uY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcclxufVxyXG5cclxuXHJcbn0pKCk7XHJcblxyXG4vL1RPRE86IERPTSBlbGVtZW50cywgdGhhdCB1IG1hbmFnZSB0aHJvdWdoIEpTIG11c3QgaGF2ZSBkYXRhLVxyXG4iXX0=
