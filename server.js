const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/resolve', async (req, res) => {
    const diskwalaUrl = req.query.url;
    if (!diskwalaUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Diskwala পেজ থেকে HTML ডাটা আনা
        const response = await axios.get(diskwalaUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        // HTML থেকে ভিডিও উৎস (src) বা ডাউনলোড লিংক স্ক্র্যাপ করা
        let videoSrc = $('video source').attr('src') || $('video').attr('src') || $('a#download_btn').attr('href');

        if (videoSrc) {
            return res.json({
                success: true,
                title: $('title').text().trim() || "Diskwala Video",
                downloadUrl: videoSrc,
                streamUrl: videoSrc
            });
        } else {
            return res.status(400).json({ error: 'Could not find video link from Diskwala' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Server error or Diskwala link unreachable' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
