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
const scrollSection = document.getElementById('brain-scroll-section');
const scrollCards = scrollSection ? Array.from(scrollSection.querySelectorAll('.scroll-card')) : [];

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

    scrollCards.forEach(card => {
        const threshold = Number(card.dataset.threshold || 0);

        if (progress > threshold) {
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

// --- Shared reader for brain scroll cards ---
const scrollReaderPanel = document.getElementById('brain-scroll-reader');

if (scrollSection && scrollReaderPanel) {
    const scrollReaderTitle = scrollReaderPanel.querySelector('.scroll-reader-title');
    const scrollReaderBody = scrollReaderPanel.querySelector('.scroll-reader-body');
    const expandableScrollCards = scrollCards.filter(card => card.querySelector('.hidden-content'));
    let activeScrollCard = null;

    const closeScrollReader = () => {
        if (!activeScrollCard) return;

        activeScrollCard.classList.remove('expanded');
        activeScrollCard.setAttribute('aria-expanded', 'false');
        activeScrollCard = null;
        scrollReaderPanel.classList.remove('open');
    };

    const openScrollReader = card => {
        const title = card.querySelector('h3, h2')?.textContent?.trim() || '';
        const summary = card.querySelector(':scope > p')?.outerHTML || '';
        const details = card.querySelector('.hidden-content')?.innerHTML?.trim() || '';

        if (!details) return;

        if (activeScrollCard && activeScrollCard !== card) {
            activeScrollCard.classList.remove('expanded');
            activeScrollCard.setAttribute('aria-expanded', 'false');
        }

        scrollReaderTitle.textContent = title;
        scrollReaderBody.innerHTML = `${summary}${details}`;
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
        activeScrollCard = card;
        scrollReaderPanel.classList.add('open');
    };

    expandableScrollCards.forEach(card => {
        card.classList.add('has-details');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-controls', 'brain-scroll-reader');
        card.setAttribute('aria-expanded', 'false');

        const toggleReader = () => {
            if (activeScrollCard === card) {
                closeScrollReader();
                return;
            }

            openScrollReader(card);
        };

        card.addEventListener('click', toggleReader);
        card.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            toggleReader();
        });
    });
}

// --- Shared reader panels for grouped cards ---
const cardGroups = document.querySelectorAll('.card-container');

cardGroups.forEach((group, groupIndex) => {
    const groupedCards = Array.from(group.querySelectorAll(':scope > .info-card'));

    if (!groupedCards.length) return;

    group.dataset.cardCount = String(Math.min(groupedCards.length, 3));

    const readerPanel = document.createElement('div');
    const readerPanelId = `card-reader-panel-${groupIndex + 1}`;

    readerPanel.className = 'card-reader-panel';
    readerPanel.id = readerPanelId;
    readerPanel.innerHTML = `
        <div class="card-reader-panel-inner">
            <div class="card-reader-content">
                <span class="card-reader-label">Expanded reading</span>
                <h4 class="card-reader-title"></h4>
                <div class="card-reader-body"></div>
            </div>
        </div>
    `;

    group.appendChild(readerPanel);

    const readerTitle = readerPanel.querySelector('.card-reader-title');
    const readerBody = readerPanel.querySelector('.card-reader-body');
    let activeCard = null;

    const closeReader = () => {
        if (!activeCard) return;

        activeCard.classList.remove('expanded');
        activeCard.setAttribute('aria-expanded', 'false');
        activeCard = null;
        readerPanel.classList.remove('open');
    };

    const openReader = card => {
        const title = card.querySelector('h3')?.textContent?.trim() || '';
        const summary = card.querySelector(':scope > p')?.outerHTML || '';
        const details = card.querySelector('.hidden-content')?.innerHTML?.trim() || '';

        if (!details) return;

        if (activeCard && activeCard !== card) {
            activeCard.classList.remove('expanded');
            activeCard.setAttribute('aria-expanded', 'false');
        }

        readerTitle.textContent = title;
        readerBody.innerHTML = `${summary}${details}`;
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
        activeCard = card;
        readerPanel.classList.add('open');
    };

    groupedCards.forEach(card => {
        const hiddenContent = card.querySelector('.hidden-content')?.textContent?.trim();

        if (!hiddenContent) return;

        card.classList.add('shared-reader-card');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-controls', readerPanelId);
        card.setAttribute('aria-expanded', 'false');

        if (!card.querySelector('.card-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'card-indicator';
            indicator.textContent = 'Expand';
            indicator.setAttribute('aria-hidden', 'true');
            card.appendChild(indicator);
        }

        const toggleReader = () => {
            if (activeCard === card) {
                closeReader();
                return;
            }

            openReader(card);
        };

        card.addEventListener('click', toggleReader);
        card.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            toggleReader();
        });
    });
});

// --- Standalone expanding cards ---
const standaloneExpandableCards = document.querySelectorAll('.info-card:not(.shared-reader-card)');

standaloneExpandableCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('expanded');
    });
});
