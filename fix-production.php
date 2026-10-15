<?php
// Force production mode
echo "<h1>🔧 Fixing Production Mode</h1>";

// 1. Update .env
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $env = file_get_contents($envPath);
    
    // Force production settings
    $env = preg_replace('/APP_ENV=.*/', 'APP_ENV=production', $env);
    $env = preg_replace('/APP_DEBUG=.*/', 'APP_DEBUG=false', $env);
    $env = preg_replace('/APP_URL=.*/', 'APP_URL=https://ilocosnortemustsee.xyz', $env);
    
    file_put_contents($envPath, $env);
    echo "✅ Updated .env to production<br>";
}

// 2. Update app.blade.php to force production
$bladePath = __DIR__ . '/resources/views/app.blade.php';
if (file_exists($bladePath)) {
    $content = file_get_contents($bladePath);
    
    // Ensure Vite directives remain in the Blade layout for production asset resolution
    if (!str_contains($content, '@viteReactRefresh')) {
        $content = str_replace('@inertiaHead', "@viteReactRefresh\n        @vite(['resources/js/app.tsx'])\n        @inertiaHead", $content);
    }
    
    file_put_contents($bladePath, $content);
    echo "✅ Updated app.blade.php<br>";
}

// 3. Clear cache
echo "Clearing cache...<br>";
exec('php artisan cache:clear 2>&1', $output);
echo implode('<br>', $output) . "<br>";

exec('php artisan config:clear 2>&1', $output);
echo implode('<br>', $output) . "<br>";

exec('php artisan view:clear 2>&1', $output);
echo implode('<br>', $output) . "<br>";

// 4. Optimize
echo "Optimizing...<br>";
exec('php artisan config:cache 2>&1', $output);
echo implode('<br>', $output) . "<br>";

exec('php artisan route:cache 2>&1', $output);
echo implode('<br>', $output) . "<br>";

exec('php artisan view:cache 2>&1', $output);
echo implode('<br>', $output) . "<br>";

echo "<br>🎉 Production mode fixed!";
echo "<br><br><a href='/' style='display:inline-block;padding:10px 30px;background:#c9a84c;color:white;text-decoration:none;border-radius:5px;'>Go to Homepage</a>";
?>