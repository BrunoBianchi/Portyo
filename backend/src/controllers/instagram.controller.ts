import { Request, Response } from "express";

export const getLatestPosts = async (req: Request, res: Response) => {
    const { username } = req.params;
    if (!username) {
        res.status(400).json({ error: "Username required" });
        return;
    }

    try {
        // Try to fetch using the web_profile_info endpoint which is used by the web app
        // This mimics a browser request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                "X-IG-App-ID": "936619743392459",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": `https://www.instagram.com/${username}/`,
                "Accept-Language": "en-US,en;q=0.9"
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
             console.log("Instagram API failed, trying HTML fallback...");
             // Fallback: Scrape HTML
             const htmlResponse = await fetch(`https://www.instagram.com/${username}/`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                }
             });

             if (!htmlResponse.ok) {
                 throw new Error(`HTML fetch failed: ${htmlResponse.status}`);
             }

             if (!htmlResponse.ok) {
                 throw new Error(`HTML fetch failed: ${htmlResponse.status}`);
             }

             const html = await htmlResponse.text();

             if (html.includes("Login • Instagram")) {
                 console.log("Instagram redirected to login page");
                 res.status(401).json({ error: "Instagram requires login (profile might be private or rate limited)" });
                 return;
             }
             
             // Regex to find edges (posts)
             const edges: any[] = [];
             
             // Pattern 1: Standard GraphImage structure
             const regex = /"node":{"__typename":"GraphImage".*?"shortcode":"([^"]+)".*?"display_url":"([^"]+)"/g;
             let match;
             while ((match = regex.exec(html)) !== null && edges.length < 3) {
                 edges.push({ node: { shortcode: match[1], display_url: match[2].replace(/\\u0026/g, '&') } });
             }

             // Pattern 2: Alternative structure (dimensions)
             if (edges.length === 0) {
                 const altRegex = /"shortcode":"([^"]+)","dimensions":{.*?},"display_url":"([^"]+)"/g;
                 while ((match = altRegex.exec(html)) !== null && edges.length < 3) {
                    edges.push({ node: { shortcode: match[1], display_url: match[2].replace(/\\u0026/g, '&') } });
                 }
             }

             // Pattern 3: Loose match (shortcode ... display_url) - riskiest but most likely to hit
             if (edges.length === 0) {
                 const looseRegex = /"shortcode":"([\w-]+)".*?"display_url":"([^"]+)"/g;
                 while ((match = looseRegex.exec(html)) !== null && edges.length < 3) {
                    edges.push({ node: { shortcode: match[1], display_url: match[2].replace(/\\u0026/g, '&') } });
                 }
             }

             if (edges.length === 0) {
                 console.log("No edges found in HTML. Title:", html.match(/<title>(.*?)<\/title>/)?.[1]);
                 res.status(404).json({ error: "No posts found" });
                 return;
             }

             const baseUrl = `${req.protocol}://${req.get('host')}`;
             const posts = edges.map((edge: any) => ({
                id: edge.node.shortcode, // Use shortcode as ID
                url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
                imageUrl: `${baseUrl}/api/public/instagram/proxy?url=${encodeURIComponent(edge.node.display_url)}`,
                thumbnailUrl: edge.node.display_url,
                caption: "" // Hard to extract reliably with regex
            }));

            res.json(posts);
            return;
        }

        const data = await response.json();
        const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || [];
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const posts = edges.slice(0, 3).map((edge: any) => ({
            id: edge.node.id,
            url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
            imageUrl: `${baseUrl}/api/public/instagram/proxy?url=${encodeURIComponent(edge.node.display_url)}`,
            thumbnailUrl: edge.node.thumbnail_src,
            caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || ""
        }));

        res.json(posts);

    } catch (error) {
        console.error("Instagram error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getProxyImage = async (req: Request, res: Response) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        res.status(400).send("URL is required");
        return;
    }

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) {
            res.status(response.status).send("Failed to fetch image");
            return;
        }

        const contentType = response.headers.get("content-type");
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).send("Proxy error");
    }
}
