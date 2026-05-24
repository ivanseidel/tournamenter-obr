const fs = require('node:fs');

const writeFileSync = fs.writeFileSync;

fs.writeFileSync = function writeFileSyncCompat(file, data, ...args) {
  if (
    typeof file === 'string' &&
    file.endsWith('.map') &&
    data &&
    typeof data !== 'string' &&
    !Buffer.isBuffer(data) &&
    typeof data.toString === 'function'
  ) {
    return writeFileSync.call(this, file, data.toString(), ...args);
  }

  return writeFileSync.call(this, file, data, ...args);
};
