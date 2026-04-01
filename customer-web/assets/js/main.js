// Sticky Navbar Scroll Effect
const navbar = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
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

// Auto-close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.replace('fa-times', 'fa-bars');
        document.body.style.overflow = ''; // Unlock scroll
    });
});

// Scroll Reveal Animation (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.15 // Trigger when 15% of element is visible
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
