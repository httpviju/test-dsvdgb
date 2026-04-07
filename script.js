/* ============================================================
   ResuméCraft — script.js
   ============================================================ */

'use strict';

/* ── State ──────────────────────────────────────────────────── */
const state = {
  template: 'minimal',
  zoom: 1,
  skills: [],
  experience: [],
  education: [],
};

let expIdCounter = 0;
let eduIdCounter = 0;

/* ── DOM Refs ───────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const resumePreview = $('resumePreview');
const scaleWrapper  = $('scaleWrapper');

/* ── Field getters ──────────────────────────────────────────── */
const getField = id => ($( id)?.value || '').trim();

/* ── Render ─────────────────────────────────────────────────── */
function render() {
  const data = {
    fullName:   getField('fullName'),
    jobTitle:   getField('jobTitle'),
    email:      getField('email'),
    phone:      getField('phone'),
    location:   getField('location'),
    website:    getField('website'),
    summary:    getField('summary'),
    skills:     state.skills,
    experience: state.experience,
    education:  state.education,
  };

  if (state.template === 'minimal') {
    resumePreview.className = 'resume-paper tpl-minimal';
    resumePreview.innerHTML = buildMinimal(data);
  } else {
    resumePreview.className = 'resume-paper tpl-modern';
    resumePreview.innerHTML = buildModern(data);
  }
}

