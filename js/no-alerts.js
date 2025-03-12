// This is a complete replacement script with no alerts or popups
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
    });
    
    // Get the video element
    const video = document.getElementById('background-video');
    if (!video) return;
    
    // Try to force the video to play
    video.play().catch(() => {
        // Add a click event to the body to start playing
        document.body.addEventListener('click', () => {
            video.play().catch(() => {});
        });
    });
});