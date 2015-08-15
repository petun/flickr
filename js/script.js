$(function () {

    GalleryApp.Loggger.debug = false;

    var gallery = new GalleryApp.Gallery('.gallery-container', {per_page: 15});
    gallery.init();


});
