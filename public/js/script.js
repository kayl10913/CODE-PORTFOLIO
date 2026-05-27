(function () {
  'use strict';

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  function setTheme(dark) {
    if (dark) {
      html.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      html.removeAttribute('data-theme');
      if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
    try {
      localStorage.setItem(key, dark ? 'dark' : 'light');
    } catch (e) {}
  }

  function isDark() {
    return html.getAttribute('data-theme') === 'dark';
  }

  var stored = getStoredTheme();
  if (stored === 'dark') setTheme(true);
  else if (stored === 'light') setTheme(false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(!isDark());
    });
  }

  // Certification Details modal
  var certData = {
    aws: {
      img: '/img/badges/aws-academy-graduate-cloud-foundations-training-bad.png',
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
      img: '/img/badges/red-hat-application-development-i-programming-in-ja.1.png',
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
      img: '/img/badges/red-hat-openshift-development-i-introduction-to-con.2.png',
      title: 'Red Hat OpenShift Development I: Introduction to Containers with Podman (DO188 - RHA) - Ver. 4.18',
      org: 'Red Hat',
      desc: 'This credential verifies the attendance of the Red Hat OpenShift Development I: Introduction to Containers with Podman course.',
      date: '7/22/2025',
      expiry: 'This credential does not expire',
      credId: '26662f19-ed7a-49db-9bf6-99be9087e372',
      url: 'https://www.credly.com/earner/earned/badge/26662f19-ed7a-49db-9bf6-99be9087e372',
      skills: ['DevOps', 'Red Hat OpenShift', 'Basic container networking', 'Containers', 'OpenShift', 'Podman', 'Podman Desktop', 'Red Hat Academy', 'Run multi-container applications', 'Troubleshoot Container Deployments']
    },
    'databiz-2025': {
      img: '/img/certificates/5f9e17b9-1e39-4a98-97a3-9171e3384477.jpg',
      title: 'Certificate of Participation — DATABIZ 2025',
      org: 'Batangas Information Technology Society',
      desc: 'For actively participating in the DATABIZ 2025 Conference with the theme "Future-Proof Skills: Empowering Students with Data, AI, and Analytics" held on October 25, 2025 at Lipa Academy for Sports, Culture, and Arts (LASCA), Lipa City.',
      date: 'October 25, 2025',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/5f9e17b9-1e39-4a98-97a3-9171e3384477.jpg',
      viewLabel: 'View Certificate',
      skills: []
    },
    'bitcon-2025': {
      img: '/img/certificates/042d7b7d-23f2-4e63-a5ea-4060b3fda89f.jpg',
      title: 'Certificate of Participation — BITCON 2025',
      org: 'Batangas Information Technology Society',
      desc: 'For active participation in the Batangas Information Technology Conference (BITCON) 2025 with the theme "Building a Connected Tomorrow: IoT Innovations and Beyond", given April 26, 2025 at Lipa Academy for Sports, Culture and Arts Convention Center, Dagatan, Lipa City.',
      date: 'April 26, 2025',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/042d7b7d-23f2-4e63-a5ea-4060b3fda89f.jpg',
      viewLabel: 'View Certificate',
      skills: []
    },
    'techno-sdg-2024': {
      img: '/img/certificates/9740ccc7-3490-440c-a420-388ccfc47e59.jpg',
      title: 'Certificate of Participation — Techno SDG Exposition',
      org: 'Junior Philippine Computer Society - Lipa Chapter & Tech Innovators Society, Batangas State University The NEU Lipa',
      desc: 'For active participation during the event "Techno SDG Exposition: Bridging Insights and Innovation", a collaborative initiative between JPCS and Tech Innovators Society held at 1st flr Gregorio Zara Building, BatStateU-TNEU Lipa Campus on February 28, 2024.',
      date: 'February 28, 2024',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/9740ccc7-3490-440c-a420-388ccfc47e59.jpg',
      viewLabel: 'View Certificate',
      skills: []
    },
    'techsynergy-2023': {
      img: '/img/certificates/c2228d3d-ac23-4705-b078-69c092e1be0f.jpg',
      title: 'Certificate of Participation — TechSynergy 2023',
      org: 'Junior Philippine Computer Society - Lipa Chapter, Batangas State University The NEU Lipa',
      desc: 'For active and invaluable participation during "TechSynergy: Navigating the Digital Landscape 2023 - Connecting Concepts, Bridging Technologies" held on December 4, 2023 at Batangas State University TheNEU - Lipa.',
      date: 'December 4, 2023',
      expiry: '—',
      credId: '—',
      url: '/img/certificates/c2228d3d-ac23-4705-b078-69c092e1be0f.jpg',
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
    if (!certLightbox || !certLightboxImg) return;
    certLightboxImg.src = imgSrc;
    certLightboxImg.alt = imgAlt || 'Certificate';
    certLightbox.classList.add('is-open');
    certLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCertLightbox() {
    if (!certLightbox) return;
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
      images: ['moodstudios.png', 'moodstudios2.png', 'moodstudios3.png']
    },
    safebite: {
      title: 'SafeBite: Smart Monitoring Platform for Food Spoilage',
      tagline: 'IoT-based food spoilage monitoring with AI-driven analysis',
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
      images: ['safebite.png', 'safebite2.png', 'safebite3.png']
    },
    midwest: {
      title: 'Midwest Web and Mobile Application',
      tagline: 'Web admin dashboard with sales forecasting and analytics',
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
      images: ['midwest.png', 'midwest2.png', 'midwest3.png']
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

    if (projectModalGalleryWrap) {
      projectModalGalleryWrap.classList.toggle('is-hidden', !currentProjectImages.length);
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

  document.querySelectorAll('.project-view-btn').forEach(function (btn) {
    var id = btn.getAttribute('data-project-id');
    if (!id || !projectData[id]) return;
    btn.addEventListener('click', function () {
      openProjectModal(id);
    });
  });
})();
