(function () {
  const slug = document.body.dataset.page;
  if (!slug) return;
  const BASE = window.SITE_BASE || '.';

  const order = {
    corporativo: ['institucionales', 'comerciales', 'reels-verticales', 'motion-graphics', 'drone', 'inmobiliaria', 'fotografia-producto'],
    sociales: ['bodas', '15-anios', 'cumpleanos', 'embarazo', 'baby-shower', 'pedidas-de-matrimonio', 'revelacion-de-genero', 'cumpleanos-de-bebe', 'newborn', 'sesiones-personales']
  };

  function mediaSrc(path) {
    if (!path) return '';
    if (/^(https?:|data:)/.test(path)) return path;
    const clean = String(path).replace(/^\//, '').replace(/^total-media-site\//, '');
    return `${BASE}/${clean}`;
  }

  function toEmbed(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.href);
      const host = parsed.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') {
        const id = parsed.pathname.split('/').filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsed.pathname.startsWith('/embed/')) return url;
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
      }
      if (host === 'vimeo.com') {
        const id = parsed.pathname.split('/').filter(Boolean).pop();
        return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : url;
      }
      if (host === 'facebook.com' || host === 'fb.watch') {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(parsed.href)}&show_text=false&width=1280`;
      }
    } catch (error) {
      return url;
    }
    return url;
  }

  function photosOf(page) {
    if (!Array.isArray(page.photos)) return [];
    return page.photos.map((entry) => (typeof entry === 'string' ? entry : entry && entry.image)).filter(Boolean);
  }

  function openVideo(url) {
    const frame = document.getElementById('reelFrame');
    const image = document.getElementById('reelImage');
    const modal = document.getElementById('reelModal');
    if (!frame || !modal) return;
    if (image) image.hidden = true;
    frame.hidden = false;
    frame.src = toEmbed(url);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function openPhoto(src, alt) {
    const frame = document.getElementById('reelFrame');
    const image = document.getElementById('reelImage');
    const modal = document.getElementById('reelModal');
    if (!image || !modal) return;
    if (frame) {
      frame.src = '';
      frame.hidden = true;
    }
    image.hidden = false;
    image.src = src;
    image.alt = alt || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function videoCard(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'piece-card';
    const id = (item.url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1];
    if (id) {
      const image = document.createElement('img');
      image.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      image.alt = item.title || '';
      button.appendChild(image);
    }
    const meta = document.createElement('div');
    meta.className = 'piece-meta';
    const label = document.createElement('span');
    label.className = 'mono-tag';
    label.textContent = item.type === 'reel' ? 'Reel' : 'Video';
    const title = document.createElement('h3');
    title.textContent = item.title || 'Video';
    meta.append(label, title);
    button.appendChild(meta);
    button.addEventListener('click', () => openVideo(item.url));
    return button;
  }

  function section(title, nodes) {
    if (!nodes.length) return null;
    const block = document.createElement('div');
    block.className = 'media-block';
    const heading = document.createElement('h2');
    heading.textContent = title;
    const grid = document.createElement('div');
    grid.className = 'portfolio-grid';
    nodes.forEach((node) => grid.appendChild(node));
    block.append(heading, grid);
    return block;
  }

  function extrasFromPortfolio(page, pieces) {
    const matches = pieces.filter((item) => {
      if (page.layout === 'segment') return item.segment === page.group;
      return item.category === page.slug;
    });
    const videos = matches
      .filter((item) => item.video_url)
      .map((item) => ({ title: item.title, url: item.video_url, type: 'largo' }));
    const photos = matches.flatMap((item) => {
      if (!Array.isArray(item.gallery)) return [];
      return item.gallery.map((entry) => (typeof entry === 'string' ? entry : entry && entry.image)).filter(Boolean);
    });
    return { videos, photos };
  }

  function render(page, pages, site, pieces) {
    const root = document.getElementById('pageRoot');
    if (!root || !page) return;
    document.title = `${page.title} | Total Media`;
    root.replaceChildren();

    const eyebrow = document.createElement('span');
    eyebrow.className = 'mono-tag';
    eyebrow.textContent = page.eyebrow || '';
    const title = document.createElement('h1');
    title.textContent = page.title || '';
    const intro = document.createElement('p');
    intro.className = 'section-lead';
    intro.textContent = page.intro || '';
    root.append(eyebrow, title, intro);

    if (page.reel_url) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-primary';
      button.textContent = 'Ver reel';
      button.addEventListener('click', () => openVideo(page.reel_url));
      root.appendChild(button);
    }

    if (page.layout === 'segment') {
      const cards = document.createElement('div');
      cards.className = 'category-grid';
      (order[page.group] || []).forEach((key) => {
        const child = pages.find((item) => item.slug === key);
        if (!child) return;
        const link = document.createElement('a');
        link.className = 'category-card';
        link.href = `${BASE}/${child.slug}`;
        const name = document.createElement('h3');
        name.textContent = child.title;
        const text = document.createElement('p');
        text.textContent = child.summary || '';
        link.append(name, text);
        cards.appendChild(link);
      });
      root.appendChild(cards);
    }

    const extra = extrasFromPortfolio(page, pieces);
    const videos = (Array.isArray(page.videos) ? page.videos.filter((item) => item && item.url) : []).concat(extra.videos);
    const longVideos = videos.filter((item) => item.type !== 'reel');
    const reels = videos.filter((item) => item.type === 'reel');
    [section('Videos', longVideos.map(videoCard)), section('Reels', reels.map(videoCard))].forEach((block) => {
      if (block) root.appendChild(block);
    });

    const photos = photosOf(page).concat(extra.photos);
    if (photos.length) {
      const block = document.createElement('div');
      block.className = 'media-block';
      const heading = document.createElement('h2');
      heading.textContent = page.layout === 'brands' ? 'Logos' : 'Fotografías';
      const grid = document.createElement('div');
      grid.className = 'photo-grid';
      photos.forEach((src) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'photo-button';
        const image = document.createElement('img');
        image.src = mediaSrc(src);
        image.alt = page.title || '';
        button.appendChild(image);
        button.addEventListener('click', () => openPhoto(image.src, image.alt));
        grid.appendChild(button);
      });
      block.append(heading, grid);
      root.appendChild(block);
    }

    if (page.layout === 'brands' && site && Array.isArray(site.brands) && site.brands.length) {
      const grid = document.createElement('div');
      grid.className = 'brands-grid';
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
      root.appendChild(grid);
    }

    if (Array.isArray(page.collaborators) && page.collaborators.length) {
      const block = document.createElement('div');
      block.className = 'media-block';
      const heading = document.createElement('h2');
      heading.textContent = 'Colaboradores';
      const grid = document.createElement('div');
      grid.className = 'category-grid';
      page.collaborators.forEach((person) => {
        const card = document.createElement('article');
        card.className = 'category-card';
        const name = document.createElement('h3');
        name.textContent = person.name || '';
        const role = document.createElement('p');
        role.textContent = [person.role, person.bio].filter(Boolean).join(' — ');
        card.append(name, role);
        grid.appendChild(card);
      });
      block.append(heading, grid);
      root.appendChild(block);
    }

    if (Array.isArray(page.sisters) && page.sisters.length) {
      const block = document.createElement('div');
      block.className = 'media-block';
      const heading = document.createElement('h2');
      heading.textContent = 'Empresas hermanas';
      const grid = document.createElement('div');
      grid.className = 'category-grid';
      page.sisters.forEach((company) => {
        const card = document.createElement('article');
        card.className = 'category-card';
        const name = document.createElement('h3');
        name.textContent = company.name || '';
        const text = document.createElement('p');
        text.textContent = company.description || '';
        card.append(name, text);
        if (company.url) {
          const link = document.createElement('a');
          link.href = company.url;
          link.textContent = 'Visitar';
          link.target = '_blank';
          link.rel = 'noopener';
          card.appendChild(link);
        }
        grid.appendChild(card);
      });
      block.append(heading, grid);
      root.appendChild(block);
    }

    if (page.layout === 'contact' || page.phone || page.email) {
      const block = document.createElement('div');
      block.className = 'media-block';
      const links = document.createElement('div');
      links.className = 'footer-links';
      const number = (site && site.whatsapp) || page.phone || '';
      if (number) {
        const whatsapp = document.createElement('a');
        whatsapp.href = `https://wa.me/${String(number).replace(/[^\d]/g, '')}`;
        whatsapp.target = '_blank';
        whatsapp.rel = 'noopener';
        whatsapp.textContent = 'WhatsApp';
        links.appendChild(whatsapp);
      }
      [['Correo', page.email, page.email && `mailto:${page.email}`], ['Instagram', 'Instagram', page.instagram], ['TikTok', 'TikTok', page.tiktok], ['YouTube', 'YouTube', page.youtube], ['Facebook', 'Facebook', page.facebook]].forEach(([label, text, href]) => {
        if (!href) return;
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label === 'Correo' ? page.email : text;
        if (!href.startsWith('mailto:')) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
        links.appendChild(link);
      });
      block.appendChild(links);

      if (page.layout === 'contact') {
        const form = document.createElement('form');
        form.className = 'contact-form';
        form.innerHTML = `
          <input name="nombre" placeholder="Nombre" required />
          <input name="telefono" placeholder="Teléfono" required />
          <input name="correo" type="email" placeholder="Correo" required />
          <select name="servicio">
            <option>Corporativo</option>
            <option>Bodas</option>
            <option>15 años</option>
            <option>Otro evento social</option>
          </select>
          <input name="fecha" type="date" />
          <textarea name="mensaje" rows="5" placeholder="Mensaje" required></textarea>
          <button class="btn btn-primary" type="submit">Enviar por WhatsApp</button>
        `;
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          const data = new FormData(form);
          const text = [
            `Nombre: ${data.get('nombre')}`,
            `Teléfono: ${data.get('telefono')}`,
            `Correo: ${data.get('correo')}`,
            `Servicio: ${data.get('servicio')}`,
            data.get('fecha') ? `Fecha: ${data.get('fecha')}` : '',
            `Mensaje: ${data.get('mensaje')}`
          ].filter(Boolean).join('\n');
          const wa = String((site && site.whatsapp) || page.phone || '').replace(/[^\d]/g, '');
          window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        });
        block.appendChild(form);
      }
      root.appendChild(block);
    }
  }

  Promise.all([
    fetch(`${BASE}/content/pages.json`, { cache: 'no-store' }).then((response) => response.json()),
    fetch(`${BASE}/content/site.json`, { cache: 'no-store' }).then((response) => response.json()).catch(() => ({})),
    fetch(`${BASE}/content/portfolio.json`, { cache: 'no-store' }).then((response) => response.json()).catch(() => [])
  ]).then(([pages, site, portfolio]) => {
    const list = Array.isArray(pages) ? pages : [];
    render(list.find((page) => page.slug === slug), list, site, Array.isArray(portfolio) ? portfolio : []);
  }).catch(() => {
    const root = document.getElementById('pageRoot');
    if (root) root.textContent = 'No se pudo cargar esta página.';
  });
})();
