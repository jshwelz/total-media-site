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

  function watchLabel(url) {
    try {
      const host = new URL(url, window.location.href).hostname.replace(/^www\./, '');
      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') return 'Ver en YouTube';
      if (host === 'facebook.com' || host === 'fb.watch') return 'Ver en Facebook';
      if (host === 'vimeo.com' || host === 'player.vimeo.com') return 'Ver en Vimeo';
    } catch (error) {
      return 'Ver video';
    }
    return 'Ver video';
  }

  function photosOf(page) {
    if (!Array.isArray(page.photos)) return [];
    return page.photos.map((entry) => (typeof entry === 'string' ? entry : entry && entry.image)).filter(Boolean);
  }

  function openPhoto(src, alt) {
    const frame = document.getElementById('reelFrame');
    const image = document.getElementById('reelImage');
    const modal = document.getElementById('reelModal');
    if (!image || !modal) return;
    if (frame) {
      frame.src = 'about:blank';
      frame.hidden = true;
    }
    image.hidden = false;
    image.src = src;
    image.alt = alt || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function profileLink(url) {
    if (!url) return '';
    try {
      const path = new URL(url).pathname.replace(/\/+$/, '');
      return path ? url : '';
    } catch (error) {
      return '';
    }
  }

  function filmCard(item) {
    const link = document.createElement('a');
    link.className = 'film-card';
    link.href = watchUrl(item.url);
    link.target = '_blank';
    link.rel = 'noopener';
    const thumb = document.createElement('span');
    thumb.className = 'film-thumb';
    const id = (item.url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1];
    if (id) {
      const image = document.createElement('img');
      image.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      image.alt = '';
      thumb.appendChild(image);
    }
    const play = document.createElement('span');
    play.className = 'film-play';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '▶';
    thumb.appendChild(play);
    const meta = document.createElement('span');
    meta.className = 'film-meta';
    const title = document.createElement('p');
    title.textContent = item.title || 'Video';
    const where = document.createElement('span');
    where.textContent = watchLabel(item.url).replace('Ver en ', '');
    meta.append(title, where);
    link.append(thumb, meta);
    return link;
  }

  function videoCard(item) {
    const link = document.createElement('a');
    link.className = 'piece-card';
    link.href = watchUrl(item.url);
    link.target = '_blank';
    link.rel = 'noopener';
    const id = (item.url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1];
    if (id) {
      const image = document.createElement('img');
      image.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      image.alt = item.title || '';
      link.appendChild(image);
    }
    const meta = document.createElement('div');
    meta.className = 'piece-meta';
    const label = document.createElement('span');
    label.className = 'mono-tag';
    label.textContent = item.type === 'reel' ? 'Reel' : 'Video';
    const title = document.createElement('h3');
    title.textContent = item.title || 'Video';
    const hint = document.createElement('span');
    hint.className = 'watch-hint';
    hint.textContent = `${watchLabel(item.url)} ↗`;
    meta.append(label, title, hint);
    link.appendChild(meta);
    return link;
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
      const link = document.createElement('a');
      link.className = 'btn btn-primary';
      link.href = watchUrl(page.reel_url);
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Ver reel';
      root.appendChild(link);
    }

    if (page.layout === 'segment') {
      const listed = order[page.group] || [];
      const extraKeys = pages
        .filter((item) => item.group === page.group && item.layout === 'category' && !listed.includes(item.slug))
        .map((item) => item.slug);
      const spans = {
        bodas: 'tile-lg',
        '15-anios': 'tile-tall',
        'sesiones-personales': 'tile-wide',
        institucionales: 'tile-lg',
        comerciales: 'tile-tall',
        'fotografia-producto': 'tile-wide'
      };
      const cards = document.createElement('div');
      cards.className = 'social-mosaic';
      listed.concat(extraKeys).forEach((key) => {
        const child = pages.find((item) => item.slug === key);
        if (!child) return;
        const link = document.createElement('a');
        link.href = `${BASE}/${child.slug}`;
        link.className = `social-tile ${spans[child.slug] || ''}`.trim();
        const cover = photosOf(child)[0];
        if (cover) {
          const image = document.createElement('img');
          image.src = mediaSrc(cover);
          image.alt = child.card_title || child.title;
          link.appendChild(image);
        }
        const shade = document.createElement('span');
        shade.className = 'tile-shade';
        const copy = document.createElement('span');
        copy.className = 'tile-copy';
        const name = document.createElement('h2');
        name.textContent = child.card_title || child.title;
        copy.appendChild(name);
        if (child.summary) {
          const line = document.createElement('p');
          line.textContent = child.summary;
          copy.appendChild(line);
        }
        const arrow = document.createElement('span');
        arrow.className = 'tile-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';
        link.append(shade, copy, arrow);
        cards.appendChild(link);
      });
      root.appendChild(cards);
    }

    const extra = extrasFromPortfolio(page, pieces);
    const videos = (Array.isArray(page.videos) ? page.videos.filter((item) => item && item.url) : []).concat(extra.videos);
    const photos = photosOf(page).concat(extra.photos);
    const showcase = page.layout === 'segment';
    const filmTitle = page.slug === 'corporativo' ? 'Piezas y recaps' : 'Películas y mejores momentos';

    if (showcase) {
      if (videos.length) {
        const block = document.createElement('div');
        block.className = 'media-block';
        const kicker = document.createElement('p');
        kicker.className = 'section-kicker';
        kicker.textContent = '03 // VIDEOS';
        const heading = document.createElement('h2');
        heading.textContent = filmTitle;
        const grid = document.createElement('div');
        grid.className = 'film-grid';
        videos.forEach((item) => grid.appendChild(filmCard(item)));
        block.append(kicker, heading, grid);
        root.appendChild(block);
      }
    } else {
      const longVideos = videos.filter((item) => item.type !== 'reel');
      const reels = videos.filter((item) => item.type === 'reel');
      [section('Videos', longVideos.map(videoCard)), section('Reels', reels.map(videoCard))].forEach((block) => {
        if (block) root.appendChild(block);
      });
    }

    if (photos.length) {
      const block = document.createElement('div');
      block.className = 'media-block';
      if (showcase) {
        const kicker = document.createElement('p');
        kicker.className = 'section-kicker';
        kicker.textContent = '04 // FOTOGRAFÍAS';
        block.appendChild(kicker);
      }
      const heading = document.createElement('h2');
      heading.textContent = page.layout === 'brands' ? 'Logos' : 'Fotografías';
      const grid = document.createElement('div');
      grid.className = showcase ? 'photo-grid social-photos' : 'photo-grid';
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
      block.append(...(showcase ? [grid] : [heading, grid]));
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

    if (page.layout === 'segment') {
      const corporate = page.slug === 'corporativo';
      const cta = document.createElement('div');
      cta.className = 'social-cta';
      const copy = document.createElement('div');
      const heading = document.createElement('h2');
      heading.textContent = corporate ? '¿Listo para el próximo proyecto?' : '¿Lista para guardar tu evento?';
      const text = document.createElement('p');
      text.textContent = corporate
        ? 'Cuéntanos la fecha, la ciudad y el tipo de pieza. Te compartimos disponibilidad y paquetes.'
        : 'Cuéntanos la fecha, la ciudad y el tipo de evento. Te compartimos disponibilidad y paquetes.';
      const actions = document.createElement('div');
      actions.className = 'cta-actions';
      const quote = document.createElement('a');
      quote.className = 'btn btn-primary';
      quote.href = `${BASE}/contacto`;
      quote.textContent = corporate ? 'Cotizar mi proyecto' : 'Cotizar mi evento';
      actions.appendChild(quote);
      const contactPage = pages.find((item) => item.slug === 'contacto');
      const more = profileLink(page.instagram) || profileLink(contactPage && contactPage.facebook);
      if (more) {
        const link = document.createElement('a');
        link.className = 'btn btn-outline';
        link.href = more;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Ver más trabajo';
        actions.appendChild(link);
      }
      const number = (site && site.whatsapp) || '';
      if (number) {
        const whatsapp = document.createElement('a');
        whatsapp.className = 'btn btn-outline';
        whatsapp.href = `https://wa.me/${String(number).replace(/[^\d]/g, '')}`;
        whatsapp.target = '_blank';
        whatsapp.rel = 'noopener';
        whatsapp.textContent = 'WhatsApp';
        actions.appendChild(whatsapp);
      }
      copy.append(heading, text, actions);
      const points = document.createElement('ul');
      points.className = 'social-points';
      (corporate
        ? ['Video, foto y reels para tu marca', 'Entrega en 3 a 4 semanas', 'Cobertura en toda la república']
        : ['Cobertura en foto y video', 'Entrega en 3 a 4 semanas', 'Cobertura en toda la república']
      ).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        points.appendChild(li);
      });
      cta.append(copy, points);
      root.appendChild(cta);
    } else if (page.layout === 'segment' || page.layout === 'category') {
      const cta = document.createElement('div');
      cta.className = 'page-cta';
      const heading = document.createElement('h2');
      heading.textContent = 'Cotiza tu evento';
      const text = document.createElement('p');
      text.textContent = 'Cuéntanos la fecha y el tipo de cobertura.';
      const actions = document.createElement('div');
      actions.className = 'cta-actions';
      const quote = document.createElement('a');
      quote.className = 'btn btn-primary';
      quote.href = `${BASE}/contacto`;
      quote.textContent = 'Cotiza tu evento';
      actions.appendChild(quote);
      const number = (site && site.whatsapp) || page.phone || '';
      if (number) {
        const whatsapp = document.createElement('a');
        whatsapp.className = 'btn btn-outline';
        whatsapp.href = `https://wa.me/${String(number).replace(/[^\d]/g, '')}`;
        whatsapp.target = '_blank';
        whatsapp.rel = 'noopener';
        whatsapp.textContent = 'WhatsApp';
        actions.appendChild(whatsapp);
      }
      cta.append(heading, text, actions);
      root.appendChild(cta);
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
