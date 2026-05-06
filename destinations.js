
function injectStyle(css) {
  const tag = document.createElement('style');
  tag.textContent = css;
  document.head.appendChild(tag);
}


/* 1. PAGE LOADER */
const PageLoader = (() => {
  function init() {
    const loader = document.createElement('div');
    loader.id = 'resortify-loader';
    Object.assign(loader.style, {
      position: 'fixed', top: '0', left: '0',
      height: '3px', width: '0%',
      background: 'linear-gradient(90deg,#b2905a,#d4af7a,#b2905a)',
      zIndex: '99999',
      transition: 'width 0.6s ease, opacity 0.5s ease 0.2s',
    });
    document.body.appendChild(loader);
    requestAnimationFrame(() => { loader.style.width = '100%'; });
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 600);
      }, 300);
    });
  }
  return { init };
})();


/* 2. NAVBAR FX*/
const NavbarFX = (() => {
  function init() {
    const navbar = document.querySelector('.navbar');
    const topBar = document.querySelector('.top-bar');
    if (!navbar) return;
    let lastScroll = 0;
    injectStyle(`.navbar--scrolled{background:rgba(255,255,255,0.97)!important;box-shadow:0 4px 30px rgba(0,0,0,0.08)!important;border-bottom:1px solid rgba(178,144,90,0.2)!important;}`);
    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
      navbar.classList.toggle('navbar--scrolled', cur > 80);
      if (topBar) {
        topBar.style.transform = (cur > lastScroll && cur > 200) ? 'translateY(-100%)' : 'translateY(0)';
        topBar.style.transition = 'transform 0.4s ease';
      }
      lastScroll = cur;
    }, { passive: true });
  }
  return { init };
})();


/* 3. PAGE TRANSITION  */
const PageTransition = (() => {
  function init() {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:999999;pointer-events:none;opacity:0;transition:opacity 0.35s ease;';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '0'; });
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.target === '_blank') return;
      e.preventDefault();
      overlay.style.opacity = '1';
      setTimeout(() => { window.location.href = href; }, 350);
    });
  }
  return { init };
})();


/* 4. ACTIVE NAV LINK */
const ActiveNav = (() => {
  function init() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === current || href.includes(current.replace('.html', ''))) {
        Object.assign(link.style, { color: '#b2905a', fontWeight: '700', borderBottom: '2px solid #b2905a', paddingBottom: '2px' });
      }
    });
  }
  return { init };
})();


/* 5. MOBILE MENU*/
const MobileMenu = (() => {
  function init() {
    const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    injectStyle(`
      @media(max-width:900px){
        .nav-links{display:none;flex-direction:column!important;position:fixed!important;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.98)!important;padding:100px 40px 40px!important;z-index:9998!important;overflow-y:auto;backdrop-filter:blur(8px);}
        .nav-links.mobile-open{display:flex!important;animation:mobileNavIn 0.4s cubic-bezier(0.25,1,0.5,1);}
        .nav-links li{border-bottom:1px solid #f0f0f0;padding:18px 0;}
        .nav-links li a{font-size:18px!important;letter-spacing:2px!important;}
        @keyframes mobileNavIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        .hamburger.open span:nth-child(1){transform:rotate(45deg) translate(6px,6px);}
        .hamburger.open span:nth-child(2){opacity:0;}
        .hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(6px,-6px);}
        .hamburger span{transition:transform 0.3s ease,opacity 0.3s ease;display:block;}
      }
    `);

    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      hamburger.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-links') && !e.target.closest('.hamburger,#hamburger')) {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { navLinks.classList.remove('mobile-open'); hamburger.classList.remove('open'); document.body.style.overflow = ''; }
    });
  }
  return { init };
})();


/* 6. SMOOTH SCROLL */
const SmoothScroll = (() => {
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
  return { init };
})();


