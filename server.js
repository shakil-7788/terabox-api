const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// TeraBox Direct Extraction Endpoint
app.get('/api/resolve', async (req, res) => {
    let videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // ১. Short URL হলে Full URL বের করা
        const initialRes = await axios.get(videoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            },
            maxRedirects: 5
        });

        const finalUrl = initialRes.request.res.responseUrl || videoUrl;
        const urlObj = new URL(finalUrl);
        const surl = urlObj.searchParams.get('surl');

        if (!surl) {
            return res.status(400).json({ error: 'Invalid TeraBox URL format' });
        }

        // ২. TeraBox Official API থেকে File List আনা
        const apiRes = await axios.get(`https://www.terabox.com/share/list?app_id=250528&shorturl=${surl}&root=1`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Referer': finalUrl
            }
        });

        if (apiRes.data && apiRes.data.list && apiRes.data.list.length > 0) {
            const fileData = apiRes.data.list[0];
            const dlink = fileData.dlink;

            if (dlink) {
                return res.json({
                    success: true,
                    title: fileData.server_filename || "TeraBox Video",
                    downloadUrl: dlink,
                    streamUrl: dlink
                });
            }
        }

        return res.status(400).json({ error: 'Could not extract direct video link' });

    } catch (error) {
        console.error("Extraction Error:", error.message);
        return res.status(500).json({ error: 'Server error or TeraBox link restricted' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
