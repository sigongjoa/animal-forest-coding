import { useState, useRef, useEffect } from 'react';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState<number>(15);
  const [frameWidth, setFrameWidth] = useState<number>(64);
  const [frameHeight, setFrameHeight] = useState<number>(256); // Default for Nook 3x4 sheet? No, mostly just height
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [imageSrc, tolerance]);

  const processImage = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Auto-detect background color from Top-Left (0,0)
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Simple Euclidean color distance
        const diff = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );

        if (diff <= tolerance) {
          data[i + 3] = 0; // Alpha 0
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white font-sans">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          🦁 Animal Forest Asset Studio
        </h1>
        <p className="text-gray-400 mt-2">Verify and Process Sprite Assets</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Step 1: Input */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">1. Raw Input</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Upload Sprite Sheet</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-emerald-500 file:text-white
                hover:file:bg-emerald-600
              "
            />
          </div>

          {imageSrc && (
            <div className="relative mt-4 border border-gray-600 rounded bg-black/50 p-2 overflow-auto max-h-[400px]">
              <p className="text-xs text-center mb-2 text-gray-500">Original (Background Detected from Top-Left)</p>
              <img src={imageSrc} alt="Raw" className="max-w-none pixelated" />
            </div>
          )}
        </div>

        {/* Step 2: Controls */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">2. Tuning & Preview</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Color Tolerance ({tolerance})</label>
            <input
              type="range"
              min="0"
              max="100"
              value={tolerance}
              onChange={(e) => setTolerance(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Increase if edges are still colored. Decrease if sprite parts disappear.</p>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <label className="block text-sm font-medium mb-1">Animation Preview Settings</label>
            <div className="flex gap-4">
              <div>
                <span className="text-xs text-gray-400">Frame Width</span>
                <input
                  type="number"
                  value={frameWidth}
                  onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mt-1"
                />
              </div>
              <div>
                <span className="text-xs text-gray-400">Total Height</span>
                <input
                  type="number"
                  value={frameHeight}
                  onChange={(e) => setFrameHeight(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mt-1"
                />
              </div>
            </div>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`w-full mt-4 py-2 rounded font-bold transition-all ${isAnimating ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isAnimating ? 'Stop Animation' : 'Play Animation'}
            </button>
          </div>
        </div>

        {/* Step 3: Result */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">3. Verified Result</h2>

          {processedSrc ? (
            <div className="flex flex-col gap-4">
              <div
                className="relative border-2 border-dashed border-gray-600 rounded bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/5d/Checker-16x16.png')] min-h-[200px] flex items-center justify-center overflow-hidden"
              >
                {/* This img is for static verification */}
                {!isAnimating && (
                  <img src={processedSrc} alt="Processed" className="max-w-full max-h-[300px] object-contain pixelated" />
                )}

                {/* This div is for animation verification */}
                {isAnimating && (
                  <div
                    className="animate-sprite"
                    style={{
                      width: `${frameWidth}px`,
                      height: `${frameHeight}px`, // This is usually full height? No, sprite frame height is SheetHeight / Rows.
                      // Simplified: Just showing background image shift animation logic in CSS
                      backgroundImage: `url(${processedSrc})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: '0 0',
                      animation: `play-sprite 0.8s step-end infinite`
                    }}
                  ></div>
                )}
                <style>{`
                    @keyframes play-sprite {
                        0% { background-position: 0 0; }
                        25% { background-position: -${frameWidth}px 0; }
                        50% { background-position: -${frameWidth * 2}px 0; }
                        75% { background-position: -${frameWidth}px 0; } /* Ping pong or loop? standard is 0, -w, -2w */
                        100% { background-position: 0 0; }
                    }
                 `}</style>
              </div>

              <a
                href={processedSrc}
                download="processed_sprite.png"
                className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-center rounded-lg font-bold shadow-lg transition-transform active:scale-95"
              >
                💾 Download Processed Asset
              </a>
              <p className="text-xs text-center text-gray-400">Save this file to <code>frontend/public/assets/character/</code></p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600">
              No input image
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
