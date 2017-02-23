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
    scrollBarX.style.width = getGridPercentage() ;
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

});//end DOMContentLoaded

})();
