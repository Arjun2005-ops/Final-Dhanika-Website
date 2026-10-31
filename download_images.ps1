$images = @{
    'rose_single.jpg' = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    'sunflower_single.jpg' = 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80'
    'sunflower_bouquet.jpg' = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'
    'tulip_single.jpg' = 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80'
    'tulip_bouquet.jpg' = 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80'
    'lily_single.jpg' = 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=800&q=80'
    'lily_bouquet.jpg' = 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80'
    'about_craft.jpg' = 'https://images.unsplash.com/photo-1582794543462-0d7922e50cf5?auto=format&fit=crop&w=800&q=80'
    'custom_order_banner.jpg' = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80'
}

foreach ($entry in $images.GetEnumerator()) {
    $dest = "assets\images\" + $entry.Key
    Write-Host "Downloading $($entry.Key)..."
    Invoke-WebRequest -Uri $entry.Value -OutFile $dest -UserAgent "Mozilla/5.0"
}
Write-Host "All downloads completed successfully."
