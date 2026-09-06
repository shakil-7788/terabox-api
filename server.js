const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/resolve', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // নতুন আপডেট হওয়া কার্যকরী API Endpoint
        const response = await axios.get(`https://terabox-dl.qt0.workers.dev/api/get-download?url=${encodeURIComponent(videoUrl)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        
        if (response.data && (response.data.downloadLink || response.data.direct_link)) {
            const finalLink = response.data.downloadLink || response.data.direct_link;
            return res.json({
                success: true,
                title: response.data.filename || "TeraBox Video",
                downloadUrl: finalLink,
                streamUrl: finalLink
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