/* 7. MAP VIEW */
const MapView = (() => {
  const HOTELS = [
    { id:1,  name:'Umaid Bhawan Palace',   city:'Jodhpur',   brand:'MG',       lat:26.2389, lng:73.0243 },
    { id:2,  name:'Rambagh Palace',         city:'Jaipur',    brand:'MG',       lat:26.9124, lng:75.8648 },
    { id:3,  name:'Jai Mahal Palace',       city:'Jaipur',    brand:'MG',       lat:26.9260, lng:75.8235 },
    { id:4,  name:'Falaknuma Palace',       city:'Hyderabad', brand:'MG',       lat:17.3292, lng:78.4653 },
    { id:5,  name:'Exotica',                city:'Goa',       brand:'MG',       lat:15.5491, lng:73.7553 },
    { id:6,  name:'Meghauli Serai',         city:'Chitwan',   brand:'MG',       lat:27.5920, lng:84.4320 },
    { id:7,  name:'Baghvan Safari Lodge',   city:'Pench',     brand:'MG',       lat:21.7645, lng:79.2970 },
    { id:8,  name:'51 Buckingham Gate',     city:'London',    brand:'MG',       lat:51.4990, lng:-0.1357 },
    { id:9,  name:'MG Dubai',               city:'Dubai',     brand:'MG',       lat:25.1972, lng:55.2744 },
    { id:10, name:'MG Cape Town',           city:'Cape Town', brand:'MG',       lat:-33.9258,lng:18.4232 },
    { id:11, name:'MG Boston',              city:'Boston',    brand:'MG',       lat:42.3519, lng:-71.0552 },
    { id:12, name:'MG New York Palace',     city:'New York',  brand:'MG',       lat:40.7561, lng:-73.9773 },
    { id:13, name:'The Claridges',          city:'New Delhi', brand:'CLARIDGES',lat:28.5987, lng:77.2018 },
    { id:14, name:'Brij Anayra',            city:'Dharamshala',brand:'BRIJ',    lat:32.2190, lng:76.3234 },
    { id:15, name:'Brij Atmanya',           city:'Nainital',  brand:'BRIJ',     lat:29.3803, lng:79.4636 },
    { id:16, name:'Brij Lakshman Sagar',    city:'Pali',      brand:'BRIJ',     lat:25.7711, lng:73.3234 },
    { id:17, name:'Vivanta Goa',            city:'Goa',       brand:'VIVANTA',  lat:15.5095, lng:73.8118 },
    { id:18, name:'Vivanta Chennai',        city:'Chennai',   brand:'VIVANTA',  lat:13.0827, lng:80.2707 },
    { id:19, name:'MG Exotica Maldives',    city:'Maldives',  brand:'MG',       lat:4.1755,  lng:73.5093 },
    { id:20, name:'MG Frankfurt',           city:'Frankfurt', brand:'MG',       lat:50.1109, lng:8.6821  },
  ];
  const BRANDS = ['ALL','MG','CLARIDGES','BRIJ','VIVANTA','GINGER'];
  let leafletMap = null, markersLayer = null;

  function goldIcon() {
    return L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;background:#b2905a;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>',
      iconSize: [14,14], iconAnchor: [7,14], popupAnchor: [0,-16],
    });
  }

  function init() {
    const toggleBar = document.createElement('div');
    toggleBar.id = 'view-toggle-bar';
    toggleBar.innerHTML = '<button id="btn-list-view" class="view-toggle-btn active">LIST VIEW</button><button id="btn-map-view" class="view-toggle-btn">MAP VIEW</button>';

    const mapSection = document.createElement('section');
    mapSection.id = 'map-section';
    mapSection.style.display = 'none';
    mapSection.innerHTML = `
      <div id="map-brand-tabs">${BRANDS.map((b,i)=>`<button class="map-brand-btn${i===0?' active':''}" data-brand="${b}">${b}</button>`).join('')}</div>
      <div id="map-wrapper"><div id="leaflet-map"></div></div>`;

    const filterSection = document.querySelector('.filter-section');
    if (filterSection) { filterSection.after(toggleBar); toggleBar.after(mapSection); }

    injectStyle(`
      #view-toggle-bar{display:flex;justify-content:center;padding:20px 10%;background:#fff;border-bottom:1px solid #eee;}
      .view-toggle-btn{padding:14px 40px;border:1px solid #ddd;background:#fff;font-size:12px;letter-spacing:3px;color:#888;cursor:pointer;font-family:'Inter',sans-serif;font-weight:500;transition:all 0.3s;}
      .view-toggle-btn:first-child{border-right:none;}
      .view-toggle-btn.active{color:#b2905a;border-color:#b2905a;font-weight:700;}
      #map-section{background:#fff;}
      #map-brand-tabs{display:flex;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid #eee;padding:0 10px;background:#fff;}
      #map-brand-tabs::-webkit-scrollbar{display:none;}
      .map-brand-btn{flex:0 0 auto;padding:16px 28px;border:none;background:none;font-size:11px;letter-spacing:2px;color:#888;cursor:pointer;font-family:'Inter',sans-serif;font-weight:600;border-bottom:3px solid transparent;white-space:nowrap;transition:all 0.25s;}
      .map-brand-btn.active{color:#b2905a;border-bottom-color:#b2905a;}
      #map-wrapper{width:100%;height:580px;}
      #leaflet-map{width:100%;height:100%;}
      .leaflet-popup-content-wrapper{border-radius:0!important;border-top:3px solid #b2905a!important;box-shadow:0 12px 40px rgba(0,0,0,0.18)!important;padding:0!important;}
      .leaflet-popup-content{margin:16px 16px 14px!important;}
      @media(max-width:768px){#map-wrapper{height:360px;}.map-brand-btn{padding:14px 16px;}}
    `);

    const LIST_SELS = ['.featured-slider-section','.secondary-filters','.hotel-results','.other-hotels-section','.travel-stories-section'];
    const getListSections = () => LIST_SELS.map(s => document.querySelector(s)).filter(Boolean);

    document.getElementById('btn-list-view').addEventListener('click', () => {
      document.getElementById('btn-list-view').classList.add('active');
      document.getElementById('btn-map-view').classList.remove('active');
      mapSection.style.display = 'none';
      getListSections().forEach(el => el.style.display = '');
    });
    document.getElementById('btn-map-view').addEventListener('click', () => {
      document.getElementById('btn-map-view').classList.add('active');
      document.getElementById('btn-list-view').classList.remove('active');
      mapSection.style.display = 'block';
      getListSections().forEach(el => el.style.display = 'none');
      setTimeout(() => {
        if (!leafletMap) {
          leafletMap = L.map('leaflet-map', { center:[20,15], zoom:2, scrollWheelZoom:false });
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution:'© OpenStreetMap © CARTO', maxZoom:19, subdomains:'abcd' }).addTo(leafletMap);
          markersLayer = L.layerGroup().addTo(leafletMap);
          renderPins('ALL');
        }
        leafletMap.invalidateSize();
      }, 50);
    });

    document.querySelectorAll('.map-brand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-brand-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPins(btn.dataset.brand);
      });
    });
  }

  function renderPins(brand) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    HOTELS.forEach(h => {
      if (brand !== 'ALL' && h.brand !== brand) return;
      L.marker([h.lat, h.lng], { icon: goldIcon() })
        .bindPopup(`<div style="font-family:'Inter',sans-serif;min-width:160px;"><div style="font-size:9px;letter-spacing:2px;color:#b2905a;font-weight:700;margin-bottom:4px;">${h.brand}</div><div style="font-family:'Playfair Display',serif;font-size:14px;color:#1a1a1a;margin-bottom:2px;">${h.name}</div><div style="font-size:11px;color:#999;letter-spacing:1px;margin-bottom:12px;">${h.city}</div><button onclick="location.href='offers.html'" style="width:100%;background:#b2905a;color:#fff;border:none;padding:8px;font-size:10px;letter-spacing:2px;font-weight:700;cursor:pointer;">BOOK NOW</button></div>`, { maxWidth:200 })
        .addTo(markersLayer);
    });
  }

  return { init };
})();


/* 8. DESTINATION FILTER TABS*/
const DestinationFilter = (() => {
  function init() {
    const tabs = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.hotel-card,.other-hotel-card');
    if (!tabs.length) return;
    tabs[0].classList.add('tab-btn--active');
    injectStyle('.tab-btn--active{color:#b2905a!important;box-shadow:inset 0 -4px 0 #b2905a,0 10px 20px rgba(0,0,0,0.05)!important;font-weight:600!important;}');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('tab-btn--active'));
        tab.classList.add('tab-btn--active');
        const filter = tab.textContent.trim().toLowerCase();
        cards.forEach(card => {
          const country = (card.dataset.country || '').toLowerCase();
          const show = filter === 'all' || !country || country.includes(filter);
          if (show) {
            card.style.display = '';
            requestAnimationFrame(() => requestAnimationFrame(() => { card.style.opacity='1'; card.style.transform='translateY(0)'; }));
          } else {
            card.style.opacity = '0'; card.style.transform = 'translateY(10px)';
            setTimeout(() => { card.style.display = 'none'; }, 400);
          }
        });
      });
    });
  }
  return { init };
})();


