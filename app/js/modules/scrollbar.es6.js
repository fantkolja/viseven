//TODO: add wheel events
(() => {
'use strict';

/**
 * Constructor function for scrollbars
 * @param {HTMLElement} scrollBar
 * @param {String} 'h' for horizontal || 'v' for vertical
 * @returns {Object} with methods for handling scrollbar
 */

module.exports = function Scrollbar(scrollBar, direction) {
  let scrollBox = scrollBar.parentNode;
  let scrolledArea = document.querySelector
                   (scrollBox.getAttribute('data-scrolled-area'));
  let scrolledBox = scrolledArea.parentNode;

  // depends on direction of the scrollbar
  let [clientSizeProp, sizeProp, marginProp, clientAxis, scrollProp] = (direction == 'h') ?
  ['clientWidth', 'width', 'marginLeft', 'clientX', 'scrollLeft'] :
  ['clientHeight', 'height', 'marginTop', 'clientY', 'scrollTop'];


  // if grid is wider returns the difference in percents
  // otherwise returns 100%
  let getAreaToBoxRatio = () => {
    let areaSize = scrolledArea[clientSizeProp];
    let boxSize = scrolledBox[clientSizeProp];

    if (direction == 'v') {
      // console.log('Area:', scrolledArea, scrolledArea[clientSizeProp], '\nBox:', scrolledBox, scrolledBox[clientSizeProp]);
    }

    if (areaSize > boxSize) {
      return (boxSize / areaSize * 100) + '%';
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

    if (toInitial) this.jumpTo(0);

    if (ratio == '100%') {
      scrollBox.style.opacity = 0;
      scrolledBox.removeEventListener('wheel', onWheel);
    } else {
      scrollBox.style.opacity = 1;
      scrollBar.style[sizeProp] = ratio;
      scrolledBox.addEventListener('wheel', onWheel);
    }
  };

  let onWheel = (e) => {
    console.log('wheel');

    // prevent page scrolling
    e.preventDefault();
  }

  // event handler for scrollbars

  // use closure to keep track of mouse move
  // and attach event handler to window only once
  let onMove = (() => {
    //X for scrollBarX and Y for scrollBarY
    let lastMousePoint = null,
        margin = parseFloat(window.
                 getComputedStyle(scrollBar)[marginProp]),
        scrollBoxSize = scrollBar.parentNode[clientSizeProp];

    // junps to given scroll point
    this.jumpTo = (point) => {
      margin = point;
      scrollBar.style[marginProp] = point;
      scrolledBox[scrollProp] = point;
    };

    function isOnBegin() {
      return margin <= 0;
    }

    function isOnEnd() {
      return onMove.scrollBarSize + margin >= scrollBoxSize;
    }

    function scrollTo() {
      if (isOnBegin()) {
        scrollBar.style[marginProp] = margin = 0;
        // to prevent insufficient scroll, when browser renders scroll to slow
        scrolledBox[scrollProp] = 0;
        return;
      //prevent dragging to right if on edge
      } else if (isOnEnd()) {
        margin = scrollBoxSize - onMove.scrollBarSize;
      }

      onMove.currentTarget.style[marginProp] = margin + 'px';
      //adjust grid position due to percentage value of scroll-bar margin
      //***->->-> scrollbar[marginProp] / parent.width = -grid[marginProp] / grid.width <-<-<-***
      // scrolledBox[scrollProp] = margin / scrollBoxSize * scrollAreaSize;
      scrolledBox[scrollProp] = margin / scrollBoxSize * onMove.scrollAreaSize;
    }

    //onMove Handler
    let onMove = (e) => {
      let diff,
          scrollBar = onMove.currentTarget,
          scrollBarSize = onMove.scrollBarSize;

      if (!scrollBoxSize) scrollBoxSize = scrollBar.parentNode[clientSizeProp];

      //remember initial position of the mouse
      if (lastMousePoint === null) {
        lastMousePoint = e[clientAxis];
        return;
      }
      // get mouse move
      diff = e[clientAxis] - lastMousePoint;
      lastMousePoint = e[clientAxis];

      margin += diff;
      scrollTo(margin);
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
    //remember which scrollbar we are currently on
    onMove.currentTarget = e.target;

    //remember size of the scrollbar and width of the scrollArea
    //they are needed for dragging computations
    onMove.scrollBarSize = e.target[clientSizeProp];
    onMove.scrollAreaSize = scrolledArea[clientSizeProp];

    window.addEventListener('mousemove', onMove);
  });

};

})();
