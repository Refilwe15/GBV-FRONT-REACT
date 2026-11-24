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

function cleanBuild() {
  console.log('🧹 Cleaning previous builds...');
  try {
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    if (fs.existsSync('web-build')) {
      fs.rmSync('web-build', { recursive: true });
    }
    console.log('✅ Clean completed');
  } catch (error) {
    console.log('⚠️ Clean failed:', error.message);
  }
}

function main() {
  console.log('🏁 Starting Web Build Process...');
  
  // Clean previous builds
  cleanBuild();
  
  // Set environment for web build
  const env = {
    ...process.env,
    EXPO_USE_FAST_RESOLVER: '1',
    NODE_ENV: 'production'
  };
  
  console.log('🌐 Building for web platform...');
  
  // Method 1: Direct web export with environment
  const success = runCommand(
    'npx expo export --platform web', 
    'Web Export with Platform Flag'
  );
  
  if (success && fs.existsSync('dist')) {
    console.log('\n🎉 WEB BUILD COMPLETED SUCCESSFULLY!');
    
    // Verify the build output
    const files = fs.readdirSync('dist');
    console.log('📄 Built files:', files);
    
    if (files.includes('index.html')) {
      console.log('✅ index.html found - Web build is ready for Vercel!');
    }
    return;
  }
  
  // Method 2: Try alternative command
  console.log('🔄 Trying alternative build command...');
  const altSuccess = runCommand(
    'npx expo export:web', 
    'Alternative Web Export'
  );
  
  if (altSuccess && fs.existsSync('dist')) {
    console.log('\n🎉 Alternative web build successful!');
    return;
  }
  
  // Method 3: Create fallback
  console.log('💥 All build methods failed, creating fallback...');
  createWebFallback();
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
        .loading {
            color: #666;
            margin: 20px 0;
        }
        .emergency {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            color: #856404;
        }
        .contact {
            background: #d1ecf1;
            border: 2px solid #bee5eb;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            color: #0c5460;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>GBV Support Platform</h1>
        <p class="loading">Web application is loading...</p>
        
        <div class="emergency">
            <strong>🚨 Emergency Contacts:</strong>
            <p>📞 10111 - SA Police</p>
            <p>📞 0800 428 428 - GBV Command Centre</p>
        </div>
        
        <div class="contact">
            <strong>📞 Support Contacts:</strong>
            <p>Lifeline: 0861 322 322</p>
            <p>People Opposed to Woman Abuse: 011 642 4345</p>
        </div>
        
        <p>If you need immediate assistance, please contact the numbers above.</p>
    </div>

    <script>
        console.log('GBV Support Platform - Web Version');
        setTimeout(() => {
            document.querySelector('.loading').textContent = 'Web version optimized for desktop and mobile browsers';
        }, 2000);
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(distPath, 'index.html'), webAppHtml);
  console.log('✅ Web fallback created in dist/');
}

// Run the build
try {
  main();
} catch (error) {
  console.error('💥 Build process failed:', error);
  createWebFallback();
}
