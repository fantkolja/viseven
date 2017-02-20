(() => {
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const grid = document.querySelector('.grid'),
        scrollBar = document.querySelector('.scroll-bar');

  //TODO: add loader into grid cos images loading can take a while
  // set layout of images
  let pckry = new Packery(grid, {
    itemSelector: '.grid-item',
    columnWidth: 240,
    rowHeight: 200,
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

  let adjustScrollBar = () => {
    let percents = isGridWider();
    if (percents) {
      scrollBar.style.width = percents + '%';
    }
  };

  adjustScrollBar();

  scrollBar.addEventListener('mousedown', () => {

    scrollBar.addEventListener('mousemove', () => {

    });
  });

});//end DOMContentLoaded

})();
