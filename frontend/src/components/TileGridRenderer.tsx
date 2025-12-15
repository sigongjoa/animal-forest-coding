import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectWorld, TileData, setTile } from '../store/slices/worldSlice';
import { selectBells } from '../store/slices/economySlice';
import './TileGridRenderer.css';

export const TileGridRenderer: React.FC = React.memo(() => {
    const { tiles } = useSelector(selectWorld);
    const bells = useSelector(selectBells);
    const dispatch = useDispatch();

    // Memoize the emoji mapping function
    const getEmojiForObject = useCallback((obj: string | undefined): string | null => {
        switch (obj) {
            case 'tree': return '🌲';
            case 'rock': return '🪨';
            case 'flower': return '🌸';
            case 'house': return '🏠';
            case 'weed': return '🌿';
            case 'present': return '🎁';
            case 'fossil': return '🦴';
            default: return null;
        }
    }, []);

    // Memoize the tile click handler
    const handleTileClick = useCallback((x: number, y: number) => {
        // Simple Interaction Debugging
        // In real game, this would trigger an action based on tool selected
        // Removed console.log for production code
    }, []);

    // Early return for empty tiles
    if (!tiles || tiles.length === 0) {
        return <div>No World Data</div>;
    }

    return (
        <div className="flex flex-col items-center">
            <div className="mb-2 font-bold text-yellow-600 bg-yellow-100 px-4 py-1 rounded-full shadow-sm" data-testid="bells-display">
                💰 {bells} Bells
            </div>
            <div className="tile-grid-container">
                {tiles.map((row, y) => (
                    <div key={y} className="tile-row">
                        {row.map((tile: TileData, x: number) => (
                            <div
                                key={`${x}-${y}`}
                                className={`tile-cell tile-${tile.type}`}
                                title={`(${x}, ${y}) ${tile.type}`}
                                onClick={() => handleTileClick(x, y)}
                            >
                                {tile.object && (
                                    <span className="tile-object">{getEmojiForObject(tile.object)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
});
