
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, PenLine, Play, Mail, Presentation, Folder, Loader2, FileText, Image as ImageIcon, Gamepad2, Eraser, Video } from 'lucide-react';
import { Modality } from "@google/genai";
import { AppId, DesktopItem, Stroke, Email } from './types';
import { HomeScreen } from './components/apps/HomeScreen';
import { MailApp } from './components/apps/MailApp';
import { SlidesApp } from './components/apps/SlidesApp';
import { SnakeGame } from './components/apps/SnakeGame';
import { FolderView } from './components/apps/FolderView';
import { DraggableWindow } from './components/DraggableWindow';
import { InkLayer } from './components/InkLayer';
import { getAiClient, HOME_TOOLS, MAIL_TOOLS, MODEL_NAME, SYSTEM_INSTRUCTION } from './lib/gemini';
import { NotepadApp } from './components/apps/NotepadApp';

const INITIAL_DESKTOP_ITEMS: DesktopItem[] = [
    { id: 'mail', name: 'Mail', type: 'app', icon: Mail, appId: 'mail', bgColor: 'bg-gradient-to-br from-blue-400 to-blue-700' },
    { id: 'slides', name: 'Slides', type: 'app', icon: Presentation, appId: 'slides', bgColor: 'bg-gradient-to-br from-orange-400 to-orange-700' },
    { id: 'snake', name: 'Game', type: 'app', icon: Gamepad2, appId: 'snake', bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-800' },
    { 
        id: 'how_to_use', 
        name: 'how_to_use.txt', 
        type: 'app', 
        icon: FileText, 
        appId: 'notepad', 
        bgColor: 'bg-gradient-to-br from-pink-500 to-pink-700',
        notepadInitialContent: `GEMINI INK - GESTURE GUIDE

Navigate your computer using natural hand-drawn sketches.

GLOBAL / DESKTOP
----------------
1. Delete Item: 
   Draw an "X" or a cross over any app icon or folder to delete it.

2. Explode Folder: 
   Draw outward pointing arrows coming out of a folder to "explode" it and reveal its contents on the desktop.

3. Get Info / Summarize: 
   Draw a question mark "?" over an item.
   - If it's a folder, it lists contents.
   - If it's a text file, it reads and summarizes the text.

4. Generate Wallpaper: 
   Draw a sketch on the empty background (mountains, flowers, abstract shapes) to generate a new AI wallpaper based on your drawing.

MAIL APP
--------
1. Delete Email: 
   Draw a horizontal line (strike-through) or an "X" over an email row.

2. Summarize Email: 
   Draw a question mark "?" over an email row or highlight it to get a one-sentence summary of the email body.

TIPS
----
- Ensure your ink contrasts with the background.
- Distinct shapes work best.`
    },
    { 
        id: 'notes', 
        name: 'notes.txt', 
        type: 'app', 
        icon: FileText, 
        appId: 'notepad', 
        bgColor: 'bg-gradient-to-br from-zinc-400 to-zinc-600',
        notepadInitialContent: `TODO LIST:
- Buy milk, eggs, and bread
- Call mom on weekend
- Finish Gemini Ink demo
- Schedule dentist appointment
- Water the plants

RANDOM THOUGHTS:
The universe is vast and full of mysteries. 
Why do cats purr? 
Is time travel possible?`
    },
    { 
        id: 'project_specs', 
        name: 'novel.txt', 
        type: 'app', 
        icon: FileText, 
        appId: 'notepad', 
        bgColor: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
        notepadInitialContent: `THE BOND

Elara lived in a small cottage at the edge of the Whispering Woods, a place where the trees murmured secrets to those willing to listen. Her only companion was Barnaby, a scruffy terrier mix with one ear that stood at attention and another that flopped lazily over his brow. 

They were a pair, Elara and Barnaby. Where she went, he trotted behind, his nails clicking a familiar rhythm on the cobblestones of the village or sinking silently into the moss of the forest floor. He was her shadow, her confidant, and her anchor in a world that often felt too large and too loud.

One bitter winter evening, a storm rolled in, fierce and howling. The wind rattled the windowpanes like an angry spirit demanding entry. Elara sat by the hearth, knitting a scarf, while Barnaby dozed at her feet, chasing dream-rabbits with twitching paws. Suddenly, the power cut, plunging the cottage into darkness.

Barnaby was up in an instant. He didn't whine. He simply pressed his warm flank against Elara's leg, a sturdy, living presence in the void. He guided her, step by step, to the kitchen where the candles were kept, his low woof signaling obstacles she couldn't see. 

As they sat together by candlelight, the storm raging outside, Elara buried her face in his fur. He smelled of pine needles and rain. "You're a good boy, Barnaby," she whispered. He licked her hand, a rough, wet sandpaper kiss that said, clearer than any words, "I am here. We are safe."

Years passed, and Barnaby's muzzle turned gray. His walks became slower, his naps longer. But the look in his eyes—that adoration, that absolute, unwavering trust—never dimmed. And when the day came that he could no longer stand, Elara sat with him on the floor, holding his paw as he drifted away. 

The cottage felt empty afterwards, the silence deafening. But sometimes, when the wind blew through the Whispering Woods, Elara could swear she heard the click-click-click of nails on the floorboards, and felt a phantom warmth against her leg, reminding her that love, once given, never truly leaves.`
    },
    { id: 'docs', name: 'Documents', type: 'folder', icon: Folder, bgColor: 'bg-gradient-to-br from-sky-400 to-sky-700', contents: [
        { id: 'doc1', name: 'Report.docx', type: 'app', icon: FileText, bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700' },
        { id: 'img1', name: 'Vacation.png', type: 'app', icon: ImageIcon, bgColor: 'bg-gradient-to-br from-purple-500 to-purple-700' }
    ] },
    { id: 'projects', name: 'Projects', type: 'folder', icon: Folder, bgColor: 'bg-gradient-to-br from-teal-400 to-teal-700', contents: [
        { id: 'p1', name: 'Q4 Plans', type: 'folder', icon: Folder, bgColor: 'bg-gradient-to-br from-pink-500 to-pink-700', contents: [] },
        { id: 'p2', name: 'Assets', type: 'folder', icon: Folder, bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-700', contents: [] },
    ] }
];

interface WindowState {
    id: string;
    appId: AppId;
    title: string;
    icon: any;
    zIndex: number;
    contentId?: string; // For folder views or file opens
}

const MOCK_EMAILS: Email[] = [
    { id: 1, from: "Sarah Connors", subject: "Project Update Q3", preview: "Here are the latest metrics for the Q3 review...", body: "Hi Team,\n\nPlease find attached the Q3 metrics. We are up 20% YoY.\n\nBest,\nSarah", time: "10:30 AM", unread: true },
    { id: 2, from: "Newsletter", subject: "Weekly Tech Digest", preview: "Top 10 trends in AI this week...", body: "1. Generative AI\n2. Quantum Computing\n...", time: "Yesterday", unread: false },
    { id: 3, from: "Boss Man", subject: "Urgent: Meeting Rescheduled", preview: "Can we move the sync to 3 PM?", body: "Something came up. Let's meet at 3.\n\nThanks.", time: "Oct 24", unread: true },
];

export const App = () => {
    const [desktopItems, setDesktopItems] = useState(INITIAL_DESKTOP_ITEMS);
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [zIndexCounter, setZIndexCounter] = useState(100);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
    
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- HELPERS ---

    const findItemById = (items: DesktopItem[], id: string): DesktopItem | undefined => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.contents) {
                const found = findItemById(item.contents, id);
                if (found) return found;
            }
        }
        return undefined;
    };

    const updateItemsRecursively = (items: DesktopItem[], targetId: string, updateFn: (item: DesktopItem) => DesktopItem): DesktopItem[] => {
        return items.map(item => {
            if (item.id === targetId) {
                return updateFn(item);
            }
            if (item.contents) {
                return { ...item, contents: updateItemsRecursively(item.contents, targetId, updateFn) };
            }
            return item;
        });
    };

    const addItemToFolderRecursively = (items: DesktopItem[], folderId: string, newItem: DesktopItem): DesktopItem[] => {
        return items.map(item => {
            if (item.id === folderId) {
                return { ...item, contents: [...(item.contents || []), newItem] };
            }
            if (item.contents) {
                return { ...item, contents: addItemToFolderRecursively(item.contents, folderId, newItem) };
            }
            return item;
        });
    };

    // --- ACTIONS ---

    const handleLaunch = (item: DesktopItem) => {
        if (item.type === 'folder') {
            const newWindow: WindowState = {
                id: `win-${Date.now()}`,
                appId: 'folder',
                title: item.name,
                icon: Folder,
                zIndex: zIndexCounter + 1,
                contentId: item.id
            };
            setWindows([...windows, newWindow]);
            setActiveWindowId(newWindow.id);
            setZIndexCounter(prev => prev + 1);
        } else if (item.appId) {
            const newWindow: WindowState = {
                id: `win-${Date.now()}`,
                appId: item.appId,
                title: item.name,
                icon: item.icon,
                zIndex: zIndexCounter + 1,
                contentId: item.id
            };
            setWindows([...windows, newWindow]);
            setActiveWindowId(newWindow.id);
            setZIndexCounter(prev => prev + 1);
        }
    };

    const handleCloseWindow = (id: string) => {
        setWindows(windows.filter(w => w.id !== id));
        if (activeWindowId === id) {
            setActiveWindowId(null);
        }
    };

    const handleFocusWindow = (id: string) => {
        setActiveWindowId(id);
        setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter + 1 } : w));
        setZIndexCounter(c => c + 1);
    };

    const handleRenameItem = (id: string, newName: string) => {
        setDesktopItems(prev => updateItemsRecursively(prev, id, (item) => ({ ...item, name: newName })));
        // Also update window titles if open
        setWindows(prev => prev.map(w => {
            if (w.contentId === id) return { ...w, title: newName };
            return w;
        }));
    };

    const handleCreateFolder = (parentId: string) => {
        const newFolder: DesktopItem = {
            id: `folder-${Date.now()}`,
            name: 'New Folder',
            type: 'folder',
            icon: Folder,
            bgColor: 'bg-zinc-500',
            contents: []
        };
        setDesktopItems(prev => addItemToFolderRecursively(prev, parentId, newFolder));
    };

    const handleCreateDesktopFolder = () => {
        const newFolder: DesktopItem = {
            id: `folder-${Date.now()}`,
            name: 'New Folder',
            type: 'folder',
            icon: Folder,
            bgColor: 'bg-zinc-500',
            contents: []
        };
        setDesktopItems(prev => [...prev, newFolder]);
    };

    const handleSortDesktopItems = () => {
        setDesktopItems(prev => [...prev].sort((a, b) => {
            // Sort folders first, then by name
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'folder' ? -1 : 1;
        }));
    };

    const handleWallpaperTrigger = () => {
        alert("Tip: Draw a sketch on the empty background (e.g., mountains, flowers) to generate a custom AI wallpaper!");
    };

    // --- GEMINI INK LOGIC ---

    useEffect(() => {
        if (strokes.length === 0) return;

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            setIsProcessing(true);
            
            // 1. Capture Screen Context (Mocked slightly for speed/reliability or use html2canvas)
            // For this demo, we'll rely on text descriptions of the state + the stroke data (if we could send it)
            // Since we can't easily send vector strokes to a vision model without rasterizing, let's assume
            // we primarily use the tool definitions and state context. 
            // However, the prompt implies visual understanding.
            // We will construct a prompt with the state.
            
            let currentContextDescription = "The user is on the desktop.";
            const activeWindow = windows.find(w => w.id === activeWindowId);
            let activeTools = HOME_TOOLS;

            if (activeWindow) {
                currentContextDescription = `The user has the '${activeWindow.title}' app open and focused.`;
                if (activeWindow.appId === 'mail') {
                    activeTools = MAIL_TOOLS;
                    // Add email context
                    currentContextDescription += ` The visible emails are: ${emails.map(e => `[${e.subject}] from ${e.from}`).join(', ')}.`;
                }
            } else {
                currentContextDescription += ` Visible desktop items: ${desktopItems.map(i => i.name).join(', ')}.`;
            }

            try {
                const client = getAiClient();
                // We send a screenshot if possible, but for this code block let's rely on text context + tool assumption
                // In a real visual app, we'd await html2canvas(document.body).toDataURL()
                
                // Simulate visual interpretation by mapping common shapes (X, ?, Line) to tools via LLM reasoning on the *intent*
                // Since we can't send the canvas easily in this text-only update without adding a huge base64 string,
                // we will prompt the model to assume the stroke shapes based on typical user behaviors described in system instructions.
                // WAIT -> We *can* use html2canvas. Let's try to grab a snapshot.
                
                let imagePart: any = null;
                try {
                    const canvas = await html2canvas(document.body);
                    const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                    imagePart = { inlineData: { data: base64, mimeType: 'image/jpeg' } };
                } catch (e) {
                    console.error("Screenshot failed", e);
                }

                const parts = [{ text: `The user just drew a stroke on the screen. ${currentContextDescription}` }];
                if (imagePart) parts.unshift(imagePart);

                const response = await client.models.generateContent({
                    model: MODEL_NAME,
                    contents: { parts },
                    config: {
                        tools: activeTools,
                        systemInstruction: SYSTEM_INSTRUCTION
                    }
                });

                const functionCalls = response.functionCalls();
                if (functionCalls) {
                    for (const call of functionCalls) {
                        const args = call.args as any;
                        console.log("Tool call:", call.name, args);

                        if (call.name === 'delete_item') {
                            // Recursively remove item
                            const removeItem = (items: DesktopItem[]): DesktopItem[] => {
                                return items.filter(i => {
                                    if (i.name.toLowerCase() === args.itemName.toLowerCase()) return false;
                                    if (i.contents) {
                                        i.contents = removeItem(i.contents);
                                    }
                                    return true;
                                });
                            };
                            setDesktopItems(prev => removeItem(prev));
                        }
                        
                        if (call.name === 'explode_folder') {
                            // Find folder and launch it
                            const folder = findItemById(desktopItems, "projects"); // Mock finding by name for now or traverse
                            // Real implementation would traverse tree to find ID by name
                            // Let's just try to find top level for simplicity in this demo
                            const found = desktopItems.find(i => i.name.toLowerCase() === args.folderName.toLowerCase());
                            if (found) handleLaunch(found);
                        }

                        if (call.name === 'delete_email') {
                            setEmails(prev => prev.filter(e => !e.subject.includes(args.subject_text)));
                        }
                        
                        if (call.name === 'summarize_email') {
                            // Just alert for demo
                            alert(`Summarizing email: ${args.subject_text}`);
                        }
                    }
                }

            } catch (err) {
                console.error("Gemini Error", err);
            } finally {
                setIsProcessing(false);
                setStrokes([]); // Clear strokes
            }
        }, 1000); // 1 second debounce
    }, [strokes, windows, activeWindowId, desktopItems, emails]);

    // --- RENDER ---

    return (
        <div className="h-full w-full overflow-hidden bg-zinc-900 text-white relative selection:bg-blue-500/30">
            {/* Background Wallpaper Layer - mocked as simple gradient/color for now, could be image */}
            <div className="absolute inset-0 bg-[#1e1e2e] z-0" />

            {/* Desktop Icons */}
            <div className="relative z-10 h-full w-full">
                <HomeScreen 
                    items={desktopItems} 
                    onLaunch={handleLaunch} 
                    onCreateFolder={handleCreateDesktopFolder}
                    onSort={handleSortDesktopItems}
                    onWallpaper={handleWallpaperTrigger}
                />
            </div>

            {/* Windows */}
            {windows.map(win => (
                <DraggableWindow
                    key={win.id}
                    id={win.id}
                    title={win.title}
                    icon={win.icon}
                    zIndex={win.zIndex}
                    onClose={() => handleCloseWindow(win.id)}
                    onFocus={() => handleFocusWindow(win.id)}
                    isActive={activeWindowId === win.id}
                >
                    {win.appId === 'mail' && <MailApp emails={emails} />}
                    {win.appId === 'slides' && <SlidesApp />}
                    {win.appId === 'snake' && <SnakeGame />}
                    {win.appId === 'notepad' && (
                        <NotepadApp initialContent={findItemById(desktopItems, win.contentId!)?.notepadInitialContent} />
                    )}
                    {win.appId === 'folder' && (() => {
                        const folder = findItemById(desktopItems, win.contentId!);
                        if (folder) {
                            return (
                                <FolderView 
                                    folder={folder} 
                                    onRename={handleRenameItem}
                                    onCreateFolder={() => handleCreateFolder(folder.id)}
                                    onLaunch={handleLaunch}
                                />
                            );
                        }
                        return <div className="p-4 text-red-400">Folder not found</div>;
                    })()}
                </DraggableWindow>
            ))}

            {/* Taskbar / Dock (Simple) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex gap-2 z-50 shadow-2xl">
                {INITIAL_DESKTOP_ITEMS.slice(0, 3).map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleLaunch(item)}
                        className="p-2.5 hover:bg-white/20 rounded-xl transition-colors group relative"
                    >
                        <item.icon className="text-white w-6 h-6" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {item.name}
                        </span>
                    </button>
                ))}
                <div className="w-px bg-white/20 mx-1" />
                {/* Indicator for active processing */}
                <div className="flex items-center justify-center w-10">
                    {isProcessing ? (
                        <Loader2 className="animate-spin text-blue-400" size={20} />
                    ) : (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                </div>
            </div>

            {/* Ink Layer on top of everything */}
            <InkLayer 
                active={true} 
                strokes={strokes} 
                setStrokes={setStrokes} 
                isProcessing={isProcessing}
            />
        </div>
    );
};
