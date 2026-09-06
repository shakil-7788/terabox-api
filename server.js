const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// একাধিক থার্ড-পার্টি সার্ভিস ব্যবহার করে লিংক এক্সট্র্যাক্ট করার ফাংশন
app.get('/api/resolve', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // ১ নম্বর ব্যাকএন্ড সার্ভিস চেষ্টা করা
    try {
        const res1 = await axios.get(`https://terabox.hnn.workers.dev/api/get-download?url=${encodeURIComponent(videoUrl)}`, { timeout: 8000 });
        if (res1.data && res1.data.downloadLink) {
            return res.json({
                success: true,
                title: res1.data.filename || "TeraBox Video",
                downloadUrl: res1.data.downloadLink,
                streamUrl: res1.data.downloadLink
            });
        }
    } catch (e) {
        console.log("API 1 Failed, trying API 2...");
    }

    // ২ নম্বর ব্যাকএন্ড সার্ভিস চেষ্টা করা (বিকল্প)
    try {
        const res2 = await axios.post('https://terabox-dl-arman.vercel.app/api', { url: videoUrl }, { timeout: 8000 });
        if (res2.data && res2.data.dlink) {
            return res.json({
                success: true,
                title: res2.data.title || "TeraBox Video",
                downloadUrl: res2.data.dlink,
                streamUrl: res2.data.dlink
            });
        }
    } catch (e) {
        console.log("API 2 Failed...");
    }

    return res.status(500).json({ error: 'Server error or TeraBox link restricted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
