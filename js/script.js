$(function(){
    var gallery = new GalleryApp.Gallery('#gallery');
    $('.loader').removeClass('-hidden');

    gallery.init({
        onSuccess: function() {
            $('.loader').addClass('-hidden');
        },

        onError: function() {
            console.log('onError callback call');
        }
    });
});
