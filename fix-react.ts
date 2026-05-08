import fs from 'fs';
import path from 'path';

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('React.') && !content.includes('import React')) {
        content = 'import React from "react";\n' + content;
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

traverse(path.join(process.cwd(), 'src'));
