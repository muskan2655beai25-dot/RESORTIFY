document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ICON POP ANIMATION ---
    const iconCircle = document.querySelector('.icon-circle');
    if (iconCircle) {
        iconCircle.animate([
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1.2)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fill: 'forwards'
        });
    }

    // --- 2. WAVE ANIMATION FOR "THANK YOU!" ---
    const spans = document.querySelectorAll('.animated-text span');
    spans.forEach((span, index) => {
        // Create the wave effect using JS math for delays
        span.animate([
            { transform: 'translateY(0)', color: '#1a1a1a' },
            { transform: 'translateY(-20px)', color: '#b2905a' },
            { transform: 'translateY(0)', color: '#1a1a1a' }
        ], {
            duration: 2000,
            iterations: Infinity,
            easing: 'ease-in-out',
            delay: index * 100 // JS creates the staggering
        });
    });

    // --- 3. TYPING EFFECT FOR SUB-TEXT ---
    const subText = document.querySelector('.sub-text');
    if (subText) {
        const message = "Your feedback helps us make your next stay even more magical.";
        subText.textContent = ""; // Clear existing text
        subText.style.opacity = "1"; // Make container visible
        
        let i = 0;
        function typeMessage() {
            if (i < message.length) {
                subText.textContent += message.charAt(i);
                i++;
                setTimeout(typeMessage, 40); // Typing speed
            } else {
                // After typing finishes, reveal the button
                revealButton();
            }
        }
        // Start typing after the Icon and Header start their dance
        setTimeout(typeMessage, 1000);
    }

    // --- 4. BUTTON FADE-IN ---
    function revealButton() {
        const btn = document.querySelector('.btn-home');
        if (btn) {
            btn.animate([
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 800,
                fill: 'forwards',
                easing: 'ease-out'
            });
        }
    }
});
document.addEventListener('mousemove', (e) => {
    const particle = document.createElement('div');
    Object.assign(particle.style, {
        position: 'fixed',
        left: e.clientX + 'px',
        top: e.clientY + 'px',
        width: '4px',
        height: '4px',
        background: '#b2905a',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '9999'
    });
    document.body.appendChild(particle);

    particle.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 50}px, 50px) scale(0)`, opacity: 0 }
    ], { duration: 1000, easing: 'ease-out' }).onfinish = () => particle.remove();
});
setTimeout(() => {
    const reward = document.createElement('div');
    Object.assign(reward.style, {
        marginTop: '20px',
        fontSize: '12px',
        color: '#b2905a',
        letterSpacing: '2px',
        opacity: '0',
        fontWeight: 'bold'
    });
    reward.innerText = "LOYALTY CODE: ROYAL2026";
    document.querySelector('.content-box').appendChild(reward);

    reward.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: 'forwards' });
}, 4000);
const homeBtn = document.querySelector('.btn-home');
homeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const destination = homeBtn.getAttribute('href');
    
    document.body.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], { duration: 800, fill: 'forwards' }).onfinish = () => {
        window.location.href = destination;
    };
});

/**
 * ============================================================
 *  RESORTIFY — site-nav.js  (Include on EVERY page)
 *
 *  PURPOSE: Links all pages together seamlessly.
 *
 *  ADD THIS to every HTML file just before </body>:
 *    <script src="site-nav.js"></script>
 *
 *  FEATURES:
 *  1. Page Transition     — elegant fade-out → fade-in between pages
 *  2. Active Nav Link     — highlights the current page in navbar
 *  3. Breadcrumb          — shows current page path below navbar
 *  4. "Book a Stay" btn   — always routes to offers.html
 *  5. Mobile Hamburger    — proper toggle for all pages
 *  6. Scroll-hide navbar  — auto-hides on scroll down, shows on up
 *  7. Toast on arrival    — subtle welcome message on first visit
 * ============================================================
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     1. PAGE TRANSITION — luxury fade between pages
  ────────────────────────────────────────────────────────── */
  const PageTransition = (() => {

    function init() {
      // Inject the overlay element
      const overlay = document.createElement('div');
      overlay.id = 'page-transition-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0;
        background: #fff;
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.35s ease;
      `;
      document.body.appendChild(overlay);

      // Fade in on arrival (from white → transparent)
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });

      // Intercept all internal link clicks
      document.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        // Only handle internal .html links (not # anchors, not external)
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
        if (link.target === '_blank') return;

        e.preventDefault();
        // Fade to white, then navigate
        overlay.style.opacity = '1';
        setTimeout(() => {
          window.location.href = href;
        }, 350);
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     2. ACTIVE NAV LINK — highlights current page
  ────────────────────────────────────────────────────────── */
  const ActiveNav = (() => {

    function init() {
      const current = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-links a, .nav-links li > a').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === current || href.includes(current.replace('.html', ''))) {
          link.style.color = '#b2905a';
          link.style.fontWeight = '700';
          link.style.borderBottom = '2px solid #b2905a';
          link.style.paddingBottom = '2px';
        }
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     3. "BOOK A STAY" BUTTON — always routes correctly
  ────────────────────────────────────────────────────────── */
  const BookBtn = (() => {

    function init() {
      // Fix the broken <button class="book-btn" <a href="offers.html"> in index.html
      document.querySelectorAll('.book-btn, .book-now, [class*="book-stay"]').forEach(btn => {
        if (btn.tagName === 'BUTTON') {
          btn.style.cursor = 'pointer';
          btn.addEventListener('click', () => {
            window.location.href = 'offers.html';
          });
        }
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     4. MOBILE HAMBURGER — consistent across all pages
  ────────────────────────────────────────────────────────── */
  const MobileMenu = (() => {

    function init() {
      const hamburger = document.getElementById('hamburger')
                     || document.querySelector('.hamburger');
      const navLinks  = document.querySelector('.nav-links');
      if (!hamburger || !navLinks) return;

      // Inject mobile nav styles once
      if (!document.getElementById('mobile-nav-style')) {
        const style = document.createElement('style');
        style.id = 'mobile-nav-style';
        style.textContent = `
          @media (max-width: 900px) {
            .nav-links {
              display: none;
              flex-direction: column !important;
              position: fixed !important;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(255,255,255,0.98) !important;
              padding: 100px 40px 40px !important;
              z-index: 9998 !important;
              box-shadow: none !important;
              overflow-y: auto;
              backdrop-filter: blur(8px);
            }
            .nav-links.mobile-open {
              display: flex !important;
              animation: mobileNavIn 0.4s cubic-bezier(0.25,1,0.5,1);
            }
            .nav-links li {
              border-bottom: 1px solid #f0f0f0;
              padding: 18px 0;
            }
            .nav-links li a {
              font-size: 18px !important;
              letter-spacing: 2px !important;
            }
            @keyframes mobileNavIn {
              from { opacity: 0; transform: translateY(-20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            /* Hamburger → X animation */
            .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
            .hamburger.open span:nth-child(2) { opacity: 0; }
            .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }
            .hamburger span { transition: transform 0.3s ease, opacity 0.3s ease; display: block; }
          }
        `;
        document.head.appendChild(style);
      }

      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
        hamburger.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (!e.target.closest('.nav-links') && !e.target.closest('.hamburger, #hamburger')) {
          navLinks.classList.remove('mobile-open');
          hamburger.classList.remove('open');
          document.body.style.overflow = '';
        }
      });

      // Close on ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          navLinks.classList.remove('mobile-open');
          hamburger.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     5. SCROLL-HIDE NAVBAR — any page navbar
  ────────────────────────────────────────────────────────── */
  const ScrollNav = (() => {

    function init() {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;

      let lastY = 0;

      // Inject scrolled state style
      if (!document.getElementById('scroll-nav-style')) {
        const style = document.createElement('style');
        style.id = 'scroll-nav-style';
        style.textContent = `
          .navbar {
            transition: transform 0.4s ease, background 0.3s ease, box-shadow 0.3s ease;
          }
          .navbar.nav-hidden {
            transform: translateY(-100%);
          }
          .navbar.nav-scrolled {
            background: rgba(255,255,255,0.98) !important;
            box-shadow: 0 4px 30px rgba(0,0,0,0.07) !important;
          }
        `;
        document.head.appendChild(style);
      }

      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('nav-scrolled', y > 60);
        navbar.classList.toggle('nav-hidden', y > lastY && y > 200);
        lastY = y;
      }, { passive: true });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     6. FIRST-VISIT TOAST — subtle welcome on first page load
  ────────────────────────────────────────────────────────── */
  const WelcomeToast = (() => {

    function init() {
      // Only show once per session
      if (sessionStorage.getItem('resortify_welcomed')) return;
      sessionStorage.setItem('resortify_welcomed', '1');

      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; bottom: 28px; left: 28px;
        background: #1a1a1a; color: #fff;
        padding: 14px 22px;
        border-left: 3px solid #b2905a;
        font-size: 11px; letter-spacing: 1px;
        font-family: 'Inter', sans-serif;
        z-index: 99999;
        opacity: 0; transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
        max-width: 280px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      `;
      toast.textContent = '✦ Welcome to Resortify. Explore luxury reimagined.';
      document.body.appendChild(toast);

      setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 1200);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
      }, 5000);
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     7. FIX KNOWN HTML BUGS across pages
        - bill.html stray "q2" text
        - index.html broken <button> tag
  ────────────────────────────────────────────────────────── */
  const BugFixer = (() => {

    function init() {
      // Remove stray text nodes (e.g. "q2" in bill.html)
      document.querySelectorAll('.stepper-container, .step-line').forEach(el => {
        el.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'q2') {
            node.remove();
          }
        });
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    PageTransition.init();
    ActiveNav.init();
    BookBtn.init();
    MobileMenu.init();
    ScrollNav.init();
    WelcomeToast.init();
    BugFixer.init();
  });

}());