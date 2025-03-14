document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const enableExtensionToggle = document.getElementById("enableExtension")
  const hoverModeToggle = document.getElementById("hoverMode")
  const tooltipSizeSelect = document.getElementById("tooltipSize")
  const themeRadios = document.getElementsByName("theme")
  const animationsEnabledToggle = document.getElementById("animationsEnabled")
  const ttsEnabledToggle = document.getElementById("ttsEnabled")
  const learningModeToggle = document.getElementById("learningModeToggle")
  const optionsBtn = document.getElementById("optionsBtn")
  const apiStatus = document.getElementById("apiStatus")

  // Tab navigation elements
  const mainTab = document.getElementById("mainTab")
  const historyTab = document.getElementById("historyTab")
  const learningTab = document.getElementById("learningTab")
  const settingsTab = document.getElementById("settingsTab")

  const historyBtn = document.getElementById("historyBtn")
  const learningBtn = document.getElementById("learningBtn")
  const settingsBtn = document.getElementById("settingsBtn")

  const backFromHistoryBtn = document.getElementById("backFromHistoryBtn")
  const backFromLearningBtn = document.getElementById("backFromLearningBtn")
  const backFromSettingsBtn = document.getElementById("backFromSettingsBtn")

  const clearHistoryBtn = document.getElementById("clearHistoryBtn")
  const startQuizBtn = document.getElementById("startQuizBtn")

  const historyList = document.getElementById("historyList")
  const learningList = document.getElementById("learningList")

  const wordOfDayContainer = document.getElementById("wordOfDayContainer")
  const wordOfDay = document.getElementById("wordOfDay")
  const wordDefinition = document.getElementById("wordDefinition")

  // Load saved settings
  chrome.storage.sync.get(
    ["enabled", "hoverMode", "tooltipSize", "theme", "animationsEnabled", "ttsEnabled", "learningMode", "apiKey"],
    (result) => {
      enableExtensionToggle.checked = result.enabled !== false // Default to true
      hoverModeToggle.checked = result.hoverMode === true // Default to false

      if (result.tooltipSize) tooltipSizeSelect.value = result.tooltipSize

      if (result.theme) {
        for (const radio of themeRadios) {
          if (radio.value === result.theme) {
            radio.checked = true
            break
          }
        }
      } else {
        // Default to system
        for (const radio of themeRadios) {
          if (radio.value === "system") {
            radio.checked = true
            break
          }
        }
      }

      animationsEnabledToggle.checked = result.animationsEnabled !== false // Default to true
      ttsEnabledToggle.checked = result.ttsEnabled === true // Default to false
      learningModeToggle.checked = result.learningMode === true // Default to false

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

  // Load Word of the Day
  chrome.storage.local.get("wordOfTheDay", (result) => {
    if (result.wordOfTheDay) {
      wordOfDay.textContent = result.wordOfTheDay.word
      wordDefinition.textContent = result.wordOfTheDay.definition
    } else {
      wordOfDayContainer.classList.add("hidden")
    }
  })

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

  hoverModeToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ hoverMode: this.checked })

    // Send message to all tabs to update state
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "updateState",
            hoverMode: hoverModeToggle.checked,
          })
          .catch(() => {
            // Ignore errors for tabs where content script isn't loaded
          })
      })
    })
  })

  // Tab navigation
  historyBtn.addEventListener("click", () => {
    showTab(historyTab)
    loadHistory()
  })

  learningBtn.addEventListener("click", () => {
    showTab(learningTab)
    loadLearningWords()
  })

  settingsBtn.addEventListener("click", () => {
    showTab(settingsTab)
  })

  backFromHistoryBtn.addEventListener("click", () => {
    showTab(mainTab)
  })

  backFromLearningBtn.addEventListener("click", () => {
    showTab(mainTab)
  })

  backFromSettingsBtn.addEventListener("click", () => {
    // Save settings
    let selectedTheme = "system"
    for (const radio of themeRadios) {
      if (radio.checked) {
        selectedTheme = radio.value
        break
      }
    }

    const settings = {
      tooltipSize: tooltipSizeSelect.value,
      theme: selectedTheme,
      animationsEnabled: animationsEnabledToggle.checked,
      ttsEnabled: ttsEnabledToggle.checked,
      learningMode: learningModeToggle.checked,
    }

    chrome.storage.sync.set(settings)

    // Send message to all tabs to update settings
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "updateState",
            ...settings,
          })
          .catch(() => {
            // Ignore errors for tabs where content script isn't loaded
          })
      })
    })

    showTab(mainTab)
  })

  // Clear history
  clearHistoryBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "clearHistory" }, () => {
      loadHistory()
    })
  })

  // Start quiz
  startQuizBtn.addEventListener("click", () => {
    // TODO: Implement quiz functionality
    alert("Quiz feature coming soon!")
  })

  // Open options page
  optionsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage()
  })

  // Learning mode toggle
  learningModeToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ learningMode: this.checked })

    if (this.checked) {
      startQuizBtn.classList.remove("hidden")
    } else {
      startQuizBtn.classList.add("hidden")
    }

    // Send message to all tabs to update learning mode
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "updateState",
            learningMode: learningModeToggle.checked,
          })
          .catch(() => {
            // Ignore errors for tabs where content script isn't loaded
          })
      })
    })
  })

  // Helper function to show a tab
  function showTab(tabToShow) {
    // Hide all tabs
    mainTab.classList.remove("active")
    historyTab.classList.remove("active")
    learningTab.classList.remove("active")
    settingsTab.classList.remove("active")

    // Show the selected tab
    tabToShow.classList.add("active")
  }

  // Load history
  function loadHistory() {
    chrome.runtime.sendMessage({ action: "getHistory" }, (response) => {
      if (response && response.history) {
        if (response.history.length === 0) {
          historyList.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-4">
              No history yet. Look up some words!
            </div>
          `
          return
        }

        historyList.innerHTML = ""

        response.history.forEach((item) => {
          const date = new Date(item.timestamp)
          const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString()

          const historyItem = document.createElement("div")
          historyItem.className =
            "p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
          historyItem.innerHTML = `
            <div class="flex justify-between items-start">
              <div class="font-medium">${item.term}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">${formattedDate}</div>
            </div>
            <div class="text-sm mt-1">${item.definition}</div>
          `

          historyList.appendChild(historyItem)
        })
      } else {
        historyList.innerHTML = `
          <div class="text-center text-gray-500 dark:text-gray-400 py-4">
            Error loading history.
          </div>
        `
      }
    })
  }

  // Load learning words
  function loadLearningWords() {
    chrome.storage.local.get("learningModeWords", (result) => {
      if (result.learningModeWords && result.learningModeWords.length > 0) {
        learningList.innerHTML = ""

        result.learningModeWords.forEach((item) => {
          const date = new Date(item.addedAt)
          const formattedDate = date.toLocaleDateString()

          const wordCard = document.createElement("div")
          wordCard.className =
            "word-card p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
          wordCard.innerHTML = `
            <div class="flex justify-between items-start">
              <div class="font-medium">${item.term}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Added: ${formattedDate}</div>
            </div>
            <div class="text-sm mt-1">${item.definition}</div>
            <div class="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div>Reviewed: ${item.reviewCount || 0} times</div>
              <button class="remove-word text-red-500 hover:text-red-700">Remove</button>
            </div>
          `

          // Add event listener to remove button
          const removeBtn = wordCard.querySelector(".remove-word")
          removeBtn.addEventListener("click", () => {
            removeFromLearningMode(item.term)
          })

          learningList.appendChild(wordCard)
        })

        // Show quiz button if learning mode is enabled
        if (learningModeToggle.checked) {
          startQuizBtn.classList.remove("hidden")
        }
      } else {
        learningList.innerHTML = `
          <div class="text-center text-gray-500 dark:text-gray-400 py-4">
            No words added to learning mode yet.
          </div>
        `
        startQuizBtn.classList.add("hidden")
      }
    })
  }

  // Remove word from learning mode
  function removeFromLearningMode(term) {
    chrome.storage.local.get("learningModeWords", (result) => {
      if (result.learningModeWords) {
        const updatedWords = result.learningModeWords.filter((item) => item.term.toLowerCase() !== term.toLowerCase())

        chrome.storage.local.set({ learningModeWords: updatedWords }, () => {
          loadLearningWords()
        })
      }
    })
  }
})

