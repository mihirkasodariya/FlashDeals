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
        
        // Close all other FAQ cards first
        document.querySelectorAll('.faq-card').forEach(c => {
            if (c !== card) {
                c.classList.remove('faq-open');
            }
        });
        
        // Toggle the clicked card
        card.classList.toggle('faq-open');
    });
});

// Smart OS App Store Redirection
const androidLink = "https://play.google.com/store/apps/details?id=com.offerz.app";
const iosLink = "https://apps.apple.com/us/app/offerz/id123456789"; 

document.querySelectorAll('.app-dl-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isAndroid = /android/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
        
        if (isAndroid || isIOS) {
            e.preventDefault(); // Prevent standard target route on mobile
            window.location.href = isAndroid ? androidLink : iosLink;
        }
    });
});
