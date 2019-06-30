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

function isBilibili(url) {
    return url.indexOf('bilibili') !== -1;
}

function isYoutube(url) {
    return url.indexOf('youtu') !== -1;
}

function getFormats(info) {
    var formats = [];
    info.formats.forEach(function(item) {
        if(item.format_note !== 'DASH audio' && item.filesize) {
            item.filesize = item.filesize ? bytesToSize(item.filesize) : 'unknown';
            item.http_headers = item.http_headers ? JSON.stringify(item.http_headers) : 'unknown';
            formats.push(item);
        }
    });
    return formats;
}

var ytdl = require('youtube-dl');
async function bilibiliHandler(req, res, next) {
    var url = req.body.url,
    formats = null; 

    ytdl.getInfo(url, ['--youtube-skip-dash-manifest'], function(err, info) {
        if(err) return res.render('listbilibilivideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
        formats = getFormats(info);

        res.render('listbilibilivideo', {meta: {id: info.id, formats: formats}});
    }) 
}

async function youtubeHandler(req, res, next) {
    var pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
    var url = req.body.url,
    formats = null;  

    request.get(url, function (err, resp, body) {
        // check if it is valid url
        if(pattern.test(resp.request.uri.href)) {
            ytdl.getInfo(url, ['--youtube-skip-dash-manifest'], function(err, info) {
                if(err) return res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
                formats = getFormats(info);
        
                res.render('listvideo', {meta: {id: info.id, formats: formats}});
            }) 
        }
     
        else {
          res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
        }
     
    })
}

async function otherHandler(req, res, next) {
    var url = req.body.url,
    formats = null; 

    ytdl.getInfo(url, ['--youtube-skip-dash-manifest'], function(err, info) {
        if(err) return res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
        formats = getFormats(info);

        res.render('listvideo', {meta: {id: info.id, formats: formats}});
    }) 
}

router.post('/video', async function(req, res, next) {
    var url = req.body.url;
    if (isBilibili(url)) {
        await bilibiliHandler(req, res, next);
    } else if (isYoutube(url)) {
        await youtubeHandler(req, res, next);
    } else {
        await otherHandler(req, res, next);
    }
})
module.exports = router;
