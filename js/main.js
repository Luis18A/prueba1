/* ==========================================================================
   EXPOJUY 2026 - MAIN JAVASCRIPT ENGINE & I18N SYSTEM FOR INTERNATIONAL INVESTORS
   ========================================================================== */

let currentLang = localStorage.getItem('expojuy_lang') || localStorage.getItem('lang') || 'es';

const HEADER_FALLBACK = `<header class="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_4px_20px_-2px_rgba(17,24,39,0.05),0_2px_6px_-1px_rgba(17,24,39,0.02)]">
  <div class="h-20 max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between gap-space-md">
    <a class="flex items-center gap-space-xs focus:outline-none cursor-pointer" href="home.html">
      <div class="px-space-sm py-space-xs rounded-xl bg-surface-container-low flex flex-col justify-center">
        <span class="font-headline-sm text-headline-sm text-primary-container leading-none tracking-tight">EXPOJUY 2026</span>
        <span class="font-caption text-caption text-primary tracking-wider mt-1 uppercase">9-12 OCT 2026 · CIUDAD CULTURAL</span>
      </div>
    </a>
    <nav class="hidden xl:flex items-center gap-space-lg">
      <a class="nav-link font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="home.html">La Expo</a>
      <a class="nav-link font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="b2b.html">Vinculate B2B</a>
      <a class="nav-link font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="expositores.html">Expositores</a>
      <a class="nav-link font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="agenda.html">Agenda</a>
      <a class="nav-link font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="visita.html">Visitá</a>
    </nav>
    <div class="flex items-center gap-space-sm">
      <div class="flex items-center bg-surface-container-low rounded-full p-space-xxs">
        <button id="btn-lang-es" class="px-space-xs py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-[0_1px_4px_rgba(0,0,0,0.06)]" type="button">ES</button>
        <button id="btn-lang-en" class="px-space-xs py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">EN</button>
      </div>
      <a class="hidden sm:inline-flex items-center justify-center h-12 px-space-lg rounded-full bg-primary-container hover:bg-secondary transition-all text-on-primary font-label-lg text-label-lg shadow-[0_4px_14px_rgba(115,13,217,0.3)]" href="visita.html">Comprar entradas</a>
      <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-on-primary text-[18px]">person</span>
      </div>
    </div>
  </div>
</header>`;

function initApp() {
  highlightActiveNav();
  initLanguageSwitcher();
  initSeamlessNavigation();
  initAccordions();
  initSmoothScroll();

  // Load container elements if present
  loadHeader();
  loadFooter();
  loadInitialMain();

  // Apply language state
  setLanguage(currentLang);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * Carga dinámicamente views/header.html en el contenedor #header-container
 */
function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;

  const tryFetch = (path) => fetch(path).then(res => {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.text();
  });

  tryFetch('views/header.html')
    .catch(() => tryFetch('header.html'))
    .catch(() => tryFetch('../views/header.html'))
    .then(html => {
      headerContainer.innerHTML = html;
      initHeaderEvents();
    })
    .catch(() => {
      headerContainer.innerHTML = HEADER_FALLBACK;
      initHeaderEvents();
    });
}

function initHeaderEvents() {
  highlightActiveNav();
  initLanguageSwitcher();
  initSeamlessNavigation();
  applyTranslations(currentLang);
}

/**
 * Carga dinámicamente views/footer.html en el contenedor #footer-container
 */
function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  const tryFetch = (path) => fetch(path).then(res => {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.text();
  });

  tryFetch('views/footer.html')
    .catch(() => tryFetch('footer.html'))
    .catch(() => tryFetch('../views/footer.html'))
    .then(html => {
      footerContainer.innerHTML = html;
      initSeamlessNavigation();
      applyTranslations(currentLang);
    })
    .catch(e => console.error('No se pudo cargar el footer:', e));
}

/**
 * Carga dinámicamente la vista inicial (views/home.html) en el elemento <main> si está vacío
 */
function loadInitialMain() {
  const mainEl = document.querySelector('main');
  if (!mainEl || mainEl.children.length > 0) return;

  const tryFetch = (path) => fetch(path).then(res => {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.text();
  });

  tryFetch('views/home.html')
    .catch(() => tryFetch('home.html'))
    .catch(() => tryFetch('../views/home.html'))
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main');
      if (newMain) {
        mainEl.innerHTML = newMain.innerHTML;
        initSeamlessNavigation();
        initAccordions();
        initSmoothScroll();
        applyTranslations(currentLang);
      }
    })
    .catch(e => console.error('No se pudo cargar la vista inicial en <main>:', e));
}

/**
 * Navegación fluida sin recargar toda la página (Seamless SPA router)
 */
function initSeamlessNavigation() {
  document.querySelectorAll('header nav a, header a[href], #footer-container a[href]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

      e.preventDefault();
      navigateToPage(href);
    });
  });
}

function navigateToPage(url) {
  const mainEl = document.querySelector('main');
  if (!mainEl) {
    window.location.href = url;
    return;
  }

  const tryFetch = (path) => fetch(path).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  });

  tryFetch(url)
    .catch(() => tryFetch(`views/${url}`))
    .catch(() => tryFetch(`../views/${url}`))
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main');
      if (newMain) {
        mainEl.innerHTML = newMain.innerHTML;
        window.history.pushState({}, '', url);
        
        if (doc.title) document.title = doc.title;

        highlightActiveNav();
        initAccordions();
        initSmoothScroll();
        initSeamlessNavigation();

        applyTranslations(currentLang);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.href = url;
      }
    })
    .catch(() => {
      window.location.href = url;
    });
}

window.addEventListener('popstate', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'home.html';
  navigateToPage(currentPath);
});

/**
 * Destaca el enlace de navegación activo según la página actual
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('header nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      link.classList.add('text-primary', 'font-title-md');
      link.classList.remove('text-on-surface-variant');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('text-primary', 'font-title-md');
      link.classList.add('text-on-surface-variant');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Manejador universal para grupos de acordeón (.faq-toggle / .faq-item)
 */
function initAccordions() {
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const panel = this.nextElementSibling;
      const arrow = this.querySelector('.chevron-icon, .faq-arrow');
      const isHidden = panel ? panel.classList.contains('hidden') : false;

      const parentGroup = this.closest('#faq-accordion-group, section') || document;
      parentGroup.querySelectorAll('.faq-panel, .faq-content').forEach(p => p.classList.add('hidden'));
      parentGroup.querySelectorAll('.chevron-icon, .faq-arrow').forEach(a => a.classList.remove('rotate-180'));

      if (isHidden && panel) {
        panel.classList.remove('hidden');
        if (arrow) arrow.classList.add('rotate-180');
        this.setAttribute('aria-expanded', 'true');
      } else if (panel) {
        panel.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
        this.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

/**
 * Desplazamiento suave para enlaces de ancla locales (#)
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

/**
 * Inicializa los botones de cambio de idioma ES / EN
 */
function initLanguageSwitcher() {
  // Event delegation to catch clicks on ES / EN buttons across entire page
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('#btn-lang-es, #btn-lang-en');
    if (btn) {
      e.preventDefault();
      const lang = (btn.id === 'btn-lang-es' || btn.textContent.trim().toUpperCase() === 'ES') ? 'es' : 'en';
      setLanguage(lang);
    }
  });
}

/**
 * Cambia el idioma global de la aplicación y persiste en localStorage
 */
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('expojuy_lang', lang);
  localStorage.setItem('lang', lang);
  document.documentElement.setAttribute('lang', lang);

  // Actualizar estado activo de los botones ES / EN en el header
  const langButtons = document.querySelectorAll('header button[type="button"]');
  langButtons.forEach(btn => {
    const text = btn.textContent.trim().toUpperCase();
    if (text === lang.toUpperCase()) {
      btn.classList.add('bg-surface-container-lowest', 'text-on-surface', 'shadow-[0_1px_4px_rgba(0,0,0,0.06)]');
      btn.classList.remove('text-on-surface-variant');
    } else if (text === 'ES' || text === 'EN') {
      btn.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'shadow-[0_1px_4px_rgba(0,0,0,0.06)]');
      btn.classList.add('text-on-surface-variant');
    }
  });

  // Aplicar traducciones en el DOM
  applyTranslations(lang);
}

window.setLanguage = setLanguage;

