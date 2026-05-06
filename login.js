"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // 1. DATA (Lectures 5-8: Objects/Arrays)
    const benefitData = [
        { img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200', text: 'Exclusive Member Rates' },
        { img: 'https://cdn.sanity.io/images/ocl5w36p/prod5/938fba81bbfe03a175ba2d3cc59013bef11bff3b-480x240.jpg', text: 'Dining & Spa Offers' },
        { img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200', text: 'Up to 8% NeuCoins' },
        { img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200', text: 'Earn & Redeem Stays' }
    ];

    const inputTemplates = {
        mobile: `<div class="input-field"><span class="country-code">🇮🇳 +91</span><input type="tel" id="main-input" placeholder="Enter Mobile Number" maxlength="10"></div>`,
        email: `<div class="input-field"><input type="email" id="main-input" placeholder="Enter Email Address"></div>`,
        member: `<div class="input-field"><input type="text" id="main-input" placeholder="Enter Membership ID"></div>`
    };

    // 2. RENDER BENEFITS (Lectures 17-18: map())
    const grid = document.getElementById('benefits-grid');
    grid.innerHTML = benefitData.map(item => `
        <div class="benefit-card">
            <div class="benefit-img" style="background-image: url('${item.img}')"></div>
            <p>${item.text}</p>
        </div>
    `).join('');

    // 3. TAB SWITCHING (Lectures 27-30: Event Delegation)
    const tabParent = document.getElementById('login-tabs');
    const inputMount = document.getElementById('input-mount');
    
    // Initial Load
    inputMount.innerHTML = inputTemplates.mobile;

    tabParent.addEventListener('click', (e) => {
        const target = e.target.closest('.tab-btn');
        if (!target) return;

        // Manage Active Class
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        // Swap Content (DOM Manipulation)
        const type = target.dataset.type;
        inputMount.innerHTML = inputTemplates[type];
    });

    // 4. JOIN NOW BUTTON (Lectures 23-26: DOM Write)
    document.getElementById('btn-join-trigger').addEventListener('click', () => {
        const container = document.getElementById('join-container');
        container.style.opacity = '0';
        
        setTimeout(() => {
            container.innerHTML = `
                <h2 class="auth-title">Create Account</h2>
                <div class="input-field"><input type="text" id="reg-name" placeholder="Full Name"></div>
                <div class="input-field"><input type="email" id="reg-email" placeholder="Email Address"></div>
                <button class="btn-gold" id="btn-reg-submit">COMPLETE SIGNUP</button>
                <p style="margin-top:20px; font-size:11px; cursor:pointer; color:var(--gold)" onclick="location.reload()">BACK TO BENEFITS</p>
            `;
            container.style.opacity = '1';
        }, 300);
        container.style.transition = '0.3s';
    });

    // 5. ASYNC LOGIN (Lectures 35-40: Promises/Event Loop)
    const continueBtn = document.getElementById('btn-continue');
    
    continueBtn.addEventListener('click', () => {
        const inputVal = document.getElementById('main-input').value;
        const isAgreed = document.getElementById('terms').checked;

        if (!isAgreed || inputVal.trim() === "") {
            alert("Please complete the form and agree to terms.");
            return;
        }

        continueBtn.innerText = "VERIFYING...";
        continueBtn.style.pointerEvents = "none";

        // Simulation of Server Request
        new Promise((resolve) => {
            setTimeout(() => resolve("Success"), 1500);
        }).then(() => {
            alert(`OTP Sent to ${inputVal}`);
            continueBtn.innerText = "CONTINUE";
            continueBtn.style.pointerEvents = "auto";
        });
    });
});
// Add this logic to your existing login.js

// Function to show the Success Message (Lectures 23-26)
const showSuccessModal = (userName) => {
    // 1. Create the overlay element
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    
    // 2. Set the content using Template Literals (Lect 1-4)
    overlay.innerHTML = `
        <div class="success-card">
            <div class="success-icon">✓</div>
            <h2 class="auth-title">CONGRATULATIONS</h2>
            <p class="welcome-text">Welcome to the inner circle, <strong>${userName}</strong>.</p>
            <p class="sub-text">You are now a member of Resortify. Exclusive luxury awaits you.</p>
            <button class="btn-gold" onclick="location.reload()">EXPLORE RESORTIFY</button>
        </div>
    `;
    
    // 3. Append to body (DOM tree - Lect 23-26)
    document.body.appendChild(overlay);
};

// Update your Register Submit Event (inside your 'btn-join-trigger' listener)
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-reg-submit') {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;

        if (name.trim() === "" || !email.includes('@')) {
            alert("Please provide valid details.");
            return;
        }

        // Trigger the attractive success display
        showSuccessModal(name);
    }
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