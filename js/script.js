document.addEventListener('DOMContentLoaded', function() {
    // FORCE ENABLE SCROLLING - Fix for scrolling issue
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Get the video element
    const video = document.getElementById('background-video');
    
    // Log video element for debugging
    console.log('Video element:', video);
    
    // Log when video metadata is loaded
    video.addEventListener('loadedmetadata', function() {
        console.log('Video metadata loaded:', {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
        });
    });
    
    // Log video errors
    video.addEventListener('error', function() {
        console.error('Video error:', video.error);
    });
    
    // Try to force the video to play
    video.play().then(() => {
        console.log('Video playback started successfully');
    }).catch(error => {
        console.error('Auto-play was prevented:', error);
        
        // Add a click event to the body to start playing
        document.body.addEventListener('click', () => {
            video.play().catch(e => console.error('Could not play video after click:', e));
        });
        
        // Add a visual indicator that user needs to click
        const content = document.querySelector('.content');
        const playPrompt = document.createElement('div');
        playPrompt.textContent = 'Click anywhere to play video';
        playPrompt.style.padding = '10px';
        playPrompt.style.background = 'rgba(0,0,0,0.5)';
        playPrompt.style.borderRadius = '5px';
        playPrompt.style.marginTop = '20px';
        content.appendChild(playPrompt);
    });
    
    // Add click event to the CTA button
    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', function() {
        alert('Welcome to Pepe!');
        // You can redirect to another page or perform other actions here
    });
    
    // Ensure scrolling is enabled even if style sheets are loaded later
    window.setTimeout(function() {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }, 1000);
});