document.addEventListener('DOMContentLoaded', () => {
    // 1. INJECT REQUIRED STYLES FOR POP-UPS & UI
    const style = document.createElement('style');
    style.innerHTML = `
        /* Custom Toast Notification */
        .luxury-toast {
            position: fixed; bottom: 30px; right: 30px;
            background: #111; color: #fff; padding: 15px 25px;
            border-left: 4px solid #b2905a; font-size: 13px;
            letter-spacing: 1px; z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateY(100px); opacity: 0;
            transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .luxury-toast.show { transform: translateY(0); opacity: 1; }

        /* Floating Alert Badge */
        .demand-badge {
            position: absolute; top: 20px; left: 20px;
            background: rgba(178, 144, 90, 0.9); color: #fff;
            padding: 5px 12px; font-size: 10px; font-weight: bold;
            letter-spacing: 1px; pointer-events: none;
            opacity: 0; transform: scale(0.8); transition: 0.3s;
        }
        .hotel-card:hover .demand-badge { opacity: 1; transform: scale(1); }

        /* Custom Modal Overlay */
        .luxury-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
            display: flex; align-items: center; justify-content: center;
            z-index: 20000; opacity: 0; visibility: hidden; transition: 0.4s;
        }
        .modal-content {
            background: #fff; width: 450px; padding: 40px; text-align: left;
            position: relative; transform: translateY(20px); transition: 0.4s;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4); border-top: 5px solid #b2905a;
        }
        .luxury-modal.active { opacity: 1; visibility: visible; }
        .luxury-modal.active .modal-content { transform: translateY(0); }
        
        /* Scroll Progress Bar */
        #scroll-progress {
            position: fixed; top: 0; left: 0; height: 3px;
            background: linear-gradient(to right, #b2905a, #fff);
            width: 0%; z-index: 10001; transition: width 0.1s ease;
        }

        /* Magnetic Hover Effect for Buttons */
        .btn-book { transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1); cursor: pointer; }

        /* Floating Luxury Concierge */
        .concierge-bot {
            position: fixed; bottom: 30px; left: 30px;
            width: 60px; height: 60px; background: #111;
            border-radius: 50%; display: flex; align-items: center;
            justify-content: center; cursor: pointer; z-index: 9999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 1px solid #b2905a; transition: all 0.4s;
        }
        .concierge-bot:hover { transform: scale(1.1) rotate(5deg); }
        .concierge-bot i { color: #b2905a; font-size: 24px; }
    `;
    document.head.appendChild(style);

    // 2. INITIALIZE GLOBAL UI ELEMENTS
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'luxury-toast';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    // 3. SCROLL PROGRESS LOGIC
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });

    // 4. INJECT MODAL BASE
    const modal = document.createElement('div');
    modal.className = 'luxury-modal';
    modal.id = 'booking-modal';
    document.body.appendChild(modal);

    // 5. THE ADVANCED DYNAMIC CALCULATOR ENGINE
    const triggerBooking = (hotelName, basePricePerNight) => {
        let nights = 1;
        let guests = 1;
        const guestSurcharge = 2500;

        const updateDisplay = () => {
            const roomTotal = nights * basePricePerNight;
            const guestTotal = (guests > 1) ? (guests - 1) * guestSurcharge * nights : 0;
            const tax = (roomTotal + guestTotal) * 0.18;
            const grandTotal = roomTotal + guestTotal + tax;

            modal.innerHTML = `
                <div class="modal-content">
                    <span id="close-modal" style="position:absolute; top:15px; right:20px; cursor:pointer; font-size:24px; color:#b2905a;">&times;</span>
                    <h3 style="font-family:Cinzel, serif; color:#b2905a; margin-bottom:5px; border-bottom: 1px solid #eee; padding-bottom: 10px;">RESERVATION PREVIEW</h3>
                    <p style="font-size:14px; color:#555; margin-bottom:20px;"><strong>Hotel:</strong> ${hotelName}</p>
                    
                    <div style="background:#f9f9f9; padding:15px; margin-bottom:20px; border: 1px solid #eee;">
                        <div style="margin-bottom:15px;">
                            <label style="font-size:11px; font-weight:bold; display:block; margin-bottom:5px; letter-spacing:1px;">NUMBER OF NIGHTS</label>
                            <input type="number" id="book-nights" value="${nights}" min="1" max="30" 
                                style="width:100%; padding:10px; border:1px solid #ddd; outline:none; font-family:inherit;">
                        </div>
                        <div>
                            <label style="font-size:11px; font-weight:bold; display:block; margin-bottom:5px; letter-spacing:1px;">GUESTS (MAX 4)</label>
                            <input type="number" id="book-guests" value="${guests}" min="1" max="4" 
                                style="width:100%; padding:10px; border:1px solid #ddd; outline:none; font-family:inherit;">
                        </div>
                    </div>

                    <div style="font-size:13px; color:#555;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span>Room x ${nights} Nights</span>
                            <span>₹ ${roomTotal.toLocaleString()}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span>Guest Surcharge</span>
                            <span>₹ ${guestTotal.toLocaleString()}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span>Luxury Tax (18%)</span>
                            <span>₹ ${tax.toLocaleString()}</span>
                        </div>
                        <hr style="border:0; border-top:1px dashed #ccc; margin:15px 0;">
                        <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold; color:#111;">
                            <span>Total Amount</span>
                            <span style="color:#b2905a;">₹ ${grandTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <button id="pay-now-btn" style="width:100%; margin-top:25px; padding:18px; background:#111; color:#fff; border:none; cursor:pointer; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">
                        CONFIRM & PAY
                    </button>
                    <p id="cancel-preview" style="text-align:center; margin-top:15px; font-size:11px; color:#999; cursor:pointer; text-transform:uppercase;">Cancel</p>
                </div>
            `;

            modal.classList.add('active');

            // Re-attach listeners for the inputs
            document.getElementById('book-nights').addEventListener('input', (e) => {
                nights = parseInt(e.target.value) || 1;
                updateDisplay();
            });
            document.getElementById('book-guests').addEventListener('input', (e) => {
                guests = parseInt(e.target.value) || 1;
                updateDisplay();
            });
            document.getElementById('close-modal').addEventListener('click', () => modal.classList.remove('active'));
            document.getElementById('cancel-preview').addEventListener('click', () => modal.classList.remove('active'));

            // Final Payment Logic
            document.getElementById('pay-now-btn').addEventListener('click', function () {
                this.innerText = "PROCESSING SECURE PAYMENT...";
                this.disabled = true;
                this.style.background = "#555";

                setTimeout(() => {
                    modal.innerHTML = `
                        <div class="modal-content" style="text-align:center;">
                            <div style="font-size:60px; color:#27ae60; margin-bottom:20px;">✓</div>
                            <h2 style="font-family:Cinzel, serif; color:#111;">BOOKING SUCCESSFUL</h2>
                            <p style="font-size:14px; color:#666; margin:15px 0;">Transaction ID: #RES-${Math.floor(Math.random() * 1000000)}</p>
                            <p style="font-size:12px; color:#999;">A confirmation email has been sent for your stay at <strong>${hotelName}</strong>.</p>
                            <button onclick="location.reload()" style="margin-top:30px; padding:12px 30px; border:1px solid #111; background:none; cursor:pointer; font-weight:bold;">CLOSE</button>
                        </div>
                    `;
                }, 2500);
            });
        };
        updateDisplay();
    };

    // 6. CARD SETUP: INJECT BADGES & ATTACH EVENTS
    const hotelCards = document.querySelectorAll('.hotel-card');
    hotelCards.forEach((card, index) => {
        // Set simulated base price if not present
        if (!card.hasAttribute('data-base-price')) {
            card.setAttribute('data-base-price', 15000 + (index * 5000));
        }

        // Add "High Demand" Badge
        const badge = document.createElement('div');
        badge.className = 'demand-badge';
        badge.innerText = "HIGH DEMAND: 4 PEOPLE LOOKING NOW";
        card.style.position = 'relative';
        const imgContainer = card.querySelector('.card-image');
        if (imgContainer) imgContainer.appendChild(badge);

        // Attach Magnetic Effect and Booking Click
        const btn = card.querySelector('.btn-book');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const hotelTitle = card.querySelector('h3')?.innerText || "Luxury Suite";
                const basePrice = parseInt(card.getAttribute('data-base-price'));
                triggerBooking(hotelTitle, basePrice);
            });

            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
            });
            btn.addEventListener('mouseleave', () => btn.style.transform = `translate(0px, 0px)`);
        }
    });

    // 7. CONCIERGE & MISC UI
    const bot = document.createElement('div');
    bot.className = 'concierge-bot';
    bot.innerHTML = '<i class="fas fa-comment-alt" style="color:#b2905a; font-size:24px;"></i>';
    document.body.appendChild(bot);

    bot.addEventListener('click', () => {
        showToast("CONCIERGE: How can I assist your luxury travel plans today?");
    });

    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('focus', () => showToast("SEARCHING ACROSS 50+ LUXURY DESTINATIONS..."));
    }

    setTimeout(() => showToast("WELCOME TO RESORTIFY LUXURY. EXPLORE OUR EXCLUSIVE COLLECTION."), 1500);
});

