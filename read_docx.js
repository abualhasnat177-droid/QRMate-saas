const fs = require('fs');
const AdmZip = require('adm-zip');

function readDocx(filePath) {
    try {
        const zip = new AdmZip(filePath);
        const xmlEntry = zip.getEntries().find(entry => entry.entryName === 'word/document.xml');
        if (xmlEntry) {
            const xmlContent = xmlEntry.getData().toString('utf8');
            let text = xmlContent.replace(/<w:p[^>]*>/g, '\n');
            text = text.replace(/<[^>]+>/g, '');
            console.log(text.trim());
        } else {
            console.log("Could not find word/document.xml");
        }
    } catch (e) {
        console.error(e);
    }
}

if (process.argv[2]) {
    readDocx(process.argv[2]);
} else {
    console.log("Please provide a file path.");
}
