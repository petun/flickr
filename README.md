# Flickr Challenge
## Installation
Clone repository 
```sh
git clone https://github.com/petun/flickr.git
```
Next run **index.html** from your browser (not locally)

## Demo Page
You can watch demo [here](http://dv.petun.ru/flickr/)


## Module usage sample
```javascript
GalleryApp.Loggger.debug = true; //turn on/off debug

var gallery = new GalleryApp.Gallery('.gallery-container', {per_page: 10});
gallery.init();
```

### Parameters
**per_page**: number of photos to load

### Source code
Module code can be found in file [js/app.js](https://github.com/petun/flickr/blob/master/js/app.js)