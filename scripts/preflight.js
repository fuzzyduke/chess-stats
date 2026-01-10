const fs = require('fs');
const http = require('http');

const checks = [
    {
        name: 'Node Version',
        check: () => {
            const version = process.version;
            const major = parseInt(version.substring(1).split('.')[0], 10);
            return major >= 14;
        },
        message: 'Node.js version must be >= 14'
    },
    {
        name: 'index.html exists',
        check: () => fs.existsSync('index.html'),
        message: 'index.html is missing'
    }
];

let failed = false;
console.log('🚀 Running preflight checks...');

checks.forEach(({ name, check, message }) => {
    try {
        if (check()) {
            console.log(`✅ ${name}`);
        } else {
            console.error(`❌ ${name}: ${message}`);
            failed = true;
        }
    } catch (e) {
        console.error(`❌ ${name}: Error running check - ${e.message}`);
        failed = true;
    }
});

if (failed) {
    console.error('\n💥 Preflight checks failed!');
    process.exit(1);
} else {
    console.log('\n✨ All checks passed!');
}