/* 9. FEATURED SCROLLER — prev/next arrows*/
const FeaturedScroller = (() => {
  function init() {
    const viewport = document.querySelector('.featured-scroll-viewport');
    const section  = document.querySelector('.featured-slider-section');
    if (!viewport || !section) return;
    const btnPrev = makeArrow('&#8592;', 'arrow-prev');
    const btnNext = makeArrow('&#8594;', 'arrow-next');
    section.style.position = 'relative';
    section.appendChild(btnPrev); section.appendChild(btnNext);
    const SCROLL = 840;
    btnNext.addEventListener('click', () => viewport.scrollBy({ left: SCROLL, behavior:'smooth' }));
    btnPrev.addEventListener('click', () => viewport.scrollBy({ left:-SCROLL, behavior:'smooth' }));
    function updateArrows() {
      btnPrev.style.opacity = viewport.scrollLeft > 20 ? '1' : '0.3';
      btnNext.style.opacity = viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - 20 ? '1' : '0.3';
    }
    viewport.addEventListener('scroll', updateArrows, { passive:true });
    updateArrows();
    injectStyle('.featured-arrow{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.95);border:1px solid rgba(178,144,90,0.35);color:#b2905a;font-size:18px;cursor:pointer;z-index:10;box-shadow:0 4px 20px rgba(0,0,0,0.12);transition:background 0.3s,color 0.3s,opacity 0.3s;display:flex;align-items:center;justify-content:center;}.featured-arrow:hover{background:#b2905a;color:#fff;}.arrow-prev{left:2%;}.arrow-next{right:2%;}');
  }
  function makeArrow(html, cls) {
    const btn = document.createElement('button');
    btn.innerHTML = html; btn.className = `featured-arrow ${cls}`;
    btn.setAttribute('aria-label', cls === 'arrow-prev' ? 'Previous' : 'Next');
    return btn;
  }
  return { init };
})();


/* 10. SCROLL REVEAL*/
const ScrollReveal = (() => {
  function init() {
    const els = document.querySelectorAll('.hotel-card,.other-hotel-card,.story-card,.featured-item');
    els.forEach((el, i) => {
      el.style.cssText += `opacity:0;transform:translateY(28px);transition:opacity 0.6s ease ${(i%4)*0.1}s,transform 0.6s ease ${(i%4)*0.1}s;`;
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; obs.unobserve(e.target); } });
    }, { threshold:0.1 });
    els.forEach(el => obs.observe(el));
  }
  return { init };
})();


/* 11. LIVE SEARCH */
const LiveSearch = (() => {
  function init() {
    const heroInput = document.querySelector('.search-container input');
    const allCards  = [...document.querySelectorAll('.hotel-card,.other-hotel-card')];
    if (!allCards.length) return;
    function filter(q) {
      const query = q.trim().toLowerCase();
      allCards.forEach(card => {
        const match = !query || card.textContent.toLowerCase().includes(query);
        card.style.transition = 'opacity 0.3s ease';
        card.style.opacity = match ? '1' : '0.2';
        card.style.pointerEvents = match ? '' : 'none';
      });
    }
    heroInput?.addEventListener('input', e => filter(e.target.value));
  }
  return { init };
})();


