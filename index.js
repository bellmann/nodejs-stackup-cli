"use strict";

var fs      = require('fs')
var storage = require('./storage');
var path    = require('path')
var program = require('commander');
var stackup = require('pcb-stackup');
var unzip   = require('unzip');

// A function to list all files in a path
const listFilesInPath = (dir, filelist) => {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = listFilesInPath(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
}

// A function to count the layers of a specific type
const countLayers = (layers, types) => {
  var count = 0;
  layers.forEach(layer => {
    if (types.indexOf(layer.type) > -1) {
      count++;
    }
  })

  return count;
}

const main = (filename, output) => {
  new Promise((resolve, reject) => {
    // Get the file and extract it -- use `storage` as it returns a stream
    // and it can handle both local as remote files (e.g. s3) in the future
    var file = storage.open(filename)
    file.pipe(
      unzip.Extract({path: output})
    ).on('close', () => {
      resolve()
    });
  })
  .then(() => {
    // Inspect the gerber files
    var gerbers = listFilesInPath(output);
    var layers = gerbers.map(path => {
      return { gerber: fs.createReadStream(path), filename: path }
    })

    return new Promise((resolve, reject) => {
      stackup(layers, (error, stackup) => {
        if (error) {
          reject(error);
        }

        // Board attributes
        var board_width = stackup.top.width;
        var board_length = stackup.top.height;

        // Convert to mm
        if (stackup.top.units == 'in') {
          board_width = board_width * 25.4;
          board_length = board_length * 25.4;
        }

        const board = {
          'board_width': board_width.toFixed(2),
          'board_length': board_length.toFixed(2),
          'board_layers': countLayers(stackup.layers, ['icu', 'bcu', 'tcu'])
        }

        console.dir(board);

        // Generate images
        storage.save('pcb-top.svg', stackup.top.svg);
        storage.save('pcb-bottom.svg', stackup.bottom.svg);

        // Create png thumbnails (or at least a small version)
        resolve();
      });
    });
  })
  .then(() => {
    // Upload files
    // Save entry in database
    console.log('All done.');
  })
  .catch(error => {
    console.error(error);
  })
}

program
  .arguments('<file>')
  .action(function(file) {
    var filename = file;
    var output   = `tmp/${filename}/`

    main(filename, output);
  }
).parse(process.argv);
