const { execSync } = require('child_process')

try {
  console.log('Starting build process...')
  
  // Install dependencies
  console.log('Installing dependencies...')
  execSync('npm install', { stdio: 'inherit' })
  
  // Build the project
  console.log('Building project...')
  execSync('npm run build', { stdio: 'inherit' })
  
  console.log('Build completed successfully!')
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}
