var express = require('express');
var request = require('request');
var router = express.Router();

// default endpoint
router.get('/', function(req, res) {
  res.render('index', { title: 'Youtube Downloader' });
// new endpoint
});

// utility function to convert bytes to human readable.
function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

var ytdl = require('youtube-dl');
var pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

router.post('/video', async function(req, res, next) {
    var url = req.body.url,
    formats = [];

    request.get(url, function (err, resp, body) {
        // check if it is valid url
        if(pattern.test(resp.request.uri.href)) {
            ytdl.getInfo(url, ['--youtube-skip-dash-manifest'], function(err, info) {
                if(err) return res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
        
                // push all video formats for download (skipping audio)
                info.formats.forEach(function(item) {
                    if(item.format_note !== 'DASH audio' && item.filesize) {
                        item.filesize = item.filesize ? bytesToSize(item.filesize): 'unknown';
                        formats.push(item);
                    }
                });
                res.render('listvideo', {meta: {id: info.id, formats: formats}});
            })
        }
     
        else {
          res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
        }
     
    })
})
module.exports = router;
