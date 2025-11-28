document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved user preference, if any, on load of the website
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            toggleBtn.textContent = '☀️ Light Mode';
        }
    }

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        let theme = 'light';
        if (body.classList.contains('dark-mode')) {
            theme = 'dark-mode';
            toggleBtn.textContent = '☀️ Light Mode';
        } else {
            toggleBtn.textContent = '🌙 Dark Mode';
        }
        localStorage.setItem('theme', theme);
    });
});
