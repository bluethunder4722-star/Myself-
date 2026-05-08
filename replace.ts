import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src/components/ui');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/@\/lib\/utils/g, '@/src/lib/utils');
    content = content.replace(/@\/components\/ui/g, '@/src/components/ui');
    content = content.replace(/React\.HTMLAttributes/g, 'import("react").HTMLAttributes');
    content = content.replace(/React\./g, 'import("react").');
    fs.writeFileSync(filePath, content);
  }
}