// --- ADVANCED EXCLUSIVE & MEMBER OFFERS ENGINE ---

const initializePremiumOffers = () => {
    // 1. STYLED OVERLAY INJECTION
    const offerStyle = document.createElement('style');
    offerStyle.innerHTML = `
        /* Premium Member Blur Lock */
        .member-lock-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            opacity: 0; transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1);
            z-index: 5; pointer-events: none;
        }
        .hotel-card.member-exclusive:hover .member-lock-overlay { opacity: 1; }
        
        /* Interactive "More" Link Styling */
        .more-link {
            position: relative; overflow: hidden; display: inline-block;
            transition: 0.3s; padding-bottom: 2px;
        }
        .more-link::after {
            content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1px;
            background: #b2905a; transition: 0.4s ease;
        }
        .more-link:hover::after { width: 100%; }

        /* Floating Benefit Pills */
        .benefit-pill {
            display: inline-block; padding: 4px 10px; background: #f4f1ea;
            color: #b2905a; font-size: 9px; border-radius: 50px;
            margin-right: 5px; margin-top: 10px; font-weight: bold;
            text-transform: uppercase; border: 1px solid #e5dfd3;
        }
    `;
    document.head.appendChild(offerStyle);

    // 2. DYNAMIC CONTENT INJECTION FOR OFFERS
    const memberCards = document.querySelectorAll('.hotel-card.member-exclusive');
    memberCards.forEach(card => {
        // Add the blurred "Member Only" UI
        const lock = document.createElement('div');
        lock.className = 'member-lock-overlay';
        lock.innerHTML = `
            <i class="fas fa-crown" style="color: #b2905a; font-size: 24px; margin-bottom: 10px;"></i>
            <span style="font-family:Cinzel; font-size: 12px; letter-spacing: 2px; color: #111;">INNERCIRCLE PRICE</span>
            <button class="btn-login-small" style="margin-top:15px; padding: 8px 20px; background:#111; color:#fff; border:none; font-size:10px; cursor:pointer;">SIGN IN TO REVEAL</button>
        `;
        card.querySelector('.card-image').appendChild(lock);

        // Add dynamic benefit pills (Free Wifi, Butler, etc.)
        const content = card.querySelector('.card-content');
        const benefits = ['Private Butler', 'Early Check-in', 'Spa Access'];
        const pillContainer = document.createElement('div');
        benefits.forEach(text => {
            const pill = document.createElement('div');
            pill.className = 'benefit-pill';
            pill.innerText = text;
            pillContainer.appendChild(pill);
        });
        content.insertBefore(pillContainer, content.querySelector('.card-footer'));
    });

    // 3. THE "SMART MORE" REVEAL
    // Instead of a popup, clicking "MORE" expands the card to show floor plans/amenities
    document.querySelectorAll('.more-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const card = this.closest('.hotel-card');
            const originalText = this.innerText;

            if (this.classList.contains('expanded')) {
                card.querySelector('.extra-details').remove();
                this.innerText = "MORE ›";
                this.classList.remove('expanded');
            } else {
                const details = document.createElement('div');
                details.className = 'extra-details';
                details.style.cssText = "padding: 15px; background: #fcfcfc; border-top: 1px solid #eee; font-size: 12px; animation: slideDown 0.4s ease;";
                details.innerHTML = `
                    <p style="color:#777; line-height:1.6;"><strong>Amenities:</strong> Infinity Pool, 24/7 Room Service, Private Balcony, Pillow Menu.</p>
                    <div style="margin-top:10px; color:#b2905a;">● Available for Members: -25% Spa Discount</div>
                `;
                card.appendChild(details);
                this.innerText = "LESS ˄";
                this.classList.add('expanded');
            }
        });
    });
};

