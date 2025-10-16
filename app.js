import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { PORT } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Paths
const DATA_FILE = path.join(__dirname, 'data', 'links.json');
const static_path = path.join(__dirname, 'public');

// Middleware
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load links from file
const loadLinks = async () => {
  try {
    const data = await readFile(DATA_FILE, 'utf-8');
    if (!data.trim()) {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};

// Save links to file
const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Submit new link
app.post('/submit', async (req, res) => {
  const { url, optionalURL } = req.body;
  if (!url) return res.status(400).send('URL is required');

  const shortCode = optionalURL || crypto.randomBytes(4).toString('hex');
  const links = await loadLinks();

  if (links[shortCode]) {
    return res
      .status(400)
      .sendFile(path.join(__dirname, 'pages', 'error.html'));
  }

  links[shortCode] = url;
  await saveLinks(links);
  res.redirect('/');
});

// Get all links
app.get('/links', async (req, res) => {
  try {
    const links = await loadLinks();
    res.json(links);
  } catch (error) {
    res.status(500).send('Error loading links');
  }
});

// Redirect short link
app.get('/:shortCode', async (req, res) => {
  const links = await loadLinks();
  const url = links[req.params.shortCode];

  if (url) {
    res.redirect(url);
  } else {
    res
      .status(400)
      .sendFile(path.join(__dirname, 'pages', 'error.html'));
  }
});

// Delete short link
app.delete('/links/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;
  const links = await loadLinks();

  if (links[shortCode]) {
    delete links[shortCode];
    await saveLinks(links);
    res.status(200).json({ message: 'Link deleted' });
  } else {
    res.status(404).json({ error: 'Shortcode not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
