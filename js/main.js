// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile Nav
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
mobileToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Scroll Reveal (IntersectionObserver)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Lightweight Video Modal (prevents third-party iframe slowdowns on initial load)
const reelModal = document.getElementById('reelModal');
const reelFrame = document.getElementById('reelFrame');
// Replace with the real YouTube or Vimeo embed URL.
const SHOWREEL_EMBED_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';

document.getElementById('openReelBtn').addEventListener('click', () => {
  reelFrame.src = SHOWREEL_EMBED_URL;
  reelModal.classList.add('open');
  reelModal.setAttribute('aria-hidden', 'false');
});

function closeModal() {
  reelModal.classList.remove('open');
  reelModal.setAttribute('aria-hidden', 'true');
  reelFrame.src = '';
}

document.getElementById('closeReelBtn').addEventListener('click', closeModal);
reelModal.addEventListener('click', (e) => {
  if (e.target === reelModal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && reelModal.classList.contains('open')) closeModal();
});

// Bilingual ES / EN Dictionary
const i18n = {
  es: {
    nav_home: 'Inicio',
    nav_corp: 'Corporativo',
    nav_social: 'Sociales',
    nav_about: 'Sobre mí',
    nav_brands: 'Marcas',
    nav_contact: 'Contacto',
    nav_quote: 'Cotizar',
    hero_tag: 'PRODUCTORA AUDIOVISUAL & FOTOGRAFÍA',
    hero_title: 'Producción audiovisual y fotografía para marcas, empresas y momentos inolvidables.',
    hero_sub: 'Portafolios especializados en contenido corporativo y eventos sociales, organizados por segmento para que cada cliente encuentre exactamente lo que busca.',
    cta_corp: 'Explorar Corporativo →',
    cta_social: 'Explorar Sociales →',
    cta_wa: 'WhatsApp Directo',
    watch_reel: 'Ver Showreel General (01:30)',
    seg_tag: 'DOS UNIVERSOS ESPECIALIZADOS',
    seg_title: 'Elige el portafolio diseñado para tu proyecto.',
    seg_desc: 'Separamos nuestro trabajo comercial de nuestra cobertura de eventos personales para ofrecerte una experiencia clara, directa y relevante.',
    corp_card_title: 'Corporativo & Comercial',
    corp_card_desc: 'Contenido audiovisual estratégico para empresas, marcas, restaurantes, desarrollos inmobiliarios y campañas digitales.',
    cat_inst: 'Institucionales',
    cat_comm: 'Comerciales',
    cat_reels: 'Reels Verticales',
    cat_drone: 'Dron',
    cat_real: 'Inmobiliaria',
    cat_prod: 'Fotografía de Producto',
    corp_btn: 'Ver portafolio corporativo',
    soc_card_title: 'Sociales & Celebraciones',
    soc_card_desc: 'Cobertura cinematográfica en video y fotografía para bodas, 15 años y celebraciones familiares contadas con emoción y detalle.',
    cat_wed: 'Bodas',
    cat_15: '15 Años',
    cat_bday: 'Cumpleaños',
    cat_mat: 'Embarazo',
    cat_prop: 'Pedidas',
    soc_btn: 'Ver portafolio social',
    brands_tag: 'CONFIANZA COMERCIAL',
    brands_title: 'Marcas y empresas que han confiado en nuestro trabajo.',
    brands_all: 'Ver todas las marcas →',
    about_tag: 'DETRÁS DE TOTAL MEDIA',
    about_title: 'Narrativa visual, técnica cinematográfica y dirección enfocada en resultados.',
    about_text: 'Soy Enrique Turcios, productor audiovisual y fotógrafo. Total Media nace de años de experiencia en producción, dirección y edición, creando piezas visuales que conectan con marcas, empresas y momentos irrepetibles.',
    about_btn: 'Conoce mi historia y equipo →',
    stat_1: 'Proyectos audiovisuales y fotográficos entregados',
    stat_2: 'Años de experiencia en producción y edición',
    stat_3: 'Flujo de trabajo cinematográfico y dron',
    stat_4: 'Portafolios dedicados: Corporativo y Social',
    cta_tag: 'INICIEMOS TU PROYECTO',
    cta_title: '¿Buscas video o fotografía para tu marca o tu evento?',
    cta_desc: 'Cuéntanos qué necesitas y te compartimos propuestas y ejemplos específicos de nuestro portafolio.',
    cta_btn_wa: 'Cotizar por WhatsApp',
    cta_btn_form: 'Formulario de contacto'
  },
  en: {
    nav_home: 'Home',
    nav_corp: 'Corporate',
    nav_social: 'Social Events',
    nav_about: 'About',
    nav_brands: 'Brands',
    nav_contact: 'Contact',
    nav_quote: 'Get a Quote',
    hero_tag: 'VIDEO PRODUCTION & PHOTOGRAPHY STUDIO',
    hero_title: 'Video production and photography for brands, businesses, and unforgettable milestones.',
    hero_sub: 'Specialized portfolios for corporate content and social events—segmented by client type so you only see work tailored to your project.',
    cta_corp: 'Explore Corporate →',
    cta_social: 'Explore Social Events →',
    cta_wa: 'Direct WhatsApp',
    watch_reel: 'Watch General Showreel (01:30)',
    seg_tag: 'TWO SPECIALIZED WORLDS',
    seg_title: 'Choose the portfolio built for your needs.',
    seg_desc: 'We keep our commercial brand productions completely separate from personal event coverage for a focused, distraction-free experience.',
    corp_card_title: 'Corporate & Commercial',
    corp_card_desc: 'Strategic video and photography for brands, companies, restaurants, real estate developments, and digital campaigns.',
    cat_inst: 'Brand Films',
    cat_comm: 'Commercials',
    cat_reels: 'Vertical Reels',
    cat_drone: 'Drone Aerials',
    cat_real: 'Real Estate',
    cat_prod: 'Product Photography',
    corp_btn: 'View corporate portfolio',
    soc_card_title: 'Social & Celebrations',
    soc_card_desc: 'Cinematic video and photography coverage for weddings, quinceañeras, and family milestones told with emotion and craft.',
    cat_wed: 'Weddings',
    cat_15: 'Quinceañeras',
    cat_bday: 'Birthdays',
    cat_mat: 'Maternity',
    cat_prop: 'Proposals',
    soc_btn: 'View social portfolio',
    brands_tag: 'TRUSTED BY BRANDS',
    brands_title: 'Companies and brands that have trusted our visual work.',
    brands_all: 'View all brands →',
    about_tag: 'BEHIND TOTAL MEDIA',
    about_title: 'Visual storytelling, cinema craft, and results-driven direction.',
    about_text: 'I am Enrique Turcios, video producer and photographer. Total Media was built on years of production, directing, and editing experience—crafting visual pieces that connect with brands and once-in-a-lifetime moments.',
    about_btn: 'Meet the founder & crew →',
    stat_1: 'Video & photography projects delivered',
    stat_2: 'Years of production & post-production experience',
    stat_3: 'Cinema-grade workflow & aerial drone coverage',
    stat_4: 'Dedicated portfolios: Corporate & Social',
    cta_tag: 'START YOUR PROJECT',
    cta_title: 'Looking for video or photography for your brand or event?',
    cta_desc: 'Tell us about your project and we will send tailored portfolio examples and a custom quote.',
    cta_btn_wa: 'Quote via WhatsApp',
    cta_btn_form: 'Contact form'
  }
};

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
  });
});