/* 12. MODAL — Book Now popup with live price estimate*/
const Modal = (() => {
  const RATES = { 'Deluxe Room':18000, 'Junior Suite':32000, 'Grand Suite':55000, 'Presidential Suite':120000 };

  function init() {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="resortify-modal" role="dialog" aria-modal="true">
        <div class="modal-overlay"></div>
        <div class="modal-panel">
          <button class="modal-close" aria-label="Close">&times;</button>
          <div class="modal-accent-line"></div>
          <h2>BOOK YOUR STAY</h2>
          <p class="modal-hotel-name" id="modal-hotel-name"></p>
          <p class="modal-subtitle">Our concierge will confirm within 24 hours.</p>
          <div class="modal-form-grid">
            <div class="modal-field"><label>CHECK-IN</label><input type="date" id="modal-checkin"></div>
            <div class="modal-field"><label>CHECK-OUT</label><input type="date" id="modal-checkout"></div>
            <div class="modal-field"><label>GUESTS</label><select id="modal-guests"><option>1 Adult</option><option selected>2 Adults</option><option>2 Adults, 1 Child</option><option>2 Adults, 2 Children</option></select></div>
            <div class="modal-field"><label>ROOM TYPE</label><select id="modal-room"><option>Deluxe Room</option><option>Junior Suite</option><option>Grand Suite</option><option>Presidential Suite</option></select></div>
          </div>
          <div class="modal-price-row" id="modal-price-row" style="display:none"><span>Estimated Total</span><span id="modal-price-display" class="modal-price-value"></span></div>
          <button class="modal-book-btn" id="modal-submit">CONFIRM ENQUIRY</button>
          <p class="modal-note">* Prices are indicative. Final rates confirmed at checkout.</p>
        </div>
      </div>`);

    injectStyle(`
      #resortify-modal{display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;}
      #resortify-modal.modal--open{display:flex;}
      .modal-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);animation:fadeIn 0.3s ease;}
      .modal-panel{position:relative;background:#fff;width:min(90vw,600px);padding:50px;animation:slideUp 0.4s cubic-bezier(0.25,1,0.5,1);box-shadow:0 30px 80px rgba(0,0,0,0.25);}
      .modal-close{position:absolute;top:18px;right:22px;background:none;border:none;font-size:28px;color:#bbb;cursor:pointer;transition:color 0.2s;}.modal-close:hover{color:#b2905a;}
      .modal-accent-line{width:40px;height:1px;background:#b2905a;margin-bottom:14px;}
      .modal-panel h2{font-family:'Playfair Display',serif;font-size:26px;font-weight:400;letter-spacing:3px;color:#222;margin-bottom:6px;}
      .modal-hotel-name{font-size:11px;letter-spacing:2px;color:#b2905a;margin-bottom:8px;text-transform:uppercase;}
      .modal-subtitle{font-size:13px;color:#777;line-height:1.6;margin-bottom:28px;}
      .modal-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 28px;margin-bottom:22px;}
      .modal-field label{display:block;font-size:10px;letter-spacing:2px;color:#888;margin-bottom:8px;}
      .modal-field input,.modal-field select{width:100%;border:none;border-bottom:1px solid #ddd;padding:8px 0;font-size:14px;font-family:'Inter',sans-serif;color:#333;background:none;outline:none;transition:border-color 0.3s;appearance:none;}
      .modal-field input:focus,.modal-field select:focus{border-bottom-color:#b2905a;}
      .modal-price-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;margin-bottom:22px;font-size:13px;color:#555;letter-spacing:1px;}
      .modal-price-value{font-family:'Playfair Display',serif;font-size:20px;color:#b2905a;}
      .modal-book-btn{width:100%;background:#b2905a;color:#fff;border:none;padding:16px;font-size:13px;letter-spacing:2px;font-weight:600;cursor:pointer;transition:background 0.3s;}.modal-book-btn:hover{background:#967a4b;}
      .modal-note{font-size:11px;color:#aaa;text-align:center;margin-top:12px;}
      .modal-error{background:#fff0f0;border-left:3px solid #c0392b;padding:10px 14px;font-size:12px;color:#c0392b;margin-bottom:12px;}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1}}
    `);

    const modal = document.getElementById('resortify-modal');
    modal.querySelector('.modal-overlay').addEventListener('click', close);
    modal.querySelector('.modal-close').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    document.querySelectorAll('.btn-book,.btn-book-gold').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const card = btn.closest('.hotel-card,.other-hotel-card');
        open(card?.querySelector('h3,h4')?.textContent.trim() || '');
      });
    });

    ['modal-checkin','modal-checkout','modal-room'].forEach(id =>
      document.getElementById(id)?.addEventListener('change', updatePrice)
    );

    document.getElementById('modal-submit').addEventListener('click', () => {
      const cin = document.getElementById('modal-checkin').value;
      const cout = document.getElementById('modal-checkout').value;
      if (!cin || !cout || new Date(cout) <= new Date(cin)) {
        showError('Please select valid check-in and check-out dates.'); return;
      }
      const btn = document.getElementById('modal-submit');
      btn.textContent = '✓ ENQUIRY SENT'; btn.style.background = '#4a9e6a';
      setTimeout(() => { close(); btn.textContent = 'CONFIRM ENQUIRY'; btn.style.background = ''; }, 2200);
    });
  }

  function open(hotelName) {
    document.getElementById('modal-hotel-name').textContent = hotelName || '';
    const t = new Date(); t.setDate(t.getDate() + 1);
    const t2 = new Date(t); t2.setDate(t2.getDate() + 1);
    document.getElementById('modal-checkin').value  = t.toISOString().split('T')[0];
    document.getElementById('modal-checkout').value = t2.toISOString().split('T')[0];
    document.getElementById('resortify-modal').classList.add('modal--open');
    document.body.style.overflow = 'hidden';
    updatePrice();
  }

  function close() {
    document.getElementById('resortify-modal').classList.remove('modal--open');
    document.body.style.overflow = '';
  }

  function updatePrice() {
    const cin  = new Date(document.getElementById('modal-checkin')?.value);
    const cout = new Date(document.getElementById('modal-checkout')?.value);
    const room = document.getElementById('modal-room')?.value;
    const row  = document.getElementById('modal-price-row');
    const disp = document.getElementById('modal-price-display');
    if (!cin || !cout || cout <= cin || !row) { if (row) row.style.display = 'none'; return; }
    const nights = Math.round((cout - cin) / 86400000);
    disp.textContent = `₹${(nights * (RATES[room] || 18000)).toLocaleString('en-IN')} (${nights} night${nights>1?'s':''})`;
    row.style.display = 'flex';
  }

  function showError(msg) {
    document.querySelector('.modal-error')?.remove();
    const err = document.createElement('p');
    err.className = 'modal-error'; err.textContent = msg;
    document.getElementById('modal-submit').before(err);
    setTimeout(() => err.remove(), 4000);
  }

  return { init, open, close };
})();


/* 13. NEWSLETTER — footer email validation*/
const Newsletter = (() => {
  function init() {
    const input = document.querySelector('.footer-input');
    const btn   = document.querySelector('.btn-subscribe');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const email = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      document.querySelector('.newsletter-feedback')?.remove();
      const fb = document.createElement('p');
      fb.className = 'newsletter-feedback';
      fb.textContent = valid ? "✓ You're subscribed. Welcome to Resortify." : '✕ Please enter a valid email.';
      fb.style.cssText = `font-size:11px;letter-spacing:1px;margin-top:10px;color:${valid?'#b2905a':'#e07070'}`;
      btn.parentElement.after(fb);
      if (valid) { input.value = ''; setTimeout(() => fb.remove(), 5000); }
    });
  }
  return { init };
})();


/* 14. MICRO-INTERACTIONS */
const MicroInteractions = (() => {
  function init() {
    // Ripple
    injectStyle('.ripple-btn{position:relative;overflow:hidden;}.ripple-circle{position:absolute;border-radius:50%;background:rgba(255,255,255,0.28);transform:scale(0);animation:rippleAnim 0.6s linear;pointer-events:none;}@keyframes rippleAnim{to{transform:scale(4);opacity:0;}}');
    document.querySelectorAll('.btn-book,.btn-book-gold,.btn-read-now,.btn-subscribe').forEach(btn => {
      btn.classList.add('ripple-btn');
      btn.addEventListener('click', e => {
        const rect = btn.getBoundingClientRect(), size = Math.max(rect.width, rect.height);
        const c = document.createElement('span'); c.className = 'ripple-circle';
        Object.assign(c.style, { width:size+'px', height:size+'px', left:(e.clientX-rect.left-size/2)+'px', top:(e.clientY-rect.top-size/2)+'px' });
        btn.appendChild(c); setTimeout(() => c.remove(), 700);
      });
    });

    // Story card hover lift
    document.querySelectorAll('.story-card').forEach(card => {
      card.style.transition = 'transform 0.4s ease,box-shadow 0.4s ease';
      card.addEventListener('mouseenter', () => { card.style.transform='translateY(-6px)'; card.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)'; });
      card.addEventListener('mouseleave', () => { card.style.transform='translateY(0)'; card.style.boxShadow='none'; });
    });

    // Scroll progress bar
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,#b2905a,#e8c87a,#b2905a);z-index:10001;transition:width 0.1s linear;pointer-events:none;';
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
    }, { passive:true });
  }
  return { init };
})();


/* 15. BACK TO TOP — gold circular button*/
const BackToTop = (() => {
  function init() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top'; btn.setAttribute('aria-label','Back to top'); btn.innerHTML = '&#8593;';
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => btn.classList.toggle('btt--visible', window.scrollY > 400), { passive:true });
    btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
    injectStyle('#back-to-top{position:fixed;bottom:40px;right:40px;width:48px;height:48px;border-radius:50%;background:#b2905a;color:#fff;border:none;font-size:20px;cursor:pointer;z-index:9000;opacity:0;transform:translateY(16px);transition:opacity 0.4s ease,transform 0.4s ease,background 0.3s;box-shadow:0 4px 20px rgba(178,144,90,0.4);pointer-events:none;}#back-to-top.btt--visible{opacity:1;transform:translateY(0);pointer-events:auto;}#back-to-top:hover{background:#967a4b;}');
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   16. LUXURY FILTERS — animated brand / theme / destination
═══════════════════════════════════════════════════════════ */
const LuxuryFilters = (() => {
  const BRANDS = [
    { value:'',          label:'All Brands',          icon:'✦', desc:'Explore every collection' },
    { value:'taj-hotels',label:'Taj Hotels',           icon:'🏰', desc:"India's finest heritage palaces" },
    { value:'seleqtions',label:'SeleQtions',           icon:'◈', desc:'Handpicked unique properties' },
    { value:'vivanta',   label:'Vivanta',              icon:'◇', desc:'Contemporary luxury escapes' },
    { value:'gin',       label:'Resortify Luxury',     icon:'◆', desc:'Premium resort experiences' },
    { value:'safari',    label:'Resortify Safari',     icon:'🌿', desc:'Wildlife & wilderness lodges' },
    { value:'heritage',  label:'Heritage Collection',  icon:'♛', desc:'Iconic historical properties' },
    { value:'wellness',  label:'Wellness Retreats',    icon:'◎', desc:'Spa & rejuvenation sanctuaries' },
    { value:'business',  label:'Business Connect',     icon:'◉', desc:'Premier corporate stays' },
  ];
  const THEMES = [
    { value:'',          label:'All Themes',           icon:'✦', desc:'Every experience awaits' },
    { value:'beach',     label:'Beachfront',           icon:'〰', desc:'Sun, sand & ocean horizons' },
    { value:'mountains', label:'Mountain Retreat',     icon:'△', desc:'High-altitude serenity' },
    { value:'wildlife',  label:'Wildlife & Safari',    icon:'◉', desc:'Into the heart of the wild' },
    { value:'wellness',  label:'Wellness & Spa',       icon:'◎', desc:'Restore body and mind' },
    { value:'palace',    label:'Palace & Heritage',    icon:'♛', desc:'Live like royalty' },
    { value:'romance',   label:'Romance',              icon:'◈', desc:'Intimate escapes for two' },
    { value:'adventure', label:'Adventure',            icon:'◆', desc:'Thrill-seeking journeys' },
    { value:'culinary',  label:'Culinary Journeys',    icon:'◇', desc:"Taste the world's finest" },
    { value:'family',    label:'Family Escapes',       icon:'❋', desc:'Memories for all ages' },
    { value:'honeymoon', label:'Honeymoon',            icon:'◎', desc:'Your perfect first chapter' },
  ];
  const DESTINATIONS_LIST = [
    'Agra','Ahmedabad','Alibaug','Alleppey','Bangalore','Chennai','Coorg','Darjeeling',
    'Dharamshala','Goa','Hyderabad','Jaipur','Jodhpur','Kolkata','Mumbai','Mysore',
    'Nainital','New Delhi','Pondicherry','Puri','Shimla','Udaipur','Varanasi',
    'Maldives','Sri Lanka','Dubai','London','Cape Town','New York',
  ];

  let activeDropdown = null;

  function init() {
    const section = document.querySelector('.secondary-filters');
    if (!section) return;
    injectStyles();

    section.innerHTML = `
      <div class="lf-bar">
        <div class="lf-field" id="lf-destination">
          <div class="lf-field-inner">
            <span class="lf-field-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
            <div class="lf-field-text">
              <label class="lf-label">DESTINATION</label>
              <input type="text" class="lf-input" placeholder="City, resort or country…" id="lf-dest-input" autocomplete="off">
            </div>
          </div>
          <div class="lf-suggestions" id="lf-dest-suggestions"></div>
        </div>
        <div class="lf-divider"></div>
        <div class="lf-field lf-dropdown-wrap" id="lf-brands-wrap">
          <div class="lf-field-inner lf-trigger" data-target="lf-brands-panel">
            <span class="lf-field-icon">◆</span>
            <div class="lf-field-text"><label class="lf-label">BRAND</label><span class="lf-value" id="lf-brands-value">All Brands</span></div>
            <span class="lf-chevron" id="lf-brands-chevron"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </div>
          <div class="lf-panel" id="lf-brands-panel"><div class="lf-panel-inner"><p class="lf-panel-heading">OUR COLLECTIONS</p><div class="lf-options" id="lf-brands-options"></div></div></div>
        </div>
        <div class="lf-divider"></div>
        <div class="lf-field lf-dropdown-wrap" id="lf-themes-wrap">
          <div class="lf-field-inner lf-trigger" data-target="lf-themes-panel">
            <span class="lf-field-icon">◎</span>
            <div class="lf-field-text"><label class="lf-label">THEME</label><span class="lf-value" id="lf-themes-value">All Themes</span></div>
            <span class="lf-chevron" id="lf-themes-chevron"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </div>
          <div class="lf-panel" id="lf-themes-panel"><div class="lf-panel-inner"><p class="lf-panel-heading">TRAVEL EXPERIENCES</p><div class="lf-options" id="lf-themes-options"></div></div></div>
        </div>
        <button class="lf-search-btn" id="lf-search-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>SEARCH</button>
      </div>
      <div class="lf-active-filters" id="lf-active-filters"></div>`;

    populateOptions('lf-brands-options', BRANDS,  'brands');
    populateOptions('lf-themes-options', THEMES,  'themes');
    bindDropdowns();
    bindDestSearch();
    bindSearchBtn();
  }

  function populateOptions(id, data, group) {
    const container = document.getElementById(id);
    if (!container) return;
    data.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'lf-option'; el.dataset.value = item.value; el.dataset.group = group;
      el.style.animationDelay = `${i*30}ms`;
      el.innerHTML = `<span class="lf-opt-icon">${item.icon}</span><div class="lf-opt-text"><span class="lf-opt-label">${item.label}</span><span class="lf-opt-desc">${item.desc}</span></div><span class="lf-opt-check">✓</span>`;
      el.addEventListener('click', () => {
        el.closest('.lf-panel').querySelectorAll('.lf-option').forEach(o => o.classList.remove('lf-option--selected'));
        el.classList.add('lf-option--selected');
        const valEl = document.getElementById(`lf-${group}-value`);
        if (valEl) { valEl.textContent = item.label; valEl.style.color = item.value ? '#b2905a' : ''; }
        closeAll(); updatePills();
      });
      container.appendChild(el);
    });
  }

  function bindDropdowns() {
    document.querySelectorAll('.lf-trigger').forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const panel = document.getElementById(trigger.dataset.target);
        const isOpen = panel.classList.contains('lf-panel--open');
        closeAll();
        if (!isOpen) {
          panel.classList.add('lf-panel--open'); activeDropdown = trigger.dataset.target;
          trigger.closest('.lf-dropdown-wrap').querySelector('.lf-chevron').classList.add('lf-chevron--open');
          trigger.closest('.lf-field').classList.add('lf-field--active');
        }
      });
    });
    document.addEventListener('click', closeAll);
  }

  function closeAll() {
    document.querySelectorAll('.lf-panel--open').forEach(p => p.classList.remove('lf-panel--open'));
    document.querySelectorAll('.lf-chevron--open').forEach(c => c.classList.remove('lf-chevron--open'));
    document.querySelectorAll('.lf-field--active').forEach(f => f.classList.remove('lf-field--active'));
    activeDropdown = null;
  }

  function bindDestSearch() {
    const input   = document.getElementById('lf-dest-input');
    const suggest = document.getElementById('lf-dest-suggestions');
    if (!input || !suggest) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      suggest.innerHTML = '';
      // also trigger live search
      const hero = document.querySelector('.search-container input');
      if (hero) { hero.value = input.value; hero.dispatchEvent(new Event('input')); }
      if (!q) { suggest.classList.remove('lf-suggestions--open'); return; }
      const matches = DESTINATIONS_LIST.filter(d => d.toLowerCase().startsWith(q)).slice(0, 6);
      if (!matches.length) { suggest.classList.remove('lf-suggestions--open'); return; }
      matches.forEach(dest => {
        const item = document.createElement('div'); item.className = 'lf-suggestion-item';
        item.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg><strong>${dest.slice(0,q.length)}</strong>${dest.slice(q.length)}`;
        item.addEventListener('click', () => {
          input.value = dest; suggest.classList.remove('lf-suggestions--open');
          if (hero) { hero.value = dest; hero.dispatchEvent(new Event('input')); }
          updatePills();
        });
        suggest.appendChild(item);
      });
      suggest.classList.add('lf-suggestions--open');
    });
    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !suggest.contains(e.target)) suggest.classList.remove('lf-suggestions--open');
    });
  }

  function bindSearchBtn() {
    const btn = document.getElementById('lf-search-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const dest = document.getElementById('lf-dest-input')?.value.trim();
      const hero = document.querySelector('.search-container input');
      if (hero && dest) { hero.value = dest; hero.dispatchEvent(new Event('input')); }
      updatePills();
      btn.textContent = '✓ APPLIED'; btn.style.background = '#4a9e6a';
      setTimeout(() => {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>SEARCH';
        btn.style.background = '';
      }, 1800);
    });
  }

  function updatePills() {
    const container = document.getElementById('lf-active-filters');
    if (!container) return;
    container.innerHTML = '';
    const dest  = document.getElementById('lf-dest-input')?.value.trim();
    const brand = document.querySelector('#lf-brands-options .lf-option--selected');
    const theme = document.querySelector('#lf-themes-options .lf-option--selected');
    const pills = [];
    if (dest)  pills.push({ label:dest,  group:'dest' });
    if (brand && brand.dataset.value) pills.push({ label:brand.querySelector('.lf-opt-label').textContent, group:'brands' });
    if (theme && theme.dataset.value) pills.push({ label:theme.querySelector('.lf-opt-label').textContent, group:'themes' });
    if (!pills.length) return;
    pills.forEach(p => {
      const el = document.createElement('span'); el.className = 'lf-pill';
      el.innerHTML = `${p.label} <button class="lf-pill-remove" data-group="${p.group}">×</button>`;
      el.querySelector('.lf-pill-remove').addEventListener('click', () => clearFilter(p.group));
      container.appendChild(el);
    });
    const clearAll = document.createElement('button');
    clearAll.className = 'lf-clear-all'; clearAll.textContent = 'CLEAR ALL';
    clearAll.addEventListener('click', () => { clearFilter('dest'); clearFilter('brands'); clearFilter('themes'); });
    container.appendChild(clearAll);
  }

  function clearFilter(group) {
    if (group === 'dest') {
      const input = document.getElementById('lf-dest-input');
      if (input) input.value = '';
    } else {
      document.getElementById(`lf-${group}-panel`)?.querySelectorAll('.lf-option').forEach(o => o.classList.remove('lf-option--selected'));
      const val = document.getElementById(`lf-${group}-value`);
      if (val) { val.textContent = group === 'brands' ? 'All Brands' : 'All Themes'; val.style.color = ''; }
    }
    updatePills();
  }

  function injectStyles() {
    injectStyle(`
      .secondary-filters{padding:0 10%!important;background:#fff!important;border-bottom:1px solid #ececec!important;}
      .lf-bar{display:flex;align-items:stretch;border:1px solid #e8e0d5;background:#fff;box-shadow:0 4px 30px rgba(0,0,0,0.06);position:relative;}
      .lf-field{flex:1;position:relative;cursor:pointer;transition:background 0.25s;}
      .lf-field:hover,.lf-field--active{background:#faf8f5;}
      .lf-field-inner{display:flex;align-items:center;gap:14px;padding:20px 24px;height:100%;min-height:76px;}
      .lf-field-icon{font-size:18px;color:#b2905a;flex-shrink:0;line-height:1;}
      .lf-field-text{flex:1;min-width:0;}
      .lf-label{display:block;font-size:10px;letter-spacing:2.5px;color:#aaa;margin-bottom:5px;font-family:'Inter',sans-serif;font-weight:500;}
      .lf-input{width:100%;border:none!important;outline:none!important;font-size:14px;color:#333;font-family:'Inter',sans-serif;background:transparent!important;padding:0!important;box-shadow:none!important;}
      .lf-input::placeholder{color:#bbb;font-size:13px;}
      .lf-value{font-size:14px;color:#333;font-family:'Inter',sans-serif;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.3s;}
      .lf-chevron{color:#aaa;flex-shrink:0;transition:transform 0.3s ease;display:flex;align-items:center;}.lf-chevron--open{transform:rotate(180deg);}
      .lf-divider{width:1px;background:#e8e0d5;margin:12px 0;flex-shrink:0;}
      .lf-search-btn{display:flex;align-items:center;gap:8px;padding:0 32px;background:#b2905a;color:#fff;border:none;font-size:11px;letter-spacing:2px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;flex-shrink:0;transition:background 0.3s;white-space:nowrap;}.lf-search-btn:hover{background:#967a4b;}
      .lf-panel{position:absolute;top:calc(100% + 2px);left:-1px;right:-1px;background:#fff;border:1px solid #e8e0d5;box-shadow:0 20px 60px rgba(0,0,0,0.12);z-index:500;display:none;overflow:hidden;}
      .lf-panel--open{display:block;animation:lfPanelIn 0.22s cubic-bezier(0.25,1,0.5,1);}
      @keyframes lfPanelIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      .lf-panel-inner{padding:24px;}
      .lf-panel-heading{font-size:9px;letter-spacing:3px;color:#b2905a;margin-bottom:16px;font-family:'Inter',sans-serif;font-weight:600;}
      .lf-options{display:grid;grid-template-columns:1fr 1fr;gap:4px;}
      .lf-option{display:flex;align-items:center;gap:12px;padding:11px 14px;cursor:pointer;border-radius:2px;transition:background 0.2s,border-color 0.2s;border:1px solid transparent;animation:lfOptIn 0.3s ease both;position:relative;}
      @keyframes lfOptIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      .lf-option:hover{background:#faf8f5;border-color:#e8e0d5;}.lf-option--selected{background:#fdf6ec!important;border-color:#b2905a!important;}
      .lf-opt-icon{font-size:16px;color:#b2905a;flex-shrink:0;width:20px;text-align:center;line-height:1;}
      .lf-opt-text{flex:1;min-width:0;}
      .lf-opt-label{display:block;font-size:13px;color:#333;font-family:'Inter',sans-serif;font-weight:500;letter-spacing:0.3px;}
      .lf-opt-desc{display:block;font-size:11px;color:#999;font-family:'Inter',sans-serif;margin-top:2px;}
      .lf-opt-check{color:#b2905a;font-size:13px;opacity:0;transition:opacity 0.2s;flex-shrink:0;}.lf-option--selected .lf-opt-check{opacity:1;}.lf-option--selected .lf-opt-label{color:#b2905a;}
      .lf-suggestions{display:none;position:absolute;top:100%;left:-1px;right:-1px;background:#fff;border:1px solid #e8e0d5;box-shadow:0 20px 50px rgba(0,0,0,0.1);z-index:500;}.lf-suggestions--open{display:block;}
      .lf-suggestion-item{display:flex;align-items:center;gap:10px;padding:12px 24px;font-size:13px;color:#555;font-family:'Inter',sans-serif;cursor:pointer;transition:background 0.15s;border-bottom:1px solid #f5f5f5;}.lf-suggestion-item:last-child{border-bottom:none;}.lf-suggestion-item:hover{background:#faf8f5;color:#b2905a;}.lf-suggestion-item svg{color:#b2905a;flex-shrink:0;}.lf-suggestion-item strong{color:#b2905a;font-weight:600;}
      .lf-active-filters{display:flex;flex-wrap:wrap;gap:10px;padding:16px 0;min-height:0;}
      .lf-pill{display:inline-flex;align-items:center;gap:8px;background:#fdf6ec;border:1px solid #e8d5b0;color:#b2905a;font-size:11px;letter-spacing:1.5px;font-weight:600;padding:6px 12px;font-family:'Inter',sans-serif;animation:lfPillIn 0.25s ease;}
      @keyframes lfPillIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
      .lf-pill-remove{background:none;border:none;color:#b2905a;cursor:pointer;font-size:16px;line-height:1;padding:0;margin-left:2px;opacity:0.7;transition:opacity 0.2s;}.lf-pill-remove:hover{opacity:1;}
      .lf-clear-all{background:none;border:1px solid #ddd;color:#999;font-size:10px;letter-spacing:1.5px;padding:6px 14px;cursor:pointer;font-family:'Inter',sans-serif;transition:border-color 0.2s,color 0.2s;}.lf-clear-all:hover{border-color:#b2905a;color:#b2905a;}
      @media(max-width:768px){.lf-bar{flex-direction:column;}.lf-divider{width:100%;height:1px;margin:0;}.lf-search-btn{padding:18px;justify-content:center;}.lf-options{grid-template-columns:1fr;}.lf-panel{position:fixed;left:10px;right:10px;max-height:60vh;overflow-y:auto;}}
    `);
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   17. WISHLIST & REVIEWS
═══════════════════════════════════════════════════════════ */
const WishlistReviews = (() => {
  let wishlist = JSON.parse(localStorage.getItem('resortify_wishlist') || '[]');
  let reviews  = JSON.parse(localStorage.getItem('resortify_reviews')  || '{}');
  let currentHotel = null, selectedStars = 0;

  function saveWishlist() { localStorage.setItem('resortify_wishlist', JSON.stringify(wishlist)); }
  function saveReviews()  { localStorage.setItem('resortify_reviews',  JSON.stringify(reviews)); }

  function init() {
    // ── Wishlist panel ──
    const panel   = document.getElementById('wishlistPanel');
    const overlay = document.getElementById('wishlistOverlay');
    const toggle  = document.getElementById('wishlistToggle');
    const closeBtn= document.getElementById('wishlistClose');
    const body    = document.getElementById('wishlistBody');
    const badge   = document.getElementById('wishlistBadge');
    if (!panel || !toggle) return;

    function updateBadge() { badge.textContent = wishlist.length; }

    function renderPanel() {
      if (!wishlist.length) {
        body.innerHTML = '<p class="wishlist-empty">No saved properties yet.<br>Click the <i class="far fa-heart"></i> on any hotel to save it.</p>';
        return;
      }
      body.innerHTML = wishlist.map((item,i) => `
        <div class="wishlist-item">
          <img class="wishlist-item-img" src="${item.img}" alt="${item.name}">
          <div class="wishlist-item-info"><h4>${item.name}</h4></div>
          <button class="wishlist-remove" data-index="${i}" title="Remove"><i class="fas fa-times"></i></button>
        </div>`).join('');
      body.querySelectorAll('.wishlist-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const removed = wishlist.splice(parseInt(btn.dataset.index), 1)[0];
          saveWishlist(); updateBadge(); renderPanel();
          document.querySelectorAll('.wishlist-btn').forEach(hb => {
            if (hb.dataset.name === removed.name) { hb.classList.remove('saved'); hb.querySelector('i').className = 'far fa-heart'; }
          });
        });
      });
    }

    toggle.addEventListener('click',  () => { panel.classList.add('active');    overlay.classList.add('active');    renderPanel(); });
    closeBtn.addEventListener('click', () => { panel.classList.remove('active'); overlay.classList.remove('active'); });
    overlay.addEventListener('click',  () => { panel.classList.remove('active'); overlay.classList.remove('active'); });

    // Attach heart buttons on cards
    document.querySelectorAll('.hotel-card').forEach(card => {
      const btn  = card.querySelector('.wishlist-btn');
      if (!btn) return;
      const name   = card.querySelector('h3').textContent.trim();
      const imgSrc = card.querySelector('img')?.src || '';
      btn.dataset.name = name;
      if (wishlist.find(w => w.name === name)) { btn.classList.add('saved'); btn.querySelector('i').className = 'fas fa-heart'; }
      btn.addEventListener('click', () => {
        const idx = wishlist.findIndex(w => w.name === name);
        if (idx > -1) {
          wishlist.splice(idx, 1); btn.classList.remove('saved'); btn.querySelector('i').className = 'far fa-heart';
        } else {
          wishlist.push({ name, img:imgSrc }); btn.classList.add('saved'); btn.querySelector('i').className = 'fas fa-heart';
        }
        saveWishlist(); updateBadge();
      });
    });
    updateBadge();

    // ── Reviews modal ──
    const rOverlay = document.getElementById('reviewModalOverlay');
    const rModal   = document.getElementById('reviewModal');
    const rClose   = document.getElementById('reviewModalClose');
    const rTitle   = document.getElementById('reviewModalTitle');
    const rExist   = document.getElementById('existingReviews');
    const starInput= document.getElementById('starInput');
    const rName    = document.getElementById('reviewName');
    const rText    = document.getElementById('reviewText');
    const rSubmit  = document.getElementById('submitReview');
    if (!rModal) return;

    function openReview(hotelName) {
      currentHotel = hotelName; selectedStars = 0;
      rName.value = ''; rText.value = ''; resetStars();
      rTitle.textContent = hotelName; renderExisting(hotelName);
      rOverlay.classList.add('active'); rModal.classList.add('active');
    }
    function closeReview() {
      rOverlay.classList.remove('active'); rModal.classList.remove('active'); currentHotel = null;
    }

    function renderExisting(name) {
      const list = reviews[name] || [];
      rExist.innerHTML = list.length
        ? list.map(r => `<div class="review-item"><div class="review-item-header"><span class="review-item-name">${r.name}</span><span class="review-item-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span></div><p class="review-item-text">${r.text}</p></div>`).join('')
        : '<p style="color:#aaa;font-size:13px;margin-bottom:20px;">No reviews yet. Be the first!</p>';
    }

    function resetStars() {
      starInput.querySelectorAll('i').forEach(s => { s.className = 'far fa-star'; s.classList.remove('active'); });
    }

    function updateCardRating(name) {
      const list = reviews[name] || [];
      const avg = list.length ? Math.round(list.reduce((a,b) => a+b.stars, 0) / list.length) : 4;
      document.querySelectorAll('.hotel-card').forEach(card => {
        if (card.querySelector('h3')?.textContent.trim() !== name) return;
        const countEl = card.querySelector('.review-count');
        const starsEl = card.querySelector('.stars');
        if (countEl) countEl.textContent = list.length;
        if (starsEl) {
          starsEl.innerHTML = '';
          for (let i=1;i<=5;i++) { const ic=document.createElement('i'); ic.className=i<=avg?'fas fa-star':'far fa-star'; starsEl.appendChild(ic); }
        }
      });
    }

    starInput.querySelectorAll('i').forEach(star => {
      star.addEventListener('click', () => {
        selectedStars = parseInt(star.dataset.val);
        starInput.querySelectorAll('i').forEach((s,i) => { s.className = i<selectedStars?'fas fa-star active':'far fa-star'; });
      });
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.val);
        starInput.querySelectorAll('i').forEach((s,i) => { s.className = i<val?'fas fa-star active':'far fa-star'; });
      });
      star.addEventListener('mouseleave', () => {
        starInput.querySelectorAll('i').forEach((s,i) => { s.className = i<selectedStars?'fas fa-star active':'far fa-star'; });
      });
    });

    rSubmit.addEventListener('click', () => {
      const name = rName.value.trim(), text = rText.value.trim();
      if (!selectedStars) { alert('Please select a star rating.'); return; }
      if (!name)          { alert('Please enter your name.'); return; }
      if (!text)          { alert('Please write your review.'); return; }
      if (!reviews[currentHotel]) reviews[currentHotel] = [];
      reviews[currentHotel].unshift({ name, text, stars:selectedStars });
      saveReviews(); updateCardRating(currentHotel); renderExisting(currentHotel);
      rName.value = ''; rText.value = ''; selectedStars = 0; resetStars();
    });

    rClose.addEventListener('click', closeReview);
    rOverlay.addEventListener('click', closeReview);

    document.querySelectorAll('.hotel-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent.trim();
      const btn  = card.querySelector('.btn-review-link');
      if (btn) btn.addEventListener('click', () => openReview(name));
      if (name) updateCardRating(name);
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   18. BOOK A STAY BUTTON — routes to offers.html
═══════════════════════════════════════════════════════════ */
const BookBtn = (() => {
  function init() {
    document.querySelectorAll('.book-btn,.book-now,[class*="book-stay"]').forEach(btn => {
      if (btn.tagName === 'BUTTON') {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => { window.location.href = 'offers.html'; });
      }
    });
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   BOOT — initialise everything when DOM is ready
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  PageLoader.init();
  NavbarFX.init();
  PageTransition.init();
  ActiveNav.init();
  MobileMenu.init();
  SmoothScroll.init();
  MapView.init();
  DestinationFilter.init();
  FeaturedScroller.init();
  ScrollReveal.init();
  LiveSearch.init();
  Modal.init();
  Newsletter.init();
  MicroInteractions.init();
  BackToTop.init();
  LuxuryFilters.init();
  WishlistReviews.init();
  BookBtn.init();
});