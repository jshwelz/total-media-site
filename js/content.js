(function () {
  const BASE = window.SITE_BASE || '.';

  function mediaSrc(path) {
    if (!path) return '';
    if (/^(https?:|data:)/.test(path)) return path;
    const clean = String(path).replace(/^\//, '').replace(/^total-media-site\//, '');
    return `${BASE}/${clean}`.replace(/([^:])\/{2,}/g, '$1/');
  }

  function watchUrl(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.href);
      const host = parsed.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') {
        const id = parsed.pathname.split('/').filter(Boolean)[0];
        return id ? `https://www.youtube.com/watch?v=${id}` : url;
      }
      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        const embedId = parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/').filter(Boolean)[1] : '';
        const id = parsed.searchParams.get('v') || embedId;
        return id ? `https://www.youtube.com/watch?v=${id}` : parsed.toString();
      }
      if (host === 'player.vimeo.com') {
        const id = parsed.pathname.split('/').filter(Boolean).pop();
        return id ? `https://vimeo.com/${id}` : url;
      }
      if (host === 'facebook.com' && parsed.pathname.startsWith('/plugins/video.php')) {
        return parsed.searchParams.get('href') || url;
      }
      return parsed.toString();
    } catch (error) {
      return url;
    }
  }

  function applyHome(site) {
    if (site.hero_poster) {
      const video = document.querySelector('#inicio video');
      if (video) video.poster = mediaSrc(site.hero_poster);
    }

    if (site.showreel_url) {
      const showreel = site.showreel_url.trim();
      window.TotalMedia = window.TotalMedia || {};
      if (/\.mp4($|\?)/i.test(showreel)) {
        const video = document.querySelector('#inicio video');
        const src = mediaSrc(showreel);
        window.TotalMedia.showreelUrl = src;
        if (video && !video.querySelector('source')) {
          const source = document.createElement('source');
          source.src = src;
          source.type = 'video/mp4';
          video.appendChild(source);
          video.load();
        }
      } else {
        window.TotalMedia.showreelUrl = watchUrl(showreel);
      }
    }

    if (site.whatsapp) {
      const number = String(site.whatsapp).replace(/[^\d]/g, '');
      document.querySelectorAll('a[href*="wa.me/"]').forEach((link) => {
        link.href = `https://wa.me/${number}`;
      });
    }

    const covers = {
      corporativo: site.corporativo_cover,
      sociales: site.sociales_cover
    };
    Object.entries(covers).forEach(([key, src]) => {
      const image = document.querySelector(`[data-cover="${key}"]`);
      if (image && src) image.src = mediaSrc(src);
    });

    if (Array.isArray(site.stats)) {
      document.querySelectorAll('[data-stat]').forEach((node, index) => {
        const stat = site.stats[index];
        if (stat && stat.value) node.textContent = stat.value;
      });
    }

    if (Array.isArray(site.brands) && site.brands.length) {
      const grid = document.querySelector('[data-brands]');
      if (!grid) return;
      grid.replaceChildren();
      site.brands.forEach((brand) => {
        const cell = document.createElement('div');
        cell.className = 'brand-cell';
        if (brand.logo) {
          const image = document.createElement('img');
          image.src = mediaSrc(brand.logo);
          image.alt = brand.name || '';
          cell.appendChild(image);
        } else {
          cell.textContent = brand.name || '';
        }
        grid.appendChild(cell);
      });
    }
  }

  const categoryLabels = {
    institucionales: 'Institucionales',
    comerciales: 'Comerciales',
    'reels-verticales': 'Reels verticales',
    'motion-graphics': 'Motion graphics',
    drone: 'Dron',
    inmobiliaria: 'Inmobiliaria',
    'fotografia-producto': 'Fotografía de producto',
    bodas: 'Bodas',
    '15-anios': '15 años',
    cumpleanos: 'Cumpleaños',
    embarazo: 'Embarazo',
    'baby-shower': 'Baby shower',
    'pedidas-de-matrimonio': 'Pedidas',
    newborn: 'Newborn'
  };

  function galleryImages(item) {
    if (!Array.isArray(item.gallery)) return [];
    return item.gallery.map((entry) => (typeof entry === 'string' ? entry : entry && entry.image)).filter(Boolean);
  }

  function renderPortfolio(items) {
    const segment = document.body.dataset.portfolio;
    if (!segment) return;
    const grid = document.getElementById('portfolioGrid');
    const empty = document.getElementById('portfolioEmpty');
    const filters = document.getElementById('portfolioFilters');
    if (!grid) return;

    const pieces = items.filter((item) => item && item.segment === segment);
    const categories = [...new Set(pieces.map((item) => item.category).filter(Boolean))];

    function paint(active) {
      const visible = active ? pieces.filter((item) => item.category === active) : pieces;
      grid.replaceChildren();
      if (empty) empty.hidden = visible.length > 0;
      visible.forEach((item) => {
        const card = document.createElement(item.video_url ? 'a' : 'article');
        card.className = 'piece-card';
        if (item.video_url) {
          card.href = watchUrl(item.video_url);
          card.target = '_blank';
          card.rel = 'noopener';
        }
        const cover = item.cover || galleryImages(item)[0];
        if (cover) {
          const image = document.createElement('img');
          image.src = mediaSrc(cover);
          image.alt = item.title || '';
          card.appendChild(image);
        }
        const meta = document.createElement('div');
        meta.className = 'piece-meta';
        const label = document.createElement('span');
        label.className = 'mono-tag';
        label.textContent = categoryLabels[item.category] || item.category || '';
        const title = document.createElement('h3');
        title.textContent = item.title || '';
        meta.append(label, title);
        card.appendChild(meta);
        grid.appendChild(card);
      });
    }

    if (filters) {
      filters.replaceChildren();
      const makeChip = (id, text) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chip';
        button.dataset.category = id;
        button.textContent = text;
        button.addEventListener('click', () => {
          filters.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('is-active', chip === button));
          paint(id);
        });
        return button;
      };
      const all = makeChip('', 'Todas');
      all.classList.add('is-active');
      filters.appendChild(all);
      categories.forEach((category) => {
        filters.appendChild(makeChip(category, categoryLabels[category] || category));
      });
    }

    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    const initial = categories.includes(hash) ? hash : '';
    filters?.querySelectorAll('.chip').forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.category === initial);
    });
    paint(initial);
  }

  async function loadJson(path) {
    const response = await fetch(`${BASE}/${path}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(path);
    return response.json();
  }

  loadJson('content/site.json').then(applyHome).catch(() => {});
  if (document.body.dataset.portfolio) {
    loadJson('content/portfolio.json').then((items) => renderPortfolio(Array.isArray(items) ? items : [])).catch(() => {});
  }
})();
