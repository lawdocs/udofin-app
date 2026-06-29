/* eslint-env node */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = findFiles(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Regex to match the shadow properties
  const regex = /shadowColor:\s*('#000'|colors\.primary|"[^"]+"|'[^']+'),\s*shadowOffset:\s*\{\s*width:\s*(\d+),\s*height:\s*(\d+)\s*\},\s*shadowOpacity:\s*([\d\.]+),\s*shadowRadius:\s*([\d\.]+),/g;

  content = content.replace(regex, (match, color, width, height, opacity, radius) => {
    let opacityValue = parseFloat(opacity);
    let hexOpacity = Math.round(opacityValue * 255).toString(16).padStart(2, '0').toUpperCase();
    
    let boxShadowStr = '';
    if (color === "'#000'") {
      boxShadowStr = `'${width}px ${height}px ${radius}px rgba(0, 0, 0, ${opacityValue})',`;
    } else if (color === 'colors.primary') {
      boxShadowStr = `\`${width}px ${height}px ${radius}px \${colors.primary}${hexOpacity}\`,`;
    } else {
      // For other colors
      boxShadowStr = `\`${width}px ${height}px ${radius}px \${${color.replace(/['"]/g, '')}}${hexOpacity}\`,`;
    }
    return `boxShadow: ${boxShadowStr}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
console.log('Done');
