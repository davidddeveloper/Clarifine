document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const enableExtensionToggle = document.getElementById("enableExtension")
  const optionsBtn = document.getElementById("optionsBtn")
  const apiStatus = document.getElementById("apiStatus")

  // Load saved settings
  chrome.storage.sync.get(
    ["enabled", "apiKey"],
    (result) => {
      enableExtensionToggle.checked = result.enabled !== false // Default to true

      // Check API configuration
      if (result.apiKey) {
        apiStatus.textContent = "API key configured"
        apiStatus.className = "api-status configured"
      } else {
        apiStatus.textContent = "API key not configured. Please set it in the options page."
        apiStatus.className = "api-status not-configured"
      }
    },
  )

  // Save settings when changed
  enableExtensionToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ enabled: this.checked })

    // Send message to all tabs to update state
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "updateState",
            enabled: enableExtensionToggle.checked,
          })
          .catch(() => {
            // Ignore errors for tabs where content script isn't loaded
          })
      })
    })
  })

  // Open options page
  optionsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage()
  })
  
})