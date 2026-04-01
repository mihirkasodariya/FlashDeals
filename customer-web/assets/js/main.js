// Sticky Navbar Scroll Effect
const navbar = document.getElementById('main-nav');
// Throttled Scroll Listener for Navbar
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            scrollTimeout = null;
        }, 10);
    }
});

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.replace('fa-bars', 'fa-times');
        document.body.style.overflow = 'hidden'; // Lock scroll
    } else {
        icon.classList.replace('fa-times', 'fa-bars');
        document.body.style.overflow = ''; // Unlock scroll
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
                const icon = mobileToggle.querySelector('i');
                icon.classList.replace('fa-times', 'fa-bars');
                document.body.style.overflow = ''; // Unlock scroll
            }
            
            // Scroll to target (Native CSS smooth scroll will handle the behavior)
            targetElement.scrollIntoView({
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
            revealObserver.unobserve(entry.target); // Optimize: stop after reveal
        }
    });
}, {
    threshold: 0.1, // Trigger earlier
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Simple FAQ toggle
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        let answer = q.nextElementSibling;
        if (answer.style.display === 'none' || !answer.style.display) {
            answer.style.display = 'block';
            q.querySelector('i').classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            answer.style.display = 'none';
            q.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    });

    // set initial hidden answers
    if (q.nextElementSibling) {
        q.nextElementSibling.style.display = 'none';
    }
});
