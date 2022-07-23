let optionsForm = document.getElementById("optionsForm")


const options = {};

// Initialize the form with the user's option settings
chrome.storage.sync.get('options', (data) => {
    Object.assign(options, data.options);
    optionsForm.minRiskScore.value = Number(options.minRiskScore)
});

// Immediately persist options changes
optionsForm.minRiskScore.addEventListener('change', (event) => {
    options.minRiskScore = event.target.value;
    chrome.storage.sync.set({options})
})
