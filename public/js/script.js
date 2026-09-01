(function () {
  'use strict';

  // Year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mailto links — open client + clipboard fallback + visible feedback
  function showSiteToast(message) {
    var toast = document.getElementById('site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.className = 'site-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showSiteToast._hideTimer);
    showSiteToast._hideTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  function initMailtoLinks() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var href = link.getAttribute('href');
        if (!href) return;

        var email = link.getAttribute('data-email') || href.replace(/^mailto:/i, '').split('?')[0];

        try {
          window.location.href = href;
        } catch (err) {}

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(function () {
            showSiteToast('Opening email app… Address copied to clipboard.');
          }).catch(function () {
            showSiteToast('Email: ' + email);
          });
        } else {
          showSiteToast('Email: ' + email);
        }
      });
    });
  }

  initMailtoLinks();

  // Theme toggle (dark / light)
  var themeToggle = document.querySelector('.theme-toggle');
  var html = document.documentElement;
  var key = 'portfolio-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(dark) {
    if (dark) {
      html.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      html.setAttribute('data-theme', 'light');
      if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
    try {
      localStorage.setItem(key, dark ? 'dark' : 'light');
    } catch (e) {}
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function spinThemeIcon() {
    if (!themeToggle || prefersReducedMotion()) return;
    themeToggle.classList.remove('is-switching');
    // Force a reflow so the animation restarts on rapid clicks.
    void themeToggle.offsetWidth;
    themeToggle.classList.add('is-switching');
  }

  // Reveals the new theme as a circle growing out from the toggle button.
  // Falls back to an instant swap where View Transitions are unsupported.
  function setTheme(dark, origin) {
    spinThemeIcon();

    if (!document.startViewTransition || prefersReducedMotion() || !origin) {
      applyTheme(dark);
      return;
    }

    var x = origin.x;
    var y = origin.y;
    var radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // The incoming layer renders live, so the site's own colour transitions
    // would fade inside the reveal and muddy it. Freeze them for the duration.
    html.classList.add('theme-switching');

    var transition = document.startViewTransition(function () {
      applyTheme(dark);
    });

    transition.finished
      .catch(function () {})
      .then(function () {
        html.classList.remove('theme-switching');
      });

    transition.ready
      .then(function () {
        html.animate(
          {
            clipPath: [
              'circle(0px at ' + x + 'px ' + y + 'px)',
              'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)',
            ],
          },
          {
            duration: 550,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(function () {});
  }

  function isDark() {
    return html.getAttribute('data-theme') !== 'light';
  }

  var stored = getStoredTheme();
  if (stored === 'light') applyTheme(false);
  else if (stored === 'dark') applyTheme(true);
  else applyTheme(true);

  if (themeToggle) {
    themeToggle.addEventListener('click', function (e) {
      // Keyboard activation reports 0,0 — fall back to the button's centre.
      var rect = themeToggle.getBoundingClientRect();
      var origin = e.clientX || e.clientY
        ? { x: e.clientX, y: e.clientY }
        : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

      setTheme(!isDark(), origin);
    });

    themeToggle.addEventListener('animationend', function () {
      themeToggle.classList.remove('is-switching');
    });
  }

  // Certification Details modal
  var certData = {
    aws: {
      img: '/img/badges/aws-academy-graduate-cloud-foundations-training-bad.webp',
      title: 'AWS Academy Graduate - Cloud Foundations - Training Badge',
      org: 'Amazon Web Services Training and Certification',
      desc: 'Earners of this badge have taken the AWS Academy Cloud Foundations course and have been introduced to AWS products, services, and common solutions.',
      date: '5/16/2025',
      expiry: 'This credential does not expire',
      credId: '570259b7-e088-4308-a91e-25616ad6c1b9',
      url: 'https://www.credly.com/earner/earned/badge/570259b7-e088-4308-a91e-25616ad6c1b9',
      skills: ['AWS Architecture', 'AWS Cloud', 'AWS Core Services', 'AWS Pricing', 'AWS Support']
    },
    'redhat-ad183': {
      img: '/img/badges/red-hat-application-development-i-programming-in-ja.1.webp',
      title: 'Red Hat Application Development I: Programming in Java EE (AD183 - RHA) - Ver. 7.0',
      org: 'Red Hat',
      desc: 'This credential verifies the attendance of the Red Hat Application Development I: Programming in Java EE course.',
      date: '7/22/2025',
      expiry: 'This credential does not expire',
      credId: 'b5afbbac-c454-4bab-b9f9-19c7e7068ea3',
      url: 'https://www.credly.com/earner/earned/badge/b5afbbac-c454-4bab-b9f9-19c7e7068ea3',
      skills: ['Java Enterprise Edition (JEE)', 'Red Hat', 'Red Hat Academy', 'Red Hat Application Development']
    },
    'redhat-do188': {
      img: '/img/badges/red-hat-openshift-development-i-introduction-to-con.2.webp',
      title: 'Red Hat OpenShift Development I: Introduction to Containers with Podman (DO188 - RHA) - Ver. 4.18',
      org: 'Red Hat',
      desc: 'This credential verifies the attendance of the Red Hat OpenShift Development I: Introduction to Containers with Podman course.',
      date: '7/22/2025',
      expiry: 'This credential does not expire',
      credId: '26662f19-ed7a-49db-9bf6-99be9087e372',
      url: 'https://www.credly.com/earner/earned/badge/26662f19-ed7a-49db-9bf6-99be9087e372',
      skills: ['DevOps', 'Red Hat OpenShift', 'Basic container networking', 'Containers', 'OpenShift', 'Podman', 'Podman Desktop', 'Red Hat Academy', 'Run multi-container applications', 'Troubleshoot Container Deployments']
    },
    'tesda-nc2': {
      img: '/certs/NCII Cert.pdf',
      title: 'National Certificate II in Computer Systems Servicing (CSS NC II) 2026',
      org: 'Technical Education and Skills Development Authority (TESDA)',
      desc: 'National Certificate (NC II) in Computer Systems Servicing — Passed: August 2026',
      date: 'August 2026',
      expiry: '—',
      credId: '—',
      url: '/certs/NCII Cert.pdf',
      viewLabel: 'View Certificate',
      skills: []
    },
    
    'databiz-2025': {
      img: '/img/certificates/5f9e17b9-1e39-4a98-97a3-9171e3384477.webp',
      title: 'Certificate of Participation — DATABIZ 2025',
      org: 'Batangas Information Technology Society',
      desc: 'For actively participating in the DATABIZ 2025 Conference with the theme "Future-Proof Skills: Empowering Students with Data, AI, and Analytics" held on October 25, 2025 at Lipa Academy for Sports, Culture, and Arts (LASCA), Lipa City.',
      date: 'October 25, 2025',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/5f9e17b9-1e39-4a98-97a3-9171e3384477.webp',
      viewLabel: 'View Certificate',
      skills: []
    },
    'bitcon-2025': {
      img: '/img/certificates/042d7b7d-23f2-4e63-a5ea-4060b3fda89f.webp',
      title: 'Certificate of Participation — BITCON 2025',
      org: 'Batangas Information Technology Society',
      desc: 'For active participation in the Batangas Information Technology Conference (BITCON) 2025 with the theme "Building a Connected Tomorrow: IoT Innovations and Beyond", given April 26, 2025 at Lipa Academy for Sports, Culture and Arts Convention Center, Dagatan, Lipa City.',
      date: 'April 26, 2025',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/042d7b7d-23f2-4e63-a5ea-4060b3fda89f.webp',
      viewLabel: 'View Certificate',
      skills: []
    },
    'techno-sdg-2024': {
      img: '/img/certificates/9740ccc7-3490-440c-a420-388ccfc47e59.webp',
      title: 'Certificate of Participation — Techno SDG Exposition',
      org: 'Junior Philippine Computer Society - Lipa Chapter & Tech Innovators Society, Batangas State University The NEU Lipa',
      desc: 'For active participation during the event "Techno SDG Exposition: Bridging Insights and Innovation", a collaborative initiative between JPCS and Tech Innovators Society held at 1st flr Gregorio Zara Building, BatStateU-TNEU Lipa Campus on February 28, 2024.',
      date: 'February 28, 2024',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/9740ccc7-3490-440c-a420-388ccfc47e59.webp',
      viewLabel: 'View Certificate',
      skills: []
    },
    'techsynergy-2023': {
      img: '/img/certificates/c2228d3d-ac23-4705-b078-69c092e1be0f.webp',
      title: 'Certificate of Participation — TechSynergy 2023',
      org: 'Junior Philippine Computer Society - Lipa Chapter, Batangas State University The NEU Lipa',
      desc: 'For active and invaluable participation during "TechSynergy: Navigating the Digital Landscape 2023 - Connecting Concepts, Bridging Technologies" held on December 4, 2023 at Batangas State University TheNEU - Lipa.',
      date: 'December 4, 2023',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/c2228d3d-ac23-4705-b078-69c092e1be0f.webp',
      viewLabel: 'View Certificate',
      skills: []
    }
  };

  var certModal = document.getElementById('cert-modal');
  var certModalBackdrop = certModal && certModal.querySelector('.cert-modal-backdrop');
  var certModalCloseBtn = certModal && certModal.querySelector('.cert-modal-close');
  var certModalCloseLink = certModal && certModal.querySelector('.cert-modal-close-link');
  var certModalViewBtn = document.getElementById('cert-modal-view-btn');
  var currentCertId = null;

  var certLightbox = document.getElementById('cert-lightbox');
  var certLightboxImg = document.getElementById('cert-lightbox-img');
  var certLightboxClose = certLightbox && certLightbox.querySelector('.cert-lightbox-close');
  var certLightboxBackdrop = certLightbox && certLightbox.querySelector('.cert-lightbox-backdrop');

  function openCertLightbox(imgSrc, imgAlt) {
    if (!certLightbox) return;
    var iframe = document.getElementById('cert-lightbox-iframe');
    // If PDF, show in iframe; otherwise show as image
      if (iframe && imgSrc && typeof imgSrc === 'string' && imgSrc.toLowerCase().endsWith('.pdf')) {
      if (certLightboxImg) certLightboxImg.style.display = 'none';
      iframe.style.display = '';
      // Append a PDF fragment to fit page width in the browser PDF viewer
      try {
        var pdfSrc = imgSrc + (imgSrc.indexOf('#') === -1 ? '#zoom=page-width' : '&zoom=page-width');
      } catch (e) { var pdfSrc = imgSrc; }
      iframe.src = pdfSrc;
      iframe.title = imgAlt || 'Certificate (PDF)';
    } else {
      if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }
      if (!certLightboxImg) return;
      certLightboxImg.style.display = '';
      certLightboxImg.src = imgSrc;
      certLightboxImg.alt = imgAlt || 'Certificate';
    }
    certLightbox.classList.add('is-open');
    certLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCertLightbox() {
    if (!certLightbox) return;
    var iframe = document.getElementById('cert-lightbox-iframe');
    if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }
    if (certLightboxImg) { certLightboxImg.src = ''; certLightboxImg.style.display = ''; }
    certLightbox.classList.remove('is-open');
    certLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openCertModal(id) {
    var data = certData[id];
    if (!certModal || !data) return;
    currentCertId = id;
    var img = document.getElementById('cert-modal-img');
    var titleText = document.getElementById('cert-modal-title-text');
    var org = document.getElementById('cert-modal-org');
    var desc = document.getElementById('cert-modal-desc');
    var date = document.getElementById('cert-modal-date');
    var expiry = document.getElementById('cert-modal-expiry');
    var credId = document.getElementById('cert-modal-cred-id');
    var urlWrap = document.getElementById('cert-modal-url-wrap');
    var skillsEl = document.getElementById('cert-modal-skills');

    if (img) { img.src = data.img; img.alt = data.title; }
    if (titleText) titleText.textContent = data.title;
    if (org) org.textContent = data.org;
    if (desc) desc.textContent = data.desc;
    if (date) date.textContent = data.date;
    if (expiry) expiry.textContent = data.expiry;
    if (credId) credId.textContent = data.credId;
    if (urlWrap) {
      urlWrap.innerHTML = '';
      var link = document.createElement('a');
      link.href = data.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = (data.viewLabel || 'See Badge Details Page') + ' ';
      var icon = document.createElement('i');
      icon.className = 'fa-solid fa-external-link-alt';
      icon.setAttribute('aria-hidden', 'true');
      link.appendChild(icon);
      urlWrap.appendChild(link);
    }
    if (certModalViewBtn) {
      certModalViewBtn.href = data.url;
      var label = (data.viewLabel || 'View Badge') + ' ';
      certModalViewBtn.innerHTML = label + '<i class="fa-solid fa-external-link-alt" aria-hidden="true"></i>';
    }
    if (skillsEl && data.skills && data.skills.length) {
      skillsEl.innerHTML = '';
      data.skills.forEach(function (skill) {
        var tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        skillsEl.appendChild(tag);
      });
    } else if (skillsEl) skillsEl.textContent = '';

    certModal.setAttribute('aria-hidden', 'false');
    certModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  if (certModalViewBtn) {
    certModalViewBtn.addEventListener('click', function (e) {
      if (currentCertId && certData[currentCertId] && certData[currentCertId].viewLabel) {
        e.preventDefault();
        closeCertModal();
        openCertLightbox(certData[currentCertId].img, certData[currentCertId].title);
      }
    });
  }

  if (certLightbox) {
    if (certLightboxClose) certLightboxClose.addEventListener('click', closeCertLightbox);
    if (certLightboxBackdrop) certLightboxBackdrop.addEventListener('click', closeCertLightbox);
    certLightbox.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCertLightbox();
    });
  }

  function closeCertModal() {
    if (!certModal) return;
    certModal.classList.remove('is-open');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (certModal) {
    if (certModalBackdrop) certModalBackdrop.addEventListener('click', closeCertModal);
    if (certModalCloseBtn) certModalCloseBtn.addEventListener('click', closeCertModal);
    if (certModalCloseLink) certModalCloseLink.addEventListener('click', closeCertModal);
    certModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCertModal();
    });
  }

  document.querySelectorAll('.cert-view-btn').forEach(function (btn) {
    var id = btn.getAttribute('data-cert-id');
    if (!id) return;
    btn.addEventListener('click', function () {
      var data = certData[id];
      if (data && data.viewLabel) {
        openCertLightbox(data.img, data.title);
      } else {
        openCertModal(id);
      }
    });
  });

  // Populate badge skills in cert rows
  document.querySelectorAll('.cert-row-skills').forEach(function (el) {
    var id = el.getAttribute('data-cert-id');
    var data = certData[id];
    if (!data || !data.skills || !data.skills.length) return;
    data.skills.forEach(function (skill) {
      var tag = document.createElement('span');
      tag.className = 'skill-tag cert-skill-tag';
      tag.textContent = skill;
      el.appendChild(tag);
    });
  });

  // Project preview modal
  var projectImgBase = '/img/projects/';

  var projectData = {
    'mood-studios': {
      title: 'Mood Studios Web and Mobile Application',
      tagline: 'Booking system for Mood Studios in Bacoor, Cavite',
      repo: 'https://github.com/mood-studios/moodstudios-backend',
      description: 'A full-stack web and mobile application developed for a photography studio business to streamline booking, client management, and payment processing. The web application was built using React, while the mobile application was developed using Flutter to provide a seamless cross-platform experience. The backend was powered by Node.js, enabling efficient API handling and system integration. The system also integrates PayMongo for secure online payment transactions, allowing clients to conveniently pay for photography packages and reservations digitally.',
      stackCategories: [
        {
          name: 'Frontend',
          items: [
            { label: 'JavaScript', icon: 'fa-brands fa-js' },
            { label: 'React', icon: 'fa-brands fa-react' }
          ]
        },
        {
          name: 'Mobile',
          items: [
            { label: 'Flutter', icon: 'fa-solid fa-mobile-screen' },
            { label: 'Dart', icon: 'fa-solid fa-code' }
          ]
        },
        {
          name: 'Backend',
          items: [
            { label: 'Node.js', icon: 'fa-brands fa-node-js' }
          ]
        },
        {
          name: 'Database & Integrations',
          items: [
            { label: 'MongoDB', icon: 'fa-solid fa-database' },
            { label: 'PayMongo', icon: 'fa-solid fa-credit-card' }
          ]
        }
      ],
      images: ['moodstudios.webp', 'moodstudios2.webp', 'moodstudios3.webp']
    },
    safebite: {
      title: 'SafeBite: Smart Monitoring Platform for Food Spoilage',
      tagline: 'IoT-based food spoilage monitoring with AI-driven analysis',
      repo: 'https://github.com/kayl10913/SafeBite_Server',
      description: 'SafeBite is an IoT-based food spoilage monitoring system designed to help users detect and prevent food waste through smart monitoring technology. The system utilizes multiple sensors to gather environmental and food condition data, which are analyzed using AI-driven techniques to determine spoilage levels and generate real-time alerts. The platform combines IoT hardware, data analytics, and artificial intelligence to improve food safety, monitoring accuracy, and early spoilage detection for households and businesses.',
      stackCategories: [
        {
          name: 'Frontend',
          items: [
            { label: 'PHP', icon: 'fa-brands fa-php' }
          ]
        },
        {
          name: 'Backend',
          items: [
            { label: 'JavaScript', icon: 'fa-brands fa-js' },
            { label: 'Node.js', icon: 'fa-brands fa-node-js' }
          ]
        },
        {
          name: 'Database',
          items: [
            { label: 'MySQL', icon: 'fa-solid fa-database' }
          ]
        },
        {
          name: 'IoT & AI',
          items: [
            { label: 'IoT Sensors', icon: 'fa-solid fa-microchip' },
            { label: 'AI-driven Analysis', icon: 'fa-solid fa-brain' }
          ]
        }
      ],
      images: ['safebite.webp', 'safebite2.webp', 'safebite3.webp']
    },
    midwest: {
      title: 'Midwest Web and Mobile Application',
      tagline: 'Web admin dashboard with sales forecasting and analytics',
      repo: 'https://github.com/aleshamarie/Midwest_Server',
      description: 'A modern web and mobile management platform developed for business operations, featuring an admin dashboard with advanced analytics and AI-powered sales forecasting. The system provides real-time monitoring of business performance, sales trends, and operational insights through interactive dashboards and data visualization tools. Artificial intelligence integration enhances decision-making by predicting future sales patterns and generating analytical reports to support strategic business planning.',
      stackCategories: [
        {
          name: 'Frontend',
          items: [
            { label: 'JavaScript', icon: 'fa-brands fa-js' },
            { label: 'React', icon: 'fa-brands fa-react' }
          ]
        },
        {
          name: 'Mobile',
          items: [
            { label: 'Flutter', icon: 'fa-solid fa-mobile-screen' },
            { label: 'Dart', icon: 'fa-solid fa-code' }
          ]
        },
        {
          name: 'Backend',
          items: [
            { label: 'Node.js', icon: 'fa-brands fa-node-js' }
          ]
        },
        {
          name: 'Database',
          items: [
            { label: 'MongoDB', icon: 'fa-solid fa-database' }
          ]
        }
      ],
      images: ['midwest.webp', 'midwest2.webp', 'midwest3.webp']
    },
    'unit-testing': {
      title: 'Unit Testing Generator with AI + Code Vulnerability Checker',
      tagline: 'AI-powered unit test generation and code vulnerability scanning',
      description: 'An AI-powered software development tool designed to automate unit test generation and detect potential security vulnerabilities in source code. The system analyzes uploaded or existing codebases to generate accurate unit test cases, helping developers improve software reliability and testing efficiency. It also performs vulnerability scanning to identify insecure coding practices, possible exploits, and security risks, assisting developers in maintaining secure and high-quality applications throughout the development lifecycle.',
      stackCategories: [
        {
          name: 'Frontend',
          items: [
            { label: 'JavaScript', icon: 'fa-brands fa-js' },
            { label: 'Vite React', icon: 'fa-solid fa-bolt' }
          ]
        },
        {
          name: 'Backend',
          items: [
            { label: 'Python', icon: 'fa-brands fa-python' }
          ]
        },
        {
          name: 'AI & Security',
          items: [
            { label: 'AI-powered Unit Test Generation', icon: 'fa-solid fa-vial' },
            { label: 'Code Vulnerability Scanning', icon: 'fa-solid fa-shield-halved' }
          ]
        }
      ],
      images: []
    }
  };

  var projectModal = document.getElementById('project-modal');
  var projectModalBackdrop = projectModal && projectModal.querySelector('.project-modal-backdrop');
  var projectModalCloseBtn = projectModal && projectModal.querySelector('.project-modal-close');
  var projectModalCloseLink = projectModal && projectModal.querySelector('.project-modal-close-link');
  var projectModalTitle = document.getElementById('project-modal-title');
  var projectModalTagline = document.getElementById('project-modal-tagline');
  var projectModalDesc = document.getElementById('project-modal-desc');
  var projectModalTechStack = document.getElementById('project-modal-tech-stack');
  var projectModalGalleryWrap = document.getElementById('project-modal-gallery-wrap');
  var projectModalImg = document.getElementById('project-modal-img');
  var projectGalleryPrev = projectModal && projectModal.querySelector('.project-gallery-prev');
  var projectGalleryNext = projectModal && projectModal.querySelector('.project-gallery-next');
  var projectGalleryDots = document.getElementById('project-gallery-dots');
  var projectGalleryCurrent = document.getElementById('project-gallery-current');
  var projectGalleryTotal = document.getElementById('project-gallery-total');
  var projectGalleryFrame = projectModal && projectModal.querySelector('.project-gallery-frame');
  var projectGalleryHint = document.getElementById('project-gallery-hint');
  var projectModalRepo = document.getElementById('project-modal-repo');
  var currentProjectImages = [];
  var currentProjectIndex = 0;

  function projectImageSrc(filename) {
    return projectImgBase + filename;
  }

  function updateProjectGallery() {
    if (!currentProjectImages.length || !projectModalImg) return;
    var src = currentProjectImages[currentProjectIndex];
    projectModalImg.src = src;
    projectModalImg.alt = (projectModalTitle && projectModalTitle.textContent) || 'Project screenshot';
    if (projectGalleryCurrent) projectGalleryCurrent.textContent = String(currentProjectIndex + 1);
    if (projectGalleryTotal) projectGalleryTotal.textContent = String(currentProjectImages.length);
    if (projectGalleryPrev) projectGalleryPrev.disabled = currentProjectIndex === 0;
    if (projectGalleryNext) projectGalleryNext.disabled = currentProjectIndex === currentProjectImages.length - 1;
    if (projectGalleryDots) {
      projectGalleryDots.querySelectorAll('.project-gallery-dot').forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === currentProjectIndex);
        dot.setAttribute('aria-selected', i === currentProjectIndex ? 'true' : 'false');
      });
    }
  }

  function showProjectSlide(index) {
    if (!currentProjectImages.length) return;
    currentProjectIndex = Math.max(0, Math.min(index, currentProjectImages.length - 1));
    updateProjectGallery();
  }

  function renderProjectTechStack(container, categories) {
    if (!container) return;
    container.innerHTML = '';
    (categories || []).forEach(function (category) {
      if (!category.items || !category.items.length) return;

      var categoryEl = document.createElement('div');
      categoryEl.className = 'tech-category';

      var heading = document.createElement('h3');
      heading.textContent = category.name;
      categoryEl.appendChild(heading);

      var pills = document.createElement('div');
      pills.className = 'tech-pills';

      category.items.forEach(function (item) {
        var pill = document.createElement('span');
        pill.className = 'pill';

        if (item.icon) {
          var icon = document.createElement('i');
          icon.className = item.icon;
          icon.setAttribute('aria-hidden', 'true');
          pill.appendChild(icon);
          pill.appendChild(document.createTextNode(' ' + item.label));
        } else {
          pill.textContent = item.label;
        }

        pills.appendChild(pill);
      });

      categoryEl.appendChild(pills);
      container.appendChild(categoryEl);
    });
  }

  function openProjectModal(id) {
    var data = projectData[id];
    if (!projectModal || !data) return;

    currentProjectImages = (data.images || []).map(projectImageSrc);
    currentProjectIndex = 0;

    if (projectModalTitle) projectModalTitle.textContent = data.title;
    if (projectModalTagline) projectModalTagline.textContent = data.tagline || '';
    if (projectModalDesc) projectModalDesc.textContent = data.description || '';

    renderProjectTechStack(projectModalTechStack, data.stackCategories);

    if (projectModalRepo) {
      projectModalRepo.classList.toggle('is-hidden', !data.repo);
      if (data.repo) {
        projectModalRepo.href = data.repo;
      } else {
        projectModalRepo.removeAttribute('href');
      }
    }

    if (projectModalGalleryWrap) {
      projectModalGalleryWrap.classList.toggle('is-hidden', !currentProjectImages.length);
    }

    resetGalleryDrag();
    if (projectGalleryHint) {
      projectGalleryHint.classList.toggle('is-hidden', currentProjectImages.length < 2);
    }

    if (projectGalleryDots) {
      projectGalleryDots.innerHTML = '';
      currentProjectImages.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'project-gallery-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Screenshot ' + (i + 1));
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', function () {
          showProjectSlide(i);
        });
        projectGalleryDots.appendChild(dot);
      });
    }

    if (currentProjectImages.length) {
      updateProjectGallery();
    } else if (projectModalImg) {
      projectModalImg.removeAttribute('src');
    }

    projectModal.classList.add('is-open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetGalleryDrag();
    if (projectModalImg) projectModalImg.removeAttribute('src');
  }

  if (projectModal) {
    if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeProjectModal);
    if (projectModalCloseBtn) projectModalCloseBtn.addEventListener('click', closeProjectModal);
    if (projectModalCloseLink) projectModalCloseLink.addEventListener('click', closeProjectModal);
    projectModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeProjectModal();
      if (!projectModal.classList.contains('is-open')) return;
      if (e.key === 'ArrowLeft') showProjectSlide(currentProjectIndex - 1);
      if (e.key === 'ArrowRight') showProjectSlide(currentProjectIndex + 1);
    });
  }

  if (projectGalleryPrev) {
    projectGalleryPrev.addEventListener('click', function () {
      showProjectSlide(currentProjectIndex - 1);
    });
  }

  if (projectGalleryNext) {
    projectGalleryNext.addEventListener('click', function () {
      showProjectSlide(currentProjectIndex + 1);
    });
  }

  // ----- Gallery swipe (touch) -----
  // The frame declares `touch-action: pan-y pinch-zoom`, so the browser keeps
  // vertical scrolling and zoom while horizontal drags arrive here untouched.
  // That lets every listener stay passive.
  var SWIPE_COMMIT_PX = 45;
  var SWIPE_LOCK_PX = 8;
  var SWIPE_EDGE_RESISTANCE = 0.25;
  var swipeStartX = 0;
  var swipeStartY = 0;
  var swipeOffset = 0;
  var swipeActive = false;
  var swipeIsHorizontal = null;

  function setSwipeOffset(px) {
    if (!projectModalImg) return;
    projectModalImg.style.transform = px ? 'translateX(' + px + 'px)' : '';
  }

  function resetGalleryDrag() {
    swipeActive = false;
    swipeIsHorizontal = null;
    swipeOffset = 0;
    if (projectGalleryFrame) projectGalleryFrame.classList.remove('is-dragging');
    setSwipeOffset(0);
  }

  // Dragging past the first or last shot only gives a little, mirroring the
  // disabled prev/next buttons at the ends.
  function dampenAtEdges(dx) {
    var atStart = currentProjectIndex === 0 && dx > 0;
    var atEnd = currentProjectIndex === currentProjectImages.length - 1 && dx < 0;
    return atStart || atEnd ? dx * SWIPE_EDGE_RESISTANCE : dx;
  }

  if (projectGalleryFrame) {
    projectGalleryFrame.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1 || currentProjectImages.length < 2) return;
      swipeActive = true;
      swipeIsHorizontal = null;
      swipeOffset = 0;
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
    }, { passive: true });

    projectGalleryFrame.addEventListener('touchmove', function (e) {
      if (!swipeActive || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - swipeStartX;
      var dy = e.touches[0].clientY - swipeStartY;

      if (swipeIsHorizontal === null) {
        if (Math.abs(dx) < SWIPE_LOCK_PX && Math.abs(dy) < SWIPE_LOCK_PX) return;
        swipeIsHorizontal = Math.abs(dx) > Math.abs(dy);
        // A vertical drag belongs to the scrolling modal body, so bow out.
        if (!swipeIsHorizontal) {
          swipeActive = false;
          return;
        }
        projectGalleryFrame.classList.add('is-dragging');
      }

      swipeOffset = dampenAtEdges(dx);
      setSwipeOffset(swipeOffset);
    }, { passive: true });

    projectGalleryFrame.addEventListener('touchend', function () {
      if (!swipeActive) return;
      swipeActive = false;

      var dx = swipeOffset;
      swipeOffset = 0;

      if (Math.abs(dx) > SWIPE_COMMIT_PX) {
        // Drop the offset while transitions are still off so the incoming
        // screenshot appears centred instead of sliding in from the drag.
        setSwipeOffset(0);
        showProjectSlide(currentProjectIndex + (dx < 0 ? 1 : -1));
        requestAnimationFrame(function () {
          if (projectGalleryFrame) projectGalleryFrame.classList.remove('is-dragging');
        });
        return;
      }

      if (projectGalleryFrame) projectGalleryFrame.classList.remove('is-dragging');
      setSwipeOffset(0);
    }, { passive: true });

    projectGalleryFrame.addEventListener('touchcancel', resetGalleryDrag, { passive: true });
  }

  document.querySelectorAll('.project-view-btn').forEach(function (btn) {
    var id = btn.getAttribute('data-project-id');
    if (!id || !projectData[id]) return;
    btn.addEventListener('click', function () {
      openProjectModal(id);
    });
  });

  // Mobile nav toggle
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Scroll spy for nav — sync highlight with scroll position
  var navSectionIds = ['about', 'experience', 'tech-stack', 'projects', 'certifications', 'contact'];
  var navAnchors = document.querySelectorAll('.nav-links a');

  function getNavMarker() {
    var header = document.querySelector('.site-header');
    var headerHeight = header ? header.offsetHeight : 57;
    return window.scrollY + headerHeight + 48;
  }

  function getSectionDocumentTop(el) {
    return window.scrollY + el.getBoundingClientRect().top;
  }

  function setActiveNavSection(id) {
    navAnchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      anchor.classList.toggle('is-active', href.slice(1) === id);
    });
  }

  function getVisibleSectionHeight(el, headerHeight) {
    var rect = el.getBoundingClientRect();
    var top = Math.max(rect.top, headerHeight);
    var bottom = Math.min(rect.bottom, window.innerHeight);
    return Math.max(0, bottom - top);
  }

  function updateActiveNav() {
    var header = document.querySelector('.site-header');
    var headerHeight = header ? header.offsetHeight : 57;
    var current = '';
    var bestVisible = 0;

    navSectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;

      var visible = getVisibleSectionHeight(el, headerHeight);
      var idIndex = navSectionIds.indexOf(id);
      var currentIndex = current ? navSectionIds.indexOf(current) : -1;

      if (
        visible > bestVisible + 2 ||
        (Math.abs(visible - bestVisible) <= 2 && visible > 0 && idIndex < currentIndex)
      ) {
        bestVisible = visible;
        current = id;
      }
    });

    if (!current) {
      var marker = getNavMarker();
      navSectionIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && getSectionDocumentTop(el) <= marker) {
          current = id;
        }
      });
    }

    setActiveNavSection(current);
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav);
  updateActiveNav();

  navAnchors.forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();
      var header = document.querySelector('.site-header');
      var headerHeight = header ? header.offsetHeight : 57;
      var top = getSectionDocumentTop(target) - headerHeight - 16;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setActiveNavSection(href.slice(1));
    });
  });

  // Reveal sections on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // Hero terminal — interactive command layer
  var heroTerminalLog = document.getElementById('hero-terminal-log');
  var heroTerminalScroll = document.getElementById('hero-terminal-scroll');
  var heroTerminalForm = document.getElementById('hero-terminal-form');
  var heroTerminalInput = document.getElementById('hero-terminal-input');
  var heroTerminalSuggestions = document.getElementById('hero-terminal-suggestions');
  var terminalOutput = document.querySelector('#terminal-output code');
  var heroCmdHistory = [];
  var heroHistoryIndex = -1;

  var heroProfileJson = [
    '{',
    '  <span class="json-key">"name"</span>: <span class="json-str">"Kyle Matthew Calingasan"</span>,',
    '  <span class="json-key">"role"</span>: <span class="json-str">"Backend Developer"</span>,',
    '  <span class="json-key">"location"</span>: <span class="json-str">"Taguig, PH"</span>,',
    '  <span class="json-key">"honors"</span>: <span class="json-str">"Cum Laude — BS IT, BatStateU TNEU Lipa"</span>,',
    '  <span class="json-key json-key-click" data-cmd="stack" role="button" tabindex="0" title="Run: stack">"tech_stack"</span>: {',
    '    <span class="json-key">"frontend"</span>: [<span class="json-str">"JavaScript"</span>, <span class="json-str">"React"</span>, <span class="json-str">"HTML/CSS"</span>],',
    '    <span class="json-key">"backend"</span>: [<span class="json-str">"Python"</span>, <span class="json-str">"PHP"</span>, <span class="json-str">"Java EE"</span>, <span class="json-str">"Node.js"</span>],',
    '    <span class="json-key">"mobile"</span>: [<span class="json-str">"React Native"</span>, <span class="json-str">"Flutter"</span>],',
    '    <span class="json-key">"devops"</span>: [<span class="json-str">"AWS"</span>, <span class="json-str">"Docker"</span>, <span class="json-str">"Kubernetes"</span>]',
    '  },',
    '  <span class="json-key json-key-click" data-cmd="certs" role="button" tabindex="0" title="Run: certs">"certs"</span>: <span class="json-num">3</span>,',
    '  <span class="json-key json-key-click" data-cmd="contact" role="button" tabindex="0" title="Run: contact">"status"</span>: <span class="json-str">"open_to_work"</span>',
    '}'
  ].join('\n');

  var heroCommands = [
    'help', 'profile', 'projects', 'certs', 'stack', 'contact',
    'about', 'experience', 'assistant', 'clear', 'view', 'go'
  ];

  var heroCmdHistory = [];
  var heroHistoryIndex = -1;
  var heroTerminalBusy = false;
  var heroReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollHeroTerminal() {
    if (heroTerminalScroll) heroTerminalScroll.scrollTop = heroTerminalScroll.scrollHeight;
  }

  function escapeTermHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function setHeroTerminalBusy(busy) {
    heroTerminalBusy = busy;
    if (heroTerminalInput) heroTerminalInput.disabled = busy;
    if (heroTerminalForm) heroTerminalForm.classList.toggle('is-busy', busy);
    var inputLine = heroTerminalForm && heroTerminalForm.querySelector('.hero-terminal-input-line');
    if (inputLine) inputLine.classList.toggle('is-busy', busy);
    if (heroTerminalSuggestions) {
      heroTerminalSuggestions.querySelectorAll('.terminal-cmd-suggest').forEach(function (btn) {
        btn.disabled = busy;
      });
    }
    if (!busy && heroTerminalInput) {
      try {
        heroTerminalInput.focus({ preventScroll: true });
      } catch (e) {
        heroTerminalInput.focus();
      }
    }
  }

  function getTypeSpeed(textLength) {
    if (textLength > 280) return 5;
    if (textLength > 120) return 8;
    if (textLength > 50) return 11;
    return 14;
  }

  function typeHeroCommandLine(cmd, done) {
    if (!heroTerminalLog) {
      done();
      return;
    }

    var line = document.createElement('p');
    line.className = 'terminal-line';
    var cmdSpan = document.createElement('span');
    cmdSpan.className = 'hero-terminal-cmd';
    line.innerHTML = '<span class="terminal-prompt">$</span> ';
    line.appendChild(cmdSpan);
    heroTerminalLog.appendChild(line);

    if (heroReducedMotion) {
      cmdSpan.textContent = cmd;
      scrollHeroTerminal();
      done();
      return;
    }

    var index = 0;
    var speed = 10;

    function tick() {
      if (index >= cmd.length) {
        scrollHeroTerminal();
        done();
        return;
      }
      index += 1;
      cmdSpan.textContent = cmd.slice(0, index);
      scrollHeroTerminal();
      setTimeout(tick, speed);
    }

    tick();
  }

  function typeHeroOutput(text, isHtml, done) {
    if (!heroTerminalLog) {
      done();
      return;
    }

    var block = document.createElement('div');
    block.className = 'hero-terminal-out is-typing';
    var content = document.createElement('span');
    content.className = 'hero-terminal-out-text';
    var cursor = document.createElement('span');
    cursor.className = 'hero-terminal-type-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    block.appendChild(content);
    block.appendChild(cursor);
    heroTerminalLog.appendChild(block);

    var plain = isHtml
      ? text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      : text;

    if (heroReducedMotion) {
      cursor.remove();
      block.classList.remove('is-typing');
      if (isHtml) block.innerHTML = text;
      else content.textContent = text;
      scrollHeroTerminal();
      done();
      return;
    }

    var index = 0;
    var speed = getTypeSpeed(plain.length);

    function tick() {
      if (index >= plain.length) {
        cursor.remove();
        block.classList.remove('is-typing');
        if (isHtml) {
          content.remove();
          block.innerHTML = text;
        }
        scrollHeroTerminal();
        done();
        return;
      }
      index += 1;
      content.textContent = plain.slice(0, index);
      scrollHeroTerminal();
      setTimeout(tick, speed);
    }

    setTimeout(tick, 80);
  }

  function runHeroResponse(cmd, output, options) {
    options = options || {};

    if (!options.clearLog) {
      heroCmdHistory.push(cmd);
      heroHistoryIndex = heroCmdHistory.length;
    }

    setHeroTerminalBusy(true);

    typeHeroCommandLine(cmd, function () {
      if (options.clearLog) {
        if (heroTerminalLog) heroTerminalLog.innerHTML = '';
        setHeroTerminalBusy(false);
        return;
      }

      if (output == null || output === '') {
        setHeroTerminalBusy(false);
        if (options.onComplete) options.onComplete();
        return;
      }

      setTimeout(function () {
        typeHeroOutput(output, !!options.isHtml, function () {
          setHeroTerminalBusy(false);
          if (options.onComplete) options.onComplete();
        });
      }, options.pause || 140);
    });
  }

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var header = document.querySelector('.site-header');
    var headerHeight = header ? header.offsetHeight : 57;
    var top = window.scrollY + el.getBoundingClientRect().top - headerHeight - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function getProjectsListText() {
    return Object.keys(projectData).map(function (id) {
      var p = projectData[id];
      var slug = id;
      return slug + ' — ' + p.tagline;
    }).join('\n') + '\n\nType: view <project>  e.g. view safebite';
  }

  function getCertsListText() {
    return [
      'AWS Academy Graduate — Cloud Foundations',
      'Red Hat Application Development I: Java EE (AD183)',
      'Red Hat OpenShift Development I: Containers with Podman (DO188)'
    ].join('\n');
  }

  function getStackText() {
    return [
      'Frontend:  JavaScript, React, HTML/CSS, Vite',
      'Backend:   Python, PHP, Java EE, Node.js, RESTful API',
      'Mobile:    React Native, Flutter',
      'DevOps:    AWS, Docker, Kubernetes, OpenShift, Podman'
    ].join('\n');
  }

  function getContactHtml() {
    return [
      'Email:    calingasankylematthew@gmail.com',
      'Phone:    09514351648',
      'GitHub:   github.com/kayl10913',
      'LinkedIn: kyle-matthew-calingasan',
      'Location: Taguig, Metro Manila, Philippines',
      '',
      'Type: go contact — to jump to the contact section'
    ].join('<br>');
  }

  function getHelpText() {
    return [
      'Available commands:',
      '  help        — show this list',
      '  profile     — show profile JSON',
      '  projects    — list recent projects',
      '  view <id>   — open project preview',
      '  certs       — list cloud certifications',
      '  stack       — show tech stack',
      '  contact     — email, phone & social links',
      '  about       — about summary in terminal',
      '  experience  — experience summary in terminal',
      '  go <section>— scroll to section (e.g. go contact)',
      '  assistant   — open AI stack assistant',
      '  clear       — clear terminal output'
    ].join('\n');
  }

  function openStackAssistant() {
    if (typeof window.openPortfolioChat === 'function') {
      window.openPortfolioChat();
      return;
    }
    var chatBtn = document.getElementById('chat-float-btn');
    if (chatBtn) chatBtn.click();
  }

  function runHeroCommand(raw) {
    var cmd = (raw || '').trim();
    if (!cmd || heroTerminalBusy) return;

    var parts = cmd.toLowerCase().split(/\s+/);
    var name = parts[0];
    var arg = parts.slice(1).join(' ');

    if (name === 'help' || name === '?') {
      runHeroResponse(cmd, getHelpText());
      return;
    }

    if (name === 'clear') {
      runHeroResponse(cmd, null, { clearLog: true });
      return;
    }

    if (name === 'profile') {
      runHeroResponse(cmd, [
        '{',
        '  "name": "Kyle Matthew Calingasan",',
        '  "role": "Backend Developer",',
        '  "location": "Taguig, PH",',
        '  "tech_stack": {',
        '    "frontend": ["JavaScript", "React", "HTML/CSS"],',
        '    "backend": ["Python", "PHP", "Java EE", "Node.js"],',
        '    "mobile": ["React Native", "Flutter"],',
        '    "devops": ["AWS", "Docker", "Kubernetes"]',
        '  },',
        '  "certs": 3,',
        '  "status": "open_to_work"',
        '}'
      ].join('\n'));
      return;
    }

    if (name === 'projects') {
      runHeroResponse(cmd, getProjectsListText());
      return;
    }

    if (name === 'certs') {
      runHeroResponse(cmd, getCertsListText());
      return;
    }

    if (name === 'stack') {
      runHeroResponse(cmd, getStackText());
      return;
    }

    if (name === 'contact') {
      runHeroResponse(cmd, getContactHtml(), { isHtml: true });
      return;
    }

    if (name === 'about') {
      runHeroResponse(cmd, 'Information Technology Specialist · Batangas State University graduate, Cum Laude.\nBackend systems, RESTful APIs, AWS, IoT & AI.\nType: go about — to jump to the section');
      return;
    }

    if (name === 'experience') {
      runHeroResponse(cmd, [
        'IT Support Intern — Batangas State University TNEU (Feb–May 2026)',
        'Web Developer Intern — Tech Executive Labs (Feb–May 2025)',
        '',
        'Type: go experience — to jump to the section'
      ].join('\n'));
      return;
    }

    if (name === 'go') {
      var sectionId = arg.replace(/\s+/g, '-');
      var valid = ['about', 'experience', 'tech-stack', 'projects', 'certifications', 'contact'];
      if (!sectionId || valid.indexOf(sectionId) === -1) {
        runHeroResponse(cmd, 'Usage: go <section>\nSections: about, experience, tech-stack, projects, certifications, contact');
        return;
      }
      runHeroResponse(cmd, 'Navigating to #' + sectionId + '...', {
        onComplete: function () {
          scrollToSection(sectionId);
        }
      });
      return;
    }

    if (name === 'assistant' || name === 'chat') {
      runHeroResponse(cmd, 'Opening stack assistant...', {
        onComplete: openStackAssistant
      });
      return;
    }

    if (name === 'view') {
      var projectId = arg.replace(/\s+/g, '-');
      if (!projectId || !projectData[projectId]) {
        runHeroResponse(cmd, 'Project not found. Try: view safebite | view mood-studios | view midwest | view unit-testing');
        return;
      }
      runHeroResponse(cmd, 'Opening ' + projectData[projectId].title + '...', {
        onComplete: function () {
          openProjectModal(projectId);
        }
      });
      return;
    }

    if (projectData[name]) {
      runHeroResponse(cmd, 'Opening ' + projectData[name].title + '...', {
        onComplete: function () {
          openProjectModal(name);
        }
      });
      return;
    }

    runHeroResponse(cmd, "command not found: '" + cmd + "'. Type 'help' for available commands.");
  }

  function wireJsonKeyClicks() {
    document.querySelectorAll('#terminal-output .json-key-click').forEach(function (key) {
      function activate() {
        var cmd = key.getAttribute('data-cmd');
        if (cmd) runHeroCommand(cmd);
      }
      key.addEventListener('click', activate);
      key.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function enableHeroTerminal() {
    if (heroTerminalSuggestions) heroTerminalSuggestions.hidden = false;
    if (heroTerminalInput) {
      heroTerminalInput.disabled = false;
      heroTerminalInput.placeholder = 'type a command...';
    }
    wireJsonKeyClicks();

    if (heroTerminalSuggestions) {
      heroTerminalSuggestions.querySelectorAll('.terminal-cmd-suggest').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (heroTerminalBusy) return;
          var cmd = btn.getAttribute('data-cmd');
          if (cmd) runHeroCommand(cmd);
        });
      });
    }

    if (heroTerminalForm && heroTerminalInput) {
      heroTerminalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (heroTerminalBusy) return;
        var value = heroTerminalInput.value;
        heroTerminalInput.value = '';
        runHeroCommand(value);
      });

      heroTerminalInput.addEventListener('keydown', function (e) {
        if (heroTerminalBusy && e.key !== 'Escape') return;
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!heroCmdHistory.length) return;
          if (heroHistoryIndex > 0) heroHistoryIndex -= 1;
          heroTerminalInput.value = heroCmdHistory[heroHistoryIndex] || '';
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!heroCmdHistory.length) return;
          if (heroHistoryIndex < heroCmdHistory.length - 1) {
            heroHistoryIndex += 1;
            heroTerminalInput.value = heroCmdHistory[heroHistoryIndex];
          } else {
            heroHistoryIndex = heroCmdHistory.length;
            heroTerminalInput.value = '';
          }
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          var val = heroTerminalInput.value.trim().toLowerCase();
          if (!val) return;
          var matches = heroCommands.filter(function (c) {
            return c.indexOf(val) === 0;
          });
          if (matches.length === 1) heroTerminalInput.value = matches[0];
        }
      });
    }
  }

  if (terminalOutput) {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function finishBoot() {
      terminalOutput.innerHTML = heroProfileJson;
      enableHeroTerminal();
    }

    if (prefersReduced) {
      finishBoot();
    } else {
      var charIndex = 0;
      var plainText = heroProfileJson.replace(/<[^>]+>/g, '');
      var speed = 18;

      function typeNext() {
        if (charIndex >= plainText.length) {
          finishBoot();
          return;
        }
        charIndex += 1;
        terminalOutput.textContent = plainText.slice(0, charIndex);
        scrollHeroTerminal();
        setTimeout(typeNext, speed);
      }

      setTimeout(typeNext, 400);
    }
  }

  // Hero terminal window controls (minimize / maximize / close)
  var heroTerminalWindow = document.getElementById('hero-terminal-window');
  var heroTerminalMinimize = document.getElementById('hero-terminal-minimize');
  var heroTerminalMaximize = document.getElementById('hero-terminal-maximize');
  var heroTerminalClose = document.getElementById('hero-terminal-close');
  var heroTerminalTitlebar = heroTerminalWindow && heroTerminalWindow.querySelector('.hero-terminal-titlebar');

  function getTerminalState() {
    return heroTerminalWindow ? heroTerminalWindow.getAttribute('data-state') || 'normal' : 'normal';
  }

  function setTerminalState(state) {
    if (!heroTerminalWindow) return;

    heroTerminalWindow.classList.remove('is-minimized', 'is-maximized', 'is-closed');
    document.body.classList.remove('hero-terminal-maximized');

    if (state === 'minimized') heroTerminalWindow.classList.add('is-minimized');
    if (state === 'maximized') {
      heroTerminalWindow.classList.add('is-maximized');
      document.body.classList.add('hero-terminal-maximized');
    }
    if (state === 'closed') heroTerminalWindow.classList.add('is-closed');

    heroTerminalWindow.setAttribute('data-state', state);

    if (heroTerminalMaximize) {
      heroTerminalMaximize.setAttribute(
        'aria-label',
        state === 'maximized' ? 'Restore terminal size' : 'Maximize terminal'
      );
    }
    if (heroTerminalMinimize) {
      heroTerminalMinimize.setAttribute(
        'aria-label',
        state === 'minimized' ? 'Restore terminal' : 'Minimize terminal'
      );
    }
    if (heroTerminalClose) {
      heroTerminalClose.setAttribute(
        'aria-label',
        state === 'closed' ? 'Restore terminal' : 'Close terminal'
      );
    }

    if (state === 'normal' && heroTerminalInput && !heroTerminalBusy) {
      window.setTimeout(function () {
        try {
          heroTerminalInput.focus({ preventScroll: true });
        } catch (e) {
          heroTerminalInput.focus();
        }
      }, 350);
    }
  }

  if (heroTerminalMinimize) {
    heroTerminalMinimize.addEventListener('click', function (e) {
      e.stopPropagation();
      var state = getTerminalState();
      if (state === 'minimized') setTerminalState('normal');
      else if (state === 'maximized') setTerminalState('minimized');
      else if (state !== 'closed') setTerminalState('minimized');
    });
  }

  if (heroTerminalMaximize) {
    heroTerminalMaximize.addEventListener('click', function (e) {
      e.stopPropagation();
      var state = getTerminalState();
      if (state === 'maximized') setTerminalState('normal');
      else if (state === 'closed') setTerminalState('normal');
      else setTerminalState('maximized');
    });
  }

  if (heroTerminalClose) {
    heroTerminalClose.addEventListener('click', function (e) {
      e.stopPropagation();
      var state = getTerminalState();
      if (state === 'closed') setTerminalState('normal');
      else setTerminalState('closed');
    });
  }

  if (heroTerminalTitlebar) {
    heroTerminalTitlebar.addEventListener('click', function (e) {
      if (e.target.closest('.hero-terminal-dots')) return;
      var state = getTerminalState();
      if (state === 'closed' || state === 'minimized') setTerminalState('normal');
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && getTerminalState() === 'maximized') {
      setTerminalState('normal');
    }
  });

  document.body.addEventListener('click', function (e) {
    if (getTerminalState() !== 'maximized') return;
    if (heroTerminalWindow && !heroTerminalWindow.contains(e.target)) {
      setTerminalState('normal');
    }
  });
})();
