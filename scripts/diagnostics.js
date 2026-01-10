const fs = require('fs');
const os = require('os');

const diagnostic = {
    timestamp: new Date().toISOString(),
    os: os.platform(),
    nodeVersion: process.version,
    files: fs.readdirSync('.'),
};

console.log(JSON.stringify(diagnostic, null, 2));
