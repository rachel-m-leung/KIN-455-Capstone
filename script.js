const navToggle = document.getElementById('nav-toggle');
const sideNav = document.getElementById('side-nav');

// Toggle navigation on hover/click
navToggle.addEventListener('mouseenter', () => {
    sideNav.style.left = '0';
});

// Also allow clicking to open for touch devices
navToggle.addEventListener('click', () => {
    if (sideNav.style.left === '0px') {
        sideNav.style.left = '-260px';
    } else {
        sideNav.style.left = '0';
    }
});

sideNav.addEventListener('mouseleave', () => {
    sideNav.style.left = '-260px';
});

// Close nav when a link is clicked
const navLinks = sideNav.querySelectorAll('a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        sideNav.style.left = '-260px';
    });
});

// Intersection Observer for scroll animations (Standard Sections)
const cards = document.querySelectorAll('.info-card');

const observerOptions = {
    threshold: 0.2, // Trigger when 20% of the element is visible
    rootMargin: "0px 0px -50px 0px" // Offset slightly so it triggers before bottom
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

cards.forEach(card => observer.observe(card));


// --- Scroll Sequence Logic ---
const scrollSection = document.querySelector('.scroll-sequence');
const scrollCards = document.querySelectorAll('.scroll-card');

function handleScrollSequence() {
    if (!scrollSection) return;

    const sectionRect = scrollSection.getBoundingClientRect();
    const sectionHeight = scrollSection.offsetHeight;
    const windowHeight = window.innerHeight;

    // Calculate how far we've scrolled INTO the section
    // When sectionRect.top is 0, we are at the start.
    // When sectionRect.bottom is windowHeight, we are at the end.
    
    // We want a progress from 0 to 1 based on the scroll travel within the sticky area
    // The "scrollable distance" is (sectionHeight - windowHeight)
    // The "scrolled amount" is (-sectionRect.top)
    
    let progress = -sectionRect.top / (sectionHeight - windowHeight);

    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    // Show cards based on progress stages
    // We have 4 cards, so we can split the progress into segments
    // Card 1: 0.1 - 0.25
    // Card 2: 0.3 - 0.45
    // Card 3: 0.5 - 0.65
    // Card 4: 0.7 - 0.85
    
    // Thresholds for each card
    const thresholds = [0.1, 0.3, 0.5, 0.7];

    scrollCards.forEach((card, index) => {
        if (progress > thresholds[index]) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Attach scroll listener
window.addEventListener('scroll', handleScrollSequence);
// Initial check
handleScrollSequence();

// --- Expanding Card Logic ---
const allExpandableCards = document.querySelectorAll('.info-card, .scroll-card');

allExpandableCards.forEach(card => {
    card.addEventListener('click', () => {
        // Toggle the expanded class on the clicked card
        card.classList.toggle('expanded');
    });
});
