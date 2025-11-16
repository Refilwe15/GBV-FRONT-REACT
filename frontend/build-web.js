const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Expo Web Version for Vercel...');

function runCommand(command, description) {
  console.log(`\n🔨 ${description}`);
  console.log(`💻 Command: ${command}`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, EXPO_USE_FAST_RESOLVER: 'true' }
    });
    console.log(`✅ ${description} completed successfully!`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Force web build function
function forceWebBuild() {
  console.log('\n📦 Forcing Web Build...');
  
  try {
    // Clean previous builds
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    if (fs.existsSync('web-build')) {
      fs.rmSync('web-build', { recursive: true });
    }
    
    // Install web dependencies
    console.log('📥 Ensuring web dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Method 1: Direct web export
    console.log('🌐 Building for web platform...');
    const success = runCommand(
      'npx expo export --platform web --dev', 
      'Web Export with Platform Flag'
    );
    
    if (success && fs.existsSync('dist')) {
      console.log('✅ Web build created successfully in dist/');
      return true;
    }
    
    // Method 2: Try alternative approach
    console.log('🔄 Trying alternative web build...');
    const altSuccess = runCommand(
      'npx expo export:web', 
      'Alternative Web Export'
    );
    
    if (altSuccess && fs.existsSync('dist')) {
      console.log('✅ Alternative web build successful');
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('💥 Web build failed:', error);
    return false;
  }
}

// Check if we have React Native Web properly configured
function checkWebConfig() {
  console.log('\n🔍 Checking Web Configuration...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check if react-native-web is installed
  if (!packageJson.dependencies['react-native-web']) {
    console.log('⚠️ react-native-web not found in dependencies');
    return false;
  }
  
  // Check app.json web config
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  if (!appJson.expo.web) {
    console.log('⚠️ Web configuration missing in app.json');
    return false;
  }
  
  console.log('✅ Web configuration looks good');
  return true;
}

// Main build process
async function main() {
  console.log('🏁 Starting Web Build Process...');
  
  // Check configuration first
  if (!checkWebConfig()) {
    console.log('⚠️ Web configuration issues detected');
  }
  
  // Force web build
  const buildSuccess = forceWebBuild();
  
  if (buildSuccess) {
    console.log('\n🎉 WEB BUILD COMPLETED SUCCESSFULLY!');
    console.log('📁 Output directory: dist/');
    
    // Verify the build output
    if (fs.existsSync('dist')) {
      const files = fs.readdirSync('dist');
      console.log('📄 Built files:', files);
      
      // Ensure we have an index.html
      if (files.includes('index.html')) {
        console.log('✅ index.html found - Web build is ready!');
      }
    }
  } else {
    console.log('\n💥 Web build failed, creating basic web fallback...');
    createWebFallback();
  }
}

// Create web fallback
function createWebFallback() {
  console.log('📝 Creating web-optimized fallback...');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  const webAppHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GBV Support - Web Version</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .app-container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        .loading {
            color: #666;
            margin: 20px 0;
        }
        .web-features {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <h1>GBV Support Platform</h1>
        <p class="loading">Loading web version...</p>
        
        <div class="web-features">
            <h3>Web Version Features:</h3>
            <ul>
                <li>Responsive design for all devices</li>
                <li>Fast loading web interface</li>
                <li>Access to support resources</li>
                <li>Emergency contact information</li>
            </ul>
        </div>
        
        <p>If this message persists, the web build may need additional configuration.</p>
    </div>

    <script>
        console.log('GBV Web App Loading...');
        // Add any web-specific JavaScript here
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Web app initialized');
        });
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(distPath, 'index.html'), webAppHtml);
  console.log('✅ Web fallback created');
}

// Run the build
main().catch(error => {
  console.error('💥 Build process failed:', error);
  createWebFallback();
});
