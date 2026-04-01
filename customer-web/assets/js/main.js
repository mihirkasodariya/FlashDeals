// Sticky Navbar Scroll Effect
const navbar = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle (Modified for new .bar icon)
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('open'); // For bar animation if added later
    
    if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('open');
                document.body.style.overflow = '';
            }
            
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll Reveal Animation (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // revealObserver.unobserve(entry.target); // Keep observing for continuous scroll effect if desired
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Premium FAQ Accordion Toggle
document.querySelectorAll('.faq-card').forEach(card => {
    const question = card.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isOpen = card.classList.contains('faq-open');

        // Close ALL cards first (including current)
        document.querySelectorAll('.faq-card').forEach(c => {
            c.classList.remove('faq-open');
        });

        // Only re-open if it was NOT already open (acts as toggle)
        if (!isOpen) {
            card.classList.add('faq-open');
        }
    });
});

// Default open first FAQ on Mobile/Tablet load
window.addEventListener('load', () => {
    if (window.innerWidth <= 992) {
        const firstFaq = document.querySelector('.faq-card');
        if (firstFaq && !document.querySelector('.faq-card.faq-open')) {
            firstFaq.classList.add('faq-open');
        }
    }
});

// Smart OS App Store Button Visibility + Redirection
const androidLink = "https://play.google.com/store/apps/details?id=com.offerz.app";
const iosLink = "https://apps.apple.com/us/app/offerz/id123456789";

(function applyStoreButtonLogic() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    if (isAndroid || isIOS) {
        // On mobile: hide the wrong platform's button
        document.querySelectorAll('[data-store]').forEach(btn => {
            const store = btn.getAttribute('data-store');
            if (isAndroid && store === 'ios') {
                btn.style.display = 'none'; // Android → hide App Store
            } else if (isIOS && store === 'android') {
                btn.style.display = 'none'; // iOS → hide Google Play
            }
        });
    }

    // Click handler: redirect to the correct store
    document.querySelectorAll('.app-dl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isAndroid || isIOS) {
                e.preventDefault();
                window.location.href = isAndroid ? androidLink : iosLink;
            }
        });
    });
})();

// Shop by Category: Show More Toggle (Mobile/Tablet/Desktop)
document.getElementById('show-more-cats')?.addEventListener('click', function() {
    const grid = document.querySelector('.category-grid');
    const container = this.parentElement;
    
    if (grid && container) {
        // Clear transition delays for hidden items so they appear instantly
        const hiddenItems = grid.querySelectorAll('.category-card');
        hiddenItems.forEach(item => {
            // Only clear for items that were hidden (beyond 10 on mobile, 21 on desktop)
            item.style.transitionDelay = '0s';
        });

        grid.classList.add('show-all');
        container.classList.add('hidden'); // Hide the button after use
        
        // Refresh reveal animations for newly shown items
        if (typeof ScrollReveal !== 'undefined') {
            ScrollReveal().sync();
        }
    }
});
