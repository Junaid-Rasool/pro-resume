document.getElementById('add-experience-btn').addEventListener('click', function() {
    // Get the container where the inputs are
    const container = document.getElementById('experience-container');

    // Create a new div to hold the next set of fields
    const newEntry = document.createElement('div');
    newEntry.className = 'experience-input-group';
    
    // Fill the new div with the exact same HTML as the first entry
    newEntry.innerHTML = `
        <input type="text" name="company[]" placeholder="Company Name" required>
        <input type="text" name="dates[]" placeholder="Dates (e.g., 2015-2018)" required>
        <textarea name="description[]" placeholder="Description of your role and responsibilities" required></textarea>
    `;

    // Append the new div to the container
    container.appendChild(newEntry);
});



// === Containers ===
const homepageSide = document.getElementById('homepage-side');
const templatesContainer = document.getElementById('templates-container');
const templatesGrid = templatesContainer.querySelector('.template-grid');
const resumeOutput = document.getElementById('resume-output');

let formData = {};

// === SHOW TEMPLATES BUTTON ===
document.getElementById("generate-btn").addEventListener("click", function(e){
    e.preventDefault();

    const form = document.getElementById('resume-form');
    const data = new FormData(form);
    formData = Object.fromEntries(data.entries());

    if ((formData.summary || '').length < 50) {
        alert("Professional Summary must be at least 50 characters.");
        return;
    }

    // Hide the main homepage content
    homepageSide.classList.add('hidden');

    // Show the templates container
    templatesContainer.classList.remove('hidden');

    // Hide the header by removing the class from the body
    document.body.classList.remove('homepage-active');

    // Build templates grid
    templatesGrid.innerHTML = `
        <div class="template active" data-template="default">Classic</div>
        <div class="template" data-template="classic">Professional</div>
        <div class="template" data-template="modern">Modern</div>
        <div class="template" data-template="creative">Creative Header</div>
        <div class="template" data-template="technical">Technical Focus</div>
        <div class="template" data-template="simple">Simple Text</div>
        <div class="template" data-template="stylish">Stylish</div>
    `;

    renderTemplate('default');
});

// === Template Selection ===
templatesGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('template')) {
        const templateId = e.target.getAttribute('data-template');
        document.querySelectorAll('.template').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        renderTemplate(templateId);
    }
});

// === Render Resume ===
function renderTemplate(id) {
    const htmlContent = generateResumeHTML(id, formData);
    resumeOutput.innerHTML = DOMPurify.sanitize(htmlContent);

    const btnContainer = document.createElement('div');
    btnContainer.style.textAlign = 'center';
    btnContainer.style.padding = '20px';

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = "Download PDF";
    downloadBtn.id = "download-pdf-btn";
    downloadBtn.addEventListener('click', () => downloadPDF(id));

    btnContainer.appendChild(downloadBtn);
    resumeOutput.appendChild(btnContainer);
}

// A new helper function to collect data and generate the experience section HTML
function generateExperienceHTML() {
    // 1. Collect all the input fields from the dynamic form
    const companyInputs = document.querySelectorAll('#experience-container input[name="company[]"]');
    const datesInputs = document.querySelectorAll('#experience-container input[name="dates[]"]');
    const descriptionInputs = document.querySelectorAll('#experience-container textarea[name="description[]"]');

    let experienceHTML = '';

    // 2. Loop through all the collected fields to build the HTML string
    // We can use the length of any of the lists since they should all be the same
    for (let i = 0; i < companyInputs.length; i++) {
        const company = companyInputs[i].value || '';
        const dates = datesInputs[i].value || '';
        const description = descriptionInputs[i].value || '';

        // Only add an entry if the user has entered a company name
        if (company) {
            experienceHTML += `
                <div class="experience-entry">
                    <p style="font-weight: bold; margin-bottom: 5px;">${company}</p>
                    
                    <p style="font-weight: 300; color: #272525ff; margin-bottom: 5px;">${dates}</p>
                    
                    <p style="margin-bottom: 10px;">${description}</p>
                </div>
            `;
        }
    }
    
    return experienceHTML;
}

