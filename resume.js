const createBtn = document.getElementById('create-btn');
const homepageContainer = document.getElementById('homepage-container');
const formContainer = document.getElementById('form-container');
const templatesContainer = document.getElementById('templates-container');
const previewSide = document.getElementById('preview-side');
const resumeOutput = document.getElementById('resume-output');
const templatesGrid = document.getElementById('templates-grid');

let formData = {};

createBtn.addEventListener('click', () => {
    homepageContainer.style.display = 'none';
    formContainer.style.display = 'flex';
    if (window.innerWidth > 768) {
        previewSide.style.display = 'flex';
    } else {
        previewSide.style.display = 'none';
    }
    const form = document.getElementById('resume-form');
    form.addEventListener('input', updatePreview);
    form.addEventListener('submit', saveForm);
    addBulletPointListeners();
    updatePreview({ target: { form } });
});

function convertToBullets(text) {
    if (!text) return "N/A";
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return "N/A";
    return `<ul style="list-style-position: inside; padding-left: 0;">${lines.map(line => `<li>${line}</li>`).join('')}</ul>`;
}

function addBulletPointListeners() {
    const form = document.getElementById('resume-form');
    if (!form) return;
    ['hobbies', 'experience', 'skills', 'certifications', 'education'].forEach(name => {
        const textarea = form.querySelector(`textarea[name="${name}"]`);
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    textarea.value = value.substring(0, start) + "\n" + value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                    textarea.dispatchEvent(new Event('input'));
                }
            });
        }
    });
}

function updatePreview(e) {
    const form = e.target.form;
    if (!form) return;
    const liveData = Object.fromEntries(new FormData(form).entries());
    previewSide.innerHTML = generateResumeHTML('default', liveData);
}

function saveForm(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    formData = Object.fromEntries(data.entries());

    if ((formData.summary || '').length < 50) {
        alert("Professional Summary must be at least 50 characters.");
        return;
    }

    formContainer.style.display = 'none';
    templatesContainer.style.display = 'block';

    templatesGrid.innerHTML = `
        <div class="template active" data-template="default">Default Professional</div>
        <div class="template" data-template="classic">Classic Minimalist</div>
        <div class="template" data-template="modern">Modern Compact</div>
        <div class="template" data-template="creative">Creative Header</div>
        <div class="template" data-template="technical">Technical Focus</div>
        <div class="template" data-template="simple">Simple Text</div>
    `;

    renderTemplate('default');
}

templatesGrid.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('template')) {
        const templateId = e.target.getAttribute('data-template');
        
        document.querySelectorAll('.template').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        renderTemplate(templateId);
    }
});

function renderTemplate(id) {
    const htmlContent = generateResumeHTML(id, formData);
    // Remove any old controls then inject fresh content
    resumeOutput.innerHTML = htmlContent;

    if (id === 'classic') {
        resumeOutput.classList.remove('a4-preview');
    } else {
        resumeOutput.classList.add('a4-preview');
    }

    // Add the Preview button (JS only, no HTML edits)
    const btnContainer = document.createElement('div');
    btnContainer.style.textAlign = 'center';
    btnContainer.style.padding = '20px';

    const previewBtn = document.createElement('button');
    previewBtn.textContent = "Preview PDF";
    previewBtn.id = "preview-pdf-btn";
    previewBtn.addEventListener('click', () => previewPDF(id));

    btnContainer.appendChild(previewBtn);
    resumeOutput.appendChild(btnContainer);
}

