var express = require('express')
var app = express()
var path = require('path');
var watch = require('node-watch');

watch('changelist.txt', function(filename) {
  console.log(filename, ' changed.');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/sketch_params.csv'));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
