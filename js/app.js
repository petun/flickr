var GalleryApp = GalleryApp || {};


GalleryApp.Gallery = function () {
    this.photos = [];


};

GalleryApp.Gallery.prototype = {
    init: function() {

    }
};

GalleryApp.Gallery.prototype.addPhoto = function (photo) {
    this.photos.push(photo);
};

GalleryApp.Gallery.prototype.generateHtml = function () {
    console.log('generate HTML');
    var table = $('#gallery');

    this.photos.forEach(function (photo) {
        table.append('<div class="image"><img src="' + photo.getImageThumb() + '" alt="" /><p>"' + photo.title + '</p><p><a target="_blank" href="' + photo.getUserLink() + '">>> More</a></p></div>');
    });
};

GalleryApp.Gallery.prototype.getRecentPhotos = function(params) {
    var api = new GalleryApp.FlickrApi();

    var self = this;

    $.when(api.getRecentPhotos()).then(function(flickrObjects){
        console.log(flickrObjects);

        if (flickrObjects) {
            $.each(flickrObjects, function(index, photo) {
                self.addPhoto(GalleryApp.CreatePhoto(photo));
            });

            if (params.onSuccess) {
                params.onSuccess();
            }

        } else {
            if (params.onError) {
                params.onError();
            }
        }
    });


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
        return this.sizes[5].source;
    }
};


GalleryApp.FlickrApi = function () {

    this.methods = {
        recent: 'flickr.photos.getRecent', //https://www.flickr.com/services/api/explore/flickr.photos.getRecent
        size: 'flickr.photos.getSizes', //
        info: 'flickr.photos.getInfo' //https://www.flickr.com/services/api/explore/flickr.photos.getInfo
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

    return this._apiCall(this.methods.recent, {per_page:2}).then(function(result) {
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

GalleryApp.FlickrApi.prototype.getPhotoInfo = function () {

};


GalleryApp.CreatePhoto = function (flickrObject) {
    var basePhoto = new GalleryApp.Photo();
    return $.extend(basePhoto, flickrObject);
};