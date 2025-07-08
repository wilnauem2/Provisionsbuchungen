const { execSync } = require('child_process')
const path = require('path')

try {
  console.log('Starting build process...')
  
  // Ensure we're in the correct directory
  process.chdir(path.join(__dirname, '..'))
  
  // Install dependencies
  console.log('Installing dependencies...')
  execSync('npm ci', { stdio: 'inherit' })
  
  // Build the project
  console.log('Building project...')
  execSync('npm run build', { stdio: 'inherit' })
  
  console.log('Build completed successfully!')
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}
