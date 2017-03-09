(() => {
'use strict';
const scrollBraking = 5;

/**
 * Constructor function for scrollbars
 * @param {HTMLElement} scrollBar
 * @param {String} 'h' for horizontal || 'v' for vertical
 * @returns {Object} with methods for handling scrollbar
 */

module.exports = function Scrollbar(scrollBar, direction) {
  // depends on direction of the scrollbar
  let [clientSizeProp, sizeProp, marginProp, clientAxis, scrollProp] = (direction == 'h') ?
  ['clientWidth', 'width', 'marginLeft', 'clientX', 'scrollLeft'] :
  ['clientHeight', 'height', 'marginTop', 'clientY', 'scrollTop'];

  let scrollBox = scrollBar.parentNode;
  let scrolledArea = document.querySelector
                   (scrollBox.getAttribute('data-scrolled-area'));
  let scrolledBox = scrolledArea.parentNode;
  let scrollBarSize = scrollBar[clientSizeProp];
  let scrollBoxSize = scrollBox[clientSizeProp];
  let scrolledAreaSize = scrolledArea[clientSizeProp];


  // if grid is wider returns the difference in percents
  // otherwise returns 100%
  let getAreaToBoxRatio = () => {
    let boxSize = scrolledBox[clientSizeProp];
    scrolledAreaSize = scrolledArea[clientSizeProp];

    if (scrolledAreaSize > boxSize) {
      return (boxSize / scrolledAreaSize * 100) + '%';
    } else {
      return 100 + '%';
    }
  };

  /**
   * Enable scroll if area is wider
   * sets size of scroll-bar
   * adds and removes wheel listeners
   * @param {Boolean} 'true' -> jumps to zero scroll
   * @returns {undefined}
   */
  this.adjustSize = (toInitial) => {
    let ratio = getAreaToBoxRatio();

    if (toInitial) this.scrollAt(0, true);

    if (ratio == '100%') {
      scrollBox.style.opacity = 0;
      scrolledBox.removeEventListener('wheel', onWheel);
    } else {
      scrollBox.style.opacity = 1;
      // set in %
      scrollBar.style[sizeProp] = ratio;
      //refresh sizes
      scrollBarSize = scrollBar[clientSizeProp];
      scrollBoxSize = scrollBox[clientSizeProp];

      scrolledBox.addEventListener('wheel', onWheel);
    }
  };

  let onWheel = (e) => {
    this.scrollAt(e.deltaY / scrollBraking);
    // prevent page scrolling
    e.preventDefault();
  }

  // event handler for scrollbars

  // use closure to keep track of mouse move
  // and attach event handler to window only once
  let onMove = (() => {
    //X for scrollBarX and Y for scrollBarY
    let lastMousePoint = null,
        margin = parseFloat(window.getComputedStyle(scrollBar)[marginProp]);

    scrollBoxSize = scrollBar.parentNode[clientSizeProp];

  /**
   * scrolles at set distance
   * @param {Number} positive or negative integer
   * @param {Boolean} if true jumps to initial position
   * @returns
   */
    this.scrollAt = (distance, onInit) => {
      if (onInit) {
        margin = scrollBar.style[marginProp] =
        scrolledBox[scrollProp] = 0;
        return;
      }

      margin += distance;
      if (isOnBegin()) {
        scrollBar.style[marginProp] = margin = 0;
        // to prevent insufficient scroll, when browser renders scroll to slow
        scrolledBox[scrollProp] = 0;
        return;
      //prevent dragging to right if on edge
      } else if (isOnEnd()) {
        margin = scrollBoxSize - scrollBarSize;
      }

      scrollBar.style[marginProp] = margin + 'px';
      //adjust grid position due to percentage value of scroll-bar margin
      //***->->-> scrollbar[marginProp] / parent.width = -grid[marginProp] / grid.width <-<-<-***
      scrolledBox[scrollProp] = margin / scrollBoxSize * scrolledAreaSize;
    };

    function isOnBegin() {
      return margin <= 0;
    }

    function isOnEnd() {
      return scrollBarSize + margin >= scrollBoxSize;
    }

    //onMove Handler
    let onMove = (e) => {
      let diff;

      if (!scrollBoxSize) scrollBoxSize = scrollBar.parentNode[clientSizeProp];

      //remember initial position of the mouse
      if (lastMousePoint === null) {
        lastMousePoint = e[clientAxis];
        return;
      }
      // get mouse move
      diff = e[clientAxis] - lastMousePoint;
      lastMousePoint = e[clientAxis];

      this.scrollAt(diff);
    };

    //to disable scrolling onmouseup
    let removeScrollListeners = () => {
      window.removeEventListener('mousemove', onMove);
      lastMousePoint = null;
    };

    window.addEventListener('mouseup', removeScrollListeners);
    window.addEventListener('blur', removeScrollListeners);
    return onMove;
  })();

  scrollBar.addEventListener('mousedown', (e) => {
    window.addEventListener('mousemove', onMove);
  });

};

})();
