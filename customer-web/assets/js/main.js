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
