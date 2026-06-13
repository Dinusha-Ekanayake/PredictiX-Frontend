const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                replaceInDir(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Handle the multiline case in FloatingChatbot
            const regex1 = /process\.env\.NEXT_PUBLIC_CHATBOT_API_URL\s*\|\|\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*["']http:\/\/(127\.0\.0\.1|localhost):\d+["']/gm;
            if (regex1.test(content)) {
                content = content.replace(regex1, '"/api/proxy"');
                modified = true;
            }

            // Handle the single line cases
            const regex2 = /process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*["']http:\/\/(127\.0\.0\.1|localhost):\d+["']/g;
            if (regex2.test(content)) {
                content = content.replace(regex2, '"/api/proxy"');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}
replaceInDir(path.join(__dirname, 'src'));
console.log("Replacement complete.");