/* ── SVG Icons ──────────────────────────────────────────────── */
const icon = {
  email:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>`,
  phone:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 9.8 19.79 19.79 0 011 1.18 2 2 0 013 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.98 14l-.06 2.92z"/></svg>`,
  location: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  globe:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
};

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function nl2br(s) {
  return escHtml(s).replace(/\n/g, '<br>');
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

/* ── Template: Minimal ──────────────────────────────────────── */
function buildMinimal(d) {
  const hasContent = d.fullName || d.email || d.summary || d.experience.length || d.education.length || d.skills.length;
  if (!hasContent) return emptyState();

  const contactItems = [
    d.email    ? `<span class="rp-contact-item">${icon.email} ${escHtml(d.email)}</span>` : '',
    d.phone    ? `<span class="rp-contact-item">${icon.phone} ${escHtml(d.phone)}</span>` : '',
    d.location ? `<span class="rp-contact-item">${icon.location} ${escHtml(d.location)}</span>` : '',
    d.website  ? `<span class="rp-contact-item">${icon.globe} ${escHtml(d.website)}</span>` : '',
  ].filter(Boolean).join('');

  const experienceHTML = d.experience.length ? `
    <div class="rp-section">
      <div class="rp-section-label">Experience</div>
      ${d.experience.map(e => `
        <div class="rp-entry">
          <div class="rp-entry-top">
            <div>
              <div class="rp-entry-company">${escHtml(e.company || 'Company')}</div>
              <div class="rp-entry-role">${escHtml(e.role || 'Role')}</div>
            </div>
            <div class="rp-entry-date">${escHtml(e.date || '')}</div>
          </div>
          ${e.desc ? `<div class="rp-entry-desc">${nl2br(e.desc)}</div>` : ''}
        </div>
      `).join('')}
    </div>` : '';

  const educationHTML = d.education.length ? `
    <div class="rp-section">
      <div class="rp-section-label">Education</div>
      ${d.education.map(e => `
        <div class="rp-entry">
          <div class="rp-entry-top">
            <div>
              <div class="rp-entry-company">${escHtml(e.school || 'Institution')}</div>
              <div class="rp-entry-role">${escHtml(e.degree || 'Degree')}</div>
            </div>
            <div class="rp-entry-date">${escHtml(e.date || '')}</div>
          </div>
          ${e.desc ? `<div class="rp-entry-desc">${nl2br(e.desc)}</div>` : ''}
        </div>
      `).join('')}
    </div>` : '';

  const skillsHTML = d.skills.length ? `
    <div class="rp-section">
      <div class="rp-section-label">Skills</div>
      <div class="rp-skills-list">
        ${d.skills.map(s => `<span class="rp-skill">${escHtml(s)}</span>`).join('')}
      </div>
    </div>` : '';

  return `
    <div class="rp-header">
      <div class="rp-name">${escHtml(d.fullName || 'Your Name')}</div>
      ${d.jobTitle ? `<div class="rp-title">${escHtml(d.jobTitle)}</div>` : ''}
      ${contactItems ? `<div class="rp-contact">${contactItems}</div>` : ''}
    </div>
    ${d.summary ? `<div class="rp-section"><div class="rp-section-label">Profile</div><div class="rp-summary">${nl2br(d.summary)}</div></div>` : ''}
    ${experienceHTML}
    ${educationHTML}
    ${skillsHTML}
  `;
}

/* ── Template: Modern ───────────────────────────────────────── */
function buildModern(d) {
  const hasContent = d.fullName || d.email || d.summary || d.experience.length || d.education.length || d.skills.length;
  if (!hasContent) return emptyState();

  const contactItems = [
    d.email    ? `<div class="rp-contact-item">${icon.email} ${escHtml(d.email)}</div>` : '',
    d.phone    ? `<div class="rp-contact-item">${icon.phone} ${escHtml(d.phone)}</div>` : '',
    d.location ? `<div class="rp-contact-item">${icon.location} ${escHtml(d.location)}</div>` : '',
    d.website  ? `<div class="rp-contact-item">${icon.globe} ${escHtml(d.website)}</div>` : '',
  ].filter(Boolean).join('');

  const initStr = initials(d.fullName || 'YN');

  const sidebarSkills = d.skills.length ? `
    <div class="rp-sidebar-section">
      <div class="rp-sidebar-label">Skills</div>
      <div class="rp-skills-list">
        ${d.skills.map(s => `<div class="rp-skill">${escHtml(s)}</div>`).join('')}
      </div>
    </div>` : '';

  const experienceHTML = d.experience.length ? `
    <div class="rp-section">
      <div class="rp-section-label">Experience</div>
      ${d.experience.map(e => `
        <div class="rp-entry">
          <div class="rp-entry-top">
            <div>
              <div class="rp-entry-company">${escHtml(e.company || 'Company')}</div>
              <div class="rp-entry-role">${escHtml(e.role || 'Role')}</div>
            </div>
            <div class="rp-entry-date">${escHtml(e.date || '')}</div>
          </div>
          ${e.desc ? `<div class="rp-entry-desc">${nl2br(e.desc)}</div>` : ''}
        </div>
      `).join('')}
    </div>` : '';

  const educationHTML = d.education.length ? `
    <div class="rp-section">
      <div class="rp-section-label">Education</div>
      ${d.education.map(e => `
        <div class="rp-entry">
          <div class="rp-entry-top">
            <div>
              <div class="rp-entry-company">${escHtml(e.school || 'Institution')}</div>
              <div class="rp-entry-role">${escHtml(e.degree || 'Degree')}</div>
            </div>
            <div class="rp-entry-date">${escHtml(e.date || '')}</div>
          </div>
          ${e.desc ? `<div class="rp-entry-desc">${nl2br(e.desc)}</div>` : ''}
        </div>
      `).join('')}
    </div>` : '';

  return `
    <div class="rp-sidebar">
      <div>
        <div class="rp-avatar">${escHtml(initStr)}</div>
        <div class="rp-name">${escHtml(d.fullName || 'Your Name')}</div>
        ${d.jobTitle ? `<div class="rp-title">${escHtml(d.jobTitle)}</div>` : ''}
      </div>
      ${contactItems ? `
        <div class="rp-sidebar-section">
          <div class="rp-sidebar-label">Contact</div>
          ${contactItems}
        </div>` : ''}
      ${sidebarSkills}
    </div>
    <div class="rp-main">
      ${d.summary ? `<div class="rp-section"><div class="rp-section-label">Profile</div><div class="rp-summary">${nl2br(d.summary)}</div></div>` : ''}
      ${experienceHTML}
      ${educationHTML}
    </div>
  `;
}

/* ── Empty State ────────────────────────────────────────────── */
function emptyState() {
  return `
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <p>Start filling in the form to see your resume</p>
    </div>
  `;
}

/* ── Experience Cards ───────────────────────────────────────── */
function addExperience(initial = {}) {
  const id = ++expIdCounter;
  const entry = {
    id,
    company: initial.company || '',
    role:    initial.role    || '',
    date:    initial.date    || '',
    desc:    initial.desc    || '',
  };
  state.experience.push(entry);

  const card = document.createElement('div');
  card.className = 'dynamic-card';
  card.dataset.id = id;
  card.innerHTML = `
    <div class="dynamic-card-header">
      <div>
        <div class="dynamic-card-title exp-title-${id}">New Experience</div>
        <div class="dynamic-card-subtitle exp-sub-${id}">Company · Role</div>
      </div>
      <div class="card-actions">
        <button class="btn-remove" title="Remove">×</button>
        <span class="collapse-arrow">▾</span>
      </div>
    </div>
    <div class="dynamic-card-body">
      <div class="field-row">
        <div class="field">
          <label>Company</label>
          <input type="text" class="exp-company" placeholder="Google" value="${escHtml(entry.company)}"/>
        </div>
        <div class="field">
          <label>Role / Title</label>
          <input type="text" class="exp-role" placeholder="Software Engineer" value="${escHtml(entry.role)}"/>
        </div>
      </div>
      <div class="field">
        <label>Date Range</label>
        <input type="text" class="exp-date" placeholder="Jan 2022 – Present" value="${escHtml(entry.date)}"/>
      </div>
      <div class="field">
        <label>Description</label>
        <textarea class="exp-desc" rows="3" placeholder="Key responsibilities and achievements...">${escHtml(entry.desc)}</textarea>
      </div>
    </div>
  `;

  $('experienceList').appendChild(card);
  bindCardEvents(card, 'experience', id);
  updateCardLabel(card, id, 'experience');
  render();
}

function addEducation(initial = {}) {
  const id = ++eduIdCounter;
  const entry = {
    id,
    school: initial.school  || '',
    degree: initial.degree  || '',
    date:   initial.date    || '',
    desc:   initial.desc    || '',
  };
  state.education.push(entry);

  const card = document.createElement('div');
  card.className = 'dynamic-card';
  card.dataset.id = id;
  card.innerHTML = `
    <div class="dynamic-card-header">
      <div>
        <div class="dynamic-card-title edu-title-${id}">New Education</div>
        <div class="dynamic-card-subtitle edu-sub-${id}">School · Degree</div>
      </div>
      <div class="card-actions">
        <button class="btn-remove" title="Remove">×</button>
        <span class="collapse-arrow">▾</span>
      </div>
    </div>
    <div class="dynamic-card-body">
      <div class="field-row">
        <div class="field">
          <label>Institution</label>
          <input type="text" class="edu-school" placeholder="MIT" value="${escHtml(entry.school)}"/>
        </div>
        <div class="field">
          <label>Degree / Field</label>
          <input type="text" class="edu-degree" placeholder="B.Sc. Computer Science" value="${escHtml(entry.degree)}"/>
        </div>
      </div>
      <div class="field">
        <label>Date Range</label>
        <input type="text" class="edu-date" placeholder="2018 – 2022" value="${escHtml(entry.date)}"/>
      </div>
      <div class="field">
        <label>Notes</label>
        <textarea class="edu-desc" rows="2" placeholder="GPA, honours, relevant coursework...">${escHtml(entry.desc)}</textarea>
      </div>
    </div>
  `;

  $('educationList').appendChild(card);
  bindCardEvents(card, 'education', id);
  updateCardLabel(card, id, 'education');
  render();
}

function bindCardEvents(card, type, id) {
  /* Collapse toggle */
  card.querySelector('.dynamic-card-header').addEventListener('click', e => {
    if (e.target.closest('.btn-remove')) return;
    card.classList.toggle('collapsed');
  });

  /* Remove */
  card.querySelector('.btn-remove').addEventListener('click', () => {
    card.style.opacity = '0';
    card.style.transform = 'translateX(-8px)';
    card.style.transition = 'opacity .2s, transform .2s';
    setTimeout(() => {
      card.remove();
      if (type === 'experience') {
        state.experience = state.experience.filter(e => e.id !== id);
      } else {
        state.education = state.education.filter(e => e.id !== id);
      }
      render();
    }, 200);
  });

  /* Live field updates */
  if (type === 'experience') {
    card.querySelector('.exp-company').addEventListener('input', e => {
      const entry = state.experience.find(x => x.id === id);
      if (entry) entry.company = e.target.value;
      updateCardLabel(card, id, 'experience');
      render();
    });
    card.querySelector('.exp-role').addEventListener('input', e => {
      const entry = state.experience.find(x => x.id === id);
      if (entry) entry.role = e.target.value;
      updateCardLabel(card, id, 'experience');
      render();
    });
    card.querySelector('.exp-date').addEventListener('input', e => {
      const entry = state.experience.find(x => x.id === id);
      if (entry) entry.date = e.target.value;
      render();
    });
    card.querySelector('.exp-desc').addEventListener('input', e => {
      const entry = state.experience.find(x => x.id === id);
      if (entry) entry.desc = e.target.value;
      render();
    });
  } else {
    card.querySelector('.edu-school').addEventListener('input', e => {
      const entry = state.education.find(x => x.id === id);
      if (entry) entry.school = e.target.value;
      updateCardLabel(card, id, 'education');
      render();
    });
    card.querySelector('.edu-degree').addEventListener('input', e => {
      const entry = state.education.find(x => x.id === id);
      if (entry) entry.degree = e.target.value;
      updateCardLabel(card, id, 'education');
      render();
    });
    card.querySelector('.edu-date').addEventListener('input', e => {
      const entry = state.education.find(x => x.id === id);
      if (entry) entry.date = e.target.value;
      render();
    });
    card.querySelector('.edu-desc').addEventListener('input', e => {
      const entry = state.education.find(x => x.id === id);
      if (entry) entry.desc = e.target.value;
      render();
    });
  }
}

function updateCardLabel(card, id, type) {
  if (type === 'experience') {
    const e = state.experience.find(x => x.id === id);
    if (!e) return;
    const titleEl = card.querySelector(`.dynamic-card-title`);
    const subEl   = card.querySelector(`.dynamic-card-subtitle`);
    if (titleEl) titleEl.textContent = e.company || 'New Experience';
    if (subEl)   subEl.textContent   = [e.role].filter(Boolean).join(' · ') || 'Company · Role';
  } else {
    const e = state.education.find(x => x.id === id);
    if (!e) return;
    const titleEl = card.querySelector(`.dynamic-card-title`);
    const subEl   = card.querySelector(`.dynamic-card-subtitle`);
    if (titleEl) titleEl.textContent = e.school || 'New Education';
    if (subEl)   subEl.textContent   = e.degree || 'School · Degree';
  }
}

/* ── Skills ─────────────────────────────────────────────────── */
function addSkill(value) {
  const skill = value.trim();
  if (!skill || state.skills.includes(skill)) return false;
  state.skills.push(skill);

  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.innerHTML = `${escHtml(skill)} <button class="tag-remove" title="Remove skill">×</button>`;
  tag.querySelector('.tag-remove').addEventListener('click', () => {
    tag.style.transform = 'scale(0)';
    tag.style.opacity = '0';
    tag.style.transition = 'transform .15s, opacity .15s';
    setTimeout(() => {
      tag.remove();
      state.skills = state.skills.filter(s => s !== skill);
      render();
    }, 150);
  });
  $('skillTags').appendChild(tag);
  render();
  return true;
}

/* ── Personal form inputs ───────────────────────────────────── */
function bindPersonalFields() {
  const ids = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'website', 'summary'];
  ids.forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', render);
  });
}

