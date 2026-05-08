const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost:8080')) {
                console.log(`Updating ${fullPath}`);
                // Replace hardcoded URL with environment variable
                content = content.replace(/['"`]http:\/\/localhost:8080(.*?)['"`]/g, (match, p1) => {
                    return `\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${p1}\``;
                });
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

replaceInDir('user-frontend/app');
