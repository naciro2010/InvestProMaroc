const fs = require('fs')
const path = require('path')

const sourceDir = path.join(__dirname, '..', 'src')

function fixGridComponents(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Replace Grid with explicit item prop
  const gridRegex = /(<Grid\s+)(?!item={true})([\s\S]*?)(>)/g
  const updatedContent = content.replace(gridRegex, (match, p1, p2, p3) => {
    // Check if it already has item prop
    if (p2.includes('item=')) return match

    // If it doesn't have item prop, add it
    return `${p1}item={true} ${p2}${p3}`
  })

  fs.writeFileSync(filePath, updatedContent)
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      traverseDirectory(fullPath)
    } else if (file.endsWith('.tsx') && file !== 'index.tsx') {
      try {
        fixGridComponents(fullPath)
        console.log(`Fixed Grid components in ${fullPath}`)
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error)
      }
    }
  })
}

traverseDirectory(sourceDir)
console.log('Grid component fix script completed.')