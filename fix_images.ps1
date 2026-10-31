# Fix incorrect flower images - download verified Unsplash direct links
$images = @{
    'sunflower_bouquet.jpg' = 'https://images.unsplash.com/photo-1500021804447-2ca2eaaaabeb?w=800&q=80'
    'tulip_bouquet.jpg'     = 'https://images.unsplash.com/photo-1490750967868-88df5691cc16?w=800&q=80'
    'lily_single.jpg'       = 'https://images.unsplash.com/photo-1587530093498-1d8cb8c61e4a?w=800&q=80'
    'lily_bouquet.jpg'      = 'https://images.unsplash.com/photo-1490750967868-88df5691cc16?w=800&q=80'
    'rose_single.jpg'       = 'https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=800&q=80'
    'sunflower_single.jpg'  = 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?w=800&q=80'
    'about_craft.jpg'       = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
}

foreach ($entry in $images.GetEnumerator()) {
    $dest = "assets\images\" + $entry.Key
    Write-Host "Downloading $($entry.Key)..."
    try {
        Invoke-WebRequest -Uri $entry.Value -OutFile $dest -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -TimeoutSec 30
        Write-Host "  OK: $($entry.Key)"
    } catch {
        Write-Host "  FAILED: $($entry.Key) - $($_.Exception.Message)"
    }
}
Write-Host "All done."
