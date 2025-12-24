import { Request, Response } from "express";

export const getLatestVideos = async (req: Request, res: Response) => {
    const { username } = req.params;
    const { url } = req.query;

    let targetUrl = "";

    if (url && typeof url === 'string') {
        targetUrl = url;
    } else if (username) {
        // If username is provided, construct the URL
        // Handles usually look like @username
        const handle = username.startsWith('@') ? username : `@${username}`;
        targetUrl = `https://www.youtube.com/${handle}`;
    } else {
        res.status(400).json({ error: "Username or URL required" });
        return;
    }

    try {
        // 1. Get Channel ID from handle/username/url
        // We try to fetch the channel page to find the RSS feed URL or Channel ID
        const channelPageResponse = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!channelPageResponse.ok) {
            res.status(channelPageResponse.status).json({ error: "Failed to fetch channel page" });
            return;
        }

        const channelPageText = await channelPageResponse.text();
        
        // Look for channelId in the page source
        // Pattern 1: "channelId":"UC..."
        let channelIdMatch = channelPageText.match(/"channelId":"(UC[\w-]+)"/);

        // Pattern 2: <meta itemprop="channelId" content="UC...">
        if (!channelIdMatch) {
            channelIdMatch = channelPageText.match(/<meta itemprop="channelId" content="(UC[\w-]+)"/);
        }

        // Pattern 3: "externalId":"UC..."
        if (!channelIdMatch) {
            channelIdMatch = channelPageText.match(/"externalId":"(UC[\w-]+)"/);
        }

        // Pattern 4: browse_id (often used for channel ID in initial data)
        if (!channelIdMatch) {
            channelIdMatch = channelPageText.match(/"browseId":"(UC[\w-]+)"/);
        }
        
        if (!channelIdMatch) {
             console.log("Failed to find channel ID for URL:", targetUrl);
             // console.log("Page preview:", channelPageText.substring(0, 500)); // Debugging
             res.status(404).json({ error: "Channel ID not found" });
             return;
        }

        const channelId = channelIdMatch[1];
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

        // 2. Fetch RSS Feed
        const rssResponse = await fetch(rssUrl);
        if (!rssResponse.ok) {
            res.status(rssResponse.status).json({ error: "Failed to fetch RSS feed" });
            return;
        }

        const rssText = await rssResponse.text();

        // 3. Parse XML (Simple Regex approach)
        // We need <entry> tags
        const entries = rssText.split('<entry>').slice(1);
        
        const videos = entries.slice(0, 3).map(entry => {
            const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entry.match(/<title>(.*?)<\/title>/);
            const id = idMatch ? idMatch[1] : '';
            
            return {
                id: id,
                url: `https://www.youtube.com/watch?v=${id}`,
                imageUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`, // Standard YouTube thumbnail URL
                title: titleMatch ? titleMatch[1] : ''
            };
        });

        res.json(videos);

    } catch (error) {
        console.error("YouTube error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
