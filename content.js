;(() => {
  // State variables
  let enabled = true
  let tooltip = null
  let currentSelection = ""

  // Initialize
  function init() {
    console.log("Definition Helper: Content script initialized")

    // Load settings
    chrome.storage.sync.get(["enabled"], (result) => {
      enabled = result.enabled !== false // Default to true
      setupEventListeners()
    })

    // Create tooltip element
    createTooltip()
  }

  // Create tooltip element
  function createTooltip() {
    tooltip = document.createElement("div")
    tooltip.className = "definition-tooltip"
    tooltip.style.display = "none"
    document.body.appendChild(tooltip)
  }

  // Set up event listeners
  function setupEventListeners() {
    // Listen for text selection
    document.addEventListener("mouseup", handleTextSelection)

    // Listen for scroll to hide tooltip
    window.addEventListener("scroll", () => {
      hideTooltip()
    })

    // Listen for messages from popup or background
    chrome.runtime.onMessage.addListener(handleMessage)

    // Listen for escape key to close tooltip
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && tooltip.style.display !== "none") {
        hideTooltip()
      }
    })
  }

  // Handle messages from popup or background
  function handleMessage(message, sender, sendResponse) {
    console.log("Content script received message:", message)

    if (message.action === "updateState") {
      enabled = message.enabled !== undefined ? message.enabled : enabled
      sendResponse({ success: true })
    } else if (message.action === "showDefinition" && message.text) {
      console.log("Showing definition for:", message.text)
      currentSelection = message.text

      // Show tooltip in the center of the viewport
      const x = window.innerWidth / 2
      const y = window.innerHeight / 2

      showTooltipAtPosition(x, y, message.text)
      sendResponse({ success: true })
    } else if (message.action === "lookupSelection") {
      // Handle keyboard shortcut to look up current selection
      const selection = window.getSelection()
      const selectedText = selection.toString().trim()

      if (selectedText && selectedText.length > 0) {
        currentSelection = selectedText

        // Get selection coordinates
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        // Show tooltip below the selection
        showTooltipAtPosition(rect.left + rect.width / 2, rect.bottom, selectedText)
        sendResponse({ success: true })
      } else {
        sendResponse({ success: false, error: "No text selected" })
      }
    }

    return true // Keep the message channel open for async responses
  }

  // Handle text selection
  function handleTextSelection(event) {
    if (!enabled) return

    // Ignore selections inside the tooltip itself
    if (event.target && tooltip.contains(event.target)) {
      return
    }

    const selection = window.getSelection()
    const selectedText = selection.toString().trim()

    if (selectedText && selectedText.length > 0) {
      currentSelection = selectedText

      // Get selection coordinates
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Show tooltip below the selection
      showTooltipAtPosition(rect.left + rect.width / 2, rect.bottom, selectedText)
    } else {
      hideTooltip()
    }
  }

  // Show tooltip at specified position
  function showTooltipAtPosition(x, y, text) {
    // Ensure the tooltip is visible in the viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust x position to ensure tooltip is within viewport
    x = Math.max(100, Math.min(x, viewportWidth - 100))

    // Adjust y position to ensure tooltip is within viewport
    y = Math.max(50, Math.min(y, viewportHeight - 100))

    // Update tooltip position
    tooltip.style.left = `${x}px`
    tooltip.style.top = `${y + window.scrollY}px`

    // Show loading state
    tooltip.innerHTML = `
      <div class="tooltip-loading">
        <div class="loading-spinner"></div>
        <div>Loading definition...</div>
      </div>
    `
    tooltip.style.display = "block"

    // Get definition
    getDefinition(text)
      .then((definition) => {
        if (definition) {
          tooltip.innerHTML = `
            <div class="tooltip-header">
              <div class="tooltip-term">${text}</div>
              <button class="tooltip-close" title="Close">×</button>
            </div>
            <div class="tooltip-definition">${definition}</div>
          `

          // Add event listener to close button
          const closeButton = tooltip.querySelector(".tooltip-close")
          if (closeButton) {
            closeButton.addEventListener("click", (e) => {
              e.stopPropagation()
              hideTooltip()
            })
          }
        } else {
          hideTooltip()
        }
      })
      .catch((error) => {
        console.error("Error getting definition:", error)
        tooltip.innerHTML = `
          <div class="tooltip-header">
            <div class="tooltip-term">${text}</div>
            <button class="tooltip-close" title="Close">×</button>
          </div>
          <div class="tooltip-error">Error: ${error.toString()}</div>
        `

        const closeButton = tooltip.querySelector(".tooltip-close")
        if (closeButton) {
          closeButton.addEventListener("click", (e) => {
            e.stopPropagation()
            hideTooltip()
          })
        }
      })
  }

  // Hide tooltip
  function hideTooltip() {
    tooltip.style.display = "none"
    currentSelection = ""
  }

  // Get definition from API
  function getDefinition(text) {
    return new Promise((resolve, reject) => {
      console.log("Requesting definition for:", text)

      chrome.runtime.sendMessage({ action: "getDefinition", text: text }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError)
          reject(chrome.runtime.lastError)
          return
        }

        console.log("Received definition response:", response)

        if (response && response.definition) {
          resolve(response.definition)
        } else if (response && response.error) {
          reject(response.error)
        } else {
          reject("Unknown error")
        }
      })
    })
  }

  // Initialize the content script
  init()
})()

