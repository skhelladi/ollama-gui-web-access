import express from 'express';
import ollama from 'ollama';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ip from 'ip';
import chalk from 'chalk';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Ollama avec détection automatique
async function detectOllamaHost() {
    try {
        const response = await ollama.list();
        console.log('Connected to Ollama server successfully');
        return {
            host: 'http://localhost:11434', // Ollama's default host
            version: ollama.version || 'unknown',
            models: response.models || []
        };
    } catch (error) {
        console.error('Failed to connect to Ollama:', error);
        throw error;
    }
}

const app = express();
const PORT = process.env.PORT || 8080;

// Configuration initiale d'Ollama
let OLLAMA_CONFIG = {
    host: 'http://localhost:11434',
    version: 'unknown',
    models: []
};

async function initServer() {
    try {
        OLLAMA_CONFIG = await detectOllamaHost();
    } catch (error) {
        console.error('Failed to detect Ollama server:', error);
    }

    // Load settings from a JSON file
    const settingsPath = path.join(__dirname, 'settings.json');
    let settings = { ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434' };

    if (fs.existsSync(settingsPath)) {
        try {
            const settingsData = fs.readFileSync(settingsPath, 'utf-8');
            settings = JSON.parse(settingsData);
        } catch (error) {
            console.error('Error reading settings file:', error);
        }
    }

    app.use(cors());
    app.use(express.json());
    app.use(express.static('dist'));

    // Nouvel endpoint pour vérifier la connexion Ollama
    app.get('/api/status', (req, res) => {
        res.json({
            ollama: {
                host: OLLAMA_CONFIG.host,
                version: OLLAMA_CONFIG.version,
                connected: true
            }
        });
    });

    // API endpoints
    app.get('/api/models', async (req, res) => {
        try {
            const response = await ollama.list();
            const models = response.models.map(model => model.name);
            res.json({ models });
        } catch (error) {
            console.error('Error fetching LLM models:', error);
            res.status(500).json({ 
                error: 'Failed to fetch LLM models',
                details: error.message 
            });
        }
    });

    app.post('/api/generate', async (req, res) => {
        try {
            const { model, prompt } = req.body;
            if (!model || !prompt) {
                return res.status(400).json({ error: 'Model and prompt are required' });
            }
            
            console.log('Generating response with model:', model);
            const response = await ollama.generate({
                model,
                prompt,
                options: {
                    temperature: 0.7,
                    repeat_penalty: 1.1
                }
            });
            
            res.json({ response: response.response });
        } catch (error) {
            console.error('Error generating response:', error);
            res.status(500).json({ 
                error: 'Failed to generate response',
                details: error.message 
            });
        }
    });

    // Endpoint to save settings
    app.post('/api/settings', (req, res) => {
        try {
            const newSettings = req.body;
            fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
            console.log('Settings saved:', newSettings);
            res.json({ success: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            res.status(500).json({ error: error.toString() });
        }
    });

    // Serve React app for all other routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    app.listen(PORT, () => {
        const publicIp = ip.address();
        console.log(`
----------------------------------------
|          Ollama Search GUI           |
----------------------------------------
| Ollama Version: ${OLLAMA_CONFIG.version}
| Available Models: ${OLLAMA_CONFIG.models.length}
| GUI Server: http://${publicIp}:${PORT}
----------------------------------------
${chalk.green(`Local URL:   http://localhost:${PORT}`)}
${chalk.green(`Network URL: http://${publicIp}:${PORT}`)}
----------------------------------------
${chalk.yellow('Press Ctrl+C to stop the server')}
`);
    });
}

// Démarrer le serveur
initServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});


