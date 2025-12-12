$componentsPath = "d:\intern\Institute management system\frontend\src\components"

# Define comprehensive replacements for all light text colors
$replacements = @{
    # Light gray text to dark gray
    'text-gray-100' = 'text-gray-900'
    'text-gray-200' = 'text-gray-900'
    'text-gray-300' = 'text-gray-700'
    'text-gray-400' = 'text-gray-700'
    'text-gray-500' = 'text-gray-800'
    
    # Teal text
    'text-teal-100' = 'text-teal-700'
    'text-teal-200' = 'text-teal-700'
    'text-teal-300' = 'text-teal-600'
    'text-teal-400' = 'text-teal-600'
    'text-teal-500' = 'text-teal-700'
    
    # Slate text
    'text-slate-100' = 'text-slate-900'
    'text-slate-200' = 'text-slate-900'
    'text-slate-300' = 'text-slate-700'
    'text-slate-400' = 'text-slate-700'
}

# Get all JS and JSX files in components directory (excluding ui folder which has proper styling)
$files = Get-ChildItem -Path $componentsPath -Include *.js,*.jsx -Recurse | Where-Object { $_.FullName -notlike "*\ui\*" }

Write-Host "Found $($files.Count) component files to process"
Write-Host "Replacing light text colors with dark colors..."
Write-Host ""

$filesModified = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($key in $replacements.Keys) {
        $pattern = $key
        $replacement = $replacements[$key]
        $matches = ([regex]::Matches($content, [regex]::Escape($pattern))).Count
        
        if ($matches -gt 0) {
            $content = $content -replace [regex]::Escape($pattern), $replacement
            $fileReplacements += $matches
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Modified: $($file.Name) - $fileReplacements replacements"
        $filesModified++
        $totalReplacements += $fileReplacements
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "Total component files modified: $filesModified"
Write-Host "Total replacements made: $totalReplacements"
Write-Host "========================================="
