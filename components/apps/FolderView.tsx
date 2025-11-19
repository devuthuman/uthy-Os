/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { DesktopItem } from '../../types';
import { FileText, FolderPlus, Folder } from 'lucide-react';

interface FolderViewProps {
    folder: DesktopItem;
    onRename: (id: string, name: string) => void;
    onCreateFolder: () => void;
    onLaunch: (item: DesktopItem) => void;
}

export const FolderView: React.FC<FolderViewProps> = ({ folder, onRename, onCreateFolder, onLaunch }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const startEditing = (e: React.MouseEvent, item: DesktopItem) => {
        e.stopPropagation();
        setEditingId(item.id);
        setEditValue(item.name);
    };

    const commitRename = () => {
        if (editingId && editValue.trim()) {
            onRename(editingId, editValue.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitRename();
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div className="h-full w-full bg-zinc-50 flex flex-col text-zinc-800 p-4 overflow-y-auto overscroll-y-contain" onClick={() => setEditingId(null)}>
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between mb-4 p-3 bg-white border border-zinc-200 rounded-xl shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-zinc-600">
                    <Folder size={18} className="text-blue-500"/>
                    <span className="font-bold text-sm">{folder.name}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onCreateFolder(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors"
                >
                    <FolderPlus size={14} />
                    <span>New Folder</span>
                </button>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-white border border-zinc-200 rounded-lg shadow-sm shrink-0">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 font-medium uppercase text-[10px] tracking-wider">
                    <FileText size={14} /> README.txt
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">
                    {folder.contents && folder.contents.length > 0 
                        ? `Contains ${folder.contents.length} item(s). Click an item's icon to open it. Click the name to rename.` 
                        : "This folder is empty. Use the 'New Folder' button to create contents."}
                </p>
            </div>

            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 shrink-0">
                Contents
            </h3>
            
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 content-start pb-10">
                {folder.contents?.map(item => (
                    <button 
                        key={item.id} 
                        className="flex flex-col items-center justify-start gap-3 p-3 hover:bg-blue-100/50 rounded-xl cursor-pointer transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            onLaunch(item);
                        }}
                    >
                        {/* Icon */}
                        <div className={`relative w-16 h-16 ${item.bgColor || 'bg-zinc-500'} rounded-[18px] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200 ease-out border-t border-white/20 overflow-hidden`}>
                             <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_rgba(255,255,255,0.25)_0%,_transparent_70%)] pointer-events-none" />
                            <item.icon size={32} className="relative z-10 drop-shadow-sm" />
                        </div>
                        
                        {/* Rename Input or Label */}
                        {editingId === item.id ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-xs text-center bg-white ring-2 ring-blue-500 rounded px-1 py-0.5 focus:outline-none shadow-lg z-20 text-zinc-900 min-w-[80px]"
                            />
                        ) : (
                            <span 
                                onClick={(e) => startEditing(e, item)}
                                className="text-xs text-center truncate w-full font-medium text-zinc-700 group-hover:text-zinc-900 rounded px-1.5 py-0.5 transition-colors select-none"
                                title={item.name}
                            >
                                {item.name}
                            </span>
                        )}
                    </button>
                ))}
                {(!folder.contents || folder.contents.length === 0) && (
                     <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-400 gap-2 border-2 border-dashed border-zinc-200 rounded-xl">
                        <Folder size={32} className="opacity-20"/>
                        <span className="text-sm font-medium">Folder is empty</span>
                    </div>
                )}
            </div>
        </div>
    );
};
