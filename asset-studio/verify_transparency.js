const fs = require('fs');
const axios = require('axios');
const { PNG } = require('pngjs');

async function checkTransparency(url) {
    console.log(`📡 Checking asset: ${url}`);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data);
        const png = PNG.sync.read(buffer);

        // Check Top-Left Pixel (0,0)
        const idx = 0; // (y * width + x) * 4
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        const a = png.data[idx + 3];

        console.log(`🎨 Pixel (0,0) Color: RGBA(${r}, ${g}, ${b}, ${a})`);

        if (a === 0) {
            console.log("✅ STATUS: TRANSPARENT (Background Removed)");
        } else {
            console.log("❌ STATUS: OPAQUE (Background Detected)");
            console.log("   Action Required: Background removal pipeline needs to be executed.");
        }

    } catch (error) {
        console.error(`❌ Error fetching asset: ${error.message}`);
        // If 404, it implies file missing or path wrong
    }
}

checkTransparency('http://localhost:3000/assets/character/nook.png');
