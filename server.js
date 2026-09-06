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
        // নতুন মাল্টি-সোর্স API এক্সট্র্যাক্টর
        const response = await axios.get(`https://terabox-videodownloader.com/api/get-info?url=${encodeURIComponent(videoUrl)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        if (response.data && (response.data.hd_link || response.data.fast_link || response.data.download_link)) {
            const dlLink = response.data.hd_link || response.data.fast_link || response.data.download_link;
            return res.json({
                success: true,
                title: response.data.filename || "TeraBox Video",
                downloadUrl: dlLink,
                streamUrl: dlLink
            });
        }

        return res.status(400).json({ error: 'Could not extract direct video link' });

    } catch (error) {
        return res.status(500).json({ error: 'Server error or TeraBox link restricted' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
