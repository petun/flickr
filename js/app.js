var GalleryApp = GalleryApp || {};


/**
 * Main application class. Generate html, register all events, store images.
 * @constructor
 * @param  element jQuery Selector or string
 * @param params
 */
GalleryApp.Gallery = function (element, params) {

    this.params = {per_page: 20};

    this.wrapper = typeof element == 'string' ? $(element) : element;
    this.photos = [];
    this.api = new GalleryApp.FlickrApi();

    if (typeof (params) == 'object') {
        this.params = $.extend({}, this.params, params);
    }

    this.galleryWrapper = null;
    this.photosContainer = null;
    this.bigPhotoContainer = null;
};


GalleryApp.Gallery.prototype = {

    init: function () {
        var self = this;

        this.generateHtmlWrappers();

        this.showLoader();

        $.when(this.api.getRecentPhotos(this.params.per_page)).then(function (flickrObjects) {

            self.hideLoader();

            GalleryApp.Loggger.log('Get All Flickr Objects');
            GalleryApp.Loggger.log(flickrObjects);

            if (flickrObjects) {

                $.each(flickrObjects, function (index, photo) {
                    self.addPhoto(new GalleryApp.Photo(photo));
                });

                self.generatePhotosHtml();
                self.registerEvents();

            }
        }, function (jqXHR, textStatus, errorThrown) {
            this.showError('Failed to complete request. Try again later. <a href=".">Refresh then page</a>');
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

    showError: function (message) {
        var template = '<p class="error">{{message}}</p>';
        this.hideLoader();
        this.photosContainer.append(GalleryApp.TemplateEngine.process(template, {message: message}));
    },

    generateHtmlWrappers: function () {
        GalleryApp.Loggger.log('generateHtmlWrappers');

        this.galleryWrapper = $('<div id="gallery"></div>').appendTo(this.wrapper);
        this.photosContainer = $('<div class="images"></div>').appendTo(this.galleryWrapper);
        this.bigPhotoContainer = $('<div class="big-image"><div class="big-image-container"><img src="" alt="" /></div><p><a href="#">Go Back</a></p></div>').appendTo(this.galleryWrapper);
    },

    showLoader: function () {
        GalleryApp.Loggger.log('showLoader');
        this.photosContainer.addClass('-loading');
    },

    hideLoader: function () {
        GalleryApp.Loggger.log('hideLoader');
        this.photosContainer.removeClass('-loading');
    },

    showBigImage: function () {
        GalleryApp.Loggger.log('showBigImage');
        this.galleryWrapper.addClass('big-image');
    },

    hideBigImage: function () {
        GalleryApp.Loggger.log('hideBigImage');
        this.galleryWrapper.removeClass('big-image');
    },

    registerEvents: function () {
        var self = this;

        $(this.photosContainer).on('click', '.image-link', function (e) {
            e.preventDefault();

            var src = $(this).attr('href');

            if (src) {
                var img = $('.big-image img', self.wrapper);

                img.attr('src', src).hide();

                self.showBigImage();

                img.load(function () {
                    img.show();
                })
            }
        });


        $(this.bigPhotoContainer).on('click', function () {
            self.hideBigImage();
        });
    }
};


/**
 * Represents photo object. Store flickr object as property. Give access to params via getters.
 * @param flickrObject json, representing flick object with sizes
 * @constructor
 */
GalleryApp.Photo = function (flickrObject) {
    this.props = flickrObject;
};

GalleryApp.Photo.prototype = {

    getTitle: function () {
        return this.props.title;
    },

    getUserLink: function () {
        var template = 'http://www.flickr.com/photos/{{owner}}/{{id}}';
        return GalleryApp.TemplateEngine.process(template, {
            owner: this.props.owner,
            id: this.props.id
        });
    },

    getImageThumb: function () {
        return this.props.sizes[1].source;
    },

    getOriginalImage: function () {
        var bestImageSizeIndex = 8;
        for (var i = bestImageSizeIndex; i >= 0, i--;) {
            if (this.props.sizes[i] != undefined && this.props.sizes[i].source != undefined) {
                return this.props.sizes[i].source;
            }
        }
    }
};

/**
 * FlickApi use to gather information from flickr.
 * @constructor
 */
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

GalleryApp.FlickrApi.prototype = {

    /**
     * Get recent photos from flickr API and attach photos size
     * @param imagesCount
     * @returns {Deferred}
     */
    getRecentPhotos: function (imagesCount) {
        GalleryApp.Loggger.log('getRecentPhotos');

        var dfd = new $.Deferred();

        var self = this;

        this._apiCall(this.methods.recent, {per_page: imagesCount}).done(
            function (result) {

                var photos = result.photos.photo;

                var promises = [];
                $.map(photos, function (photo) {
                    promises.push(
                        self.attachPhotoSizes(photo)
                    );
                });


                $.when.apply($, promises).then(
                    function () {
                        GalleryApp.Loggger.log(arguments);
                        dfd.resolve(arguments);
                    },
                    function (r) {
                        GalleryApp.Loggger.log('failed request');
                        GalleryApp.Loggger.log(r);
                        dfd.fail(r);
                    }
                );
            }
        ).fail(function(jqXHR, textStatus, errorThrown) {
                dfd.fail(jqXHR, textStatus, errorThrown);
        });

        return dfd;
    },

    /**
     * Attach photo sizes to exist flickr photo object
     * @param object Flickr object
     * @returns {Deferred}
     */
    attachPhotoSizes: function (object) {
        var dfd = new $.Deferred();

        this._apiCall(this.methods.size, {photo_id: object.id}).then(function (result) {
            if (result.stat == "ok" && Array.isArray(result.sizes.size)) {
                object.sizes = result.sizes.size;
                dfd.resolve(object);
            } else {
                dfd.reject(result);
            }
        });

        return dfd;
    }
};


GalleryApp.TemplateEngine = {

    process: function (template, data) {
        var reg = /{{([\w]+)}}/gi;

        return template.replace(reg, function (match, param) {
            return data[param] || '';
        });
    }

};


GalleryApp.Loggger = {
    debug: true,
    log: function (str) {
        if (this.debug && window.console) {
            console.log(str);
        }
    }
};