/* ── Template switcher ──────────────────────────────────────── */
function bindTemplateSwitcher() {
  document.querySelectorAll('.tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tpl-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.template = btn.dataset.tpl;

      /* Brief flash animation */
      resumePreview.style.opacity = '0';
      resumePreview.style.transform = 'scale(.98)';
      resumePreview.style.transition = 'opacity .15s, transform .15s';
      setTimeout(() => {
        render();
        resumePreview.style.opacity = '1';
        resumePreview.style.transform = 'scale(1)';
      }, 150);
    });
  });
}

/* ── Zoom ───────────────────────────────────────────────────── */
function applyZoom() {
  scaleWrapper.style.transform = `scale(${state.zoom})`;
  $('zoomVal').textContent = Math.round(state.zoom * 100) + '%';
}

function bindZoom() {
  $('zoomIn').addEventListener('click', () => {
    state.zoom = Math.min(state.zoom + 0.1, 1.5);
    applyZoom();
  });
  $('zoomOut').addEventListener('click', () => {
    state.zoom = Math.max(state.zoom - 0.1, 0.4);
    applyZoom();
  });
}

/* ── Auto zoom for smaller screens ─────────────────────────── */
function autoZoom() {
  const panel  = document.querySelector('.preview-scroll');
  if (!panel) return;
  const panelW = panel.clientWidth - 48;
  const paperW = 794;
  if (panelW < paperW) {
    state.zoom = Math.max(panelW / paperW, 0.4);
    applyZoom();
  }
}

