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

  // if grid is wider returns the difference in percents
  // otherwise returns 100%
  let getAreaToBoxRatio = () => {
    let areaWidth = scrolledArea.clientWidth;
    let boxWidth = scrolledBox.clientWidth;

    if (areaWidth > boxWidth) {
      return (boxWidth / areaWidth * 100) + '%';
    } else {
      return 100 + '%';
    }
  };

  // Enable scroll if area is wider
  // sets size of scroll-bar
  this.adjustSize = () => {
    let ratio = getAreaToBoxRatio();

    if (ratio == '100%')
      scrollBox.style.opacity = 0;
    else {
      scrollBox.style.opacity = 1;
      scrollBar.style.width = ratio;
    }
  };

  // event handler for scrollbars

  // use closure to keep track of mouse move
  // and attach event handler to window only once
  let onMove = (() => {
    //X for scrollBarX and Y for scrollBarY
    let lastMouseX = null,
        lastMouseY = null,
        margin = parseFloat(window.
                  getComputedStyle(scrollBar).marginLeft),
        scrollBoxWidth = scrollBar.parentNode.clientWidth;

    //onMove Handler
    let onMove = (e) => {
      let diff,
          scrollBar = onMove.currentTarget,
          scrollBarSize = onMove.scrollBarSize,
          scrollAreaSize = onMove.scrollAreaSize;

      //remember initial position of the mouse
      if (lastMouseX === null) {
        lastMouseX = e.clientX;
        return;
      }
      // get mouse move
      diff = e.clientX - lastMouseX;
      lastMouseX = e.clientX;

      margin += diff;
      //prevent dragging to left if on edge
      if (margin <= 0) {
        scrollBar.style.marginLeft = margin = 0;
        // to prevent insufficient scroll, when browser renders scroll to slow
        scrolledBox.scrollLeft = 0;
        return;
      //prevent dragging to right if on edge
    } else if (scrollBarSize + margin >= scrollBoxWidth) {
        margin = scrollBoxWidth - scrollBarSize;
      }
      scrollBar.style.marginLeft = margin + 'px';

      //adjust grid position due to percentage value of scroll-bar margin
      //***->->-> scrollbar.marginLeft / parent.width = -grid.marginLeft / grid.width <-<-<-***
      scrolledBox.scrollLeft = margin / scrollBoxWidth * scrollAreaSize;
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

  scrollBar.addEventListener('mousedown', (e) => {
    //remember which scrollbar we are currently on
    onMove.currentTarget = e.target;

    //remember size of the scrollbar and width of the scrollArea
    //they are needed for dragging computations
    if (direction == 'h') {
      onMove.scrollBarSize = e.target.clientWidth;
      onMove.scrollAreaSize = scrolledArea.clientWidth;
    } else if (direction == 'v') {
      onMove.scrollBarSize = e.target.clientHeight;
      onMove.scrollAreaSize = scrolledArea.clientHeight;
    }

    window.addEventListener('mousemove', onMove);
  });

};

})();
