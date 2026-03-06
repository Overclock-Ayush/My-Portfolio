/* ========= NAVBAR UNDERLINE & ACTIVE STATES ========= */
const nav = document.getElementById('navbar');
const links = nav.querySelectorAll('.nav-link');
const underline = nav.querySelector('.nav-underline');
const sections = document.querySelectorAll('section[id]');

// Better underline positioning calculation
function moveUnderline(el) {
  if (!el || !nav || !underline) return;
  
  // Wait for next frame to ensure DOM is ready
  requestAnimationFrame(() => {
    const navRect = nav.getBoundingClientRect();
    const linkRect = el.getBoundingClientRect();
    
    // Calculate position relative to navbar container
    const leftOffset = linkRect.left - navRect.left;
    
    // Set underline properties
    underline.style.width = `${linkRect.width}px`;
    underline.style.left = `${leftOffset}px`;
    underline.style.transform = `translateX(0)`;
    underline.style.opacity = '1';
  });
}

// Initialize underline on page load
function initializeUnderline() {
  const activeLink = nav.querySelector('.nav-link.active') || nav.querySelector('.nav-link');
  if (activeLink) {
    // Set initial position without animation
    underline.style.transition = 'none';
    moveUnderline(activeLink);
    
    // Re-enable animation after positioning
    setTimeout(() => {
      underline.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 50);
  }
}

// Click handling
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    
    // Update active states
    links.forEach(l => l.classList.remove('active'));
    e.target.classList.add('active');
    moveUnderline(e.target);
    
    // Smooth scroll to section
    const target = e.target.getAttribute('href');
    if (target && target.startsWith('#')) {
      const section = document.querySelector(target);
      if (section) {
        const navHeight = nav.offsetHeight;
        const sectionTop = section.offsetTop - navHeight - 20;
        
        window.scrollTo({
          top: Math.max(0, sectionTop),
          behavior: 'smooth'
        });
      }
    }
  });
});

/* ========= FIXED SCROLL SYNCHRONIZATION ========= */
let isScrolling = false;
let scrollTimeout;

function updateActiveSection() {
  if (isScrolling) return;
  
  let current = 'home';
  const navHeight = nav.offsetHeight;
  
  // Check each section to see which one we're currently viewing
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    
    // If section is visible in viewport (accounting for navbar)
    // A section is considered active if its top is above the fold and its bottom is below the fold
    if (sectionTop <= navHeight + 150 && sectionTop + sectionHeight > navHeight + 150) {
      current = section.getAttribute('id');
    }
  });
  
  // Special case: if we're at the very top, always show home
  if (window.scrollY < 50) {
    current = 'home';
  }
  
  // Special case: if we're near the bottom and contact section exists, show contact
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const contactSection = document.querySelector('#contact');
  
  if (contactSection && window.scrollY + windowHeight >= documentHeight - 100) {
    current = 'contact';
  }
  
  // Update active states
  const targetLink = nav.querySelector(`a[href="#${current}"]`);
  if (targetLink && !targetLink.classList.contains('active')) {
    links.forEach(link => link.classList.remove('active'));
    targetLink.classList.add('active');
    moveUnderline(targetLink);
  }
}

// Optimized scroll handler
window.addEventListener('scroll', () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    updateActiveSection();
  }, 16); // ~60fps
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  
  resizeTimeout = setTimeout(() => {
    const activeLink = nav.querySelector('.nav-link.active');
    if (activeLink) {
      moveUnderline(activeLink);
    }
  }, 100);
});

/* ========= THEME TOGGLE ========= */
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme') || 'light';

// Set initial theme
root.setAttribute('data-theme', saved);
toggle.textContent = saved === 'light' ? '🌙' : '☀️';

toggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  toggle.textContent = next === 'light' ? '🌙' : '☀️';
});

/* ========= INTERSECTION OBSERVER FOR REVEALS ========= */
const revealTargets = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

/* ========= INITIALIZATION ========= */
document.addEventListener('DOMContentLoaded', () => {
  // Wait for fonts to load
  setTimeout(() => {
    initializeUnderline();
    updateActiveSection();
  }, 100);
});

// Re-initialize after fonts load
document.fonts.ready.then(() => {
  setTimeout(() => {
    initializeUnderline();
  }, 100);
});
