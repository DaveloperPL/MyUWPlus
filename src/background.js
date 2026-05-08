
// Test function to verify API integration and GPA calculation logic
async function testMadgrades(courseName) {
  console.log(`--- Starting Test for: ${courseName} ---`);
  
  const headers = { 
    'accept': 'application/json',
    'Authorization': API_KEY 
  };

  try {
    const searchUrl = `https://api.madgrades.com/v1/courses?query=${encodeURIComponent(courseName)}`;
    console.log(`Searching ${searchUrl}`);
    
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();
    
    console.log("Search Response:", searchData);

    if (!searchData.results || searchData.results.length === 0) {
      console.error("Result: No course found with that name.");
      return "N/A";
    }

    const uuid = searchData.results[0].uuid;

    const gradeUrl = `https://api.madgrades.com/v1/courses/${uuid}/grades`;
    const gradeRes = await fetch(gradeUrl, { headers });
    const gradeData = await gradeRes.json();

    console.log("Grade Response:", gradeData);

    if (gradeData?.cumulative?.gpa) {
      const gpa = gradeData.cumulative.gpa.toFixed(2);
      console.log(`SUCCESS: GPA is ${gpa}`);
      return gpa;
    }

    return "No GPA Data";

  } catch (err) {
    console.error("CRITICAL ERROR:", err);
    return "Error";
  }
}

// Handler for messages from content scripts requesting GPA data
async function handleGpaRequest(courseName) {
  const API_KEY = '3ee0ad4fa95147c3bc07fb915a6a63c1';
  const headers = { 'accept': 'application/json', 'Authorization': API_KEY };

  try {
    const searchRes = await fetch(`https://api.madgrades.com/v1/courses?query=${encodeURIComponent(courseName)}`, { headers });
    const searchData = await searchRes.json();

    if (!searchData.results?.length) return { gpa: "N/A" };

    const uuid = searchData.results[0].uuid;
    const gradeRes = await fetch(`https://api.madgrades.com/v1/courses/${uuid}/grades`, { headers });
    const data = await gradeRes.json();


    const c = data.cumulative;
    const totalGraded = c.aCount + c.abCount + c.bCount + c.bcCount + c.cCount + c.dCount + c.fCount;

    if (totalGraded === 0) return { gpa: "N/A" };

    const points = (c.aCount * 4.0) + 
                   (c.abCount * 3.5) + 
                   (c.bCount * 3.0) + 
                   (c.bcCount * 2.5) + 
                   (c.cCount * 2.0) + 
                   (c.dCount * 1.0) + 
                   (c.fCount * 0.0);

    const calculatedGpa = (points / totalGraded).toFixed(2);
    
    console.log(`[Success] Calculated GPA for ${courseName}: ${calculatedGpa}`);
    return { gpa: calculatedGpa };

  } catch (err) {
    console.error("Fetch Error:", err);
    return { gpa: "Err" };
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_GPA") {
    handleGpaRequest(request.courseName).then(gpa => sendResponse({ gpa }));
    return true; 
  }
});
// "use strict"

// function setBadgeText(enabled) {
//     const text = enabled ? "ON" : "OFF"
//     void chrome.action.setBadgeText({text: text})
// }

// function startUp() {
//     chrome.storage.sync.get("enabled", (data) => {
//         setBadgeText(!!data.enabled)
//     })
// }

// // Ensure the background script always runs.
// chrome.runtime.onStartup.addListener(startUp)
// chrome.runtime.onInstalled.addListener(startUp)
