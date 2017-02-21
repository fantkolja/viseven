(() => {
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const grid = document.querySelector('.grid'),
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
  // otherwise undefined
  let isGridWider = (() => {
    let section = document.querySelector('section.main');

    return () => {
      let sectionStyle = window.getComputedStyle(section);
      let sectionWidth = parseFloat(sectionStyle.width);
      let gridWidth = parseFloat(grid.style.width);

      if (gridWidth > sectionWidth) {
        return sectionWidth / gridWidth * 100;
      }
    };
  })();

  let adjustScrollBarWidth = () => {
    let percents = isGridWider();
    if (percents) {
      scrollBarX.style.width = percents + '%';
    }
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
        parentWidth = scrollBarX.parentNode.clientWidth;
    //onMove Handler
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
        grid.style.marginLeft = 0;
        return;
      //prevent dragging to right if on edge
      } else if (scrollBarWidth + marginX >= parentWidth) {
        marginX = parentWidth - scrollBarWidth;
      }
      scrollBar.style.marginLeft = marginX + 'px';

      //adjust grid position due to percentage value of scroll-bar margin
      //***->->-> scrollbar.marginLeft / parent.width = -grid.marginLeft / grid.width <-<-<-***
      grid.style.marginLeft = (-1 * (marginX / parentWidth) * gridWidth) + 'px';
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