// Your main function, updated to use the new experience generator
function generateResumeHTML(id, data) {
    const fullName = data.name || "Your Name";
    const fullAddress = data.address || "Your Address";
    const contactLine = `${data.email || 'Email'} | ${data.phone || 'Phone'}`;
    const summary = data.summary || '';
    
    // Call our new function to get the dynamically generated experience HTML
    const experienceHTML = generateExperienceHTML();

    const educationHTML = data.education ? convertToBullets(data.education) : '';
    const certTrainHTML = data.certTrain ? convertToBullets(data.certTrain) : '';
    const languageHTML = data.language ? convertToBullets(data.language) : '';
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

    const singleColumnLayout = `
        ${createSection('Professional Summary', summary)}
        ${createSection('Work Experience', experienceHTML, true)}
        ${createSection('Education', educationHTML, true)}
        ${createSection('Certifications & Trainings', certTrainHTML, true)}
        ${createSection('Skills', skillsHTML, true)}
        ${createSection('Hobbies', hobbiesHTML, true)}
        ${createSection('Languages', languageHTML, true)}
    `;
    switch(id){
        case 'classic':
            return `<div class="resume-preview classic-template">
            <div class="classic-resume-header">
              <h1>${fullName}</h1>
              <p>${fullAddress}</p>
              <p>${contactLine}</p>
              </div>
            <div class="classic-resume-body">
            <div class="classic-resume-left">
                ${createSection('Skills', skillsHTML)}

                ${createSection('Education', educationHTML, true)}

                ${createSection('Certifications & Trainings', certTrainHTML, true)}

                ${createSection('Hobbies', hobbiesHTML, true)}

                ${createSection('Languages', languageHTML, true)}
            </div>

            <div class="classic-resume-right">
                ${createSection('Professional Summary', summary)}

                ${createSection('Work Experience', experienceHTML, true)}
            </div>
            </div>
    </div>`;
        case 'modern':
            return `<div class="resume-preview modern-template" style="padding:30px; background:white;"><div style="background-color: #333; color: white; padding: 20px; margin-bottom:20px;"><h1>${fullName}</h1><p>${fullAddress}</p><p>${contactLine}</p></div>${singleColumnLayout}</div>`;
        case 'creative':
            return `<div class="resume-preview creative-template" style="padding:40px; background:white;"><h1 class="creative-title">${fullName}</h1><p>${fullAddress}</p><p class="creative-contact"><strong>Contact:</strong> ${contactLine}</p><hr class="creative-divider">${singleColumnLayout}</div>`;
        case 'technical':
            return `<div class="resume-preview technical-template" style="padding:40px; background:white;"><h3>CONTACT</h3><h1>${fullName} | ${fullAddress} | ${data.email} | ${data.phone}</h1><hr>${singleColumnLayout}</div>`;
        case 'simple':
            return `<div class="resume-preview simple-template" style="padding:40px; background:white; font-family: 'Times New Roman', serif;"><b>Name:</b> ${fullName}<br><b>Address:</b> ${fullAddress}<br><b>Contact:</b> ${contactLine}<br><br>${singleColumnLayout}</div>`;
            case 'stylish':
            return `<div class="resume-preview stylish-template">
            <!-- Header -->
            <div class="stylish-resume-header">
    <h1>${fullName}</h1>
    <p>${fullAddress}</p>
    <p>${contactLine}</p>
  </div>

  <!-- Professional Summary -->
  <div class="stylish-resume-summary">
    ${createSection('Professional Summary', summary)}
  </div>

  <!-- Skills (top row) -->
  <div class="stylish-resume-work-top">
    ${createSection('Work Experience', experienceHTML, true)}
  </div>

  <!-- Two Column Layout -->
  <div class="stylish-resume-columns">
    <!-- Left Column -->
    <div class="resume-col left-col">
      ${createSection('Skills', skillsHTML)}
      ${createSection('Education', educationHTML, true)}
      ${createSection('Certifications & Trainings', certTrainHTML, true)}
    </div>

    <!-- Right Column -->
    <div class="resume-col right-col">
      ${createSection('Hobbies', hobbiesHTML, true)}
      ${createSection('Languages', languageHTML, true)}
    </div>
  </div>
</div>
`;
        default:
    return `
    <div class="resume-preview default-template">
            <div class="default-resume-left">
              <div class="default-resume-header">
              <h1>${fullName}</h1>
              <p>${fullAddress}</p>
              <p>${contactLine}</p>
              </div>
            
                ${createSection('Skills', skillsHTML)}

                ${createSection('Education', educationHTML, true)}

                ${createSection('Hobbies', hobbiesHTML, true)}

                ${createSection('Languages', languageHTML, true)}
            </div>

            <div class="default-resume-right">
                ${createSection('Professional Summary', summary)}

                ${createSection('Work Experience', experienceHTML, true)}
                
                ${createSection('Certifications & Trainings', certTrainHTML, true)}
            </div>
    </div>`;
    }
}

// === Convert text to bullet list ===
function convertToBullets(text){
    if(!text) return "";
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l=>l.length>0);
    if(lines.length===0) return "";
    return `<ul style="list-style-position: inside; padding-left: 0;">${lines.map(l=>`<li>${l}</li>`).join('')}</ul>`;
}

// =================== THEME SWITCHER ===================
document.getElementById("theme").addEventListener("change", function () {
  const selectedTheme = this.value;
  const resume = document.querySelector(".resume-preview");

  // remove old theme classes
  resume.classList.remove("theme1", "theme2", "theme3");

  if (selectedTheme) {
    resume.classList.add(selectedTheme);
  }
});

// === Preview PDF ===
function downloadPDF(templateId) {
    const resumeElement = resumeOutput.querySelector('.resume-preview');
    if (!resumeElement) {
        alert('Error: Could not find resume content.');
        return;
    }

    const opt = {
        margin:       [0.3, 0.3, 0.3, 0.3], // top, left, bottom, right
        filename:     'My_Resume.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Use html2pdf to capture and download
    html2pdf().set(opt).from(resumeElement).save();
}
