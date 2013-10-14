var _ = require('underscore')
  , cache = require('memory-cache')
  , pretty = require('prettysize')
  , async = require('async')
  , db = require('../database.js');

var directorySize = function(path, cb) {

  var exec = require('child_process').exec, child;

  child = exec('du -sk '+path,
      function (error, stdout, stderr) {

        var size = stdout.match(/([0-9]+)/);

        cb(error, size[0]*1024);
    }
  );
} 

var usedSize = function(paths, cb) {
  var key = 'size_' + new Buffer(paths.paths.join('-')).toString('hex'), cachedSize = cache.get(key);

  if(cachedSize)
    cb(pretty(cachedSize));
  else {
    async.map(paths.paths, directorySize, function(err, sizes){
        var size = _.reduce(sizes, function(memo, num){ return memo + num; }, 0);
        cache.put(key, size, 10000);
        cb(pretty(size));
    });
  } 
} 

module.exports.usedSize = usedSize;


var countDatas = function(p, cb) {
  var count = 0;

  if(!_.isArray(p))
    p = [p];

  _.each(p, function(e, i) {
    count += e.albums.length + e.movies.length + e.others.length;
  });

  cb(count);
}

module.exports.fetchDatas = function(params) {

  var lastUpdate = cache.get('lastUpdate');

  if(lastUpdate === null)
    cache.put('lastUpdate', params.lastUpdate);

  db.files.byUser(params.uid, cache.get('lastUpdate'), function(err, files) {

     countDatas(files.paths, function(count) {
       if(count !== 0) {
          io.sockets.socket(params.sid).emit('files', JSON.stringify(files));
          cache.put('lastUpdate', new Date());

          usedSize({paths : params.paths}, function(size) {
              io.sockets.socket(params.sid).emit('size', size);
          });
        }
      });
  });


}