// Initialize after DOM is ready
initializePremiumOffers();
// --- ADVANCED EXCLUSIVE OFFERS & HEADER ENGINE ---

const initializeExclusiveFeatures = () => {
    // 1. INJECT PREMIUM DRAWER UI
    const drawerStyle = document.createElement('style');
    drawerStyle.innerHTML = `
        /* Info Side-Drawer */
        .info-drawer {
            position: fixed; top: 0; right: -500px; width: 450px; height: 100%;
            background: #fff; z-index: 40000; box-shadow: -10px 0 30px rgba(0,0,0,0.1);
            transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1); padding: 60px 40px;
            display: flex; flex-direction: column;
        }
        .info-drawer.active { right: 0; }
        .drawer-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
            z-index: 39999; opacity: 0; visibility: hidden; transition: 0.4s;
        }
        .drawer-overlay.active { opacity: 1; visibility: visible; }
        
        /* Book a Stay Ripple */
        .ripple-btn { position: relative; overflow: hidden; }
        .ripple-effect {
            position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3);
            transform: scale(0); animation: ripple-anim 0.6s linear; pointer-events: none;
        }
        @keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }

        /* Offer Card Visual Polish */
        .exclusive-card-content { transition: transform 0.4s ease; }
        .hotel-card:hover .exclusive-card-content { transform: translateY(-10px); }
    `;
    document.head.appendChild(drawerStyle);

    // 2. CREATE DRAWER DOM ELEMENTS
    const drawer = document.createElement('div');
    drawer.className = 'info-drawer';
    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    document.body.append(drawer, overlay);

    // 3. SMART "KNOW MORE" SIDE-PANEL LOGIC
    document.querySelectorAll('.know-more, .more-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const card = link.closest('.hotel-card') || link.closest('.offer-card');
            const title = card.querySelector('h3, h2')?.innerText || "Exclusive Offer";

            drawer.innerHTML = `
                <span class="close-drawer" style="position:absolute; top:30px; left:40px; cursor:pointer; font-size:12px; letter-spacing:2px; color:#b2905a;">← BACK</span>
                <div style="margin-top:40px;">
                    <h2 style="font-family:Cinzel, serif; font-size:28px; color:#111; margin-bottom:20px;">${title}</h2>
                    <p style="color:#777; line-height:1.8; margin-bottom:30px;">
                        Indulge in a curated experience designed for the discerning traveler. This package includes 
                        private airport transfers, a bespoke welcome amenity, and 24-hour dedicated concierge service.
                    </p>
                    <h4 style="font-size:12px; letter-spacing:1px; margin-bottom:15px; color:#b2905a;">INCLUSIONS</h4>
                    <ul style="list-style:none; padding:0; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">○ Daily Gourmet Breakfast for Two</li>
                        <li style="margin-bottom:10px;">○ $100 Resort Credit per Stay</li>
                        <li style="margin-bottom:10px;">○ Guaranteed Room Upgrade</li>
                        <li style="margin-bottom:10px;">○ Sunset Cocktails at the Lounge</li>
                    </ul>
                    <button class="btn-book" style="margin-top:40px; width:100%; padding:18px; background:#111; color:#fff; border:none; cursor:pointer; font-weight:bold; letter-spacing:2px;">BOOK THIS EXPERIENCE</button>
                </div>
            `;

            drawer.classList.add('active');
            overlay.classList.add('active');

            // Attach booking trigger to drawer button
            drawer.querySelector('.btn-book').onclick = () => {
                const basePrice = parseInt(card.getAttribute('data-base-price')) || 25000;
                triggerBooking(title, basePrice); // Uses your existing booking engine
            };
        });
    });

    // Close logic
    const closeDrawer = () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    };
    overlay.onclick = closeDrawer;
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-drawer')) closeDrawer();
    });

    // 4. "BOOK A STAY" DYNAMIC RIPPLE (Header Button)
    const bookAStayBtn = document.querySelector('.btn-book-stay, .book-a-stay');
    if (bookAStayBtn) {
        bookAStayBtn.classList.add('ripple-btn');
        bookAStayBtn.addEventListener('click', function (e) {
            // Visual Ripple
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const rect = this.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            // Functional Trigger: Opens a General Booking Inquiry
            showToast("OPENING GLOBAL RESERVATIONS...");
            setTimeout(() => triggerBooking("Global Stay", 35000), 800);
        });
    }

    // 5. PARALLAX CARD DEPTH
    document.querySelectorAll('.hotel-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const img = card.querySelector('img');
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            img.style.transform = `scale(1.1) translate(${(x - 0.5) * 20}px, ${(y - 0.5) * 20}px)`;
        });
        card.addEventListener('mouseleave', () => {
            const img = card.querySelector('img');
            img.style.transform = `scale(1) translate(0, 0)`;
        });
    });
};

