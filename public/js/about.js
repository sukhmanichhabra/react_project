document.addEventListener('DOMContentLoaded', function() {
    // Video player functionality
    const playButton = document.querySelector('.play-button');
    const videoContainer = document.querySelector('.video-container');
    const iframe = videoContainer?.querySelector('iframe');
    
    if (playButton && iframe) {
        playButton.addEventListener('click', function() {
            // Get current src
            let videoSrc = iframe.src;
            
            // Add autoplay parameter if not already present
            if (videoSrc.indexOf('autoplay=1') === -1) {
                videoSrc += (videoSrc.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
            }
            
            // Update iframe src to autoplay
            iframe.src = videoSrc;
            
            // Hide play button
            playButton.style.opacity = '0';
            setTimeout(() => {
                playButton.style.display = 'none';
            }, 300);
        });
    }

    initFeedbackSlider();
    initAgentsSlider();
    initLogoSlider();
});

function initFeedbackSlider() {
    const container = document.querySelector('.feedback-container');
    const originalCards = document.querySelectorAll('.feedback-card');
    const dots = document.querySelectorAll('.dot');
    
    if (!container || originalCards.length === 0) return;
    
    // Clear existing cloned cards first
    container.innerHTML = '';
    
    // Create a complete set of original cards
    const originalSet = Array.from(originalCards).slice(0, 3); // Assuming we have 3 unique cards
    
    // Clone cards multiple times for smooth infinite looping
    // Add original cards first
    originalSet.forEach(card => {
        container.appendChild(card.cloneNode(true));
    });
    
    // Then add clones for smooth looping
    originalSet.forEach(card => {
        container.appendChild(card.cloneNode(true));
    });
    
    // Add more clones to ensure we have enough cards for continuous scrolling
    originalSet.forEach(card => {
        container.appendChild(card.cloneNode(true));
    });
    
    const allCards = container.querySelectorAll('.feedback-card');
    const cardWidth = allCards[0].offsetWidth + 24; // Card width plus gap
    const visibleCards = 3; // Number of cards visible at once
    const totalOriginalCards = originalSet.length;
    
    let currentIndex = 0;
    let isTransitioning = false;
    
    // Apply initial positioning
    container.style.transform = `translateX(0px)`;
    
    function updateDots() {
        const activeDotIndex = Math.floor((currentIndex % totalOriginalCards) / 1); // Update dot for each card
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    }
    
    function slideToIndex(index, withAnimation = true) {
        if (isTransitioning) return;
        
        currentIndex = index;
        isTransitioning = true;
        
        // Apply or remove transition based on animation flag
        container.style.transition = withAnimation ? 'transform 0.7s ease' : 'none';
        container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        
        updateDots();
        
        // Reset transition state after animation completes
        setTimeout(() => {
            isTransitioning = false;
            
            // If we've scrolled past the first set, jump back to the equivalent position in the original set
            if (currentIndex >= totalOriginalCards * 2) {
                container.style.transition = 'none';
                currentIndex = currentIndex % totalOriginalCards;
                container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            }
        }, withAnimation ? 700 : 50);
    }
    
    function nextSlide() {
        slideToIndex(currentIndex + 1);
    }
    
    // Auto slide every 4 seconds
    let slideInterval = setInterval(nextSlide, 4000);
    
    // Click handlers for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            slideToIndex(index);
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 4000);
        });
    });
    
    // Pause on hover
    container.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    container.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, 4000);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newCardWidth = allCards[0].offsetWidth + 24;
        container.style.transition = 'none';
        container.style.transform = `translateX(-${currentIndex * newCardWidth}px)`;
    });
}

function initAgentsSlider() {
    const container = document.querySelector('.agents-container');
    const originalCards = container.querySelectorAll('.agent-card');
    
    if (!container || originalCards.length === 0) return;
    
    // Store the original cards
    const originalSet = Array.from(originalCards);
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add the original cards
    originalSet.forEach(card => {
        container.appendChild(card.cloneNode(true));
    });
    
    // Add clones for smooth infinite scrolling (add the set twice more)
    originalSet.forEach(card => {
        container.appendChild(card.cloneNode(true));
    });
    
    originalSet.forEach(card => {
        container.appendChild(card.cloneNode(true));
    });
    
    const totalCards = originalSet.length;
    let currentPosition = 0;
    let isAnimating = false;
    
    // Calculate visible cards based on window width
    function getVisibleCards() {
        const windowWidth = window.innerWidth;
        if (windowWidth >= 1200) return 4;
        if (windowWidth >= 768) return 3;
        if (windowWidth >= 480) return 2;
        return 1;
    }
    
    function updateSliderPosition(animate = true) {
        const visibleCards = getVisibleCards();
        const cardWidth = 100 / visibleCards;
        
        container.style.transition = animate ? 'transform 0.8s ease-in-out' : 'none';
        container.style.transform = `translateX(-${currentPosition * cardWidth}%)`;
        
        if (animate) {
            isAnimating = true;
            setTimeout(() => {
                isAnimating = false;
                
                // Reset position if we've gone through all original cards
                if (currentPosition >= totalCards) {
                    container.style.transition = 'none';
                    currentPosition = 0;
                    container.style.transform = `translateX(0)`;
                }
            }, 800);
        }
    }
    
    function slideNext() {
        if (isAnimating) return;
        
        currentPosition++;
        updateSliderPosition(true);
    }
    
    // Auto slide every 3 seconds with a smoother transition
    let slideInterval = setInterval(slideNext, 3000);
    
    // Pause on hover
    container.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    container.addEventListener('mouseleave', () => {
        slideInterval = setInterval(slideNext, 3000);
    });
    
    // Handle window resize - recalculate and update positions
    window.addEventListener('resize', () => {
        updateSliderPosition(false);
    });
    
    // Initial positioning
    updateSliderPosition(false);
}

function initLogoSlider() {
    const container = document.querySelector('.logo-container');
    if (!container) return;
    
    // Clone the entire set of logos three times for smoother transition
    const logoSet = container.innerHTML;
    container.innerHTML = logoSet + logoSet + logoSet;
}