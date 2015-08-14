var GalleryApp = GalleryApp || {};


/**
 * @param element jQuery Selector or string
 * @constructor
 */
GalleryApp.Gallery = function (element) {
    this.wrapper = typeof element == 'string' ? $(element) : element;
    this.photos = [];

    this.galleryWrapper = null;
    this.photosContainer = null;
    this.bigPhotoContainer = null;
};
// todo - добавить кол-ко фоток в конструктор


GalleryApp.Gallery.prototype = {
    /**
     * @param params Json with callbacks. onSuccess, onError
     */
    init:  function(params) {

        this.generateHtmlWrappers();

        var self = this;

        this.photosContainer.addClass('-loading');

        var api = new GalleryApp.FlickrApi();

        $.when(api.getRecentPhotos()).then(function(flickrObjects){

            self.photosContainer.removeClass('-loading');

            console.log('Get All Flickr Objects');
            console.log(flickrObjects);

            if (flickrObjects) {

                $.each(flickrObjects, function(index, photo) {
                    self.addPhoto( GalleryApp.CreatePhoto(photo) );
                });

                self.generatePhotosHtml();
                self.registerEvents();

            } else {
                //todo error
            }
        });
    },


    addPhoto: function (photo) {
        this.photos.push(photo);
    },


    generatePhotosHtml: function () {
        var self = this;
        this.photos.forEach(function (photo) {
            self.photosContainer.append('<div class="image"><a class="image-link" href="'+photo.getOriginalImage()+'"><img src="' + photo.getImageThumb() + '" alt="" /></a><p>"' + photo.title + '</p><p><a target="_blank" href="' + photo.getUserLink() + '">>> More</a></p></div>');
        });
    },

    generateHtmlWrappers: function() {
        this.galleryWrapper =$('<div id="gallery"></div>').appendTo(this.wrapper);
        this.photosContainer = $('<div class="images"></div>').appendTo(this.galleryWrapper);
        this.bigPhotoContainer = $('<div class="big-image"><div class="big-image-container"><img src="" alt="" /></div><p><a href="#">Go Back</a></p></div>').appendTo(this.galleryWrapper);
    },

    registerEvents: function() {
        var self = this;

        $('.image-link', this.photosContainer).on('click', function(e) {
            e.preventDefault();
            // todo попробовать переделать на массив с картинками
            var src = $(this).attr('href');

            if (src) {
                var img = $('.big-image img', self.wrapper);

                img.attr('src', src).hide();

                self.galleryWrapper.addClass('big-image');

                img.load(function(){
                    img.show();
                })
            }
        });


        $(this.bigPhotoContainer).on('click', function() {
            $(self.galleryWrapper).removeClass('big-image');
        });
    }
};





GalleryApp.Photo = function () {

};

GalleryApp.Photo.prototype = {
    getUserLink : function () {
        return 'http://www.flickr.com/photos/<user>/<photoid>'.replace('<user>', this.owner).replace('<photoid>', this.id);
    },

    getImageThumb: function() {
        return this.sizes[1].source;
    },

    getOriginalImage: function() {
        var bestImageSizeIndex = 8;
        for (var i = bestImageSizeIndex; i>=0, i--;) {
            if (this.sizes[i] != undefined) {
                return this.sizes[i].source;
            }
        }
    }
};


GalleryApp.FlickrApi = function () {

    this.methods = {
        recent: 'flickr.photos.getRecent',
        size: 'flickr.photos.getSizes'
    };


    this._apiCall = function (method, params) {
        var data = {};
        data.method = method;
        data.format = 'json';
        data.api_key = '4ef2fe2affcdd6e13218f5ddd0e2500d';

        $.extend(data, params);

        return $.ajax({
            url: 'https://api.flickr.com/services/rest/',
            dataType: 'jsonp',
            data: data,
            jsonp: 'jsoncallback'
        });
    }
};

GalleryApp.FlickrApi.prototype.getRecentPhotos = function () {

    var self = this;

    return this._apiCall(this.methods.recent, {per_page:10}).then(function(result) {
        var photos = result.photos.photo;
        var promise = $.when();

        $.each(photos, function(index, photo) {
            promise = promise.then(function () {
                return self._apiCall(self.methods.size, {photo_id:photo.id});
            }).then(function(r) {
                console.log('Get photo sizes: ');
                console.log(r);
                photo.sizes = r.sizes.size;
                console.log('Get Photo size.. print photo object. Size count is - ');
                console.log(photo);
            });
        });

        return promise.then(function() {
            return photos;
        });
    });
};

GalleryApp.CreatePhoto = function (flickrObject) {
    var basePhoto = new GalleryApp.Photo();
    return $.extend(basePhoto, flickrObject);
};