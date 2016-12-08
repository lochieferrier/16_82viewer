var watch = require('node-watch');

watch('changelist.txt', function(filename) {
  console.log(filename, ' changed.');
});
