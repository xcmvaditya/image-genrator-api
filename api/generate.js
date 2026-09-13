const fetch = require('node-fetch');
const FormData = require('form-data');

const STABILITY_KEY = "sk-9yemfPddohz31t88bvykuEJfNInqCY7dckgFzrMXpTst8J0Z";
const STABILITY_URL = "https://api.stability.ai/v2beta/stable-image/generate/core";

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, error: 'Method not allowed' });
    }

    try {
        // Body se prompt lo
        const { prompt } = req.body || {};

        if (!prompt) {
            return res.status(400).json({ status: false, error: 'Prompt required' });
        }

        // Thumbnail ke liye optimized prompt
        const fullPrompt = `${prompt}, YouTube thumbnail, 1280x720, bold, high contrast, clickable, professional, 4k, detailed, cinematic lighting`;

        // Stability AI API call
        const formData = new FormData();
        formData.append('prompt', fullPrompt);
        formData.append('output_format', 'png');
        formData.append('aspect_ratio', '16:9');

        const response = await fetch(STABILITY_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STABILITY_KEY}`,
                'Accept': 'application/json',
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                status: false,
                error: errorText.substring(0, 200)
            });
        }

        const result = await response.json();
        const imageBase64 = result.image;

        if (!imageBase64) {
            return res.status(500).json({ status: false, error: 'No image generated' });
        }

        // Base64 image ko data URL mein convert karo
        const imageUrl = `data:image/png;base64,${imageBase64}`;

        return res.status(200).json({
            status: true,
            image_url: imageUrl,
            prompt: fullPrompt
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message.substring(0, 200)
        });
    }
};
