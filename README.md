# Ollama Search GUI

Ollama Search GUI is a graphical user interface that connects to a local instance of Ollama and allows the selected Ollama model to browse/search the internet. Users can select from the available Ollama models, change the base URL, enter prompts, enable/disable search, etc. The search is provided via DuckDuckGo.

## Features

- Select available Ollama models
- Enter prompts
- Enable/disable web search
- Display web search results
- Display AI-generated responses in real-time
- Modern theme with dark/light mode support

## Tech Stack

This project is built with React and Chakra UI.

- Vite
- React
- Chakra UI
- Ollama
- Express

## Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/GPT-Engineer-App/ollama-search-gui.git
cd ollama-search-gui
npm install
```

## Usage

To start the development server with auto-reloading and instant preview:

```sh
npm run dev
```

To build the application for production:

```sh
npm run build
```

To start the server in production mode:

```sh
npm start
```

## Configuration

The project uses a `settings.json` file for configuration. Ensure this file is present in the root directory of the project.

## API Endpoints

### Ollama Models

- `GET /api/models` : Retrieves the list of available Ollama models.

### Generate Responses

- `POST /api/generate` : Generates a response based on the provided model and prompt.

### History

- `GET /history` : Retrieves the history of questions.
- `POST /history` : Adds a question to the history.
- `DELETE /history/:id` : Deletes a question from the history.
- `PUT /history/:id` : Updates the title of a question.

### Discussions

- `GET /discussion/:questionId` : Retrieves the discussion for a given question.
- `POST /discussion` : Adds a message to a discussion.

### Settings

- `POST /save-settings` : Saves settings to a JSON file.

### Public IP Address

- `GET /get-public-ip` : Retrieves the server's public IP address.

## Requirements

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## License

This project is licensed under the GPL-3.0 License.
