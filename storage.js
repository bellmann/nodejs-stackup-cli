/*
 * storage.js
 *
 * storage.js manages different kinds of storage. The Storage class expects a
 * settings.storage object. The settings object always contains the 'type'
 * attribute. This is used to define the backend (e.g. LocalFileStorage or S3).
 *
 * Example:
 * new Storage({'type': 'LocalFileStorage'})
 */

var fs       = require('fs');
var settings = require('./settings');

/*
 * Storage
 *
 * storage object parameter:
 * {
 *   'type': 'LocalFileStorage',
 *   etc.
 * }
 */
class Storage {
  constructor(storage) {
    try {
      this.storage = eval(`new ${storage.type}(storage)`);
    } catch (error) {
      throw(new Error(`Storage class ${storage.type} does not exist`));
    }
  }

  open(file) {
    return this.storage.open(file);
  }

  save(file, content) {
    return this.storage.save(file, content);
  }

  exists(file) {
    return this.storage.exists(file);
  }

  delete(file) {
    return this.storage.delete(file);
  }
}

/*
 * LocalFileStorage
 *
 * config object parameter:
 * {
 *   'location': '/tmp'
 * }
 */
class LocalFileStorage {
  constructor(config) {
    this.location = config.location;
  }

  open(file) {
    if (typeof file == 'undefined') {
      throw(new Error('No file specified.'));
    }

    const fileLocation = `${this.location}/${file}`;
    if (this.exists(fileLocation)) {
      return fs.createReadStream(fileLocation);
    }

    throw `Unable to open ${fileLocation}.`
  }

  exists(file) {
    return fs.existsSync(file);
  }

  save(file, content) {
    if (typeof file == 'undefined') {
      throw(new Error('No file specified.'));
    }

    const fileLocation = `${this.location}/${file}`;
    fs.writeFileSync(fileLocation, content);
  }

  delete(file) {
    fs.unlink(file, error => {
      if (error) {
        throw error;
      }
    })
  }
}

module.exports = new Storage(settings.storage)