// Diccionario Maestro de Traducción ES <-> EN para Inversores Internacionales
const masterDict = [
  ["Para los expositores que ya cuentan con stand contratado en ExpoJuy 2026, la participación en las rondas de vinculación es 100% bonificada (incluye hasta 2 representantes). Para empresas no expositoras que deseen sumarse únicamente a la ronda de negocios, existe un arancel promocional de acreditación ejecutiva que incluye acceso a las mesas, credencial y sala de traducción.", "For exhibitors who already have a contracted stand at ExpoJuy 2026, participation in the linking rounds is 100% discounted (includes up to 2 representatives). For non-exhibiting companies that wish to join only the business round, there is a promotional executive accreditation fee that includes access to the tables, credentials and translation room."],
  ["Podrás adquirirlas de manera 100% digital a través de la plataforma web oficial una vez habilitada la preventa, o en las boleterías físicas en el acceso al predio. Al comprar online, recibís un código QR dinámico en tu correo que podés mostrar directamente desde la pantalla de tu celular sin necesidad de imprimir.", "You can purchase them 100% digitally through the official web platform once the pre-sale is enabled, or at the physical ticket offices at the entrance to the property. When you buy online, you receive a dynamic QR code in your email that you can show directly from your cell phone screen without having to print."],
  ["Pueden participar empresas legalmente constituidas, pymes, cooperativas productivas, emprendimientos de base tecnológica con tracción demostrada e inversores institucionales nacionales e internacionales. Se dará prioridad a actores vinculados a las cadenas estratégicas del NOA y el Corredor Bioceánico.", "Legally constituted companies, SMEs, productive cooperatives, technology-based ventures with proven traction and national and international institutional investors can participate. Priority will be given to actors linked to the strategic chains of the NOA and the Bioceanic Corridor."],
  ["Una vez recibido tu registro, nuestro equipo clasifica tu oferta y demanda. Quince días antes de la muestra, tendrás acceso a la plataforma B2B para revisar contrapartes sugeridas y validar o rechazar solicitudes. Solo se agendan reuniones donde exista mutuo interés confirmado.", "Once your registration is received, our team classifies your offer and demand. Fifteen days before the show, you will have access to the B2B platform to review suggested counterparties and validate or reject requests. Meetings are only scheduled where there is confirmed mutual interest."],
  ["Al confirmar tu agenda, se solicitará constancia de CUIT/RUT comercial o equivalente en tu país de origen, un brief o presentación de hasta 2 páginas de la empresa y los datos de contacto directo de la persona con poder de decisión que asistirá a Ciudad Cultural.", "When confirming your agenda, proof of your commercial CUIT/RUT or equivalent in your country of origin will be requested, a brief or presentation of up to 2 pages of the company and the direct contact information of the person with decision-making power who will attend Ciudad Cultural."],
  ["Se realiza en el predio Ciudad Cultural, ubicado sobre Av. de los Estudiantes s/n, en el Barrio Alto Padilla, San Salvador de Jujuy. Cuenta con acceso peatonal señalizado y conexión directa con líneas de transporte urbano e interurbano.", "It takes place at the Ciudad Cultural property, located on Av. de los Estudiantes s/n, in the Alto Padilla neighborhood, San Salvador de Jujuy. It has signposted pedestrian access and direct connection with urban and interurban transport lines."],
  ["Absolutamente. Ciudad Cultural cuenta con diseño de superficie continua sin desniveles abruptos, rampas de pendiente reglamentaria en todos los pabellones, sanitarios adaptados y prioridad de paso en todos los ingresos y cajas.", "Absolutely. Cultural City has a continuous surface design without abrupt unevenness, ramps with a regulatory slope in all pavilions, adapted toilets and priority of passage in all entrances and checkouts."],
  ["Espacio central destinado a productores agroindustriales, cadenas de valor de legumbres, tabaco, caña de azúcar, cítricos y delegaciones internacionales del Corredor Bioceánico (Chile, Bolivia, Paraguay y Brasil).", "Central space for agroindustrial producers, value chains of legumes, tobacco, sugar cane, citrus fruits and international delegations of the Bioceanic Corridor (Chile, Bolivia, Paraguay and Brazil)."],
  ["La feria se desarrollará del viernes 9 al lunes 12 de octubre de 2026 en el predio Ciudad Cultural de San Salvador de Jujuy. El horario previsto de apertura al público es de 10:00 a 22:00 horas cada jornada.", "The fair will take place from Friday, October 9 to Monday, October 12, 2026 at the Ciudad Cultural de San Salvador de Jujuy property. The planned opening hours to the public are from 10:00 a.m. to 10:00 p.m. each day."],
  ["Sí, el predio dispone de una amplia playa de estacionamiento vigilada y señalizada con sectores diferenciados para autos particulares, motos y personas con discapacidad motriz debidamente identificadas.", "Yes, the property has a large guarded and signposted parking lot with differentiated sectors for private cars, motorcycles and people with motor disabilities who have been duly identified."],
  ["Participá de las Rondas de Vinculación B2B con contrapartes de Argentina, Chile, Paraguay y Brasil en un espacio exclusivo para generar acuerdos de importación, distribución y tecnología.", "Participate in B2B Linking Rounds with counterparts from Argentina, Chile, Paraguay and Brazil in an exclusive space to generate import, distribution and technology agreements."],
  ["Acepto recibir información oficial, convocatorias y actualizaciones sobre las Rondas de Vinculación B2B de ExpoJuy 2026 organizadas por la Cámara de Comercio Exterior de Jujuy.", "I agree to receive official information, calls and updates about the ExpoJuy 2026 B2B Linking Rounds organized by the Jujuy Chamber of Foreign Trade."],
  ["Hotelería corporativa, prestadores turísticos para delegaciones internacionales, seguros empresariales, consultoría legal y contable transfronteriza y catering institucional.", "Corporate hospitality, tourism providers for international delegations, business insurance, cross-border legal and accounting consulting and institutional catering."],
  ["El registro está abierto a productores formales y empresas de Argentina y países del Corredor Bioceánico (Chile, Paraguay, Brasil). Inscribite en el formulario de la sección", "Registration is open to formal producers and companies from Argentina and countries of the Bioceanic Corridor (Chile, Paraguay, Brazil). Sign up in the section form"],
  ["Encontrá pases digitales, horarios previstos, plano del predio, accesos peatonales y servicios clave para disfrutar de la mayor muestra multisectorial en", "Find digital passes, scheduled schedules, site plan, pedestrian access and key services to enjoy the largest multi-sector exhibition in"],
  ["Charlas magistrales, rondas de vinculación comercial, experiencias culturales vivas y conferencias sectoriales para vivir los 4 días más dinámicos del", "Keynote talks, business networking rounds, live cultural experiences and sector conferences to experience the 4 most dynamic days of the"],
  ["Líneas de colectivos urbanos e interurbanos con parada directa en predio: Líneas 10, 15, 20 y unidades de refuerzo especial continuo durante la feria.", "Urban and interurban bus lines with direct stops on the premises: Lines 10, 15, 20 and continuous special reinforcement units during the fair."],
  ["Rutas de acceso rápido por Autovía RN 9 y conexión con RN 66. Señalización vial expresa hacia el predio ferial en rotondas de ingreso a San Salvador.", "Quick access routes via Highway RN 9 and connection with RN 66. Express road signage towards the fairgrounds at roundabouts entering San Salvador."],
  ["Ubicada en el acceso norte de la capital jujeña, con amplias vías de conectividad directa desde el aeropuerto, terminal de ómnibus y rutas troncales.", "Located at the northern access to the capital of Jujuy, with wide direct connectivity routes from the airport, bus terminal and trunk routes."],
  ["Información y precios sujetos a confirmación por el Comité Organizador. Venta anticipada disponible próximamente con beneficios bancarios locales.", "Information and prices subject to confirmation by the Organizing Committee. Pre-sale available soon with local bank benefits."],
  ["Conectá de manera directa con directivos, compradores internacionales y distribuidores a través de las Rondas de Vinculación B2B de ExpoJuy 2026.", "Connect directly with managers, international buyers and distributors through the B2B Linking Rounds of ExpoJuy 2026."],
  ["Soporte permanente de los oficiales de vinculación de la Cámara de Comercio Exterior de Jujuy y técnicos del Ministerio de Desarrollo Económico.", "Permanent support from the liaison officers of the Jujuy Chamber of Foreign Commerce and technicians from the Ministry of Economic Development."],
  ["Explorá los pabellones temáticos, escenarios de conferencias, áreas gastronómicas, sanitarios y puntos de acceso para organizar tu itinerario.", "Explore the themed pavilions, conference stages, dining areas, restrooms and access points to organize your itinerary."],
  ["Adquirí tu pase oficial de manera digital. Al comprar, recibirás tu credencial intransferible con código QR lista para validar en molinetes.", "Acquire your official pass digitally. When purchasing, you will receive your non-transferable credential with QR code ready to validate at turnstiles."],
  ["Análisis geopolítico y logístico sobre la integración comercial del NOA argentino con los puertos de Chile y las rutas de Brasil y Paraguay.", "Geopolitical and logistical analysis of the commercial integration of the Argentine NOA with the ports of Chile and the routes of Brazil and Paraguay."],
  ["Cruce inteligente de demanda y oferta previa confirmación de ambas partes para garantizar encuentros altamente productivos y sin dispersión.", "Intelligent crossing of demand and supply after confirmation from both parties to guarantee highly productive meetings without dispersion."],
  ["Producción de caña, tabaco, cítricos, legumbres de altura, biomasa, empaque con atmósfera controlada y certificación orgánica internacional.", "Production of cane, tobacco, citrus, high altitude legumes, biomass, controlled atmosphere packaging and international organic certification."],
  ["Software a medida, telemetría para faenas remotas, automatización industrial, servicios de telecomunicaciones satelitales y ciberseguridad.", "Custom software, telemetry for remote tasks, industrial automation, satellite telecommunications services and cybersecurity."],
  ["Acceso directo a cadenas de suministro del NOA, minería del litio, bioenergías, agroalimentos y empresas de base tecnológica exportadora.", "Direct access to NOA supply chains, lithium mining, bioenergy, agri-food and export technology-based companies."],
  ["Conexión directa con cámaras y delegaciones de Chile (Antofagasta, Iquique), Paraguay y Brasil (Mato Grosso do Sul) en el eje bioceánico.", "Direct connection with chambers and delegations of Chile (Antofagasta, Iquique), Paraguay and Brazil (Mato Grosso do Sul) in the bioceanic axis."],
  ["Logística internacional por Paso de Jama, operadores multimodales, despachos de aduana, metalmecánica y materiales de construcción civil.", "International logistics through Paso de Jama, multimodal operators, customs clearance, metalworking and civil construction materials."],
  ["Cadena de valor del litio, energía solar fotovoltaica, proveedores de perforación, repuestos de alta exigencia y remediación ambiental.", "Lithium value chain, photovoltaic solar energy, drilling suppliers, high-demand spare parts and environmental remediation."],
  ["Cata guiada de cepas cultivadas sobre 2.500 msnm combinadas con ingredientes autóctonos: maíz capia, papas andinas y quesos de cabra.", "Guided tasting of vines grown above 2,500 meters above sea level combined with native ingredients: capia corn, Andean potatoes and goat cheese."],
  ["Playa de estacionamiento vehicular tarifada y vigilada dentro del predio. Sectores señalizados para personas con discapacidad motriz.", "Paid and monitored vehicle parking lot within the property. Signposted sectors for people with motor disabilities."],
  ["Dos semanas antes de la feria recibís tu propuesta de agenda personalizada para aceptar, ajustar o solicitar mesas con contrapartes.", "Two weeks before the fair you receive your personalized agenda proposal to accept, adjust or request tables with counterparts."],
  ["El evento multisectorial más relevante del Norte Grande. Conectá el talento, la industria y la capacidad productiva de Jujuy con el", "The most relevant multi-sector event in the Norte Grande. Connect the talent, industry and productive capacity of Jujuy with the"],
  ["Asistí al Salón Internacional en Ciudad Cultural según tu cronograma. Contás con mesa reservada, credencial y apoyo de moderación.", "Attend the International Exhibition in Ciudad Cultural according to your schedule. You have a reserved table, credentials and moderation support."],
  ["Adquirí tus pases con anticipación o explorá las charlas magistrales, demostraciones y actividades programadas para cada jornada.", "Purchase your passes in advance or explore the keynote talks, demonstrations and activities scheduled for each day."],
  ["\"ExpoJuy no solo exhibe productos: crea condiciones reales para que empresas, talento y oportunidades regionales se encuentren.\"", "\"ExpoJuy not only exhibits products: it creates real conditions for companies, talent and regional opportunities to meet.\""],
  ["Especificá si buscás vender, comprar insumos, captar capital de riesgo o formalizar alianzas tecnológicas y de representación.", "Specify if you are looking to sell, buy inputs, raise risk capital or formalize technological and representation alliances."],
  ["Módulos sanitarios distribuidos en pabellones cubiertos y áreas al aire libre, adaptados para personas con movilidad reducida.", "Sanitary modules distributed in covered pavilions and outdoor areas, adapted for people with reduced mobility."],
  ["Completá el formulario online con los datos institucionales, rubro principal, productos o servicios y representante asignado.", "Complete the online form with institutional data, main category, products or services and assigned representative."],
  ["Mesas de negocios uno a uno programadas con delegaciones compradoras de Antofagasta, Iquique, Boquerón y Mato Grosso do Sul.", "One-on-one business tables scheduled with buying delegations from Antofagasta, Iquique, Boquerón and Mato Grosso do Sul."],
  ["Nuevas metodologías de extracción directa sustentable, tratamiento de cuencas hídricas y cadenas de valor locales de litio.", "New sustainable direct extraction methodologies, watershed treatment and local lithium value chains."],
  ["Casos de uso de drones multiespectrales y modelos predictivos climáticos para cultivos intensivos en los valles templados.", "Use cases of multispectral drones and climate predictive models for intensive crops in temperate valleys."],
  ["Fusión sinfónica con sikuris, quenas y charangos rindiendo homenaje a los paisajes sonoros de las Yungas y la Puna jujeña.", "Symphonic fusion with sikuris, quenas and charangos paying tribute to the sound landscapes of the Yungas and the Puna of Jujuy."],
  ["Oportunidades de diversificación verde, agregado de valor en origen y regulaciones de exportación hacia la Unión Europea.", "Green diversification opportunities, value addition at origin and export regulations to the European Union."],
  ["Puesto sanitario permanente con ambulancia de guardia de alta complejidad y personal médico certificado para emergencias.", "Permanent health post with highly complex on-call ambulance and certified medical personnel for emergencies."],
  ["Conectividad multimodal Paso de Jama para carga contenerizada y tránsitos aduaneros directos hacia puertos del Pacífico.", "Jama Pass multimodal connectivity for containerized cargo and direct customs transits to Pacific ports."],
  ["en el predio ferial Ciudad Cultural, San Salvador de Jujuy. El horario general de exposición es de 10:00 a 22:00 hs.", "at the Ciudad Cultural fairgrounds, San Salvador de Jujuy. The general exhibition hours are from 10:00 a.m. to 10:00 p.m."],
  ["Facilitación aduanera unificada, tiempos de tránsito y optimización de flotas pesadas para operadores del Cono Sur.", "Unified customs facilitation, transit times and optimization of heavy fleets for operators in the Southern Cone."],
  ["Probá ajustando la búsqueda, seleccionando otro día o eliminando los filtros activos para explorar más propuestas.", "Try adjusting your search, selecting another day or removing active filters to explore more proposals."],
  ["Red inalámbrica abierta de alta densidad disponible para acreditaciones, consultas y networking en todo el predio.", "High-density open wireless network available for accreditation, consultations and networking throughout the property."],
  ["Hilados naturales y tejidos de fibra de llama y vicuña elaborados por cooperativas de mujeres de la puna norteña.", "Natural yarns and fabrics from llama and vicuña fiber made by women's cooperatives in the northern puna."],
  ["Miel orgánica multifloral de selva de montaña con certificación Kosher y exportación regional a mercados premium.", "Organic multifloral mountain jungle honey with Kosher certification and regional export to premium markets."],
  ["Asistencia presencial continua, entrega de planos impresos y atención personalizada al visitante y delegaciones.", "Continuous in-person assistance, delivery of printed plans and personalized attention to visitors and delegations."],
  ["Materiales refractarios avanzados, arcillas purificadas y revestimientos de alto rendimiento para obras civiles.", "Advanced refractory materials, purified clays and high-performance coatings for civil works."],
  ["IoT satelital para monitoreo hídrico y agroclimático remoto en cuencas de montaña y telecomunicaciones andinas.", "Satellite IoT for remote water and agroclimatic monitoring in mountain basins and Andean telecommunications."],
  ["Optimizá tu tiempo comercial mediante cruce asistido de oferta y demanda en un entorno profesional certificado.", "Optimize your trading time through assisted crossing of supply and demand in a certified professional environment."],
  ["Producción y exportación de biofertilizantes orgánicos y frutos tropicales de altura con trazabilidad digital.", "Production and export of organic biofertilizers and high altitude tropical fruits with digital traceability."],
  ["Rampas con pendiente normalizada, senderos peatonales nivelados y prioridad de ingreso en todos los molinetes.", "Ramps with normal slope, level pedestrian paths and priority entry at all turnstiles."],
  ["Food trucks con comidas regionales, opciones vegetarianas y sin TACC, más áreas de mesas protegidas del sol.", "Food trucks with regional foods, vegetarian and TACC-free options, plus table areas protected from the sun."],
  ["Av. de los Estudiantes s/n, Barrio Alto Padilla, Ciudad Cultural, San Salvador de Jujuy, Jujuy, Argentina.", "Av. de los Estudiantes s/n, Barrio Alto Padilla, Cultural City, San Salvador de Jujuy, Jujuy, Argentina."],
  ["Las empresas y PyMEs pueden consultar el catálogo comercial y solicitar planos de modulación en la sección", "Companies and SMEs can consult the commercial catalog and request modulation plans in the section"],
  ["Historias reales de trabajadores, cooperativas, profesionales, investigadoras y emprendedores que con su", "Real stories of workers, cooperatives, professionals, researchers and entrepreneurs who, with their"],
  ["Transformación de biomasa de caña de azúcar en bioetanol de alta pureza y cogeneración eléctrica limpia.", "Transformation of sugarcane biomass into high purity bioethanol and clean electrical cogeneration."],
  ["Hacé clic en los sectores para ver áreas de interés prioritarias y perfiles de contrapartes demandadas.", "Click on the sectors to see priority areas of interest and profiles of defendant counterparties."],
  ["Disponibilidad de stands, manual del expositor, equipamiento ferial y contacto directo con la gerencia", "Availability of stands, exhibitor manual, fair equipment and direct contact with management"],
  ["Formulario demostrativo. La inscripción oficial estará sujeta a validación por el Comité Organizador.", "Demonstration form. Official registration will be subject to validation by the Organizing Committee."],
  ["\"Presentar nuestros avances en biotecnología en ExpoJuy nos abrió puertas con fondos de inversión de", "\"Presenting our advances in biotechnology at ExpoJuy opened doors for us with investment funds from"],
  ["instituciones, visitantes y delegaciones vinculadas a los sectores estratégicos de la provincia y la", "institutions, visitors and delegations linked to the strategic sectors of the province and the"],
  ["Líneas de transporte urbano directo a Ciudad Cultural, accesos vehiculares rápidos y estacionamiento", "Direct urban transport lines to the Cultural City, quick vehicular access and parking"],
  ["Músicos, ballets y muestras gastronómicas en vivo formarán parte del escenario principal cada noche.", "Live musicians, ballets and food samples will be part of the main stage each night."],
  ["Explorá el cronograma y hacé clic en \"Guardar en mi agenda\" para armar tu itinerario personalizado.", "Browse the schedule and click \"Save to my agenda\" to build your personalized itinerary."],
  ["ExpoJuy 2026 es la 17.ª edición de la feria multisectorial de Jujuy. Reúne empresas, emprendedores,", "ExpoJuy 2026 is the 17th edition of the multi-sector fair in Jujuy. Bring together companies, entrepreneurs,"],
  ["\"Como cooperativa de la Quebrada, pudimos comercializar directo a cadenas gastronómicas de todo el", "\"As a cooperative of La Quebrada, we were able to market directly to gastronomic chains throughout the"],
  ["Desarrollo de software agronómico satelital y soluciones IoT para control hídrico en zonas áridas.", "Development of satellite agronomic software and IoT solutions for water control in arid areas."],
  ["El Corredor Bioceánico abre nuevas posibilidades de integración entre Argentina, Chile, Paraguay y", "The Bioceanic Corridor opens new possibilities of integration between Argentina, Chile, Paraguay and"],
  ["Producción de legumbres y alimentos deshidratados de alta pureza con denominación de origen Jujuy.", "Production of high purity legumes and dehydrated foods with Jujuy designation of origin."],
  ["Soluciones integradas de refinamiento de litio con suministro 100% fotovoltaico en la puna jujeña.", "Integrated lithium refining solutions with 100% photovoltaic supply in the puna of Jujuy."],
  ["Un circuito estructurado de 4 etapas para maximizar tus reuniones efectivas durante la exposición.", "A structured 4-stage circuit to maximize your effective meetings during the exhibition."],
  ["\"La feria nos permitió conectar con proveedores internacionales para tecnificar nuestra planta en", "\"The fair allowed us to connect with international suppliers to modernize our plant in"],
  ["Pabellones cubiertos, áreas de exposición exterior, patios gastronómicos regionales y escenarios", "Covered pavilions, outdoor exhibition areas, regional gastronomic patios and stages"],
  ["Precios anticipados, accesos generales diarios, beneficios para jubilados, menores y estudiantes", "Advance prices, general daily access, benefits for retirees, minors and students"],
  ["Representantes de Antofagasta y Mato Grosso do Sul confirmaron su participación en las rondas de", "Representatives of Antofagasta and Mato Grosso do Sul confirmed their participation in the rounds of"],
  ["Reuniones B2B para vincular empresas, compradores, inversores y proveedores de Argentina, Chile,", "B2B meetings to link companies, buyers, investors and suppliers from Argentina, Chile,"],
  ["Agenda de espectáculos, compra de entradas con descuento, mapa interactivo y accesos peatonales", "Show agenda, purchase of discount tickets, interactive map and pedestrian access"],
  ["Desarrollo de soluciones de almacenamiento en baterías de litio y suministros para la industria", "Development of lithium battery storage solutions and supplies for the industry"],
  ["Tabaco, caña de azúcar, bioetanol, cítricos, legumbres y cadena agroalimentaria de exportación.", "Tobacco, sugar cane, bioethanol, citrus fruits, legumes and agri-food export chain."],
  ["Conexión directa con sectores productivos, agendas bilaterales y Rondas B2B internacionales de", "Direct connection with productive sectors, bilateral agendas and international B2B Rounds of"],
  ["Probá modificando los términos de búsqueda o quitá los filtros de sector y pabellón aplicados.", "Try modifying the search terms or remove the applied sector and pavilion filters."],
  ["Todo lo que necesitás saber sobre acreditaciones, stands, rondas B2B y accesos a ExpoJuy 2026.", "Everything you need to know about accreditations, stands, B2B rounds and access to ExpoJuy 2026."],
  ["Innovación local de impacto, artesanías con valor agregado, diseño y cooperativas regionales.", "Local impact innovation, value-added crafts, design and regional cooperatives."],
  ["Se habilitó la plataforma digital para adquirir pases diarios y abonos para los 4 días de la", "The digital platform was enabled to acquire daily passes and subscriptions for the 4 days of the"],
  ["Brasil. ExpoJuy transforma esa conexión en encuentros, proyectos y oportunidades concretas.", "Brazil. ExpoJuy transforms that connection into meetings, projects and concrete opportunities."],
  ["Litio, parque solar Cauchari, minerales estratégicos y transición energética internacional.", "Lithium, Cauchari solar park, strategic minerals and international energy transition."],
  ["Quebrada, Puna, Valles y Yungas: hotelería sustentable, gastronomía y turismo de reuniones.", "Quebrada, Puna, Valleys and Yungas: sustainable hospitality, gastronomy and meeting tourism."],
  ["Rampas de acceso universal, sanitarios adaptados, señalética inclusiva y puntos de atención", "Universal access ramps, adapted toilets, inclusive signage and service points"],
  ["Software, data centers de altura, biotecnología aplicada e infraestructura de conectividad.", "Software, high-rise data centers, applied biotechnology and connectivity infrastructure."],
  ["Explorá el Directorio Oficial de stands o revisá las conferencias del auditorio principal.", "Explore the Official Stand Directory or review the conferences in the main auditorium."],
  ["Completá los datos corporativos para ingresar a la matriz de cruzamiento de negocios.", "Complete the corporate data to enter the business cross-over matrix."],
  ["dedicación diaria construyen la matriz productiva y el futuro de nuestra provincia.", "daily dedication builds the productive matrix and the future of our province."],
  ["Presentación de autoridades provinciales, delegaciones de Chile, Paraguay y Brasil.", "Presentation of provincial authorities, delegations from Chile, Paraguay and Brazil."],
  ["Recibirás la confirmación de mesa de negocios vía email una vez validado tu perfil.", "You will receive confirmation of the business table via email once your profile has been validated."],
  ["Manufactura local, parques industriales, logística multimodal y comercio exterior.", "Local manufacturing, industrial parks, multimodal logistics and foreign trade."],
  ["Soluciones integradas de refinamiento de litio con suministro 100% fotovoltaico.", "Integrated lithium refining solutions with 100% photovoltaic supply."],
  ["Startups, desarrollo de talento y exportación de servicios desde Jujuy al mundo.", "Startups, talent development and export of services from Jujuy to the world."],
  ["Explorá las empresas, PyMEs y organismos públicos divididos por sectores clave:", "Explore companies, SMEs and public organizations divided by key sectors:"],
  ["Conectá tu empresa con compradores, inversores, proveedores e instituciones de", "Connect your company with buyers, investors, suppliers and institutions"],
  ["Todo lo que necesitás saber antes de tu llegada al predio de Ciudad Cultural.", "Everything you need to know before your arrival at the Ciudad Cultural property."],
  ["Encuentro exclusivo entre operadoras mineras y proveedores locales jujeños.", "Exclusive meeting between mining operators and local suppliers from Jujuy."],
  ["Resolvemos tus dudas para que prepares tu participación sin contratiempos.", "We resolve your doubts so that you can prepare your participation without any setbacks."],
  ["Paraguay y Brasil en un entorno profesional diseñado para cerrar acuerdos.", "Paraguay and Brazil in a professional environment designed to close agreements."],
  ["Inauguración Oficial y Conferencia: El Corredor Bioceánico de Capricornio", "Official Inauguration and Conference: The Capricorn Bioceanic Corridor"],
  ["en el marco del Corredor Bioceánico y el desarrollo productivo regional.", "within the framework of the Bioceanic Corridor and regional productive development."],
  ["* La información operativa definitiva será publicada antes del evento.", "*Definitive operational information will be published before the event."],
  ["Minería, Agroindustria, Tecnología, Logística y Servicios Corporativos", "Mining, Agribusiness, Technology, Logistics and Corporate Services"],
  ["Comité de Vinculación Internacional · Corredor Bioceánico Capricornio", "International Liaison Committee · Capricorn Bioceanic Corridor"],
  ["Gala Musical de Apertura: Ensamble Autóctono de la Puna y Filarmónica", "Opening Musical Gala: Puna Native Ensemble and Philharmonic"],
  ["¿Hay accesibilidad para personas con movilidad reducida y cochecitos?", "Is there accessibility for people with reduced mobility and strollers?"],
  ["Sumate al evento comercial y productivo más importante de la región.", "Join the most important commercial and productive event in the region."],
  ["El itinerario generado guardará tus horarios y salas seleccionadas.", "The generated itinerary will save your schedules and selected rooms."],
  ["Panel Agroindustrial: Cadena de Tabaco, Azúcar y Bioetanol del NOA", "Agroindustrial Panel: NOA Tobacco, Sugar and Bioethanol Chain"],
  ["Publicación del primer avance de la grilla cultural y espectáculos", "Publication of the first preview of the cultural grid and shows"],
  ["Se confirman 14 delegaciones empresariales del Corredor Bioceánico", "14 business delegations of the Bioceanic Corridor are confirmed"],
  ["El desarrollo de Jujuy tiene muchas formas. Una misma dirección.", "The development of Jujuy has many forms. The same address."],
  ["¿Buscás proveedores, aliados o nuevas oportunidades de negocio?", "Are you looking for suppliers, allies or new business opportunities?"],
  ["Inteligencia Artificial aplicada al Agro y Monitoreo Satelital", "Artificial Intelligence applied to Agriculture and Satellite Monitoring"],
  ["Apertura formal de venta anticipada de entradas con descuento", "Formal opening of advance sale of discounted tickets"],
  ["¿Cuáles son las fechas, horarios y ubicación de ExpoJuy 2026?", "What are the dates, times and location of ExpoJuy 2026?"],
  ["Panel: Ecosistema Tech y Economía del Conocimiento en el NOA", "Panel: Tech Ecosystem and Knowledge Economy at the NOA"],
  ["Tus datos son tratados bajo confidencialidad institucional.", "Your data is treated under institutional confidentiality."],
  ["¿Cómo puedo participar como expositor o reservar un stand?", "How can I participate as an exhibitor or reserve a stand?"],
  ["Descripción detallada de la charla o actividad comercial.", "Detailed description of the talk or commercial activity."],
  ["La feria que conecta producción, talento y oportunidades.", "The fair that connects production, talent and opportunities."],
  ["Stand C-14 · Pabellón Industrial (Contenido demostrativo)", "Stand C-14 · Industrial Pavilion (Demonstrative content)"],
  ["¿Qué documentación debo presentar para validar el cupo?", "What documentation should I present to validate the quota?"],
  ["17.ª Edición Multisectorial · 9 al 12 de Octubre 2026", "17th Multisectorial Edition · October 9 to 12, 2026"],
  ["Breve descripción de oferta o necesidad de búsqueda", "Brief description of offer or search need"],
  ["Stand A-08 · Pabellón Agro (Contenido demostrativo)", "Stand A-08 · Agro Pavilion (Demonstrative content)"],
  ["o comunicándose con la Cámara de Comercio Exterior.", "or by contacting the Chamber of Foreign Trade."],
  ["Cuatro días para conectar, aprender y vivir Jujuy.", "Four days to connect, learn and live Jujuy."],
  ["Mesa de Oportunidades en Cadena de Valor del Litio", "Lithium Value Chain Opportunities Table"],
  ["Stand T-03 · Espacio Tech (Contenido demostrativo)", "Stand T-03 · Espacio Tech (Demonstrative content)"],
  ["Minería de Litio y Transición Energética Regional", "Lithium Mining and Regional Energy Transition"],
  ["¿Qué requisitos se necesitan para las Rondas B2B?", "What requirements are needed for B2B Rounds?"],
  ["Masterclass de Vinos de Quebrada & Cocina Andina", "Quebrada Wines & Andean Cuisine Masterclass"],
  ["Representación comercial y distribución regional", "Commercial representation and regional distribution"],
  ["¿El predio cuenta con estacionamiento vehicular?", "Does the property have vehicle parking?"],
  ["Guía Práctica para Visitantes · Ciudad Cultural", "Practical Guide for Visitors · Cultural City"],
  ["Pabellón B: Agroindustria & Corredor Bioceánico", "Pavilion B: Agroindustry & Bioceanic Corridor"],
  ["Foro Logístico de Puertos Secos y Paso de Jama", "Logistics Forum of Dry Ports and Paso de Jama"],
  ["Servicios del predio y accesibilidad universal", "Property services and universal accessibility"],
  ["Conocé a quienes ya son parte de ExpoJuy 2026", "Meet those who are already part of ExpoJuy 2026"],
  ["agroindustria, servicios y comercio exterior.", "agroindustry, services and foreign trade."],
  ["Networking Internacional y Rondas de Comercio", "International Networking and Trade Rounds"],
  ["Turismo, Gastronomía y Servicios Corporativos", "Tourism, Gastronomy and Corporate Services"],
  ["Vinculación Empresarial · Salón Internacional", "Business Linking · International Exhibition"],
  ["¿Quiénes pueden participar de las Rondas B2B?", "Who can participate in the B2B Rounds?"],
  ["AVENIDA DE LOS ESTUDIANTES (ACCESO PEATONAL)", "STUDENT AVENUE (PEDESTRIAN ACCESS)"],
  ["Espacio ejecutivo con servicio de traducción", "Executive space with translation service"],
  ["Plano esquemático y orientación en el predio", "Schematic plan and orientation on the property"],
  ["Predio Ferial Ciudad Cultural · Alto Padilla", "Cultural City Fairgrounds · Alto Padilla"],
  ["Recibí tu acceso digital con QR en tu email.", "Received your digital access with QR in your email."],
  ["Ronda Multisectorial Internacional: Sesión 1", "International Multisector Round: Session 1"],
  ["¿Tiene costo la participación en las rondas?", "Is there a cost to participate in the rounds?"],
  ["Apertura Oficial & Foro Corredor Bioceánico", "Official Opening & Bioceanic Corridor Forum"],
  ["Búsqueda de socios estratégicos / Inversión", "Search for strategic partners / Investment"],
  ["No encontramos expositores con esos filtros", "We did not find exhibitors with those filters"],
  ["Resto de Argentina (NOA, Centro, Cuyo, Sur)", "Rest of Argentina (NOA, Center, Cuyo, South)"],
  ["¿Cómo se asignan y coordinan las reuniones?", "How are meetings assigned and coordinated?"],
  ["Inglés) para delegaciones internacionales.", "English) for international delegations."],
  ["Formulario de Solicitud de Vinculación B2B", "B2B Linkage Request Form"],
  ["Quienes mueven las oportunidades de Jujuy.", "Those who drive Jujuy's opportunities."],
  ["Sustentabilidad y Tecnología de Extracción", "Sustainability and Extraction Technology"],
  ["¿Cómo compro entradas y cómo las presento?", "How do I buy tickets and how do I submit them?"],
  ["Asistencia trilingüe (Español, Portugués,", "Trilingual assistance (Spanish, Portuguese,"],
  ["Cooperativa Agrícola Andina · Sector Agro", "Andean Agricultural Cooperative · Agro Sector"],
  ["Acreditación profesional con constancia.", "Professional accreditation with consistency."],
  ["Click en \"Ver en mapa\" para ubicar stand", "Click on \"See on map\" to locate stand"],
  ["ExpoJuy 2026 - Directorio de Expositores", "ExpoJuy 2026 - Exhibitor Directory"],
  ["ExpoJuy 2026 - Rondas de Vinculación B2B", "ExpoJuy 2026 - B2B Linking Rounds"],
  ["Listado completo de firmas participantes", "Complete list of participating firms"],
  ["Participá de los encuentros presenciales", "Participate in face-to-face meetings"],
  ["Seleccioná perfiles y coordiná reuniones", "Select profiles and coordinate meetings"],
  ["Comprar productos / insumos / servicios", "Buy products / supplies / services"],
  ["ExpoJuy 2026 - Visitá y Mapa del Predio", "ExpoJuy 2026 - Visit and Map of the Property"],
  ["Predio Ciudad Cultural — Planta Abierta", "Cultural City Property — Open Floor Plan"],
  ["Una región conectada por más que rutas.", "A region connected by more than routes."],
  ["¿Cómo funcionan las Rondas de Negocios?", "How do Business Rounds work?"],
  ["ÁREA EXTERIOR · MAQUINARIA & ARTESANÍAS", "OUTDOOR AREA · MACHINERY & CRAFTS"],
  ["Beneficios de participar en las Rondas", "Benefits of participating in the Rounds"],
  ["Brasil (Mato Grosso do Sul, San Pablo)", "Brazil (Mato Grosso do Sul, Sao Paulo)"],
  ["Cupos limitados por sector arancelario", "Limited quotas by tariff sector"],
  ["Donde las oportunidades se encuentran.", "Where opportunities are found."],
  ["Metalmecánica Jujuy · Sector Industria", "Metalworking Jujuy · Industry Sector"],
  ["OPORTUNIDADES DE NEGOCIO INTERNACIONAL", "INTERNATIONAL BUSINESS OPPORTUNITIES"],
  ["Sectores clave convocados a las rondas", "Key sectors called to the rounds"],
  ["Vender / Ofrecer productos o servicios", "Sell ​​/ Offer products or services"],
  ["donde las oportunidades se encuentran.", "where opportunities lie."],
  ["Últimos comunicados de la organización", "Latest communications from the organization"],
  ["Acceso digital intransferible con QR.", "Non-transferable digital access with QR."],
  ["Cierre Cultural y Espectáculo en Vivo", "Cultural Closing and Live Show"],
  ["Empresas regionales e internacionales", "Regional and international companies"],
  ["Ingreso rápido por molinete exclusivo", "Quick entry through exclusive turnstile"],
  ["La 17.ª edición se llevará a cabo del", "The 17th edition will take place on"],
  ["Preguntas frecuentes sobre las Rondas", "Frequently asked questions about Rounds"],
  ["Reuniones de 30 min por interés mutuo", "30-minute meetings for mutual interest"],
  ["Sabores de Jujuy y Maridaje de Altura", "Flavors of Jujuy and Altitude Pairing"],
  ["Tu recorrido empieza antes de llegar.", "Your tour begins before you arrive."],
  ["4 Jornadas con actividades continuas", "4 days with continuous activities"],
  ["Cronograma Oficial · Ciudad Cultural", "Official Schedule · Cultural City"],
  ["Cámara de Comercio Exterior de Jujuy", "Chamber of Foreign Commerce of Jujuy"],
  ["Elegí tu experiencia en ExpoJuy 2026", "Choose your experience at ExpoJuy 2026"],
  ["Paraguay (Asunción, Chaco Paraguayo)", "Paraguay (Asunción, Paraguayan Chaco)"],
  ["Servicios disponibles en este sector", "Services available in this sector"],
  ["cuatro días de innovación y cultura.", "four days of innovation and culture."],
  ["¡Solicitud registrada correctamente!", "Request registered successfully!"],
  ["4 días de exposición multisectorial", "4 days of multi-sector exhibition"],
  ["Argentina, Chile, Paraguay y Brasil", "Argentina, Chile, Paraguay and Brazil"],
  ["El valor de Jujuy está en su gente.", "The value of Jujuy is in its people."],
  ["Investigadora CONICET-UNJu · Sector", "CONICET-UNJu Researcher · Sector"],
  ["Nombre y Apellido del representante", "Name and surname of the representative"],
  ["Presentar DNI y carnet al ingresar.", "Present ID and card upon entry."],
  ["Shows en vivo y muestras culturales", "Live shows and cultural exhibitions"],
  ["Acreditación obligatoria en puerta", "Mandatory accreditation at the door"],
  ["Incluye directorio y coffee lounge", "Includes directory and coffee lounge"],
  ["Ingreso libre a Patio Gastronómico", "Free entry to Gastronomic Patio"],
  ["Muestras culturales y espectáculos", "Cultural exhibitions and shows"],
  ["Objetivo prioritario en las Rondas", "Priority objective in the Rounds"],
  ["Preguntas frecuentes de visitantes", "Visitor FAQs"],
  ["Rondas de Negocios Internacionales", "International Business Rounds"],
  ["Tipos de entradas y acceso general", "Types of tickets and general access"],
  ["el ecosistema productivo de Jujuy.", "the productive ecosystem of Jujuy."],
  ["Acceso a oportunidades regionales", "Access to regional opportunities"],
  ["Acceso ilimitado del 9 al 12 oct.", "Unlimited access from October 9 to 12."],
  ["Bloque de Apertura y Conectividad", "Openness and Connectivity Block"],
  ["Catálogo Comercial · 17.ª Edición", "Commercial Catalog · 17th Edition"],
  ["Contenido demostrativo proyectado", "Projected demo content"],
  ["Cruce directo de oferta y demanda", "Direct intersection of supply and demand"],
  ["Descargar Mapa del Complejo (PDF)", "Download Complex Map (PDF)"],
  ["Directorio oficial de expositores", "Official Exhibitor Directory"],
  ["Espacios climatizados y equipados", "Air-conditioned and equipped spaces"],
  ["Espacios exclusivos para minería,", "Exclusive spaces for mining,"],
  ["antes de llegar al predio ferial.", "before arriving at the fairgrounds."],
  ["¿Dónde se realiza y cómo acceder?", "Where is it done and how to access it?"],
  ["¿Tenés otra consulta? Ir a Visitá", "Do you have another question? Go to Visit"],
  ["+45 delegaciones agrocomerciales", "+45 agro-commercial delegations"],
  ["Acceso a las 4 jornadas de feria", "Access to the 4 days of the fair"],
  ["Acceso libre con entrada general", "Free access with general admission"],
  ["Indicá rubro, oferta y objetivos", "Indicate category, offer and objectives"],
  ["Precio de preventa con descuento", "Discounted pre-sale price"],
  ["Registrá el perfil de tu empresa", "Register your company profile"],
  ["Reservá tu Stand en ExpoJuy 2026", "Reserve your Stand at ExpoJuy 2026"],
  ["Sala VIP para reuniones privadas", "VIP room for private meetings"],
  ["Trayectoria regional consolidada", "Consolidated regional trajectory"],
  ["Turismo y Servicios Corporativos", "Tourism and Corporate Services"],
  ["Ver expositores en este pabellón", "See exhibitors in this pavilion"],
  ["¿Cuándo se realiza ExpoJuy 2026?", "When is ExpoJuy 2026 held?"],
  ["Acceso a pabellones comerciales", "Access to commercial pavilions"],
  ["Acceso prioritario a Rondas B2B", "Priority access to B2B Rounds"],
  ["Acreditación comercial completa", "Full commercial accreditation"],
  ["Consultoría Legal Internacional", "International Legal Consulting"],
  ["Empresas, PyMEs e instituciones", "Companies, SMEs and institutions"],
  ["Escribinos a b2b@expojuy.com.ar", "Write to us at b2b@expojuy.com.ar"],
  ["Estimación de afluencia general", "General influx estimate"],
  ["Ingreso a conferencias abiertas", "Admission to open conferences"],
  ["Reuniones por interés comercial", "Meetings for commercial interest"],
  ["Ronda Internacional de Negocios", "International Business Round"],
  ["Sponsors y Aliados Estratégicos", "Sponsors and Strategic Allies"],
  ["Teléfono / WhatsApp de contacto", "Contact phone / WhatsApp"],
  ["Ubicación esquemática de stands", "Schematic location of stands"],
  ["Acceso a pabellones educativos", "Access to educational pavilions"],
  ["Asesoramiento aduanero y legal", "Customs and legal advice"],
  ["Auditorios y salones temáticos", "Auditoriums and theme rooms"],
  ["Cono Sur y Corredor Bioceánico", "Southern Cone and Bioceanic Corridor"],
  ["Conocé las historias completas", "Know the full stories"],
  ["Descuentos en patio de comidas", "Food court discounts"],
  ["Explorá el directorio completo", "Browse the full directory"],
  ["Ing. Carlos Morales · Dir. Red", "Eng. Carlos Morales · Network Director"],
  ["Ir a Rondas de Vinculación B2B", "Go to B2B Linking Rounds"],
  ["Todo listo para vivir ExpoJuy.", "Everything ready to experience ExpoJuy."],
  ["¿Buscás reuniones comerciales?", "Are you looking for business meetings?"],
  ["COMODIDAD Y ATENCIÓN INTEGRAL", "COMFORT AND COMPREHENSIVE CARE"],
  ["Conocé el Corredor Bioceánico", "Get to know the Bioceanic Corridor"],
  ["Cómo llegar a Ciudad Cultural", "How to get to Cultural City"],
  ["Descargar mi itinerario (PDF)", "Download my itinerary (PDF)"],
  ["Dra. Valeria Farfán · CONICET", "Dr. Valeria Farfán · CONICET"],
  ["ExpoJuy 2026 - Agenda Oficial", "ExpoJuy 2026 - Official Agenda"],
  ["GEO-LOCALIZACIÓN Y RECORRIDOS", "GEO-LOCATION AND ROUTES"],
  ["Integración Comercial Zicosur", "Zicosur Commercial Integration"],
  ["No se encontraron actividades", "No activities found"],
  ["Rutas activas Argentina-Chile", "Argentina-Chile active routes"],
  ["Tarifa comunitaria subsidiada", "Subsidized community rate"],
  ["e inversores internacionales.", "and international investors."],
  ["Palpalá sin intermediarios.\"", "Palpalá without intermediaries.\""],
  ["Acompañamiento institucional", "Institutional support"],
  ["Aún no guardaste actividades", "You have not saved activities yet"],
  ["Dirección Oficial del Predio", "Official Address of the Property"],
  ["Enviar solicitud de registro", "Submit registration request"],
  ["Nuevos proveedores y aliados", "New suppliers and allies"],
  ["Pabellón A (Minería/Energía)", "Pavilion A (Mining/Energy)"],
  ["Traducción y soporte técnico", "Translation and technical support"],
  ["Válido con credencial física", "Valid with physical credential"],
  ["+50 prestadores habilitados", "+50 authorized providers"],
  ["+60 compradores confirmados", "+60 confirmed buyers"],
  ["ACCESOS Y TICKETS DIGITALES", "DIGITAL ACCESS AND TICKETS"],
  ["Cerámicas & Puna Industrial", "Ceramics & Puna Industrial"],
  ["Ciudad Cultural, S.S. Jujuy", "Cultural City, S.S. Jujuy"],
  ["Horario continuo del predio", "Continuous property hours"],
  ["Jujuy en el centro de todo.", "Jujuy in the center of everything."],
  ["Lic. Sofia Meyer · Corredor", "Lic. Sofia Meyer · Runner"],
  ["Mesas temáticas sectoriales", "Sectoral thematic tables"],
  ["Molinetes de ingreso rápido", "Quick entry turnstiles"],
  ["Pabellón B (Agro/Industria)", "Pavilion B (Agro/Industry)"],
  ["Pabellón C (Tech/Servicios)", "Pavilion C (Tech/Services)"],
  ["Participá de las Rondas B2B", "Participate in the B2B Rounds"],
  ["Pase Estudiante / Jubilados", "Student / Retirees Pass"],
  ["Pase Profesional / Negocios", "Professional/Business Pass"],
  ["País y Origen de la empresa", "Country and Origin of the company"],
  ["Recibí o solicitá reuniones", "Receive or request meetings"],
  ["Sector productivo principal", "Main productive sector"],
  ["¿Querés exponer tu empresa?", "Do you want to expose your company?"],
  ["9 al 12 de octubre de 2026", "October 9-12, 2026"],
  ["Comprar entrada anticipada", "Buy advance ticket"],
  ["Directorio de Expositores:", "Exhibitor Directory:"],
  ["Escenario Central Exterior", "Exterior Central Stage"],
  ["Ingreso Peatonal Principal", "Main Pedestrian Entrance"],
  ["Mieles del Carmen & Yungas", "Honeys from Carmen & Yungas"],
  ["Rondas de Vinculación B2B:", "B2B Linking Rounds:"],
  ["Área Exterior (Maquinaria)", "Exterior Area (Machinery)"],
  ["+250 empresas confirmadas", "+250 confirmed companies"],
  ["+35 empresas tecnológicas", "+35 technology companies"],
  ["AgroJujuy Biocombustibles", "AgroJujuy Biofuels"],
  ["Agroindustria y Alimentos", "Agribusiness and Food"],
  ["Ahorro del 35% anticipado", "Savings of 35% in advance"],
  ["Auditorios & Conferencias", "Auditoriums & Conferences"],
  ["Cargo / Rol en la empresa", "Position / Role in the company"],
  ["Cómo funcionan las rondas", "How the rounds work"],
  ["Logística Corredor Andino", "Andean Corridor Logistics"],
  ["Orquesta del Bicentenario", "Bicentennial Orchestra"],
  ["Registrarme para preventa", "Register for pre-sale"],
  ["Seleccioná tu procedencia", "Select your origin"],
  ["Ver todas las actividades", "See all activities"],
  ["y el Corredor Bioceánico.", "and the Bioceanic Corridor."],
  ["Cámara Comercio Exterior", "Foreign Trade Chamber"],
  ["Disertante / Facilitador", "Speaker/Facilitator"],
  ["EXPERIENCIA EXPOJUY 2026", "EXPOJUY 2026 EXPERIENCE"],
  ["Información & Sanitarios", "Information & Health"],
  ["Integración del Corredor", "Broker Integration"],
  ["Inversores & Compradores", "Investors & Buyers"],
  ["Referencias del Complejo", "Complex References"],
  ["Tarifa general en puerta", "General rate at the door"],
  ["Tasa de satisfacción 94%", "Satisfaction rate 94%"],
  ["Textiles Autóctonos Yavi", "Yavi Native Textiles"],
  ["Turismo MICE (Reuniones)", "MICE Tourism (Meetings)"],
  ["+250 Stands Confirmados", "+250 Confirmed Stands"],
  ["Agendamiento pre-evento", "Pre-event scheduling"],
  ["Explorar por categorías", "Browse by categories"],
  ["Logística Internacional", "International Logistics"],
  ["Tecnología e Innovación", "Technology and Innovation"],
  ["Ver empresas del sector", "See companies in the sector"],
  ["🏛️ Todos los Pabellones", "🏛️ All Pavilions"],
  ["+40 Oradores & Paneles", "+40 Speakers & Panels"],
  ["4 Países participantes", "4 participating countries"],
  ["5 Pabellones Temáticos", "5 Thematic Pavilions"],
  ["Acceso libre c/entrada", "Free access w/entrance"],
  ["Agenda de Actividades:", "Activities Agenda:"],
  ["Algoritmo de match B2B", "B2B matching algorithm"],
  ["Contenido demostrativo", "Demonstrative content"],
  ["Empresa u Organización", "Company or Organization"],
  ["Litio Solar Jujuy S.A.", "Lithium Solar Jujuy S.A."],
  ["Metodología Comprobada", "Proven Methodology"],
  ["Otro país de la región", "Another country in the region"],
  ["Pabellones Comerciales", "Commercial Pavilions"],
  ["Pabellones y Servicios", "Pavilions and Services"],
  ["Patio Gourmet · Pab. B", "Gourmet Patio · Pab. b"],
  ["Representante en Stand", "Stand Representative"],
  ["Seleccioná el objetivo", "Select the objective"],
  ["Todos los sectores (5)", "All sectors (5)"],
  ["Título de la Actividad", "Activity Title"],
  ["Unión Industrial Jujuy", "Jujuy Industrial Union"],
  ["Ver todas las noticias", "See all news"],
  ["¿Dudas de vinculación?", "Linking questions?"],
  ["🏭 Industria y Comercio", "🏭 Industry and Commerce"],
  ["Abrir mapa del predio", "Open property map"],
  ["Asoc. Vinos de Altura", "Altura Wines Association"],
  ["Auditorio Principal A", "Main Auditorium A"],
  ["Industria y Logística", "Industry and Logistics"],
  ["Ingresar a Rondas B2B", "Enter B2B Rounds"],
  ["Nombre del Disertante", "Speaker's Name"],
  ["Planificá tu visita a", "Plan your visit to"],
  ["Plano Ciudad Cultural", "Cultural City Plan"],
  ["Respaldo Oficial CCEJ", "CCEJ Official Support"],
  ["Restablecer selección", "Reset selection"],
  ["Salón Climatizado B2B", "B2B Air Conditioned Room"],
  ["Sanitarios accesibles", "Accessible toilets"],
  ["Solicitar reunión B2B", "Request B2B meeting"],
  ["UBICACIÓN ESTRATÉGICA", "STRATEGIC LOCATION"],
  ["Ver agenda y entradas", "See agenda and tickets"],
  ["Ver ubicación en Mapa", "See location on Map"],
  ["9 al 12 Octubre 2026", "October 9 to 12, 2026"],
  ["Abono 4 Días ExpoJuy", "ExpoJuy 4 Day Pass"],
  ["Abrir en Google Maps", "Open in Google Maps"],
  ["Artesanías y Cultura", "Crafts and Culture"],
  ["Buscar en directorio", "Search in directory"],
  ["Conocer protocolos →", "Know protocols →"],
  ["Consultar requisitos", "Check requirements"],
  ["Contacto de Negocios", "Business Contact"],
  ["Descargar Mapa (PDF)", "Download Map (PDF)"],
  ["Ecosistema Convocado", "Summoned Ecosystem"],
  ["Espacio Seleccionado", "Selected Space"],
  ["Explorá los sectores", "Explore the sectors"],
  ["Guardar en mi agenda", "Save to my calendar"],
  ["Industria y Comercio", "Industry and Commerce"],
  ["Industria y comercio", "Industry and commerce"],
  ["Logística de Eventos", "Event Logistics"],
  ["Mantenimiento Pesado", "Heavy Maintenance"],
  ["Networking Comercial", "Commercial Networking"],
  ["Pabellón A (Minería)", "Pavilion A (Mining)"],
  ["Perfil Institucional", "Institutional Profile"],
  ["Planificar mi visita", "Plan my visit"],
  ["Punto de información", "Information point"],
  ["Recomendado · 4 Días", "Recommended · 4 Days"],
  ["Restaurar directorio", "Restore directory"],
  ["Seleccioná el sector", "Select the sector"],
  ["⛰️ Turismo y Cultura", "⛰️ Tourism and Culture"],
  ["Acero y Estructuras", "Steel and Structures"],
  ["Agregar a mi agenda", "Add to my agenda"],
  ["Auditorio Principal", "Main Auditorium"],
  ["Auspiciante Oficial", "Official Sponsor"],
  ["Aviso organizativo:", "Organizational notice:"],
  ["Busco oportunidades", "I look for opportunities"],
  ["Centro de Ayuda B2B", "B2B Help Center"],
  ["Condición de Acceso", "Access Condition"],
  ["Conferencia Central", "Central Conference"],
  ["Corredor Bioceánico", "Bioceanic Corridor"],
  ["Demora aprox: 4 min", "Approximate delay: 4 min"],
  ["Dra. Valeria Farfán", "Dr. Valeria Farfán"],
  ["Energías Renovables", "Renewable Energies"],
  ["Espacio y Ubicación", "Space and Location"],
  ["Ing. Carlos Morales", "Eng. Carlos Morales"],
  ["Inscripción Abierta", "Open Registration"],
  ["Mesas pre-agendadas", "Pre-scheduled tables"],
  ["Pase General Diario", "General Daily Pass"],
  ["Planificá tu visita", "Plan your visit"],
  ["Registrá mi empresa", "Register my company"],
  ["Salón Internacional", "International Show"],
  ["Stands & Pabellones", "Stands & Pavilions"],
  ["Sujeto a cronograma", "Subject to schedule"],
  ["Turismo y servicios", "Tourism and services"],
  ["Ver agenda completa", "See full agenda"],
  ["Ver mapa del predio", "See map of the property"],
  ["⚡ Minería y Energía", "⚡ Mining and Energy"],
  ["9 al 12 de Octubre", "October 9 to 12"],
  ["BRASIL (Atlántico)", "BRAZIL (Atlantic)"],
  ["Carbonato de Litio", "Lithium Carbonate"],
  ["Chile (Bioceánico)", "Chile (Bioceanic)"],
  ["Comprar entradas →", "Buy tickets →"],
  ["Crecimiento Rápido", "Rapid Growth"],
  ["Depósitos Fiscales", "Fiscal Deposits"],
  ["Edición anual 2026", "2026 Annual Edition"],
  ["Empresa Energética", "Energy Company"],
  ["En auto particular", "In private car"],
  ["Espacio Innovación", "Innovation Space"],
  ["Espacio Rondas B2B", "B2B Rounds Space"],
  ["Esquema Bioceánico", "Bioceanic Scheme"],
  ["Horarios previstos", "Scheduled times"],
  ["Inscripción previa", "Pre-registration"],
  ["Logística Regional", "Regional Logistics"],
  ["Panel & Networking", "Dashboard & Networking"],
  ["Patio Gastronómico", "Gastronomic Patio"],
  ["Sala de Negocios B", "Business Room B"],
  ["Soporte Productivo", "Productive Support"],
  ["Todos los espacios", "All spaces"],
  ["Todos los sectores", "All sectors"],
  ["Transporte público", "Public transport"],
  ["Valles Andinos Bio", "Bio Andean Valleys"],
  ["Ver agenda oficial", "See official agenda"],
  ["💻 Tecnología e I+D", "💻 Technology and R&D"],
  ["Acceso Digital QR", "QR Digital Access"],
  ["Accesos adaptados", "Adapted access"],
  ["Agro & Bioceánico", "Agro & Bioceanic"],
  ["Email corporativo", "Corporate email"],
  ["Escenario Central", "Central Stage"],
  ["Exportación Clave", "Key Export"],
  ["Frutos Tropicales", "Tropical Fruits"],
  ["Gobierno de Jujuy", "Government of Jujuy"],
  ["Minería & Energía", "Mining & Energy"],
  ["Minería y Energía", "Mining and Energy"],
  ["Minería y energía", "Mining and energy"],
  ["Pabellón B (Agro)", "Pavilion B (Agro)"],
  ["Pabellón C (Tech)", "Pavilion C (Tech)"],
  ["Pabellón Temático", "Thematic Pavilion"],
  ["Panel Empresarial", "Business Dashboard"],
  ["Primeros auxilios", "First aid"],
  ["RESOLVÉ TUS DUDAS", "RESOLVE YOUR DOUBTS"],
  ["Reservar mi stand", "Reserve my stand"],
  ["Reservar un stand", "Reserve a booth"],
  ["Transporte Pesado", "Heavy Transport"],
  ["Valor Estratégico", "Strategic Value"],
  ["Área gastronómica", "Gastronomic area"],
  ["+250 Expositores", "+250 Exhibitors"],
  ["10:00 - 11:30 hs", "10:00 - 11:30 a.m."],
  ["10:00 a 22:00 hs", "10:00 a.m. to 10:00 p.m."],
  ["11:00 - 13:00 hs", "11:00 - 13:00"],
  ["12:30 - 14:00 hs", "12:30 - 2:00 p.m."],
  ["15:00 - 17:00 hs", "3:00 p.m. - 5:00 p.m."],
  ["15:30 - 17:00 hs", "3:30 p.m. - 5:00 p.m."],
  ["16:00 - 17:30 hs", "4:00 p.m. - 5:30 p.m."],
  ["17:30 - 19:00 hs", "5:30 p.m. - 7:00 p.m."],
  ["19:30 - 21:00 hs", "7:30 p.m. - 9:00 p.m."],
  ["Agro & Industria", "Agro & Industry"],
  ["Agtech Satelital", "Agtech Satellite"],
  ["CHILE (Pacífico)", "CHILE (Pacific)"],
  ["Comprar entradas", "Buy tickets"],
  ["Consultar Agenda", "Consult Agenda"],
  ["Dudas Frecuentes", "Frequently Asked Questions"],
  ["Empresas & PyMEs", "Companies & SMEs"],
  ["Nota importante:", "Important note:"],
  ["Pabellones A y B", "Pavilions A and B"],
  ["Próxima preventa", "Next pre-sale"],
  ["Salón Rondas B2B", "B2B Rounds Room"],
  ["Tech & Logística", "Tech & Logistics"],
  ["Tecnología e I+D", "Technology and R&D"],
  ["Validación mutua", "Mutual validation"],
  ["Ver recorridos →", "See tours →"],
  ["9 al 12 de oct.", "Oct 9-12"],
  ["Acreditarme B2B", "Accredit me B2B"],
  ["Ciudad Cultural", "Cultural City"],
  ["Descargar PDF →", "Download PDF →"],
  ["Eje Geopolítico", "Geopolitical Axis"],
  ["Emprendimientos", "Entrepreneurship"],
  ["Entradas con QR", "Tickets with QR"],
  ["Estacionamiento", "Parking lot"],
  ["Fintech & Pagos", "Fintech & Payments"],
  ["Limpiar filtros", "Clean filters"],
  ["Mapa del predio", "Property map"],
  ["Minería & Litio", "Mining & Lithium"],
  ["PARKING VIP/ORG", "VIP/ORG PARKING"],
  ["Parques Solares", "Solar Parks"],
  ["universitarios.", "university students."],
  ["Público General", "General public"],
  ["Recorré la expo", "I toured the expo"],
  ["Riego por Goteo", "Drip Irrigation"],
  ["Ronda Sectorial", "Sector Round"],
  ["Ruta Bioceánica", "Bioceanic Route"],
  ["Sabores Jujeños", "Jujuy Flavors"],
  ["Servicios Clave", "Key Services"],
  ["Solicitar Stand", "Request Stand"],
  ["Sponsor Platino", "Platinum Sponsor"],
  ["Ver Expositores", "See Exhibitors"],
  ["🌾 Agroindustria", "🌾 Agribusiness"],
  ["Acceso digital", "Digital access"],
  ["Personalizados", "Custom"],
  ["Domingo 11 Oct", "Sunday 11 Oct"],
  ["Palpalá, Jujuy", "Palpala, Jujuy"],
  ["Quiero exponer", "I want to expose"],
  ["Quiero visitar", "I want to visit"],
  ["Rampa Nivelada", "Level Ramp"],
  ["Sede principal", "Headquarters"],
  ["Software & I+D", "Software & R&D"],
  ["Traducción B2B", "B2B Translation"],
  ["Visitá ExpoJuy", "Visit ExpoJuy"],
  ["Wi-Fi gratuito", "Free Wi-Fi"],
  ["[Demostrativo]", "[Demonstrative]"],
  ["02 Junio 2026", "June 2, 2026"],
  ["15 días antes", "15 days before"],
  ["20 Junio 2026", "June 20, 2026"],
  ["Accesibilidad", "Accessibility"],
  ["Agroalimentos", "Agri-food"],
  ["Agroindustria", "Agribusiness"],
  ["Banco Oficial", "Official Bank"],
  ["Comercio Ext.", "Foreign Trade"],
  ["fotovoltaica.", "photovoltaic."],
  ["Fecha oficial", "Official date"],
  ["Pase Completo", "Full Pass"],
  ["Patio Gourmet", "Gourmet Patio"],
  ["Sábado 10 Oct", "Saturday 10 Oct"],
  ["Trayectoria &", "Career &"],
  ["Viernes 9 Oct", "Friday 9 Oct"],
  ["Vinculate B2B", "Link B2B"],
  ["🌍 Todo Origen", "🌍 All Origin"],
  ["15 Mayo 2026", "May 15, 2026"],
  ["Conferencias", "Conferences"],
  ["Demanda Alta", "High Demand"],
  ["Lunes 12 Oct", "Monday 12 Oct"],
  ["Nodo Central", "Central Node"],
  ["Norte Grande", "Great North"],
  ["PATIO GASTRO", "GASTRO PATIO"],
  ["Paso de Jama", "Jama Pass"],
  ["Paso inicial", "Initial step"],
  ["prioritaria.", "priority."],
  ["Estratégicos", "Strategic"],
  ["Ver detalles", "See details"],
  ["la región.\"", "the region.\""],
  ["A Confirmar", "To Confirm"],
  ["Banco Macro", "Macro Bank"],
  ["Comunidad y", "Community and"],
  ["Corporativo", "Corporate"],
  ["Cómo llegar", "How to get there"],
  ["Capricornio", "Capricorn"],
  ["y Comercial", "and Commercial"],
  ["Expositores", "Exhibitors"],
  ["Gastronomía", "Gastronomy"],
  ["Maquinarias", "Machineries"],
  ["Organizador", "Organizer"],
  ["Sponsor Oro", "Gold Sponsor"],
  ["Unipersonal", "sole proprietorship"],
  ["Ver detalle", "See detail"],
  ["Wi-Fi Libre", "Free Wi-Fi"],
  ["4 Jornadas", "4 days"],
  ["Bioceánico", "Bioceanic"],
  ["Bonificado", "Bonus"],
  ["Desarrollo", "Development"],
  ["Directorio", "Directory"],
  ["comercial.", "commercial."],
  ["Dom 12 Oct", "Sun 12 Oct"],
  ["Escenarios", "Scenarios"],
  ["Bioceánico", "Bioceanic"],
  ["Tecnología", "Technology"],
  ["IoT Minero", "IoT Miner"],
  ["Leer más →", "Read more →"],
  ["PABELLÓN A", "PAVILION A"],
  ["PABELLÓN B", "PAVILION B"],
  ["PABELLÓN C", "PAVILION C"],
  ["musicales.", "musicals."],
  ["RONDAS B2B", "B2B ROUNDS"],
  ["Sáb 11 Oct", "Sat 11 Oct"],
  ["Tecnología", "Technology"],
  ["Vie 10 Oct", "Fri 10 Oct"],
  ["Visitantes", "Visitors"],
  ["AUDITORIO", "AUDIENCE"],
  ["Bioetanol", "Bioethanol"],
  ["negocios.", "business."],
  ["Comercial", "Commercial"],
  ["Ediciones", "Editions"],
  ["Epicentro", "Epicenter"],
  ["Logístico", "Logistic"],
  ["Industria", "Industry"],
  ["Jue 9 Oct", "Thu 9 Oct"],
  ["vigilado.", "guarded"],
  ["Mi agenda", "my agenda"],
  ["Perfilado", "Profiling"],
  ["Novedades", "News"],
  ["RONDA B2B", "B2B ROUND"],
  ["negocios.", "business."],
  ["Servicios", "Services"],
  ["Ver ficha", "See file"],
  ["Zona Café", "Coffee Area"],
  ["10:00 hs", "10:00 a.m."],
  ["10:30 hs", "10:30 a.m."],
  ["12:30 hs", "12:30 p.m."],
  ["14:00 hs", "2:00 p.m."],
  ["15:00 hs", "3:00 p.m."],
  ["17:30 hs", "5:30 p.m."],
  ["18:00 hs", "6:00 p.m."],
  ["19:30 hs", "7:30 p.m."],
  ["Apertura", "Opening"],
  ["EXTERIOR", "ABROAD"],
  ["Entradas", "Tickets"],
  ["Práctica", "Practice"],
  ["Negocios", "Business"],
  ["Prensa y", "Press and"],
  ["Programa", "Program"],
  ["muestra.", "sample."],
  ["Sectores", "Sectors"],
  ["campaign", "campaigns"],
  ["Accesos", "Access"],
  ["Accesos", "Access"],
  ["ágiles.", "agile."],
  ["Centrar", "Center"],
  ["Charlas", "Talks"],
  ["Cultura", "Culture"],
  ["región.", "region."],
  ["Minería", "Mining"],
  ["Oficial", "Official"],
  ["Todos (", "All ("],
  ["Tucumán", "Tucuman"],
  ["Turismo", "Tourism"],
  ["país.\"", "country.\""],
  ["Brasil", "Brazil"],
  ["Cerrar", "Close"],
  ["Cierre", "Closing"],
  ["Inicio", "Start"],
  ["Países", "Countries"],
  ["Futuro", "Future"],
  ["1 Día", "1 Day"],
  ["Chile", "Chili"],
  ["Salta", "Jump"],
  ["Todos", "All"],
  ["event", "events"],
  ["Guía", "Guide"],
  ["Mapa", "Map"],
  ["mail", "email"],
  ["Eje", "Axis"],
  ["eco", "echo"],
  ["AJ", "A.J."],
  ["LC", "L.C."],
  ["LS", "L.S."],
  ["P.", "Q."],
  ["QT", "Q.T."],
  ["TY", "T.Y."],
  ["VA", "GOES"],
  ["wc", "toilet"],
];