/* ── PDF Download ───────────────────────────────────────────── */
function bindDownload() {
  $('downloadBtn').addEventListener('click', () => {
    const name = getField('fullName') || 'resume';
    const el   = resumePreview;

    const opt = {
      margin:      0,
      filename:    `${name.replace(/\s+/g, '_')}_resume.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:       { unit: 'px', format: [794, 1122], orientation: 'portrait' },
    };

    const btn = $('downloadBtn');
    btn.textContent = 'Generating…';
    btn.disabled = true;

    html2pdf().set(opt).from(el).save().then(() => {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF`;
      btn.disabled = false;
    });
  });
}

/* ── Add buttons ─────────────────────────────────────────────── */
function bindAddButtons() {
  $('addExp').addEventListener('click', () => addExperience());
  $('addEdu').addEventListener('click', () => addEducation());

  $('addSkillBtn').addEventListener('click', () => {
    const inp = $('skillInput');
    if (addSkill(inp.value)) inp.value = '';
  });

  $('skillInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inp = $('skillInput');
      if (addSkill(inp.value)) inp.value = '';
    }
  });
}

/* ── Init ────────────────────────────────────────────────────── */
function init() {
  bindPersonalFields();
  bindTemplateSwitcher();
  bindZoom();
  bindDownload();
  bindAddButtons();

  /* Seed some starter entries */
  addExperience({
    company: '',
    role:    '',
    date:    '',
    desc:    '',
  });
  addEducation({
    school: '',
    degree: '',
    date:   '',
    desc:   '',
  });

  /* Collapse starter cards by default so form feels clean */
  document.querySelectorAll('.dynamic-card').forEach(c => c.classList.add('collapsed'));

  autoZoom();
  window.addEventListener('resize', autoZoom);

  render();
}

document.addEventListener('DOMContentLoaded', init);
