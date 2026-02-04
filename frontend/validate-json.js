
const fs = require('fs');
const path = require('path');

const files = [
    'c:\\Users\\bruno\\Desktop\\portyo\\frontend\\public\\i18n\\en\\dashboard.json',
    'c:\\Users\\bruno\\Desktop\\portyo\\frontend\\public\\i18n\\pt\\dashboard.json'
];

let log = '';

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        log += `✅ ${path.basename(file)} is valid JSON.\n`;
    } catch (error) {
        log += `❌ ${path.basename(file)} has an error:\n`;
        log += `${error.message}\n`;
    }
});

fs.writeFileSync('c:\\Users\\bruno\\Desktop\\portyo\\frontend\\validation_log.txt', log);
