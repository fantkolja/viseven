'use strict';

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    var grid = document.querySelector('.grid'),
        scrollBar = document.querySelector('.scroll-bar');

    //TODO: add loader into grid cos images loading can take a while
    // set layout of images
    var pckry = new Packery(grid, {
      itemSelector: '.grid-item',
      columnWidth: 240,
      rowHeight: 200,
      horizontal: true
    });

    // Enable scroll if grid is wider

    // use closure to keep reference to section
    // if grid is wider returns the difference in percents
    // otherwise undefined
    var isGridWider = function () {
      var section = document.querySelector('section.main');

      return function () {
        var sectionStyle = window.getComputedStyle(section);
        var sectionWidth = parseFloat(sectionStyle.width);
        var gridWidth = parseFloat(grid.style.width);

        if (gridWidth > sectionWidth) {
          return sectionWidth / gridWidth * 100;
        }
      };
    }();

    var adjustScrollBar = function adjustScrollBar() {
      var percents = isGridWider();
      if (percents) {
        scrollBar.style.width = percents + '%';
      }
    };

    adjustScrollBar();

    scrollBar.addEventListener('mousedown', function () {

      scrollBar.addEventListener('mousemove', function () {});
    });
  }); //end DOMContentLoaded
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5lczYuanMiXSwibmFtZXMiOlsiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZ3JpZCIsInF1ZXJ5U2VsZWN0b3IiLCJzY3JvbGxCYXIiLCJwY2tyeSIsIlBhY2tlcnkiLCJpdGVtU2VsZWN0b3IiLCJjb2x1bW5XaWR0aCIsInJvd0hlaWdodCIsImhvcml6b250YWwiLCJpc0dyaWRXaWRlciIsInNlY3Rpb24iLCJzZWN0aW9uU3R5bGUiLCJ3aW5kb3ciLCJnZXRDb21wdXRlZFN0eWxlIiwic2VjdGlvbldpZHRoIiwicGFyc2VGbG9hdCIsIndpZHRoIiwiZ3JpZFdpZHRoIiwic3R5bGUiLCJhZGp1c3RTY3JvbGxCYXIiLCJwZXJjZW50cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxDQUFDLFlBQU07QUFDUDs7QUFFQUEsV0FBU0MsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQU07O0FBRWxELFFBQU1DLE9BQU9GLFNBQVNHLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBYjtBQUFBLFFBQ01DLFlBQVlKLFNBQVNHLGFBQVQsQ0FBdUIsYUFBdkIsQ0FEbEI7O0FBR0E7QUFDQTtBQUNBLFFBQUlFLFFBQVEsSUFBSUMsT0FBSixDQUFZSixJQUFaLEVBQWtCO0FBQzVCSyxvQkFBYyxZQURjO0FBRTVCQyxtQkFBYSxHQUZlO0FBRzVCQyxpQkFBVyxHQUhpQjtBQUk1QkMsa0JBQVk7QUFKZ0IsS0FBbEIsQ0FBWjs7QUFPQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFJQyxjQUFlLFlBQU07QUFDdkIsVUFBSUMsVUFBVVosU0FBU0csYUFBVCxDQUF1QixjQUF2QixDQUFkOztBQUVBLGFBQU8sWUFBTTtBQUNYLFlBQUlVLGVBQWVDLE9BQU9DLGdCQUFQLENBQXdCSCxPQUF4QixDQUFuQjtBQUNBLFlBQUlJLGVBQWVDLFdBQVdKLGFBQWFLLEtBQXhCLENBQW5CO0FBQ0EsWUFBSUMsWUFBWUYsV0FBV2YsS0FBS2tCLEtBQUwsQ0FBV0YsS0FBdEIsQ0FBaEI7O0FBRUEsWUFBSUMsWUFBWUgsWUFBaEIsRUFBOEI7QUFDNUIsaUJBQU9BLGVBQWVHLFNBQWYsR0FBMkIsR0FBbEM7QUFDRDtBQUNGLE9BUkQ7QUFTRCxLQVppQixFQUFsQjs7QUFjQSxRQUFJRSxrQkFBa0IsU0FBbEJBLGVBQWtCLEdBQU07QUFDMUIsVUFBSUMsV0FBV1gsYUFBZjtBQUNBLFVBQUlXLFFBQUosRUFBYztBQUNabEIsa0JBQVVnQixLQUFWLENBQWdCRixLQUFoQixHQUF3QkksV0FBVyxHQUFuQztBQUNEO0FBQ0YsS0FMRDs7QUFPQUQ7O0FBRUFqQixjQUFVSCxnQkFBVixDQUEyQixXQUEzQixFQUF3QyxZQUFNOztBQUU1Q0csZ0JBQVVILGdCQUFWLENBQTJCLFdBQTNCLEVBQXdDLFlBQU0sQ0FFN0MsQ0FGRDtBQUdELEtBTEQ7QUFPRCxHQWpERCxFQUhPLENBb0RKO0FBRUYsQ0F0REQiLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKCgpID0+IHtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcclxuXHJcbiAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmlkJyksXHJcbiAgICAgICAgc2Nyb2xsQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjcm9sbC1iYXInKTtcclxuXHJcbiAgLy9UT0RPOiBhZGQgbG9hZGVyIGludG8gZ3JpZCBjb3MgaW1hZ2VzIGxvYWRpbmcgY2FuIHRha2UgYSB3aGlsZVxyXG4gIC8vIHNldCBsYXlvdXQgb2YgaW1hZ2VzXHJcbiAgbGV0IHBja3J5ID0gbmV3IFBhY2tlcnkoZ3JpZCwge1xyXG4gICAgaXRlbVNlbGVjdG9yOiAnLmdyaWQtaXRlbScsXHJcbiAgICBjb2x1bW5XaWR0aDogMjQwLFxyXG4gICAgcm93SGVpZ2h0OiAyMDAsXHJcbiAgICBob3Jpem9udGFsOiB0cnVlXHJcbiAgfSk7XHJcblxyXG4gIC8vIEVuYWJsZSBzY3JvbGwgaWYgZ3JpZCBpcyB3aWRlclxyXG5cclxuICAvLyB1c2UgY2xvc3VyZSB0byBrZWVwIHJlZmVyZW5jZSB0byBzZWN0aW9uXHJcbiAgLy8gaWYgZ3JpZCBpcyB3aWRlciByZXR1cm5zIHRoZSBkaWZmZXJlbmNlIGluIHBlcmNlbnRzXHJcbiAgLy8gb3RoZXJ3aXNlIHVuZGVmaW5lZFxyXG4gIGxldCBpc0dyaWRXaWRlciA9ICgoKSA9PiB7XHJcbiAgICBsZXQgc2VjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlY3Rpb24ubWFpbicpO1xyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGxldCBzZWN0aW9uU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzZWN0aW9uKTtcclxuICAgICAgbGV0IHNlY3Rpb25XaWR0aCA9IHBhcnNlRmxvYXQoc2VjdGlvblN0eWxlLndpZHRoKTtcclxuICAgICAgbGV0IGdyaWRXaWR0aCA9IHBhcnNlRmxvYXQoZ3JpZC5zdHlsZS53aWR0aCk7XHJcblxyXG4gICAgICBpZiAoZ3JpZFdpZHRoID4gc2VjdGlvbldpZHRoKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlY3Rpb25XaWR0aCAvIGdyaWRXaWR0aCAqIDEwMDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KSgpO1xyXG5cclxuICBsZXQgYWRqdXN0U2Nyb2xsQmFyID0gKCkgPT4ge1xyXG4gICAgbGV0IHBlcmNlbnRzID0gaXNHcmlkV2lkZXIoKTtcclxuICAgIGlmIChwZXJjZW50cykge1xyXG4gICAgICBzY3JvbGxCYXIuc3R5bGUud2lkdGggPSBwZXJjZW50cyArICclJztcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBhZGp1c3RTY3JvbGxCYXIoKTtcclxuXHJcbiAgc2Nyb2xsQmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsICgpID0+IHtcclxuXHJcbiAgICBzY3JvbGxCYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKCkgPT4ge1xyXG5cclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxufSk7Ly9lbmQgRE9NQ29udGVudExvYWRlZFxyXG5cclxufSkoKTtcclxuIl19
