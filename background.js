// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed")

  // Create context menu item
  chrome.contextMenus.create({
    id: "getDefinition",
    title: "Get definition",
    contexts: ["selection"],
  })

  // Set default settings
  chrome.storage.sync.get(["enabled", "apiProvider", "apiKey"], (result) => {
    const defaults = {
      enabled: true,
      apiProvider: "gemini",
    }

    // Only set values that aren't already set
    const newSettings = {}
    let hasNewSettings = false

    for (const [key, value] of Object.entries(defaults)) {
      if (result[key] === undefined) {
        newSettings[key] = value
        hasNewSettings = true
      }
    }

    if (hasNewSettings) {
      chrome.storage.sync.set(newSettings)
    }
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getDefinition" && info.selectionText && tab && tab.id) {
    chrome.tabs
      .sendMessage(tab.id, {
        action: "showDefinition",
        text: info.selectionText,
      })
      .catch((error) => {
        console.log("Content script not ready, injecting it now...", error)

        // Inject content script
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          })
          .then(() => {
            // Try again after injection
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, {
                action: "showDefinition",
                text: info.selectionText,
              })
            }, 200)
          })
      })
  }
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "lookup-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "lookupSelection" })
      }
    })
  }
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getDefinition") {
    getDefinitionFromAPI(message.text)
      .then((definition) => {
        sendResponse({ definition })
      })
      .catch((error) => {
        console.error("Error getting definition:", error)
        sendResponse({ error: error.toString() })
      })

    // Return true to indicate we'll respond asynchronously
    return true
  }
})

// Get definition from API
async function getDefinitionFromAPI(text) {
  try {
    // Get API settings
    const settings = await chrome.storage.sync.get(["apiProvider", "apiKey"])

    if (!settings.apiKey) {
      throw new Error("API key not configured. Please set it in the options page.")
    }

    if (settings.apiProvider === "gemini") {
      return await getDefinitionFromGemini(text, settings.apiKey)
    } else {
      return await getDefinitionFromOpenAI(text, settings.apiKey)
    }
  } catch (error) {
    console.error("Error in getDefinitionFromAPI:", error)
    throw error
  }
}

// Get definition from Gemini API
async function getDefinitionFromGemini(text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Provide a brief, contextual definition or explanation of the term or phrase: "${text}". 
                 Keep it concise (1-3 sentences) and focus on the most likely meaning based on common usage.
                 Do not include the term itself in your response.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()

  if (
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0]
  ) {
    return data.candidates[0].content.parts[0].text.trim()
  }

  throw new Error("Unexpected response format from Gemini API")
}

// Get definition from OpenAI API
async function getDefinitionFromOpenAI(text, apiKey) {
  const url = "https://api.openai.com/v1/chat/completions"

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You provide brief, contextual definitions of terms and phrases. Keep responses concise (1-3 sentences) and focus on the most likely meaning based on common usage.",
        },
        {
          role: "user",
          content: `Define: "${text}"`,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    return data.choices[0].message.content.trim()
  }

  throw new Error("Unexpected response format from OpenAI API")
}

