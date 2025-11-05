document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const toggleSubmenus = document.querySelectorAll('.toggle-submenu');

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });

    // Close mobile menu
    closeMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle submenu toggles
    toggleSubmenus.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const submenuId = this.getAttribute('data-submenu');
            const submenu = document.getElementById(`${submenuId}-submenu`);
            const icon = this.querySelector('.fa-chevron-down');

            // Toggle submenu
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            
            // Rotate icon
            icon.style.transform = submenu.style.display === 'block' ? 'rotate(180deg)' : 'rotate(0)';
        });
    });

    // Close menu when clicking a link
    const mobileLinks = document.querySelectorAll('.mobile-nav-link:not(.toggle-submenu)');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            // Reset all submenus
            document.querySelectorAll('.mobile-submenu').forEach(submenu => {
                submenu.style.display = 'none';
            });
            // Reset all icons
            document.querySelectorAll('.toggle-submenu .fa-chevron-down').forEach(icon => {
                icon.style.transform = 'rotate(0)';
            });
        }
    });
}); 