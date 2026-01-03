import React from 'react';

export const BrowserBubbleDiagram = () => (
    <div className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col items-center gap-6">
            <div className="text-2xl font-bold font-mono text-black mb-2">OS</div>
            <div className="w-48 h-48 border-4 border-black rounded-full flex items-center justify-center relative bg-white">
                <span className="text-2xl font-bold font-mono text-black">Browser</span>
            </div>
            <div className="text-center font-mono text-xl font-bold text-black leading-tight">
                and the rest
                <br />
                of the computer
            </div>
        </div>
    </div>
);

export const CannotSeeDiagram = () => (
    <div className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-xl">
        <div className="relative h-80">
            {/* Browser Circle */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 border-4 border-black rounded-full flex items-center justify-center bg-white z-10">
                <span className="text-lg font-bold font-mono text-black">Browser</span>
            </div>

            {/* Divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-1/4 -translate-x-1/2 text-4xl text-black font-bold">×</div>
            <div className="absolute left-1/2 top-3/4 -translate-x-1/2 text-4xl text-black font-bold">×</div>

            {/* External Processes */}
            <div className="absolute right-0 top-0 w-32 h-32 border-4 border-black rounded-full flex flex-col items-center justify-center bg-white z-10">
                <span className="text-lg font-bold font-mono text-black">External</span>
                <span className="text-sm font-bold font-mono text-black">processes</span>
                {/* Little Xs inside */}
                <div className="absolute top-4 right-8 text-xs font-bold">×</div>
                <div className="absolute bottom-6 left-6 text-xs font-bold">×</div>
            </div>

            {/* Memory */}
            <div className="absolute right-0 bottom-0 w-32 h-32 border-4 border-black rounded-full flex items-center justify-center bg-white z-10">
                <span className="text-lg font-bold font-mono text-black">Memory</span>
                <div className="absolute top-8 right-6 text-xs font-bold">×</div>
            </div>
        </div>
    </div>
);

export const WebEnvDiagram = () => (
    <div className="w-full max-w-lg mx-auto my-12 bg-white rounded-xl p-6 shadow-xl font-mono">
        <div className="flex items-stretch gap-2">
            {/* Box 1 */}
            <div className="flex-1 border-4 border-black p-4 flex flex-col items-center gap-4 rounded-lg">
                <span className="text-sm font-bold text-center">Web Environment</span>
                <div className="w-24 h-24 border-4 border-black rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-center">
                        Browser
                        <br />
                        Sandbox
                    </span>
                </div>
            </div>

            {/* Middle */}
            <div className="flex flex-col items-center justify-center px-2 gap-1">
                <span className="text-lg font-bold">No</span>
                <div className="border-2 border-black rounded-full p-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </div>
                <span className="text-lg font-bold">Access</span>
            </div>

            {/* Box 2 */}
            <div className="flex-1 border-4 border-black p-4 flex flex-col items-center gap-4 rounded-lg">
                <span className="text-sm font-bold text-center">Local Computer</span>
                <div className="w-24 h-24 border-4 border-black rounded-full flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-center">
                        Native
                        <br />
                        App
                    </span>
                    <span className="text-[8px] text-center mt-1">
                        Can't see or
                        <br />
                        monitor
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export const AudioFlowDiagram = () => (
    <div className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl p-10 shadow-xl">
        <div className="flex items-center justify-between relative">
            <div className="text-2xl font-bold font-mono text-black absolute top-[-20px] left-1/2 -translate-x-1/2">OS</div>

            {/* Audio Circle */}
            <div className="w-28 h-28 border-4 border-black rounded-full flex items-center justify-center bg-white z-10">
                <span className="text-xl font-bold font-mono text-black">Audio</span>
            </div>

            {/* Arrow */}
            <div className="h-0.5 bg-black flex-1 mx-2 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-black rotate-45"></div>
            </div>

            {/* App Diamond/Circle Hybrid */}
            <div className="w-28 h-28 border-4 border-black rotate-45 flex items-center justify-center bg-white z-10 rounded-xl">
                <span className="text-xl font-bold font-mono text-black -rotate-45">App</span>
            </div>
        </div>
        <div className="border-4 border-black rounded-3xl absolute inset-4 pointer-events-none"></div>
    </div>
);

export const TaskManagerDiagram = () => (
    <div className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-xl relative">
        <div className="text-3xl font-bold font-mono text-black text-center mb-8 relative z-10">Task Manager</div>

        <div className="flex justify-between items-end relative z-10 px-4">
            {/* Eye Icon */}
            <div className="flex flex-col items-center gap-2">
                <svg width="40" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-black">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <div className="h-20 border-l-2 border-black border-dashed"></div>
                <div className="w-24 h-24 border-4 border-black rounded-full flex flex-col items-center justify-center bg-white">
                    <span className="text-sm font-bold font-mono text-black">Other</span>
                    <span className="text-sm font-bold font-mono text-black">apps</span>
                </div>
                <span className="font-bold font-mono mt-2">Visible</span>
            </div>

            {/* No Eye Icon */}
            <div className="flex flex-col items-center gap-2">
                <svg width="40" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-black">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                </svg>
                <div className="h-20 border-l-2 border-black border-dashed"></div>
                <div className="w-24 h-24 border-4 border-black rounded-full flex flex-col items-center justify-center bg-white">
                    <span className="text-sm font-bold font-mono text-black">Native</span>
                    <span className="text-sm font-bold font-mono text-black">app</span>
                </div>
                <span className="font-bold font-mono mt-2">Invisible</span>
            </div>
        </div>

        {/* Outer Box */}
        <div className="border-4 border-black rounded-3xl absolute inset-4 pointer-events-none"></div>
    </div>
);
