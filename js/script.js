// This is an updated version of the script with all alert functionality removed
document.addEventListener('DOMContentLoaded', function() {
    // FORCE ENABLE SCROLLING - Fix for scrolling issue
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Force apply button colors
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        if (button.classList.contains('meme-btn')) {
            button.style.backgroundColor = '#0fd5ff';
        } else {
            button.style.backgroundColor = '#1dc410';
        }
        
        // Prevent any click handlers from being added by explicitly setting onclick to null
        button.onclick = null;
    });
    
    // Get the video element
    const video = document.getElementById('background-video');
    if (!video) return; // Safety check
    
    // Try to force the video to play
    video.play().then(() => {
        console.log('Video playback started successfully');
    }).catch(error => {
        console.error('Auto-play was prevented:', error);
        
        // Add a click event to the body to start playing
        document.body.addEventListener('click', () => {
            video.play().catch(e => console.error('Could not play video after click:', e));
        });
    });
    
    // Ensure scrolling is enabled even if style sheets are loaded later
    window.setTimeout(function() {
        // Re-apply all important styles
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        // Re-apply button colors after a delay to override any potentially late-loading styles
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(button => {
            if (button.classList.contains('meme-btn')) {
                button.style.backgroundColor = '#0fd5ff';
            } else {
                button.style.backgroundColor = '#1dc410';
            }
            
            // Prevent any click handlers again
            button.onclick = null;
        });
    }, 1000);
});