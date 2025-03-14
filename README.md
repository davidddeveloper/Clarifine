# Smart Definition Helper

A Chrome extension that provides instant, contextual definitions for any text you select on a webpage.

![Smart Definition Helper Demo](/placeholder.svg?height=400&width=800)

## Features

- **Instant Definitions**: Select any text on a webpage to get an AI-powered contextual definition
- **AI-Powered**: Uses Google Gemini or OpenAI to provide accurate, contextual definitions
- **Keyboard Shortcuts**: Quickly look up definitions with Alt+D
- **Dark Mode**: Choose between light and dark themes
- **Movable Tooltip**: Drag the tooltip to reposition it anywhere on the screen
- **Context Menu Integration**: Right-click on selected text and choose "Get definition"

## Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (coming soon)
2. Search for "Smart Definition Helper"
3. Click "Add to Chrome"

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/yourusername/smart-definition-helper/releases)
2. Unzip the downloaded file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the unzipped folder

## Setup

1. After installation, click on the extension icon in your browser toolbar
2. Click "Open Options"
3. Choose your preferred AI provider (Google Gemini or OpenAI)
4. Enter your API key
5. Click "Save Settings"

### Getting an API Key

#### Google Gemini (Recommended)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it in the extension options

#### OpenAI
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Create a new secret key
4. Copy and paste it in the extension options

## Usage

### Basic Usage
1. Select any text on a webpage
2. A tooltip will appear with the definition
3. Click the × button to close the tooltip

### Keyboard Shortcut
- Press `Alt+D` to look up the definition for currently selected text

### Context Menu
1. Select text on a webpage
2. Right-click to open the context menu
3. Click "Get definition"

### Moving the Tooltip
1. Click and hold the ⋮⋮ button in the tooltip
2. Drag the tooltip to your desired position
3. Release to place the tooltip

### Dark Mode
1. Click on the extension icon in your browser toolbar
2. Toggle the "Dark mode" switch

## Privacy

- Your API key is stored locally in your browser and is never sent to our servers
- Selected text is sent directly to the AI provider (Google or OpenAI) for processing
- No user data is collected or stored by this extension

## Support

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/yourusername/smart-definition-helper/issues) on our GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

