const fetch = require('node-fetch');
const FormData = require('form-data');

const STABILITY_KEY = process.env.STABILITY_KEY || "sk-9yemfPddohz31t88bvykuEJfNInqCY7dckgFzrMXpTst8J0Z";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            status: true,
            message: "AI Thumbnail Generator API",
            endpoint: "POST /generate",
            body: { prompt: "your prompt here" },
            developer: "@Hackerwibes2"
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body || {};
        if (!prompt) {
            return res.status(400).json({ status: false, error: 'Prompt required' });
        }

        const fullPrompt = `${prompt}, YouTube thumbnail, 1280x720, bold, high contrast, clickable, professional, 4k, detailed`;

        const formData = new FormData();
        formData.append('prompt', fullPrompt);
        formData.append('output_format', 'png');
        formData.append('aspect_ratio', '16:9');

        const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
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

        return res.status(200).json({
            status: true,
            image_url: `data:image/png;base64,${imageBase64}`,
            prompt: fullPrompt
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message.substring(0, 200)
        });
    }
};
