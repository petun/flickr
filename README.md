# Flickr Challenge
## Installation
Clone repository 
```sh
git clone https://github.com/petun/flickr.git
```
After clone just run **index.html** (not locally)

## Demo Page
You can watch demo [here](http://dv.petun.ru/flickr/)


## Usage sample
```javascript
GalleryApp.Loggger.debug = true; //turn on/off debug

var gallery = new GalleryApp.Gallery('.gallery-container', {per_page: 10});
gallery.init();
```