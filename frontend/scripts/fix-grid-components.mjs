import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceDir = path.join(__dirname, '..', 'src')

function fixGridComponents(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Replace Grid prop usage
  const gridPropsRegex = /(<Grid\s+)([\s\S]*?)(>)/g
  const updatedContent = content.replace(gridPropsRegex, (match, p1, p2, p3) => {
    // Prepare the props object
    const props = {}

    // Check existing props
    const propEntries = p2.trim().split(/\s+/)
    propEntries.forEach(entry => {
      const [key, value] = entry.split('=')
      props[key] = value ? value.replace(/^["']|["']$/g, '') : true
    })

    // Ensure correct type and component
    if (!props.component) props.component = 'div'

    // Build updated props string
    const updatedPropsStr = Object.entries(props)
      .map(([key, value]) => {
        // Special handling for item and container to ensure correct typing
        if (['item', 'container'].includes(key)) {
          return `${key}={${value}}`
        }
        return `${key}="${value}"`
      })
      .join(' ')

    return `<Grid ${updatedPropsStr}${p3}`
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