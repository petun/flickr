$(function(){

    var gallery = new GalleryApp.Gallery('#div-selector');

    $('.loader').removeClass('-hidden');
    gallery.getRecentPhotos({

        onSuccess: function() {
            $('.loader').addClass('-hidden');

            gallery.generateHtml();
        },

        onError: function() {
            console.log('onError callback call');
        }
    });




});
