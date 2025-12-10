const fs = require('fs');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');
const path = require('path');

const targetArg = process.argv[2] || '../frontend/public/assets/character/player.png';
const TARGET_FILE = path.isAbsolute(targetArg) ? targetArg : path.resolve(__dirname, targetArg);
const TOLERANCE = 60;

function processImage(filePath) {
    console.log(`🔨 Processing Asset: ${filePath}`);

    let rawImageData;

    try {
        // Try decoding as JPEG first (since we know these assets are problematic JPEGs)
        const fileBuffer = fs.readFileSync(filePath);
        try {
            rawImageData = jpeg.decode(fileBuffer, { useTArray: true });
            console.log("ℹ️  Detected JPEG format. Converting to PNG...");
        } catch (e) {
            console.log("ℹ️  Not a JPEG, trying PNG...");
            // If not JPEG, assume PNG and use stream approach? 
            // To unify logic, let's load PNG into raw buffer too if possible, OR just handle separately.
            // For simplicity/speed in this context, let's just assume if jpeg decode fails, we pipe to PNG.
            processPngStream(filePath);
            return;
        }

        // If JPEG decode success, we have raw data. Let's process it.
        processRawData(rawImageData, filePath);

    } catch (error) {
        console.error('❌ General Error:', error);
    }
}

function processPngStream(filePath) {
    console.log("ℹ️  Processing as PNG stream...");
    const stream = fs.createReadStream(filePath).pipe(new PNG());

    stream.on('parsed', function () {
        // Convert to struct similar to jpeg-js for unified processing?
        // Or just process here.
        // Let's reuse logic.
        const rawWrapper = {
            width: this.width,
            height: this.height,
            data: this.data
        };
        processRawData(rawWrapper, filePath, this); // Pass 'this' as PNG instance if needed
    });

    stream.on('error', (err) => console.error('❌ PNG Error:', err));
}

function processRawData(rawImageData, filePath, existingPngInstance = null) {
    const png = existingPngInstance || new PNG({
        width: rawImageData.width,
        height: rawImageData.height
    });

    // 1. Multi-Point Sampling
    const samples = [
        0,                          // TL
        (16) * 4,                   // Offset 1
        (rawImageData.width * 16) * 4,      // Offset 2
        (rawImageData.width * 16 + 16) * 4, // Offset 3
        (rawImageData.width - 1) * 4,       // TR
        (rawImageData.width * (rawImageData.height - 1)) * 4, // BL
        // Middle
        (Math.floor(rawImageData.width * rawImageData.height / 2)) * 4
    ];

    const bgColors = [];

    samples.forEach(idx => {
        if (idx >= 0 && idx < rawImageData.data.length) {
            const r = rawImageData.data[idx];
            const g = rawImageData.data[idx + 1];
            const b = rawImageData.data[idx + 2];

            // Add unique colors
            const isDuplicate = bgColors.some(c =>
                Math.abs(c.r - r) < 15 &&
                Math.abs(c.g - g) < 15 &&
                Math.abs(c.b - b) < 15
            );

            if (!isDuplicate) {
                bgColors.push({ r, g, b });
                console.log(`🎨 Added Background Key: RGB(${r}, ${g}, ${b})`);
            }
        }
    });

    let transparentPixels = 0;

    for (let idx = 0; idx < rawImageData.data.length; idx += 4) {
        const r = rawImageData.data[idx];
        const g = rawImageData.data[idx + 1];
        const b = rawImageData.data[idx + 2];

        // If we created a new PNG (from JPEG), we must copy data.
        // If we are modifying existing PNG, we already have data but need to update alpha.
        if (!existingPngInstance) {
            png.data[idx] = r;
            png.data[idx + 1] = g;
            png.data[idx + 2] = b;
            png.data[idx + 3] = 255; // Default opaque
        }

        // Check Transparency
        let isBackground = false;
        for (const bg of bgColors) {
            const diff = Math.abs(r - bg.r) + Math.abs(g - bg.g) + Math.abs(b - bg.b);
            if (diff <= TOLERANCE) {
                isBackground = true;
                break;
            }
        }

        if (isBackground) {
            png.data[idx + 3] = 0; // Transparent
            transparentPixels++;
        }
    }

    console.log(`✅ Processed ${transparentPixels} pixels to transparent.`);

    // Save
    const tempPath = filePath + '.tmp';
    png.pack().pipe(fs.createWriteStream(tempPath))
        .on('finish', () => {
            fs.renameSync(tempPath, filePath);
            console.log('💾 File saved successfully (Valid PNG).');
        });
}

processImage(TARGET_FILE);