// Start the engine
initializeExclusiveFeatures();


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
/* ═══════════════════════════════════════════════════════════
   ADVANCED FILTER PANEL ENGINE
   Features:
   - Animated slide-down filter drawer
   - Live destination search with auto-suggestions
   - Price range dual-handle slider
   - Star rating picker
   - Amenity chips (multi-select)
   - Sort dropdown (Price, Rating, Name)
   - Active filter tags with x remove
   - Live results count
   - Smooth card filter + empty state
═══════════════════════════════════════════════════════════ */
const AdvancedFilters = (() => {

  const AMENITIES = ['Pool', 'Spa', 'Beach Access', 'Mountain View', 'Pet Friendly', 'Fine Dining', 'Golf Course', 'Kids Club', 'Butler Service', 'Helipad'];
  const DESTINATIONS = ['Udaipur', 'Kerala', 'Sri Lanka', 'Darjeeling', 'Goa', 'Maldives', 'Uttarakhand', 'Andamans', 'Jaipur', 'Mumbai', 'Dubai', 'London'];
  const HOTEL_PRICES = [15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000];

  let state = {
    query: '',
    minPrice: 0,
    maxPrice: 80000,
    stars: 0,
    amenities: new Set(),
    sort: 'default',
    type: '',
  };

  let drawerOpen = false;

  function init() {
    document.querySelectorAll('.hotel-card').forEach((card, i) => {
      if (!card.dataset.price) card.dataset.price = HOTEL_PRICES[i % HOTEL_PRICES.length];
      if (!card.dataset.stars) card.dataset.stars = [4, 5, 5, 4, 5, 4, 5, 4, 5][i % 9];
      if (!card.dataset.type)  card.dataset.type  = ['resort', 'resort', 'palace', 'resort', 'palace', 'resort', 'resort', 'resort', 'resort'][i % 9];
    });

    injectStyles();
    replaceFilterBar();
    bindAll();
  }

  function replaceFilterBar() {
    const old = document.querySelector('.search-filters');
    if (!old) return;

    const div = document.createElement('div');
    div.id = 'adv-filter-bar';
    div.innerHTML = `
      <div id="adv-filter-row">
        <div class="adv-field adv-search-wrap" id="adv-search-wrap">
          <i class="fas fa-search adv-field-icon"></i>
          <input type="text" id="adv-search" placeholder="Destination, city or hotel name..." autocomplete="off">
          <div id="adv-suggestions"></div>
        </div>
        <div class="adv-field adv-select-wrap">
          <i class="fas fa-building adv-field-icon"></i>
          <select id="adv-type">
            <option value="">Hotel Type</option>
            <option value="resort">Resort & Spa</option>
            <option value="palace">Palace</option>
            <option value="safari">Safari Lodge</option>
            <option value="boutique">Boutique</option>
          </select>
        </div>
        <div class="adv-field adv-select-wrap">
          <i class="fas fa-sort adv-field-icon"></i>
          <select id="adv-sort">
            <option value="default">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stars-desc">Top Rated First</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
        <button id="adv-toggle-btn">
          <i class="fas fa-sliders-h"></i>
          MORE FILTERS
          <span id="adv-filter-count" class="adv-badge" style="display:none">0</span>
        </button>
      </div>

      <div id="adv-tags-row"></div>

      <div id="adv-drawer">
        <div id="adv-drawer-inner">
          <div class="adv-drawer-section">
            <p class="adv-drawer-label">PRICE PER NIGHT</p>
            <div class="adv-price-display">
              <span id="price-min-label">0</span>
              <span id="price-max-label">80,000</span>
            </div>
            <div class="adv-range-wrap">
              <input type="range" id="range-min" min="0" max="80000" step="5000" value="0">
              <input type="range" id="range-max" min="0" max="80000" step="5000" value="80000">
              <div class="adv-range-track"><div class="adv-range-fill" id="range-fill"></div></div>
            </div>
          </div>
          <div class="adv-drawer-section">
            <p class="adv-drawer-label">MINIMUM STAR RATING</p>
            <div id="adv-stars">
              ${[1,2,3,4,5].map(n => `<button class="star-btn" data-star="${n}">${'&#9733;'.repeat(n)}${'&#9734;'.repeat(5-n)}</button>`).join('')}
            </div>
          </div>
          <div class="adv-drawer-section">
            <p class="adv-drawer-label">AMENITIES</p>
            <div id="adv-amenities">
              ${AMENITIES.map(a => `<button class="amenity-chip" data-amenity="${a}">${a}</button>`).join('')}
            </div>
          </div>
          <div id="adv-drawer-footer">
            <button id="adv-clear-all">CLEAR ALL</button>
            <button id="adv-apply">APPLY FILTERS</button>
          </div>
        </div>
      </div>

      <div id="adv-results-bar"><span id="adv-results-count"></span></div>
    `;

    old.replaceWith(div);
  }

  function bindAll() {
    setTimeout(() => {
      bindSearch();
      bindType();
      bindSort();
      bindDrawerToggle();
      bindPriceRange();
      bindStars();
      bindAmenities();
      bindApplyAndClear();
      applyFilters();
    }, 50);
  }

  function bindSearch() {
    const input = document.getElementById('adv-search');
    const box   = document.getElementById('adv-suggestions');
    if (!input) return;

    input.addEventListener('input', () => {
      state.query = input.value.trim().toLowerCase();
      const q = state.query;
      box.innerHTML = '';
      if (!q) { box.style.display = 'none'; applyFilters(); return; }

      const matches = DESTINATIONS.filter(d => d.toLowerCase().includes(q));
      if (!matches.length) { box.style.display = 'none'; applyFilters(); return; }

      matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'adv-suggestion-item';
        item.innerHTML = m.replace(new RegExp(q, 'gi'), s => `<strong>${s}</strong>`);
        item.addEventListener('click', () => {
          input.value = m;
          state.query = m.toLowerCase();
          box.style.display = 'none';
          applyFilters();
        });
        box.appendChild(item);
      });
      box.style.display = 'block';
      applyFilters();
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#adv-search-wrap')) box.style.display = 'none';
    });
  }

  function bindType() {
    const sel = document.getElementById('adv-type');
    if (!sel) return;
    sel.addEventListener('change', () => { state.type = sel.value; applyFilters(); });
  }

  function bindSort() {
    const sel = document.getElementById('adv-sort');
    if (!sel) return;
    sel.addEventListener('change', () => { state.sort = sel.value; applyFilters(); });
  }

  function bindDrawerToggle() {
    const btn    = document.getElementById('adv-toggle-btn');
    const drawer = document.getElementById('adv-drawer');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
      drawerOpen = !drawerOpen;
      drawer.classList.toggle('adv-drawer-open', drawerOpen);
      btn.classList.toggle('adv-toggle-active', drawerOpen);
    });
  }

  function bindPriceRange() {
    const rMin = document.getElementById('range-min');
    const rMax = document.getElementById('range-max');
    if (!rMin || !rMax) return;

    function update() {
      let lo = parseInt(rMin.value);
      let hi = parseInt(rMax.value);
      if (lo > hi - 5000) { lo = hi - 5000; rMin.value = lo; }
      state.minPrice = lo;
      state.maxPrice = hi;
      document.getElementById('price-min-label').textContent = 'Rs.' + lo.toLocaleString('en-IN');
      document.getElementById('price-max-label').textContent = 'Rs.' + hi.toLocaleString('en-IN');
      const pct1 = (lo / 80000) * 100;
      const pct2 = (hi / 80000) * 100;
      document.getElementById('range-fill').style.left  = pct1 + '%';
      document.getElementById('range-fill').style.width = (pct2 - pct1) + '%';
    }

    rMin.addEventListener('input', update);
    rMax.addEventListener('input', update);
    update();
  }

  function bindStars() {
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.star);
        state.stars = (state.stars === val) ? 0 : val;
        document.querySelectorAll('.star-btn').forEach(b => {
          b.classList.toggle('star-active', parseInt(b.dataset.star) <= state.stars && state.stars > 0);
        });
        applyFilters();
      });
    });
  }

  function bindAmenities() {
    document.querySelectorAll('.amenity-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const a = chip.dataset.amenity;
        if (state.amenities.has(a)) {
          state.amenities.delete(a);
          chip.classList.remove('chip-active');
        } else {
          state.amenities.add(a);
          chip.classList.add('chip-active');
        }
      });
    });
  }

  function bindApplyAndClear() {
    document.getElementById('adv-apply')?.addEventListener('click', () => {
      applyFilters();
      drawerOpen = false;
      document.getElementById('adv-drawer')?.classList.remove('adv-drawer-open');
      document.getElementById('adv-toggle-btn')?.classList.remove('adv-toggle-active');
    });

    document.getElementById('adv-clear-all')?.addEventListener('click', () => {
      state = { query: '', minPrice: 0, maxPrice: 80000, stars: 0, amenities: new Set(), sort: 'default', type: '' };
      document.getElementById('adv-search').value = '';
      document.getElementById('adv-type').value   = '';
      document.getElementById('adv-sort').value   = 'default';
      document.getElementById('range-min').value  = 0;
      document.getElementById('range-max').value  = 80000;
      document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('star-active'));
      document.querySelectorAll('.amenity-chip').forEach(c => c.classList.remove('chip-active'));
      bindPriceRange();
      applyFilters();
    });
  }

  function applyFilters() {
    const grid  = document.querySelector('.hotel-grid');
    const cards = [...document.querySelectorAll('.hotel-card')];
    if (!grid || !cards.length) return;

    let visible = 0;

    cards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const price = parseInt(card.dataset.price) || 0;
      const stars = parseInt(card.dataset.stars) || 5;
      const type  = card.dataset.type || '';

      const passSearch = !state.query || title.includes(state.query);
      const passPrice  = price >= state.minPrice && price <= state.maxPrice;
      const passStars  = state.stars === 0 || stars >= state.stars;
      const passType   = !state.type || type === state.type;

      const show = passSearch && passPrice && passStars && passType;

      card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      if (show) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.display = '';
        visible++;
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 350);
      }
    });

    if (state.sort !== 'default') {
      const visibleCards = cards.filter(c => c.style.display !== 'none');
      visibleCards.sort((a, b) => {
        if (state.sort === 'price-asc')  return parseInt(a.dataset.price) - parseInt(b.dataset.price);
        if (state.sort === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
        if (state.sort === 'stars-desc') return parseInt(b.dataset.stars) - parseInt(a.dataset.stars);
        if (state.sort === 'name-asc')   return (a.querySelector('h3')?.textContent || '').localeCompare(b.querySelector('h3')?.textContent || '');
        return 0;
      });
      visibleCards.forEach(c => grid.appendChild(c));
    }

    const countEl = document.getElementById('adv-results-count');
    if (countEl) {
      countEl.textContent = visible === cards.length
        ? `Showing all ${visible} hotels`
        : `${visible} of ${cards.length} hotels match your filters`;
    }

    let activeCount = 0;
    if (state.query) activeCount++;
    if (state.type) activeCount++;
    if (state.stars > 0) activeCount++;
    if (state.minPrice > 0 || state.maxPrice < 80000) activeCount++;
    activeCount += state.amenities.size;

    const badge = document.getElementById('adv-filter-count');
    if (badge) {
      badge.textContent = activeCount;
      badge.style.display = activeCount ? 'inline-flex' : 'none';
    }

    renderTags();

    let empty = document.getElementById('adv-empty');
    if (visible === 0) {
      if (!empty) {
        empty = document.createElement('div');
        empty.id = 'adv-empty';
        empty.style.cssText = 'text-align:center;padding:60px 20px;';
        empty.innerHTML = `
          <div style="font-size:40px;margin-bottom:16px;">&#128269;</div>
          <p style="font-size:13px;letter-spacing:2px;color:#b2905a;margin-bottom:8px;">NO RESULTS FOUND</p>
          <p style="font-size:13px;color:#aaa;">Try adjusting your filters</p>`;
        grid.after(empty);
      }
    } else {
      empty?.remove();
    }
  }

  function renderTags() {
    const row = document.getElementById('adv-tags-row');
    if (!row) return;
    row.innerHTML = '';

    const addTag = (label, onRemove) => {
      const tag = document.createElement('span');
      tag.className = 'adv-filter-tag';
      tag.innerHTML = `${label} <button>&times;</button>`;
      tag.querySelector('button').addEventListener('click', onRemove);
      row.appendChild(tag);
    };

    if (state.query) addTag(`Dest: ${state.query}`, () => {
      state.query = '';
      document.getElementById('adv-search').value = '';
      applyFilters();
    });
    if (state.type) addTag(`Type: ${state.type}`, () => {
      state.type = '';
      document.getElementById('adv-type').value = '';
      applyFilters();
    });
    if (state.stars > 0) addTag(`${state.stars}+ Stars`, () => {
      state.stars = 0;
      document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('star-active'));
      applyFilters();
    });
    if (state.minPrice > 0 || state.maxPrice < 80000) addTag(
      `Rs.${state.minPrice.toLocaleString('en-IN')} - Rs.${state.maxPrice.toLocaleString('en-IN')}`,
      () => {
        state.minPrice = 0; state.maxPrice = 80000;
        document.getElementById('range-min').value = 0;
        document.getElementById('range-max').value = 80000;
        bindPriceRange();
        applyFilters();
      }
    );
    state.amenities.forEach(a => addTag(a, () => {
      state.amenities.delete(a);
      document.querySelector(`.amenity-chip[data-amenity="${a}"]`)?.classList.remove('chip-active');
      applyFilters();
    }));
  }

  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      #adv-filter-bar {
        background: #fff;
        border-bottom: 1px solid #eee;
        padding: 0 5%;
        position: sticky;
        top: 0;
        z-index: 200;
        box-shadow: 0 2px 20px rgba(0,0,0,0.06);
      }
      #adv-filter-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 18px 0;
        flex-wrap: wrap;
      }
      .adv-field {
        display: flex;
        align-items: center;
        border: 1px solid #e0d8cc;
        background: #fdfbf8;
        padding: 0 14px;
        height: 48px;
        flex: 1;
        min-width: 180px;
        position: relative;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .adv-field:focus-within {
        border-color: #b2905a;
        box-shadow: 0 0 0 3px rgba(178,144,90,0.12);
      }
      .adv-field-icon { color: #b2905a; font-size: 13px; margin-right: 10px; flex-shrink: 0; }
      #adv-search {
        border: none; background: none; outline: none;
        width: 100%; font-size: 13px; font-family: inherit; color: #333;
      }
      #adv-search::placeholder { color: #bbb; }
      .adv-select-wrap select {
        border: none; background: none; outline: none;
        width: 100%; font-size: 13px; font-family: inherit; color: #333;
        cursor: pointer; appearance: none;
      }
      #adv-toggle-btn {
        display: flex; align-items: center; gap: 8px;
        padding: 0 24px; height: 48px;
        background: #111; color: #fff; border: none;
        font-size: 11px; letter-spacing: 2px; font-weight: 600;
        cursor: pointer; font-family: inherit; white-space: nowrap;
        transition: background 0.25s; flex-shrink: 0;
      }
      #adv-toggle-btn.adv-toggle-active, #adv-toggle-btn:hover { background: #b2905a; }
      .adv-badge {
        display: inline-flex; align-items: center; justify-content: center;
        width: 18px; height: 18px; background: #fff; color: #b2905a;
        border-radius: 50%; font-size: 10px; font-weight: 700;
      }
      #adv-tags-row { display: flex; flex-wrap: wrap; gap: 8px; padding-bottom: 10px; }
      .adv-filter-tag {
        display: inline-flex; align-items: center; gap: 6px;
        background: #f4f0e8; border: 1px solid #e0d5c0; color: #7a6040;
        padding: 5px 12px; font-size: 11px; border-radius: 2px;
        animation: tagIn 0.2s ease;
      }
      .adv-filter-tag button {
        background: none; border: none; color: #b2905a;
        cursor: pointer; font-size: 14px; padding: 0; font-weight: 700;
      }
      .adv-filter-tag button:hover { color: #7a5c2e; }
      @keyframes tagIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }

      #adv-drawer {
        max-height: 0; overflow: hidden;
        transition: max-height 0.5s cubic-bezier(0.25,1,0.5,1);
        border-top: 1px solid transparent;
      }
      #adv-drawer.adv-drawer-open { max-height: 700px; border-top-color: #eee; }
      #adv-drawer-inner {
        display: grid; grid-template-columns: 1fr 1fr 1fr;
        gap: 32px; padding: 28px 0;
      }
      .adv-drawer-label {
        font-size: 10px; letter-spacing: 2px; color: #b2905a;
        font-weight: 700; margin-bottom: 16px;
      }
      .adv-price-display {
        display: flex; justify-content: space-between;
        font-size: 13px; color: #555; margin-bottom: 14px; font-weight: 500;
      }
      .adv-range-wrap { position: relative; height: 36px; }
      .adv-range-wrap input[type=range] {
        position: absolute; width: 100%; height: 4px; top: 14px;
        appearance: none; background: none; pointer-events: none; z-index: 2;
      }
      .adv-range-wrap input[type=range]::-webkit-slider-thumb {
        appearance: none; width: 18px; height: 18px; border-radius: 50%;
        background: #b2905a; border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(178,144,90,0.4);
        cursor: pointer; pointer-events: all;
      }
      .adv-range-track {
        position: absolute; top: 16px; width: 100%; height: 4px;
        background: #e0d8cc; border-radius: 2px; z-index: 1;
      }
      .adv-range-fill { position: absolute; height: 100%; background: #b2905a; border-radius: 2px; }

      #adv-stars { display: flex; flex-direction: column; gap: 6px; }
      .star-btn {
        background: none; border: 1px solid #e0d8cc; padding: 7px 14px;
        font-size: 14px; color: #ccc; cursor: pointer; text-align: left;
        transition: all 0.2s; font-family: inherit;
      }
      .star-btn:hover { border-color: #b2905a; color: #b2905a; }
      .star-btn.star-active { background: #b2905a; color: #fff; border-color: #b2905a; }

      #adv-amenities { display: flex; flex-wrap: wrap; gap: 8px; }
      .amenity-chip {
        padding: 7px 14px; border: 1px solid #e0d8cc; background: #fdfbf8;
        font-size: 11px; letter-spacing: 1px; color: #666; cursor: pointer;
        font-family: inherit; transition: all 0.2s; border-radius: 2px;
      }
      .amenity-chip:hover { border-color: #b2905a; color: #b2905a; }
      .amenity-chip.chip-active { background: #b2905a; color: #fff; border-color: #b2905a; }

      #adv-drawer-footer {
        grid-column: 1 / -1; display: flex; gap: 12px;
        justify-content: flex-end; padding-top: 16px; border-top: 1px solid #eee;
      }
      #adv-clear-all {
        padding: 12px 28px; border: 1px solid #ccc; background: #fff;
        font-size: 11px; letter-spacing: 2px; color: #888; cursor: pointer; font-family: inherit;
        transition: all 0.2s;
      }
      #adv-clear-all:hover { border-color: #b2905a; color: #b2905a; }
      #adv-apply {
        padding: 12px 32px; background: #111; color: #fff; border: none;
        font-size: 11px; letter-spacing: 2px; font-weight: 700;
        cursor: pointer; font-family: inherit; transition: background 0.25s;
      }
      #adv-apply:hover { background: #b2905a; }

      #adv-results-bar {
        padding: 10px 0; border-top: 1px solid #f0ece4;
        font-size: 11px; color: #aaa; letter-spacing: 1px;
      }

      #adv-suggestions {
        position: absolute; top: calc(100% + 4px); left: 0; right: 0;
        background: #fff; border: 1px solid #e0d8cc;
        box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        z-index: 999; display: none; max-height: 220px; overflow-y: auto;
      }
      .adv-suggestion-item {
        padding: 12px 16px; font-size: 13px; color: #444; cursor: pointer;
        border-bottom: 1px solid #f5f5f5; transition: background 0.15s;
      }
      .adv-suggestion-item:hover { background: #fdf9f4; color: #b2905a; }
      .adv-suggestion-item strong { color: #b2905a; font-weight: 700; }

      @media (max-width: 768px) {
        #adv-drawer-inner { grid-template-columns: 1fr; }
        #adv-filter-row { flex-direction: column; }
        .adv-field { min-width: 100%; }
      }
    `;
    document.head.appendChild(s);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => AdvancedFilters.init());