/**
 * Aplica el diccionario de traducción al contenido HTML visible
 */
function applyTranslations(lang) {
  const isEn = lang === 'en';

  // 1. Actualizar estado activo de los botones ES / EN en el header
  const langButtons = document.querySelectorAll('header button[type="button"]');
  langButtons.forEach(btn => {
    const text = btn.textContent.trim().toUpperCase();
    if (text === lang.toUpperCase()) {
      btn.classList.add('bg-surface-container-lowest', 'text-on-surface', 'shadow-[0_1px_4px_rgba(0,0,0,0.06)]');
      btn.classList.remove('text-on-surface-variant');
    } else if (text === 'ES' || text === 'EN') {
      btn.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'shadow-[0_1px_4px_rgba(0,0,0,0.06)]');
      btn.classList.add('text-on-surface-variant');
    }
  });

  // 2. Traducción Navegación Principal en Header
  const navMap = {
    'home.html': isEn ? 'The Expo' : 'La Expo',
    'b2b.html': isEn ? 'B2B Matchmaking' : 'Vinculate B2B',
    'expositores.html': isEn ? 'Exhibitors' : 'Expositores',
    'agenda.html': isEn ? 'Schedule' : 'Agenda',
    'visita.html': isEn ? 'Visit Us' : 'Visitá'
  };

  document.querySelectorAll('header nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      for (const key in navMap) {
        if (href.endsWith(key)) {
          link.textContent = navMap[key];
          break;
        }
      }
    }
  });

  // 3. Recorrer todos los nodos de texto en document.body mediante TreeWalker
  const textNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  textNodes.forEach(node => {
    const rawText = node.nodeValue;
    const trimmedText = rawText.trim();
    if (!trimmedText) return;

    for (const item of masterDict) {
      const sourceStr = isEn ? item[0] : item[1];
      const targetStr = isEn ? item[1] : item[0];

      if (!sourceStr || !targetStr || sourceStr === targetStr) continue;

      if (trimmedText === sourceStr) {
        node.nodeValue = rawText.replace(sourceStr, targetStr);
        break;
      } else if (rawText.includes(sourceStr)) {
        node.nodeValue = node.nodeValue.replace(sourceStr, targetStr);
      }
    }
  });

  // 4. Aplicar atributos data-es y data-en en elementos específicos si los poseen
  document.querySelectorAll('[data-es][data-en]').forEach(el => {
    el.textContent = isEn ? el.getAttribute('data-en') : el.getAttribute('data-es');
  });

  // 5. Placeholders de búsqueda y formularios
  const placeholderMap = [
    ["Tu correo electrónico", "Your email address"],
    ["Buscar actividad, orador o tema...", "Search event, speaker or topic..."],
    ["Buscar por nombre de empresa, rubro, producto o número de stand...", "Search by company name, sector, product or booth number..."],
    ["Nombre y Apellido", "Full Name"],
    ["Empresa u Organización", "Company or Organization"]
  ];

  placeholderMap.forEach(item => {
    const fromPh = isEn ? item[0] : item[1];
    const toPh = isEn ? item[1] : item[0];
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
      if (input.getAttribute('placeholder') === fromPh) {
        input.setAttribute('placeholder', toPh);
      }
    });
  });
}

window.applyTranslations = applyTranslations;
