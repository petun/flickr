var GalleryApp = GalleryApp || {};



/**
 * @param  element jQuery Selector or string
 * @constructor
 * @param params
 */
GalleryApp.Gallery = function (element, params) {

    var defaults = {per_page: 20, debug: true};

    this.wrapper = typeof element == 'string' ? $(element) : element;
    this.photos = [];
    this.api = new GalleryApp.FlickrApi();

    this.params = $.extend({}, defaults, params);

    GalleryApp.Loggger.debug = this.params.debug;

    this.galleryWrapper = null;
    this.photosContainer = null;
    this.bigPhotoContainer = null;
};


GalleryApp.Gallery.prototype = {

    init:  function() {
        var self = this;

        this.generateHtmlWrappers();

        this.showLoader();

        $.when(this.api.getRecentPhotos(this.params.per_page)).then(function(flickrObjects){

            self.hideLoader();

            GalleryApp.Loggger.log('Get All Flickr Objects');
            GalleryApp.Loggger.log(flickrObjects);

            if (Array.isArray(flickrObjects)) {

                $.each(flickrObjects, function(index, photo) {
                    self.addPhoto(new GalleryApp.Photo(photo) );
                });

                self.generatePhotosHtml();
                self.registerEvents();

            }
        });
    },


    addPhoto: function (photo) {
        this.photos.push(photo);
    },


    generatePhotosHtml: function () {

        GalleryApp.Loggger.log('generatePhotosHtml');

        var self = this;
        this.photos.forEach(function (photo) {
            var template = '<div class="image">' +
                '<a class="image-link" href="{{link}}"><img src="{{thumb}}" alt="" /></a>' +
                '<p>{{title}}</p><p><a target="_blank" href="{{userLink}}">>> More</a></p>' +
                '</div>';

            self.photosContainer.append(
                GalleryApp.TemplateEngine.process(template,
                    {
                        link: photo.getOriginalImage(),
                        thumb: photo.getImageThumb(),
                        userLink: photo.getUserLink(),
                        title: photo.getTitle()
                    })
            );
        });
    },

    generateHtmlWrappers: function() {
        GalleryApp.Loggger.log('generateHtmlWrappers');

        this.galleryWrapper =$('<div id="gallery"></div>').appendTo(this.wrapper);
        this.photosContainer = $('<div class="images"></div>').appendTo(this.galleryWrapper);
        this.bigPhotoContainer = $('<div class="big-image"><div class="big-image-container"><img src="" alt="" /></div><p><a href="#">Go Back</a></p></div>').appendTo(this.galleryWrapper);
    },

    showLoader: function() {
        this.photosContainer.addClass('-loading');
    },

    hideLoader: function() {
        this.photosContainer.removeClass('-loading');
    },

    showBigImage: function() {
        this.galleryWrapper.addClass('big-image');
    },

    hideBigImage: function() {
        this.galleryWrapper.removeClass('big-image');
    },

    registerEvents: function() {
        var self = this;

        $('.image-link', this.photosContainer).on('click', function(e) {
            e.preventDefault();

            var src = $(this).attr('href');

            if (src) {
                var img = $('.big-image img', self.wrapper);

                img.attr('src', src).hide();

                self.showBigImage();

                img.load(function(){
                    img.show();
                })
            }
        });


        $(this.bigPhotoContainer).on('click', function() {
            self.hideBigImage();
        });
    }
};



GalleryApp.Photo = function (flickrObject) {
    this.props = flickrObject;
};

GalleryApp.Photo.prototype = {

    getTitle: function() {
        return this.props.title;
    },

    getUserLink : function () {
        var template = 'http://www.flickr.com/photos/{{owner}}/{{id}}';
        return GalleryApp.TemplateEngine.process(template, {
            owner: this.props.owner,
            id: this.props.id
        });
    },

    getImageThumb: function() {
        return this.props.sizes[1].source;
    },

    getOriginalImage: function() {
        var bestImageSizeIndex = 8;
        for (var i = bestImageSizeIndex; i>=0, i--;) {
            if (this.props.sizes[i] != undefined && this.props.sizes[i].source != undefined) {
                return this.props.sizes[i].source;
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

GalleryApp.FlickrApi.prototype.getRecentPhotos = function (imagesCount) {

    var self = this;

    return this._apiCall(this.methods.recent, {per_page:imagesCount}).then(function(result) {
        var photos = result.photos.photo;
        var promise = $.when();

        $.each(photos, function(index, photo) {
            promise = promise.then(function () {
                return self._apiCall(self.methods.size, {photo_id:photo.id});
            }).then(function(r) {
                GalleryApp.Loggger.log('Get photo sizes: ');
                GalleryApp.Loggger.log(r);
                photo.sizes = r.sizes.size;
                GalleryApp.Loggger.log('Get Photo size.. print photo object. Size count is - ');
                GalleryApp.Loggger.log(photo);
            });
        });

        return promise.then(function() {
            return photos;
        });
    });
};



GalleryApp.TemplateEngine  = {

    process : function(template, data) {
        var reg = /{{([\w]+)}}/gi;

        return template.replace(reg, function (match, param) {
            return data[param] || '';
        });
    }

};


GalleryApp.Loggger = {
    debug: true,
    log:  function(str) {
        if (this.debug && window.console) {
            console.log(str);
        }
    }
};


