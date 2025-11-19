
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { DesktopItem } from '../../types';
import { FolderPlus, Image, ArrowDownAZ } from 'lucide-react';

interface HomeScreenProps {
    items: (DesktopItem | null)[];
    onLaunch: (item: DesktopItem) => void;
    onCreateFolder: () => void;
    onSort: () => void;
    onWallpaper: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ items, onLaunch, onCreateFolder, onSort, onWallpaper }) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <div 
            className="h-full w-full p-8 grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-6 content-start justify-items-center overflow-y-auto overscroll-y-contain relative"
            onContextMenu={handleContextMenu}
        >
            {items.map((item, index) => {
                if (!item) {
                    // Render an invisible placeholder to maintain grid gap
                    return <div key={`gap-${index}`} className="w-28 h-[7rem]" />;
                }
                return (
                    <button
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); onLaunch(item); }}
                        onContextMenu={(e) => {
                             // Optional: Prevent desktop context menu when right-clicking an icon, 
                             // or allow it but maybe with different options? 
                             // For now, let's stop propagation to keep it simple (only desktop bg triggers this menu)
                             e.stopPropagation(); 
                        }}
                        className="flex flex-col items-center justify-start gap-3 p-2 w-28 rounded-xl hover:bg-white/10 transition-colors group z-10"
                        title={item.name}
                    >
                        {/* Gentler 3D Effect: Reduced shadow opacity/spread, subtler inner shadows, lighter border */}
                        <div className={`relative w-20 h-20 ${item.bgColor || 'bg-zinc-700'} rounded-[22px] flex items-center justify-center shadow-[0_4px_8px_-4px_rgba(0,0,0,0.2),inset_0_1px_0.5px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-300 ease-out border-t border-white/10 overflow-hidden`}>
                             {/* Gentler Glossy Overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_rgba(255,255,255,0.15)_0%,_transparent_70%)] pointer-events-none" />
                            
                            <item.icon className="w-10 h-10 text-white relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                        </div>
                        <span className="text-sm text-white font-medium text-center truncate w-full px-1 drop-shadow-md [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                            {item.name}
                        </span>
                    </button>
                );
            })}

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className="absolute bg-zinc-800/90 backdrop-blur-md border border-zinc-700 shadow-2xl rounded-xl py-1.5 w-56 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => { onCreateFolder(); setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-3"
                    >
                        <FolderPlus size={16} /> New Folder
                    </button>
                    <button 
                        onClick={() => { onWallpaper(); setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-3"
                    >
                        <Image size={16} /> Create Wallpaper
                    </button>
                    <div className="h-px bg-zinc-700 my-1 mx-2" />
                    <button 
                        onClick={() => { onSort(); setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-3"
                    >
                        <ArrowDownAZ size={16} /> Sort By Name
                    </button>
                </div>
            )}
        </div>
    );
};
