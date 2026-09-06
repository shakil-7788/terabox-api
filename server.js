const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// TeraBox Link Resolver API Endpoint
app.get('/api/resolve', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // ফ্রি পাবলিক API-র মাধ্যমে TeraBox Direct Link এক্সট্র্যাক্ট করা
        const response = await axios.get(`https://terabox-dl.qt0.workers.dev/api/get-download?url=${encodeURIComponent(videoUrl)}`);

        if (response.data && response.data.downloadLink) {
            return res.json({
                success: true,
                title: response.data.filename || "TeraBox Video",
                downloadUrl: response.data.downloadLink,
                streamUrl: response.data.downloadLink
            });
        } else {
            return res.status(500).json({ error: "Failed to extract link" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Server error or invalid link" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
