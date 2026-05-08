// Function to inject GPA badge into the course element
function injectGPABadge(courseElement, gpaValue) {
  if (courseElement.querySelector('.madgrades-gpa-badge')) return;

  const nameElement = courseElement.querySelector('.name');

  if (!nameElement) return;

  const badge = document.createElement('span');
  badge.className = 'madgrades-gpa-badge';
  
  // Style based on GPA "Difficulty"
  const val = parseFloat(gpaValue);
  let color = "#666"; 
  if (val >= 3.5) color = "#28a745"; // Green
  else if (val >= 3.0) color = "#d4a017"; // Gold
  else if (val < 3.0) color = "#c5050c"; // UW Red

  badge.innerText = ` GPA: ${gpaValue}`;
  badge.style.cssText = `
    display: inline-block;
    margin-left: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: ${color}22;
    color: ${color};
    font-weight: bold;
    font-size: 0.85em;
    border: 1px solid ${color};
  `;

  nameElement.appendChild(badge);
}

// Main function to process the enrollment page and find courses
const processEnrollmentPage = () => {
  const courses = document.querySelectorAll('li.course-item:not(.gpa-scanned)');

  courses.forEach(course => {
    course.classList.add('gpa-scanned');
    
    const nameSpan = course.querySelector('.name');
    if (!nameSpan) return;

    const cleanCourseName = nameSpan.textContent.replace(/\s+/g, ' ').trim();
    
    console.log(`[Content] Found course: "${cleanCourseName}". Requesting GPA...`);
    chrome.runtime.sendMessage({ 
  type: "FETCH_GPA", 
  courseName: cleanCourseName 
}, (response) => {
    // Response should be in the format: { gpa: "3.75" } or { gpa: "N/A" }
  if (response && response.gpa && response.gpa.gpa) {
    injectGPABadge(course, response.gpa.gpa); 
  } else {
    injectGPABadge(course, "N/A");
  }
});
  });
};

// Use MutationObserver because the Degree Planner is an Angular app and dynamically updates the DOM without page reloads. This ensures we catch new courses added to the list.
const observer = new MutationObserver(() => {
  processEnrollmentPage();
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

processEnrollmentPage();