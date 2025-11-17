// Minimal client-side renderer: i18n, data loading, homepage/collection/item/shop logic and cart (localStorage)
// This is meant to be a practical starter compatible with GitHub Pages (static hosting).
(async function(){
  const defaultLang = 'en';
  const supported = ['en','sk','de'];
  function qs(key){ return new URLSearchParams(location.search).get(key) }
  function getLang(){
    const q = qs('lang');
    const stored = localStorage.getItem('lang');
    if(q && supported.includes(q)) return q;
    if(stored && supported.includes(stored)) return stored;
    return navigator.language && navigator.language.startsWith('sk') ? 'sk' : (navigator.language && navigator.language.startsWith('de') ? 'de' : defaultLang);
  }
  let lang = getLang();

  // load translations and data
  async function loadJSON(url){ const r = await fetch(url); return r.json() }
  const [t_en, t_sk, t_de, categories, items] = await Promise.all([
    loadJSON('i18n/en.json'),
    loadJSON('i18n/sk.json'),
    loadJSON('i18n/de.json'),
    loadJSON('data/categories.json'),
    loadJSON('data/items.json')
  ]);
  const translations = { en: t_en, sk: t_sk, de: t_de };

  // language switcher
  function applyLang(sel){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const val = translations[sel] && translations[sel][key];
      if(val) el.innerHTML = val;
    });
    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(inp=>{
      const key = inp.getAttribute('data-i18n-placeholder');
      const val = translations[sel] && translations[sel][key];
      if(val) inp.setAttribute('placeholder', val);
    });
    document.title = translations[sel]['site_title'] || document.title;
    // set select values
    document.querySelectorAll('#langSwitcher').forEach(s=>{
      s.value = sel;
      s.addEventListener('change',(e)=>{
        const newLang = e.target.value;
        localStorage.setItem('lang', newLang);
        // preserve query param
        const params = new URLSearchParams(location.search);
        params.set('lang', newLang);
        location.search = params.toString();
      });
    });
  }

  applyLang(lang);

  // Cart (localStorage)
  const CART_KEY = 'antiquebooks_cart_v1';
  function loadCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]') }
  function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)) }
  function addToCart(itemId, qty=1){
    const cart = loadCart();
    const found = cart.find(i=>i.id===itemId);
    if(found) found.qty += qty;
    else cart.push({ id: itemId, qty });
    saveCart(cart);
    renderCartCount();
  }
  function renderCartCount(){
    const count = loadCart().reduce((s,i)=>s+i.qty,0);
    document.getElementById('cartCount') && (document.getElementById('cartCount').innerText = count);
  }
  renderCartCount();

  // Helper: currency format
  function formatCurrency(amount, currency='EUR'){
    return new Intl.NumberFormat(lang, { style:'currency', currency }).format(amount);
  }

  // Render functions
  function renderCard(item){
    const div = document.createElement('div');
    div.className = 'card';
    const img = document.createElement('img');
    img.src = item.images && item.images[0] || 'assets/images/placeholder.jpg';
    img.alt = (item.title[lang]||item.title.en);
    div.appendChild(img);
    const h = document.createElement('h3');
    h.innerText = item.title[lang] || item.title.en;
    div.appendChild(h);
    const p = document.createElement('p');
    p.innerText = item.status === 'sold' ? (translations[lang]['status_sold'] || 'Sold') : formatCurrency(item.price, item.currency);
    div.appendChild(p);
    const a = document.createElement('a');
    // link uses item.html?id=
    a.href = 'item.html?id=' + encodeURIComponent(item.id) + '&lang=' + lang;
    a.innerText = translations[lang]['view'] || 'View';
    a.className = 'btn';
    div.appendChild(a);
    return div;
  }

  // Homepage: featured items
  function renderHomepage(){
    const grid = document.getElementById('featuredGrid');
    if(!grid) return;
    grid.innerHTML = '';
    items.filter(i=>i.featured).forEach(it=>{
      grid.appendChild(renderCard(it));
    });
  }

  // Collection page
  function renderCollection(){
    const catSelect = document.getElementById('categorySelect');
    if(catSelect){
      categories.forEach(c=>{
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.text = c.title[lang] || c.title.en;
        catSelect.appendChild(opt);
      });
      catSelect.addEventListener('change',()=>renderCollectionGrid());
    }
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.addEventListener('input', ()=>renderCollectionGrid());
    if(sortSelect) sortSelect.addEventListener('change',()=>renderCollectionGrid());
    renderCollectionGrid();
  }
  function renderCollectionGrid(){
    const grid = document.getElementById('collectionGrid');
    if(!grid) return;
    const cat = document.getElementById('categorySelect') && document.getElementById('categorySelect').value;
    const sort = document.getElementById('sortSelect') && document.getElementById('sortSelect').value;
    const query = document.getElementById('searchInput') && document.getElementById('searchInput').value.toLowerCase();
    let list = items.slice();
    if(cat) list = list.filter(i=>i.category===cat);
    if(query){
      list = list.filter(i=> (i.title[lang]||i.title.en).toLowerCase().includes(query) || (i.author||'').toLowerCase().includes(query));
    }
    if(sort==='price_asc') list.sort((a,b)=>a.price-b.price);
    if(sort==='price_desc') list.sort((a,b)=>b.price-a.price);
    if(sort==='date_desc') list.sort((a,b)=> (b.year||0)-(a.year||0));
    grid.innerHTML = '';
    list.forEach(i=>grid.appendChild(renderCard(i)));
  }

  // Item page
  function renderItem(){
    const id = qs('id');
    if(!id) return;
    const item = items.find(it=>it.id===id);
    if(!item) return;
    document.getElementById('itemTitle').innerText = item.title[lang]||item.title.en;
    document.getElementById('title').innerText = item.title[lang]||item.title.en;
    document.getElementById('author').innerText = item.author || '';
    document.getElementById('yearPub').innerText = item.year || '';
    document.getElementById('price').innerText = item.status==='sold' ? (translations[lang]['status_sold']||'Sold') : formatCurrency(item.price,item.currency);
    document.getElementById('status').innerText = item.status==='available' ? (translations[lang]['status_available']||'Available') : (translations[lang]['status_sold']||'Sold');
    document.getElementById('description').innerHTML = item.description[lang] || item.description.en || '';
    // images
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '';
    (item.images||[]).forEach(src=>{
      const img = document.createElement('img');
      img.src = src;
      img.alt = item.title[lang]||item.title.en;
      gallery.appendChild(img);
    });
    // buttons
    const addBtn = document.getElementById('addToCartBtn');
    addBtn && addBtn.addEventListener('click', ()=>{
      if(item.status!=='available') { alert(translations[lang]['not_available'] || 'Not available'); return;}
      addToCart(item.id,1);
      alert(translations[lang]['added_to_cart'] || 'Added to cart');
    });
    document.getElementById('inquireBtn') && document.getElementById('inquireBtn').addEventListener('click', ()=>{
      // open contact with prefilled message
      const subject = encodeURIComponent(`Inquiry: ${item.title[lang]||item.title.en}`);
      location.href = `contact.html?subject=${subject}&lang=${lang}`;
    });
  }

  // Shop page - show all items for sale
  function renderShop(){
    const grid = document.getElementById('shopGrid');
    if(!grid) return;
    grid.innerHTML = '';
    items.forEach(i=>grid.appendChild(renderCard(i)));
  }

  // Cart page
  function renderCartPage(){
    const container = document.getElementById('cartItems');
    if(!container) return;
    const cart = loadCart();
    if(cart.length===0){ container.innerHTML = '<p>'+ (translations[lang]['cart_empty']||'Your cart is empty') +'</p>'; document.getElementById('cartSummary') && (document.getElementById('cartSummary').innerHTML=''); return; }
    container.innerHTML = '';
    let total = 0;
    cart.forEach(ci=>{
      const it = items.find(x=>x.id===ci.id);
      const row = document.createElement('div');
      row.className = 'card';
      row.innerHTML = `<h3>${it.title[lang]||it.title.en}</h3><p>${formatCurrency(it.price,it.currency)} × ${ci.qty}</p>`;
      const remove = document.createElement('button'); remove.innerText = translations[lang]['remove'] || 'Remove'; remove.className='btn';
      remove.addEventListener('click', ()=>{
        const newCart = loadCart().filter(x=>x.id!==ci.id); saveCart(newCart); renderCartPage(); renderCartCount();
      });
      row.appendChild(remove);
      container.appendChild(row);
      total += it.price * ci.qty;
    });
    document.getElementById('cartSummary').innerHTML = `<h3>${translations[lang]['total']||'Total'}: ${formatCurrency(total,'EUR')}</h3>`;
  }

  // Wire up rendering based on page
  const path = location.pathname.split('/').pop();
  if(path === '' || path === 'index.html') renderHomepage();
  if(path === 'collection.html') renderCollection();
  if(path === 'item.html') renderItem();
  if(path === 'shop.html') renderShop();
  if(path === 'cart.html') renderCartPage();

  // run page-agnostic tasks
  // apply language from ?lang param if present
  if(qs('lang') && supported.includes(qs('lang'))){
    lang = qs('lang');
    applyLang(lang);
  }
  // add some missing translation keys with defaults
  ['view','added_to_cart','status_sold','status_available','not_available','cart_empty','remove','total'].forEach(k=>{
    translations.en[k] = translations.en[k] || (k.replace(/_/g,' '));
  });

  // contact form / newsletter placeholders (no-op - in production hook to service)
  document.getElementById('newsletterForm') && document.getElementById('newsletterForm').addEventListener('submit', e=>{
    e.preventDefault(); alert(translations[lang]['footer_subscribe'] + ' — ' + document.getElementById('newsletterEmail').value);
  });
  document.getElementById('contactForm') && document.getElementById('contactForm').addEventListener('submit', e=>{
    e.preventDefault(); alert(translations[lang]['send'] + ' — ' + (new FormData(e.target)).get('email'));
  });
  document.getElementById('checkoutForm') && document.getElementById('checkoutForm').addEventListener('submit', e=>{
    e.preventDefault(); alert(translations[lang]['checkout_notice']);
    // In production: send order to server or create checkout session with Stripe/Shopify.
  });

})();
