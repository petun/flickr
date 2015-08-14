var GalleryApp = GalleryApp || {};


GalleryApp.Gallery = function (element) {
    this.wrapper = typeof element == 'string' ? $(element) : element;
    this.photos = [];
};

GalleryApp.Gallery.prototype = {
    init:  function(params) {
        var api = new GalleryApp.FlickrApi();

        var self = this;

        $.when(api.getRecentPhotos()).then(function(flickrObjects){
            console.log(flickrObjects);

            if (flickrObjects) {
                $.each(flickrObjects, function(index, photo) {
                    self.addPhoto(GalleryApp.CreatePhoto(photo));
                });

                if (params.onSuccess) {
                    self.generateHtml();
                    self.registerEvents();
                    params.onSuccess();
                }

            } else {
                if (params.onError) {
                    params.onError();
                }
            }
        });
    },

    addPhoto: function (photo) {
        this.photos.push(photo);
    },

    generateHtml: function () {
        var self = this;

        var galleryWrapper = self.wrapper.append('<div id="gallery"></div>'); //todo переделать
        var photoHolder = $('#gallery').append('<div class="images"></div>');
        var bigPhoto = $('#gallery').append('<div class="big-image"><img src="" alt="" /><p><a href="#">Go Back</a></p></div>');

        this.photos.forEach(function (photo) {
            $('#gallery .images').append('<div class="image"><a class="image-link" href="'+photo.getOriginalImage()+'"><img src="' + photo.getImageThumb() + '" alt="" /></a><p>"' + photo.title + '</p><p><a target="_blank" href="' + photo.getUserLink() + '">>> More</a></p></div>');
        });

        self.wrapper.append('');
    },

    registerEvents: function() {
        var self = this;
        $('.image-link', self.wrapper).on('click', function(e) {
            e.preventDefault();
            $('.hover-image img', self.wrapper).attr('src', '');
            var src = $(this).attr('href');
            if (src) {
                $('.big-image img', self.wrapper).attr('src', src);

                $('.big-image img', self.wrapper).load(function () {
                    $('#gallery', self.wrapper).addClass('big-image');
                });
            }
        });


        $('.big-image a, .big-image img', self.wrapper).on('click', function() {
            $('#gallery', self.wrapper).removeClass('big-image');
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
        return this.sizes[7].source;
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
                photo.sizes = r.sizes.size;
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