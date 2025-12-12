$pagesPath = "d:\intern\Institute management system\frontend\src\pages"

# Define UI style replacements
# We need to be careful with regex here.
$replacements = @{
    # Fix transparent backgrounds to solid white/gray
    'bg-white/10 backdrop-blur-md' = 'bg-white shadow-sm'
    'bg-white/5 backdrop-blur-md'  = 'bg-white shadow-sm'
    'bg-white/5'                   = 'bg-white'
    'bg-white/30'                  = 'bg-white'
    'bg-white/10'                  = 'bg-white'
    
    # Fix transparent borders to solid gray
    'border-white/20'              = 'border-gray-200'
    'border-white/10'              = 'border-gray-200'
    'border-white/40'              = 'border-gray-300'
    
    # Fix input fields
    'border-gray-300/50'           = 'border-gray-300'
    'bg-gray-300/30'               = 'bg-gray-100'
    
    # Fix specific common combinations found in AdminSchedules (Alerts/Buttons)
    'bg-red-500/20'                = 'bg-red-50'
    'hover:bg-red-500/40'          = 'hover:bg-red-100'
    'text-red-300'                 = 'text-red-600'
    
    'bg-green-500/20'              = 'bg-green-50'
    'border-green-500/50'          = 'border-green-200'
    'text-green-200'               = 'text-green-800'
    
    'border-red-500/50'            = 'border-red-200'
    'text-red-200'                 = 'text-red-800'
}

$files = Get-ChildItem -Path $pagesPath -Include *.js, *.jsx -Recurse

Write-Host "Found $($files.Count) pages to process for UI fixes"

$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content.Replace($key, $replacements[$key])
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Modified styles in: $($file.Name)"
        $filesModified++
    }
}

Write-Host "Total files modified: $filesModified"
