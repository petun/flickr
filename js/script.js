$(function () {

    GalleryApp.Loggger.debug = true;

    var gallery = new GalleryApp.Gallery('.gallery-container', {per_page: 10});
    gallery.init();
    //gallery.generateHtmlWrappers();
    //gallery.showError('Failed to complete request. Try again later. <a href=".">Refresh then page</a>');

    /*var api = new GalleryApp.FlickrApi();

    //20577569705
    //20584115781
    //20389584250


    $.when(api.getRecentPhotos(2)).then(function (e) {
        console.log(e);
    });


    /*var objects = [{id: 20577569705}, {id: 20584115781}, {id: 20389584250}];

    var promises = [];
    $.map(objects, function (o) {
        promises.push(
            api.getPhotoSizes(o)
        );
    });


    $.when.apply($, promises).then(
        function () {
            GalleryApp.Loggger.log(arguments);
        },
        function (r) {
            GalleryApp.Loggger.log('failed request');
            GalleryApp.Loggger.log(r);
        }
    ); */

});
