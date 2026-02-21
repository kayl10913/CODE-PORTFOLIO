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
    }
  };

  var certModal = document.getElementById('cert-modal');
  var certModalBackdrop = certModal && certModal.querySelector('.cert-modal-backdrop');
  var certModalCloseBtn = certModal && certModal.querySelector('.cert-modal-close');
  var certModalCloseLink = certModal && certModal.querySelector('.cert-modal-close-link');
  var certModalViewBtn = document.getElementById('cert-modal-view-btn');

  function openCertModal(id) {
    var data = certData[id];
    if (!certModal || !data) return;
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
      link.textContent = 'See Badge Details Page ';
      var icon = document.createElement('i');
      icon.className = 'fa-solid fa-external-link-alt';
      icon.setAttribute('aria-hidden', 'true');
      link.appendChild(icon);
      urlWrap.appendChild(link);
    }
    if (certModalViewBtn) certModalViewBtn.href = data.url;
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

  document.querySelectorAll('.cert-badge-card').forEach(function (btn) {
    var id = btn.getAttribute('data-cert-id');
    if (id) btn.addEventListener('click', function () { openCertModal(id); });
  });
})();
