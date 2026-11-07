const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = (file) => fs.readFileSync(path.join(dir, file), 'utf8');

const head = read('head.html');
const css = ['style-1.css', 'style-2.css', 'style-3.css', 'style-4.css', 'style-5.css']
  .map(read)
  .join('\n');
const body = ['body-1.html', 'body-2.html'].map(read).join('\n');
const js = ['game-1.js', 'game-2.js', 'game-3.js', 'game-4.js', 'game-5.js']
  .map(read)
  .join('\n');

const html = `${head}<style>\n${css}\n</style>\n${body}\n<script>\n${js}\n</script>\n</body>\n</html>\n`;
const outPath = path.join(dir, '..', 'Word_City_Adventure.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Built ${outPath}`);
console.log(`Size: ${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(1)} KB`);
