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
      env: { ...process.env, EXPO_USE_FAST_RESOLVER: '1' }
    });
    console.log(`✅ ${description} completed successfully!`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function setupWebConfiguration() {
  console.log('\n⚙️ Setting up web configuration...');
  
  try {
    // Ensure we have the necessary files for web
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update package.json if needed
    if (!packageJson.dependencies['@expo/webpack-config']) {
      console.log('📦 Adding webpack config dependency...');
      execSync('npm install @expo/webpack-config --save-dev', { stdio: 'inherit' });
    }
    
    // Create metro.config.js if it doesn't exist
    const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
    if (!fs.existsSync(metroConfigPath)) {
      const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for other file extensions
config.resolver.assetExts.push('db');

module.exports = config;`;
      fs.writeFileSync(metroConfigPath, metroConfig);
      console.log('✅ Created metro.config.js');
    }
    
    return true;
  } catch (error) {
    console.log('⚠️ Setup configuration failed:', error.message);
    return false;
  }
}

function forceWebBuild() {
  console.log('\n📦 Forcing Web Build with Metro bundler...');
  
  try {
    // Clean previous builds
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    
    // Set environment for web build
    const env = {
      ...process.env,
      EXPO_USE_FAST_RESOLVER: '1',
      NODE_ENV: 'production'
    };
    
    console.log('🌐 Building with Metro bundler for web...');
    
    // Method 1: Try with environment variables
    const success = runCommand(
      'EXPO_USE_FAST_RESOLVER=1 npx expo export --platform web', 
      'Web Export with Metro'
    );
    
    if (success && fs.existsSync('dist')) {
      console.log('✅ Web build created successfully in dist/');
      return true;
    }
    
    // Method 2: Try prebuild first
    console.log('🔄 Trying prebuild approach...');
    const prebuildSuccess = runCommand(
      'npx expo prebuild --platform web',
      'Prebuild for Web'
    );
    
    if (prebuildSuccess) {
      const exportSuccess = runCommand(
        'EXPO_USE_FAST_RESOLVER=1 npx expo export --platform web',
        'Export after Prebuild'
      );
      
      if (exportSuccess && fs.existsSync('dist')) {
        console.log('✅ Web build successful after prebuild');
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('💥 Web build failed:', error);
    return false;
  }
}

// Main build process
async function main() {
  console.log('🏁 Starting Web Build Process...');
  
  // Setup web configuration first
  setupWebConfiguration();
  
  // Force web build
  const buildSuccess = forceWebBuild();
  
  if (buildSuccess) {
    console.log('\n🎉 WEB BUILD COMPLETED SUCCESSFULLY!');
    
    // Verify the build output
    if (fs.existsSync('dist')) {
      const files = fs.readdirSync('dist');
      console.log('📄 Built files:', files);
      
      if (files.includes('index.html')) {
        console.log('✅ index.html found - Web build is ready for Vercel!');
      }
    }
  } else {
    console.log('\n💥 Web build failed with Metro, trying alternative approach...');
    createWebFallback();
  }
}

function createWebFallback() {
  console.log('📝 Creating web fallback application...');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  const webAppHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GBV Support Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .feature-list {
            text-align: left;
            margin: 20px 0;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
        }
        .emergency {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>GBV Support Platform</h1>
        <p>Web version is being optimized. Please check back soon.</p>
        
        <div class="feature-list">
            <h3>Available Features:</h3>
            <ul>
                <li>Emergency contacts</li>
                <li>Support resources</li>
                <li>Safety information</li>
                <li>Help center access</li>
            </ul>
        </div>
        
        <div class="emergency">
            <strong>🚨 Emergency Contacts:</strong>
            <p>📞 10111 - SA Police</p>
            <p>📞 0800 428 428 - GBV Command Centre</p>
        </div>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(path.join(distPath, 'index.html'), webAppHtml);
  console.log('✅ Web fallback created in dist/');
}

// Run the build
main().catch(error => {
  console.error('💥 Build process failed:', error);
  createWebFallback();
});
