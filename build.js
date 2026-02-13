const fs = require('fs-extra');

// Copy shared files to both browser folders
fs.copySync('src/shared', 'src/chrome/shared');
fs.copySync('src/shared', 'src/firefox/shared');

// (Add more build steps as needed)