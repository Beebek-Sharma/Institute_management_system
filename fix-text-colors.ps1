$pagesPath = "d:\intern\Institute management system\frontend\src\pages"

# Define replacements for common text-white patterns
$replacements = @{
    # Headings
    'className="text-4xl font-bold text-white' = 'className="text-4xl font-bold text-gray-900'
    'className="text-3xl font-bold text-white' = 'className="text-3xl font-bold text-gray-900'
    'className="text-2xl font-bold text-white' = 'className="text-2xl font-bold text-gray-900'
    'className="text-xl font-bold text-white' = 'className="text-xl font-bold text-gray-900'
    'className="text-lg font-bold text-white' = 'className="text-lg font-bold text-gray-900'
    'className="text-lg font-semibold text-white' = 'className="text-lg font-semibold text-gray-900'
    'className="font-semibold text-white' = 'className="font-semibold text-gray-900'
    'className="font-bold text-white' = 'className="font-bold text-gray-900'
    
    # Regular text
    'className="text-white' = 'className="text-gray-900'
    'text-white mb-' = 'text-gray-900 mb-'
    'text-white text-' = 'text-gray-900 text-'
    
    # Specific patterns
    'className="text-sm text-white' = 'className="text-sm text-gray-700'
    'className="text-xs text-white' = 'className="text-xs text-gray-700'
}

# Get all JS and JSX files in pages directory
$files = Get-ChildItem -Path $pagesPath -Include *.js,*.jsx -Recurse

Write-Host "Found $($files.Count) files to process"

$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Modified: $($file.Name)"
        $filesModified++
    }
}

Write-Host "`nTotal files modified: $filesModified"