function generateResumeHTML(id, data) {
    const fullName = `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim() || "Your Name";
    const addressLine = `${data.address || ''}, ${data.pinCode || ''}`.trim() || "Address, Pin Code";
    const contactLine = `${data.email || ''} | ${data.phone || ''}`.trim() || "Email | Phone";

    const certsHTML = data.certifications ? convertToBullets(data.certifications) : '';
    const educationHTML = data.education ? convertToBullets(data.education) : '';
    const summary = data.summary || '';
    const experience = data.experience || '';
    const skillsHTML = data.skills ? convertToBullets(data.skills) : '';
    const hobbiesHTML = data.hobbies ? convertToBullets(data.hobbies) : '';

    const createSection = (title, content, isHtml = false) => {
        if (!content) return '';
        return `
            <div class="resume-section page-break">
                <h3>${title}</h3>
                ${isHtml ? content : `<p>${content}</p>`}
            </div>
        `;
    };
    
    const twoColumnLayout = `
        <div class="resume-body" style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="left-column">
                ${createSection('Professional Summary', summary, true)}
                ${createSection('Certifications & Trainings', certsHTML, true)}
            </div>
            <div class="right-column">
                ${createSection('Work Experience', experience, true)}
                ${createSection('Education', educationHTML, true)}
                ${createSection('Skills', skillsHTML, true)}
                ${createSection('Hobbies', hobbiesHTML, true)}
            </div>
        </div>
    `;

    const singleColumnLayout = `
        ${createSection('Professional Summary', summary, true)}
        ${createSection('Certifications & Trainings', certsHTML, true)}
        ${createSection('Work Experience', experience, true)}
        ${createSection('Education', educationHTML, true)}
        ${createSection('Skills', skillsHTML, true)}
        ${createSection('Hobbies', hobbiesHTML, true)}
    `;

    switch (id) {
        case 'classic':
            return `
        <div class="resume-preview classic-template">
            <div class="classic-left-column">
                ${createSection('Professional Summary', summary, true)}
                ${createSection('Certifications & Trainings', certsHTML, true)}
            </div>
            <div class="classic-right-column">
                <div class="contact-info">
                    <h1>${fullName}</h1>
                    <p>${addressLine}</p>
                    <p>${contactLine}</p>
                </div>
                <div class="resume-line"></div>
                ${createSection('Work Experience', experience, true)}
                ${createSection('Education', educationHTML, true)}
                ${createSection('Skills', skillsHTML, true)}
                ${createSection('Hobbies', hobbiesHTML, true)}
            </div>
        </div>`;
        case 'modern':
            return `
                <div class="resume-preview" style="padding:30px; background:white; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    <div style="background-color: #333; color: white; padding: 20px; margin-bottom:20px;">
                        <h1>${fullName}</h1>
                        <p>${contactLine}</p>
                    </div>
                    ${singleColumnLayout}
                </div>`;
        case 'creative':
    return `
        <div class="resume-preview creative-template" style="padding:40px; background:white;">
            <h1 class="creative-title">${fullName}</h1>
            <p class="creative-contact"><strong>Contact:</strong> ${contactLine} | ${addressLine}</p>
            <hr class="creative-divider">
            ${singleColumnLayout}
        </div>`;
        case 'technical':
            return `
                <div class="resume-preview" style="padding:40px; background:white;">
                    <h3>CONTACT</h3>
                    <h1>${fullName} | ${data.email} | ${data.phone}</h1>
                    <hr>
                    ${singleColumnLayout}
                </div>`;
        case 'simple':
            return `
                <div class="resume-preview" style="padding:40px; background:white; font-family: 'Times New Roman', Times, serif;">
                    <b>Name:</b> ${fullName}<br>
                    <b>Contact:</b> ${contactLine}<br>
                    <b>Address:</b> ${addressLine}<br><br>
                    ${singleColumnLayout}
                </div>`;
        case 'default':
        default:
            return `
                <div class="resume-preview" style="background:white; padding:20px; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.2);">
                    <div class="resume-header">
                        <h1>${fullName}</h1>
                        <p>${addressLine}</p>
                        <p>${contactLine}</p>
                    </div>
                    <div class="resume-line"></div>
                    ${twoColumnLayout}
                </div>`;
    }
}

/**
 * Open a print-friendly HTML preview in a new tab (reliable, no clipping).
 * The user uses the browser's "Print" → "Save as PDF".
 */
function previewPDF(templateId) {
    const original = resumeOutput.querySelector('.resume-preview');
    if (!original) {
        alert('Error: Could not find resume content to preview.');
        return;
    }

    const w = window.open('', '_blank');
    if (!w) {
        alert('Please allow popups for this site to preview the PDF.');
        return;
    }

    const doc = w.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Resume Preview</title>

<!-- Keep your existing styling -->
<link rel="stylesheet" href="resume.css">

<style>
    /* Hide scrollbars for all browsers when printing */
body, html {
    overflow: visible !important;
}

::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
}

* {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
}

    body {
        background: #ccc;
        display: flex;
        justify-content: center;
        padding: 20px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .preview-a4-page {
        width: 794px; /* A4 width */
        min-height: 1123px; /* A4 height */
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        padding: 20mm;
    }
    @page {
        size: A4;
        margin: 12mm;
    }
    @media print {
        body {
            background: white !important;
            padding: 0;
        }
        .preview-a4-page {
            box-shadow: none !important;
            background: white !important;
            overflow: visible !important;
            height: auto !important;
            page-break-after: always;
        }
        .resume-preview,
        .resume-body {
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        }
    }
</style>
</head>
<body>
    <div class="preview-a4-page">
        ${original.outerHTML}
    </div>
</body>
</html>`);
    doc.close();
}
