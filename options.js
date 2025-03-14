document.addEventListener("DOMContentLoaded", () => {
  const apiProviderSelect = document.getElementById("apiProvider")
  const apiKeyInput = document.getElementById("apiKey")
  const toggleVisibility = document.getElementById("toggleVisibility")
  const geminiInstructions = document.getElementById("geminiInstructions")
  const openaiInstructions = document.getElementById("openaiInstructions")
  const resetBtn = document.getElementById("resetBtn")
  const saveBtn = document.getElementById("saveBtn")
  const statusMessage = document.getElementById("statusMessage")

  // Load saved settings
  chrome.storage.sync.get(["apiProvider", "apiKey"], (result) => {
    if (result.apiProvider) apiProviderSelect.value = result.apiProvider
    if (result.apiKey) apiKeyInput.value = result.apiKey

    // Show appropriate API instructions
    toggleApiInstructions(result.apiProvider || "gemini")
  })

  // Toggle API key visibility
  toggleVisibility.addEventListener("click", () => {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text"
      toggleVisibility.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
          <line x1="2" x2="22" y1="2" y2="22"></line>
        </svg>
      `
    } else {
      apiKeyInput.type = "password"
      toggleVisibility.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `
    }
  })

  // Toggle API instructions based on provider
  apiProviderSelect.addEventListener("change", function () {
    toggleApiInstructions(this.value)
  })

  function toggleApiInstructions(provider) {
    if (provider === "gemini") {
      geminiInstructions.style.display = "block"
      openaiInstructions.style.display = "none"
    } else if (provider === "openai") {
      geminiInstructions.style.display = "none"
      openaiInstructions.style.display = "block"
    } else if (provider === "ours") {
      geminiInstructions.style.display = "none"
      openaiInstructions.style.display = "none"

      chrome.storage.sync.get(["defaultApiKey"], (result) => {
        apiKeyInput.value = result.defaultApiKey
      })

    }
  }

  // Save settings
  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set(
      {
        apiProvider: apiProviderSelect.value,
        apiKey: apiKeyInput.value,
      },
      () => {
        showStatus("Settings saved successfully!", "success")
      },
    )
  })

  // Reset to defaults
  resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      apiProviderSelect.value = "gemini"
      apiKeyInput.value = ""

      toggleApiInstructions("gemini")

      showStatus("Settings reset to default values. Click Save to apply.", "info")
    }
  })

  function showStatus(message, type) {
    statusMessage.textContent = message
    statusMessage.className = "status-message"

    if (type === "success") {
      statusMessage.classList.add("status-success")
    } else if (type === "error") {
      statusMessage.classList.add("status-error")
    } else {
      statusMessage.classList.add("status-success")
    }

    statusMessage.style.display = "block"

    setTimeout(() => {
      statusMessage.style.display = "none"
    }, 3000)
  }
})

