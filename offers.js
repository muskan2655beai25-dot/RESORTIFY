document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════════════
    // 1. FUNCTIONAL FLASH SALE COUNTDOWN TIMER
    // ═══════════════════════════════════════════════════════
    const startTimer = () => {
        const segments = document.querySelectorAll('.t-segment');
        let totalSeconds = (0 * 3600) + (9 * 60) + 59;

        const updateDisplay = () => {
            if (totalSeconds <= 0) {
                const banner = document.querySelector('.timed-banner');
                if (banner) {
                    banner.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' })
                        .onfinish = () => banner.remove();
                }
                return;
            }
            totalSeconds--;
            const hrs = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            segments[0].innerHTML = `${hrs.toString().padStart(2, '0')}<small>HRS</small>`;
            segments[1].innerHTML = `${mins.toString().padStart(2, '0')}<small>MIN</small>`;
            segments[2].innerHTML = `${secs.toString().padStart(2, '0')}<small>SEC</small>`;

            // Flash red glow in last 60 seconds
            if (totalSeconds <= 60) {
                segments.forEach(s => s.style.boxShadow = `0 0 ${20 - (totalSeconds / 3)}px rgba(255,50,50,0.8)`);
            }
        };

        setInterval(updateDisplay, 1000);
    };
    startTimer();


    // ═══════════════════════════════════════════════════════
    // 2. INTERSECTION OBSERVER — SCROLL-TRIGGERED ANIMATIONS
    //    Cards, section headers animate in as you scroll
    // ═══════════════════════════════════════════════════════
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.dataset.delay || 0;
                setTimeout(() => {
                    el.animate([
                        { opacity: 0, transform: 'translateY(40px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ], { duration: 700, fill: 'forwards', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
                    el.style.opacity = '1';
                }, delay);
                revealObserver.unobserve(el);
            }
        });
    }, { threshold: 0.15 });

    const cards = document.querySelectorAll('.offer-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.dataset.delay = i * 180;
        revealObserver.observe(card);
    });

    document.querySelectorAll('.offers-hero, .newsletter-cta').forEach(el => {
        el.style.opacity = '0';
        revealObserver.observe(el);
    });


    // ═══════════════════════════════════════════════════════
    // 3. CARD IMAGE PARALLAX ON MOUSE MOVE (3D TILT EFFECT)
    //    Each card tilts in 3D based on cursor position
    // ═══════════════════════════════════════════════════════
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotateX = ((y - cy) / cy) * -6;
            const rotateY = ((x - cx) / cx) * 6;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            card.style.transition = 'transform 0.1s ease';

            // Shine shimmer effect
            let shine = card.querySelector('.card-shine');
            if (!shine) {
                shine = document.createElement('div');
                shine.className = 'card-shine';
                shine.style.cssText = `
                    position:absolute; inset:0; pointer-events:none; z-index:10;
                    background: radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12) 0%, transparent 60%);
                    border-radius: inherit; transition: background 0.05s;
                `;
                card.style.position = 'relative';
                card.appendChild(shine);
            } else {
                shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12) 0%, transparent 60%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
            const shine = card.querySelector('.card-shine');
            if (shine) shine.style.background = 'transparent';
        });
    });


    // ═══════════════════════════════════════════════════════
    // 4. LUXURY DROPDOWN LOGIC (JS-DRIVEN)
    // ═══════════════════════════════════════════════════════
    const dropdowns = document.querySelectorAll('.filter-dropdown');
    dropdowns.forEach(dropdown => {
        const list = dropdown.querySelector('.dropdown-list');
        if (!list) return;
        list.style.display = 'none';

        dropdown.addEventListener('mouseenter', () => {
            list.style.display = 'block';
            list.animate([
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 300, fill: 'forwards' });
        });

        dropdown.addEventListener('mouseleave', () => {
            list.animate([
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(10px)' }
            ], { duration: 300, fill: 'forwards' }).onfinish = () => {
                list.style.display = 'none';
            };
        });
    });


    // ═══════════════════════════════════════════════════════
    // 5. CARD IMAGE ZOOM ON HOVER (JS-DRIVEN)
    // ═══════════════════════════════════════════════════════
    cards.forEach(card => {
        const image = card.querySelector('.card-image');
        card.addEventListener('mouseenter', () => {
            image.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }],
                { duration: 1200, fill: 'forwards', easing: 'ease-out' });
        });
        card.addEventListener('mouseleave', () => {
            image.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
                { duration: 900, fill: 'forwards', easing: 'ease-in' });
        });
    });


    // ═══════════════════════════════════════════════════════
    // 6. FILTER NAV — ACTIVE STATE & LIVE CARD FILTERING
    //    Click a filter to animate-filter relevant cards
    // ═══════════════════════════════════════════════════════
    const filterLinks = document.querySelectorAll('.filter-main');
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Sub-filter items filter cards by keyword
    const subLinks = document.querySelectorAll('.dropdown-list a');
    subLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const keyword = link.textContent.toLowerCase();
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                const matches = text.includes(keyword.split(' ')[0]);
                card.animate([
                    { opacity: matches ? 0.3 : 1, transform: 'scale(1)' },
                    { opacity: matches ? 1 : 0.25, transform: matches ? 'scale(1.01)' : 'scale(0.97)' }
                ], { duration: 400, fill: 'forwards' });
            });

            // Reset all after 3s
            setTimeout(() => {
                cards.forEach(card => {
                    card.animate([{}, { opacity: 1, transform: 'scale(1)' }],
                        { duration: 400, fill: 'forwards' });
                });
            }, 3000);
        });
    });


    // ═══════════════════════════════════════════════════════
    // 7. BOOK ARROW BUTTON RIPPLE EFFECT
    // ═══════════════════════════════════════════════════════
    const buttons = document.querySelectorAll('.book-arrow');
    buttons.forEach(btn => {
        btn.style.overflow = 'hidden';
        btn.style.position = 'relative';

        btn.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const size = Math.max(btn.offsetWidth, btn.offsetHeight);
            ripple.style.cssText = `
                position:absolute; width:${size}px; height:${size}px;
                background:rgba(255,255,255,0.35); border-radius:50%;
                transform:scale(0); left:50%; top:50%;
                margin-left:-${size/2}px; margin-top:-${size/2}px;
                pointer-events:none;
            `;
            btn.appendChild(ripple);
            ripple.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(2)', opacity: 0 }],
                { duration: 500, fill: 'forwards' }).onfinish = () => ripple.remove();
        });

        btn.addEventListener('mouseenter', () => {
            btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(8px)' }],
                { duration: 200, fill: 'forwards' });
        });
        btn.addEventListener('mouseleave', () => {
            btn.animate([{ transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
                { duration: 200, fill: 'forwards' });
        });
    });


    // ═══════════════════════════════════════════════════════
    // 8. NEWSLETTER — ANIMATED SUCCESS STATE
    // ═══════════════════════════════════════════════════════
    const newsletterForm = document.querySelector('.inline-form');
    const newsContainer = document.querySelector('.news-content');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            const userEmail = emailInput.value;

            const btn = newsletterForm.querySelector('button');
            btn.textContent = 'SENDING...';
            btn.style.opacity = '0.6';

            setTimeout(() => {
                newsletterForm.animate([
                    { opacity: 1, transform: 'translateY(0)' },
                    { opacity: 0, transform: 'translateY(-15px)' }
                ], { duration: 400, fill: 'forwards' }).onfinish = () => {
                    newsletterForm.style.display = 'none';
                    const successMsg = document.createElement('div');
                    successMsg.className = 'success-message';
                    successMsg.innerHTML = `
                        <i class="fa-solid fa-circle-check" style="color:#b2905a;font-size:2.5rem;margin-bottom:12px;display:block;"></i>
                        <h3 style="font-family:'Playfair Display',serif;font-size:28px;color:#fff;font-weight:400;">Welcome to the Inner Circle</h3>
                        <p style="color:#888;font-size:14px;margin-top:8px;letter-spacing:0.5px;">A confirmation has been sent to <strong style="color:#b2905a;">${userEmail}</strong></p>
                    `;
                    newsContainer.appendChild(successMsg);
                    successMsg.animate([
                        { opacity: 0, transform: 'scale(0.85)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ], { duration: 700, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' });
                };
            }, 900);
        });
    }


    // ═══════════════════════════════════════════════════════
    // 9. PROMO CODE COPY-TO-CLIPBOARD
    //    Clicking FLASH20 copies it and shows confirmation
    // ═══════════════════════════════════════════════════════
    const promoCode = document.querySelector('.promo-highlight strong');
    if (promoCode) {
        promoCode.style.cssText += 'cursor:pointer; text-decoration:underline dotted; transition:0.2s;';
        promoCode.title = 'Click to copy';

        promoCode.addEventListener('click', () => {
            navigator.clipboard.writeText(promoCode.textContent).then(() => {
                const original = promoCode.textContent;
                promoCode.textContent = '✓ COPIED!';
                promoCode.style.color = '#a8ff78';
                promoCode.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
                    { duration: 400 });
                setTimeout(() => {
                    promoCode.textContent = original;
                    promoCode.style.color = '#ffeb3b';
                }, 2000);
            });
        });
    }


    // ═══════════════════════════════════════════════════════
    // 10. STICKY PROMO BANNER — SCROLL-BASED SHRINK
    //     Banner shrinks to a slim bar on scroll
    // ═══════════════════════════════════════════════════════
    const banner = document.querySelector('.timed-banner');
    if (banner) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY > 80 && lastScroll <= 80) {
                banner.style.cssText += 'padding:10px 0; transition: padding 0.4s ease;';
                const large = banner.querySelector('.large-static-timer');
                const lead = banner.querySelector('.timer-lead');
                if (large) large.style.cssText += 'transform:scale(0.75); transition:transform 0.3s;';
                if (lead) lead.style.fontSize = '9px';
            } else if (scrollY <= 80 && lastScroll > 80) {
                banner.style.padding = '30px 0';
                const large = banner.querySelector('.large-static-timer');
                const lead = banner.querySelector('.timer-lead');
                if (large) large.style.transform = 'scale(1)';
                if (lead) lead.style.fontSize = '11px';
            }
            lastScroll = scrollY;
        }, { passive: true });
    }


    // ═══════════════════════════════════════════════════════
    // 11. PRICE COUNTER ANIMATION
    //     Prices count up when cards scroll into view
    // ═══════════════════════════════════════════════════════
    const priceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const valEl = entry.target.querySelector('.val');
            if (!valEl) return;

            const raw = valEl.textContent.replace(/,/g, '');
            const target = parseInt(raw, 10);
            if (isNaN(target)) return;

            let start = 0;
            const duration = 1200;
            const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                valEl.textContent = current.toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
                else valEl.textContent = target.toLocaleString();
            };
            requestAnimationFrame(step);
            priceObserver.unobserve(entry.target);
        });
    }, { threshold: 0.5 });

    cards.forEach(card => priceObserver.observe(card));


    // 12. CUSTOM LUXURY CURSOR — removed (using default cursor)


    // ═══════════════════════════════════════════════════════
    // 13. WISHLIST (SAVE OFFER) BUTTON
    //     Heart icon added to each card, saves to localStorage
    // ═══════════════════════════════════════════════════════
    const saved = JSON.parse(localStorage.getItem('resortify_wishlist') || '[]');

    cards.forEach((card, i) => {
        const heart = document.createElement('button');
        heart.className = 'wishlist-btn';
        heart.setAttribute('aria-label', 'Save offer');
        const isActive = saved.includes(i);
        heart.innerHTML = `<i class="fa-${isActive ? 'solid' : 'regular'} fa-heart"></i>`;
        heart.style.cssText = `
            position:absolute; top:20px; left:20px; background:rgba(255,255,255,0.9);
            border:none; width:38px; height:38px; border-radius:50%; cursor:pointer;
            font-size:14px; color:${isActive ? '#e03e3e' : '#999'};
            display:flex; align-items:center; justify-content:center;
            box-shadow:0 2px 12px rgba(0,0,0,0.12); z-index:5; transition:0.25s;
        `;

        heart.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const idx = saved.indexOf(i);
            if (idx === -1) {
                saved.push(i);
                heart.innerHTML = '<i class="fa-solid fa-heart"></i>';
                heart.style.color = '#e03e3e';
                heart.animate([
                    { transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }
                ], { duration: 350, easing: 'ease' });
                showToast('Added to your wishlist ♥️');
            } else {
                saved.splice(idx, 1);
                heart.innerHTML = '<i class="fa-regular fa-heart"></i>';
                heart.style.color = '#999';
            }
            localStorage.setItem('resortify_wishlist', JSON.stringify(saved));
        });

        card.querySelector('.card-image').appendChild(heart);
    });


    // ═══════════════════════════════════════════════════════
    // 14. TOAST NOTIFICATION SYSTEM
    //     Lightweight global toast for user feedback
    // ═══════════════════════════════════════════════════════
    function showToast(message, duration = 3000) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position:fixed; bottom:30px; right:30px; z-index:99999;
                display:flex; flex-direction:column; gap:10px; align-items:flex-end;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            background:#1a1a1a; color:#fff; padding:14px 22px;
            font-size:12px; letter-spacing:1px; font-family:'Inter',sans-serif;
            border-left:3px solid #b2905a; box-shadow:0 8px 30px rgba(0,0,0,0.2);
            opacity:0; transform:translateX(20px); max-width:300px;
        `;
        toastContainer.appendChild(toast);
        toast.animate([
            { opacity: 0, transform: 'translateX(20px)' },
            { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 300, fill: 'forwards' });

        setTimeout(() => {
            toast.animate([
                { opacity: 1, transform: 'translateX(0)' },
                { opacity: 0, transform: 'translateX(20px)' }
            ], { duration: 300, fill: 'forwards' }).onfinish = () => toast.remove();
        }, duration);
    }


    // ═══════════════════════════════════════════════════════
    // 15. SCROLL PROGRESS BAR (LUXURY GOLD LINE)
    //     Thin gold bar at top tracks reading progress
    // ═══════════════════════════════════════════════════════
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position:fixed; top:0; left:0; height:2px; width:0%;
        background:linear-gradient(90deg, #b2905a, #e8c87a, #b2905a);
        z-index:10001; transition:width 0.1s linear;
        box-shadow: 0 0 6px rgba(178,144,90,0.6);
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    }, { passive: true });


    // ═══════════════════════════════════════════════════════
    // 16. LAZY IMAGE LOADING WITH BLUR REVEAL
    //     Card background images fade from blurred to sharp
    // ═══════════════════════════════════════════════════════
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const cardImg = entry.target;
            const bgUrl = cardImg.style.backgroundImage;
            if (!bgUrl || bgUrl === 'none') return;

            cardImg.style.filter = 'blur(12px)';
            cardImg.style.transition = 'filter 0.8s ease';

            const img = new Image();
            const urlMatch = bgUrl.match(/url\(['"]?(.+?)['"]?\)/);
            if (urlMatch) {
                img.src = urlMatch[1];
                img.onload = () => { cardImg.style.filter = 'blur(0)'; };
            }
            imageObserver.unobserve(cardImg);
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card-image').forEach(img => imageObserver.observe(img));


    // ═══════════════════════════════════════════════════════
    // 17. KEYBOARD ACCESSIBILITY — ESC CLOSES DROPDOWNS
    // ═══════════════════════════════════════════════════════
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.dropdown-list').forEach(list => {
                list.style.display = 'none';
            });
        }
    });


    // ═══════════════════════════════════════════════════════
    // 18. SEARCH / QUICK FIND (press '/' to open)
    //     Lightweight fuzzy search across cards
    // ═══════════════════════════════════════════════════════
    const searchOverlay = document.createElement('div');
    searchOverlay.id = 'quick-search';
    searchOverlay.style.cssText = `
        position:fixed; inset:0; background:rgba(10,10,10,0.85); z-index:100000;
        display:none; align-items:flex-start; justify-content:center; padding-top:15vh;
        backdrop-filter:blur(6px);
    `;
    searchOverlay.innerHTML = `
        <div style="width:min(600px,90%); background:#fff; padding:0;">
            <div style="padding:20px 30px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:15px;">
                <i class="fa-solid fa-magnifying-glass" style="color:#b2905a; font-size:16px;"></i>
                <input id="quick-search-input" placeholder="Search experiences, dining, suites…" style="
                    flex:1; border:none; outline:none; font-family:'Inter',sans-serif;
                    font-size:15px; color:#1a1a1a; letter-spacing:0.3px;
                ">
                <span style="font-size:10px;color:#ccc;letter-spacing:1px;">ESC TO CLOSE</span>
            </div>
            <div id="search-results" style="padding:20px 30px; min-height:80px; font-size:13px; color:#888; letter-spacing:0.5px;">
                Start typing to search…
            </div>
        </div>
    `;
    document.body.appendChild(searchOverlay);

    const searchInput = searchOverlay.querySelector('#quick-search-input');
    const searchResults = searchOverlay.querySelector('#search-results');

    const openSearch = () => {
        searchOverlay.style.display = 'flex';
        searchInput.value = '';
        searchResults.innerHTML = 'Start typing to search…';
        setTimeout(() => searchInput.focus(), 50);
    };
    const closeSearch = () => {
        searchOverlay.style.display = 'none';
        cards.forEach(c => { c.style.opacity = '1'; c.style.transform = ''; });
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            openSearch();
        }
        if (e.key === 'Escape') closeSearch();
    });
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            searchResults.innerHTML = 'Start typing to search…';
            cards.forEach(c => c.style.opacity = '1');
            return;
        }

        let found = 0;
        searchResults.innerHTML = '';
        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent || '';
            const desc = card.querySelector('p')?.textContent || '';
            const price = card.querySelector('.val')?.textContent || '';
            const matches = (title + desc + price).toLowerCase().includes(query);

            if (matches) {
                found++;
                const item = document.createElement('div');
                item.style.cssText = 'padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; display:flex; gap:12px; align-items:center;';
                item.innerHTML = `
                    <i class="fa-solid fa-concierge-bell" style="color:#b2905a; width:20px; text-align:center;"></i>
                    <div>
                        <div style="font-family:'Playfair Display',serif; font-size:16px; color:#1a1a1a;">${title}</div>
                        <div style="font-size:11px; color:#aaa; margin-top:2px; letter-spacing:0.3px;">$${price}/night</div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    closeSearch();
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.animate([
                        { boxShadow: '0 0 0 3px #b2905a' },
                        { boxShadow: '0 0 0 0px transparent' }
                    ], { duration: 1500, fill: 'forwards' });
                });
                searchResults.appendChild(item);
            }
        });

        if (found === 0) {
            searchResults.innerHTML = `<span style="color:#ccc;">No experiences found for "<em>${query}</em>"</span>`;
        }
    });

    // Hint text in header area
    const searchHint = document.createElement('div');
    searchHint.style.cssText = `
        text-align:center; font-size:10px; letter-spacing:2px; color:#ccc;
        margin-top:-40px; margin-bottom:40px; font-family:'Inter',sans-serif;
    `;
    searchHint.innerHTML = `PRESS <kbd style="background:#eee;padding:2px 6px;border-radius:3px;font-family:monospace;">/</kbd> TO SEARCH`;
    const hero = document.querySelector('.offers-hero');
    if (hero) hero.after(searchHint);

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