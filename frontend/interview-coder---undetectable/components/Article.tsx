import React from 'react';
import { BrowserBubbleDiagram, CannotSeeDiagram, WebEnvDiagram, AudioFlowDiagram, TaskManagerDiagram } from './Diagrams';

const CodeBlock = ({ children }: { children?: React.ReactNode }) => (
  <div className="bg-[#1d1f21] rounded-lg p-4 font-mono text-sm md:text-base text-[#c5c8c6] overflow-x-auto my-8 border border-white/5 shadow-inner">
    <pre className="whitespace-pre">{children}</pre>
  </div>
);

const SectionTitle = ({ children }: { children?: React.ReactNode }) => (
  <h2 className="text-3xl md:text-4xl font-bold text-white mt-16 mb-8 tracking-tight">
    {children}
  </h2>
);

const Paragraph = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <p className={`text-lg md:text-xl text-gray-300 leading-relaxed mb-8 ${className}`}>
    {children}
  </p>
);

const Article: React.FC = () => {
  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20">
      
      {/* Header */}
      <header className="mb-12 text-center flex flex-col items-center">
        <div 
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold relative bg-yellow-500/10 text-yellow-500 hover:opacity-90 transition-all border border-yellow-500/40 mb-4 cursor-pointer"
          style={{
            textShadow: '0 0 10px hsla(60, 100%, 50%, 0.5)',
            boxShadow: '0 0 20px hsla(60, 100%, 50%, 0.3)'
          }}
        >
          Tech Explained
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
          How Co-Interview is Still Undetectable
        </h1>
        
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          We've heard the concerns. Trust us, Co-Interview still works. Here's how we know.
        </p>
        
        <p className="mt-4 text-sm text-gray-500">
          Published on October 17, 2025
        </p>
      </header>

      {/* Main Content */}
      <div className="mx-auto">
        <SectionTitle>The Browser Bubble</SectionTitle>
        <Paragraph>
          Most coding interviews happen right in your web browser (like on HackerRank, CoderPad, or CodeSignal). Browsers are designed like secure bubbles – what happens inside one tab generally can't see or mess with anything outside of it. This is called "sandboxing," and it's a core security feature.
        </Paragraph>
        <Paragraph>
          Think of the interview website running in a browser tab. It can show you the coding problem and run its own scripts, but it's walled off from the rest of your computer. It simply doesn't have permission to peek at other apps you might be running.
        </Paragraph>

        <BrowserBubbleDiagram />

        <SectionTitle>What Interview Platforms *Can* See (Inside the Bubble)</SectionTitle>
        <Paragraph>
          Within their own tab, interview platforms *can* use browser features to monitor some things:
        </Paragraph>
        
        <ul className="list-disc pl-6 space-y-4 text-lg md:text-xl text-gray-300 mb-8">
          <li>
            <strong className="text-white">Losing Focus / Switching Tabs:</strong> They know if you click outside the browser window or switch tabs. But they *don't* know what you switched to.
            <CodeBlock>
{`// They can detect this...
window.addEventListener('blur', () => {
  console.log('User looked away from the tab!');
});`}
            </CodeBlock>
          </li>
          <li>
            <strong className="text-white">Pasting Code:</strong> They can tell if you paste something into the code editor, potentially flagging large or frequent pastes.
            <CodeBlock>
{`// ...and they can detect this.
codeInput.addEventListener('paste', (event) => {
  console.log('Paste detected!');
});`}
            </CodeBlock>
          </li>
          <li>
            <strong className="text-white">Webcam Monitoring (Sometimes):</strong> Some platforms might use your webcam to monitor eye movement, flagging excessive looking away.
          </li>
          <li>
            <strong className="text-white">Screen Sharing (If Requested):</strong> If you're asked to share your screen via Zoom, Meet, or the platform itself, they can see what you choose to share.
          </li>
        </ul>
        <Paragraph className="italic text-gray-400">
          They might also try to guess based on typing speed, but it's often unreliable.
        </Paragraph>

        <SectionTitle>What They *Cannot* See (Outside the Bubble)</SectionTitle>
        <Paragraph>
          Crucially, because of the browser sandbox and how operating systems work, these platforms **cannot** reliably:
        </Paragraph>
        <ul className="list-disc pl-6 space-y-2 text-lg md:text-xl text-gray-300 mb-8">
          <li><strong className="text-white">Know *What* App You Switched To:</strong> When you lose focus (the 'blur' event), the browser gives no information about which other application became active.</li>
          <li><strong className="text-white">Scan Running Apps:</strong> There's no way for a website to get a list of other programs running on your computer. This is a fundamental OS security boundary.</li>
        </ul>

        <CodeBlock>
{`// This CANNOT be done from a webpage!
function getRunningApps() {
   // No browser API exists for this!
   return navigator.runningProcesses || []; 
}

if (getRunningApps().includes('SomeApp.exe')) {
   // Impossible check
}`}
        </CodeBlock>

        <ul className="list-disc pl-6 space-y-2 text-lg md:text-xl text-gray-300 mt-8 mb-8">
          <li><strong className="text-white">Read Other App Memory:</strong> Accessing the memory of other applications is strictly forbidden by your operating system for security reasons.</li>
          <li><strong className="text-white">Track Your Every Click/Keystroke Globally:</strong> They can only see clicks and keys typed *inside* their own browser tab, not system-wide.</li>
          <li><strong className="text-white">See Invisible Native Apps During Screen Share:</strong> While screen sharing shows your desktop, applications designed to be hidden (like Co-Interview) won't appear in the shared view or screenshots.</li>
        </ul>

        <CannotSeeDiagram />

        <SectionTitle>Why Co-Interview is Different & How It Counters Detection</SectionTitle>
        <Paragraph>
          Co-Interview isn't a browser extension; it's a separate **native desktop app**. This fundamental difference is key to avoiding detection:
        </Paragraph>
        <ul className="list-disc pl-6 space-y-4 text-lg md:text-xl text-gray-300 mb-8">
          <li><strong className="text-white">It Lives Outside the Bubble:</strong> The browser running the interview has no connection to Co-Interview and simply cannot see it or interact with it. It doesn't need to read browser memory because it operates independently with its own data.</li>
          <li><strong className="text-white">Invisible to Screen Sharing:</strong> The app utilizes specific operating system APIs and window properties that signal the OS window to be excluded from screen captures, recordings, and screen sharing sessions (like Zoom, Meet). This is a standard OS feature used by various overlay or privacy-focused applications, not a browser hack.</li>
          <li><strong className="text-white">No Focus / Active Tab Change & Global Hotkeys:</strong> When you toggle Co-Interview's visibility (using ⌘+B), it uses standard OS-level global hotkey registration. This is completely separate from the browser's event system. Your mouse cursor focus "stays" in the browser, and the active browser tab *does not change*, bypassing platform checks for these specific actions.</li>
          <li><strong className="text-white">Webcam / Eye Tracking Counter:</strong> You can use keyboard shortcuts (⌘ + Arrow Keys) to move the Co-Interview window directly over the assessment's coding area. This allows you to view solutions while appearing to look directly at the screen where the code editor is.</li>
          <li><strong className="text-white">Reasoning Support:</strong> To help you explain your thought process (a common interview check), Co-Interview provides not just code, but also line-by-line comments and high-level reasoning hints, making it easier to articulate the solution naturally.</li>
          <li><strong className="text-white">Uses Standard OS Features:</strong> Beyond the specific examples above, it generally works using normal, legitimate operating system functions, leaving no unusual footprint that typical browser-based monitoring could detect.</li>
        </ul>
        <Paragraph>
          So, while platforms *can* detect simple events like pasting or clicking away from a tab, Co-Interview is architected to sidestep these checks and remain invisible to the monitoring methods available within a browser sandbox or standard screen share.
        </Paragraph>

        <SectionTitle>What About Desktop Proctoring Apps?</SectionTitle>
        <Paragraph>
          You might wonder: couldn't they just make you install a separate desktop app to monitor everything? In theory, yes. But reputable platforms avoid this because:
        </Paragraph>
        <ul className="list-disc pl-6 space-y-2 text-lg md:text-xl text-gray-300 mb-8">
          <li>It's a huge **security risk** (potential spyware).</li>
          <li>It raises major **privacy concerns**.</li>
          <li>It would destroy **user trust**.</li>
        </ul>
        <Paragraph>
          That's why almost all coding interviews stick to the safety of the browser sandbox.
        </Paragraph>

        <SectionTitle>The Bottom Line</SectionTitle>
        <Paragraph>
          Because coding interviews run in secure browser tabs, and Co-Interview runs as a completely separate native application, standard detection methods simply can't see it. We designed it specifically with browser security limitations in mind.
        </Paragraph>
        <Paragraph>
          Until the day that companies require you to download and install a separate desktop app, or migrate completely to in-person interviews, Co-Interview will work.
        </Paragraph>

        <WebEnvDiagram />

        <div className="border-t border-zinc-800 my-16 pt-16">
          <header className="mb-12 text-center flex flex-col items-center">
             <div 
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold relative bg-yellow-500/10 text-yellow-500 hover:opacity-90 transition-all border border-yellow-500/40 mb-4 cursor-pointer"
              style={{
                textShadow: '0 0 10px hsla(60, 100%, 50%, 0.5)',
                boxShadow: '0 0 20px hsla(60, 100%, 50%, 0.3)'
              }}
            >
              Update
            </div>
          </header>

          <SectionTitle>Co-Interview 2.0: What's New?</SectionTitle>
          <Paragraph>
            Co-Interview 2.0 is a complete rewrite from the ground up, focusing on undetectability, performance, and user experience, building even more on the strong undetectability it had in 1.0. Here's a quick overview of the key improvements:
          </Paragraph>
          <ul className="list-disc pl-6 space-y-4 text-lg md:text-xl text-gray-300 mb-8">
            <li><strong className="text-white">Undetectable by Design:</strong> Built as a native desktop app that leverages OS-level features to remain invisible during screen sharing and avoid detection by browser-based monitoring.</li>
            <li><strong className="text-white">Invisible to Task Manager:</strong> Runs in a way that it doesn't show up in system task managers or process lists, adding an extra layer of discretion.</li>
            <li><strong className="text-white">Audio Support:</strong> New audio support to keep help better guide you through any problem ranging from follow ups to system design.</li>
            <li><strong className="text-white">Improved Performance:</strong> Optimized for speed and responsiveness, allowing you to quickly access solutions without any lag.</li>
            <li><strong className="text-white">User-Friendly Interface:</strong> A sleek, modern UI that makes it easy to find and use the features you need during an interview.</li>
          </ul>
          <Paragraph>
            We're excited about these improvements and believe they make Co-Interview the best tool for coding interviews yet. If you haven't tried it yet, download the app and see for yourself!
          </Paragraph>

          <SectionTitle>How Audio Works</SectionTitle>
          <div className="my-10 rounded-lg overflow-hidden border border-white/10 bg-[#1C1C1C]">
            <div className="p-4 grid grid-cols-2 gap-4 text-white">
              <div className="bg-[#2a2a2a] p-4 rounded h-32 flex flex-col justify-between">
                  <span className="text-xs text-gray-400">English - detected</span>
                  <p className="font-serif text-lg">How would you design a file-sharing system?</p>
                  <div className="flex gap-2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </div>
              </div>
              <div className="bg-[#2a2a2a] p-4 rounded h-32 flex flex-col justify-between">
                  <span className="text-xs text-gray-400">English</span>
                  <p className="font-serif text-lg">How would you design a file-sharing system?</p>
                  <div className="flex gap-2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  </div>
              </div>
            </div>
          </div>
          
          <Paragraph>
            Co-Interview 2.0 introduces audio support to help you better understand and articulate solutions during your coding interviews. Here's how it works:
          </Paragraph>
          <ul className="list-disc pl-6 space-y-2 text-lg md:text-xl text-gray-300 mb-8">
            <li><strong className="text-white">Instant Explanations:</strong> The app can provide explanations of code snippets and algorithms, helping you grasp concepts and answer quickly and precisely.</li>
            <li><strong className="text-white">System Design:</strong> Get instant walkthroughs of system design questions to help structure your thoughts and responses.</li>
            <li><strong className="text-white">Follow-Up Questions:</strong> Receive guidance on common follow-up questions to prepare you for deeper discussions during the interview.</li>
          </ul>
          <Paragraph>
            The audio feature is designed to complement the existing text-based solutions, providing a more holistic approach to interview preparation and execution. It works by taking your system audio and routing it through the app, allowing you to get explanations in real-time without needing to switch contexts.
          </Paragraph>

          <AudioFlowDiagram />

          <SectionTitle>Invisible to Task Manager</SectionTitle>
          
          <div className="my-10 rounded-lg overflow-hidden border border-white/10 relative">
            <div className="bg-[#e5e5e5] p-2 flex items-center gap-2 border-b border-gray-300">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-xs font-semibold text-gray-600">Activity Monitor</div>
            </div>
            <div className="bg-white h-48 overflow-hidden text-xs text-gray-700 font-mono p-2">
                <div className="grid grid-cols-4 gap-4 font-bold border-b pb-1 mb-1 text-gray-400">
                    <span>Process Name</span>
                    <span>% CPU</span>
                    <span>Memory</span>
                    <span>User</span>
                </div>
                {[
                    ['Google Chrome', '12.4', '1.2 GB', 'User'],
                    ['WindowServer', '8.2', '450 MB', '_windowserver'],
                    ['kernel_task', '5.1', '2.1 GB', 'root'],
                    ['Code', '2.3', '800 MB', 'User'],
                    ['Slack', '1.1', '500 MB', 'User'],
                    ['Zoom', '10.5', '600 MB', 'User'],
                ].map((row, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 py-1 border-b border-gray-100">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span>{row[2]}</span>
                        <span>{row[3]}</span>
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
          </div>

          <Paragraph>
            Co-Interview 2.0 is designed to run in a way that it doesn't appear in your system's task manager or process list. This means that even if someone checks the running applications on your computer, they won't see Co-Interview listed there.
          </Paragraph>
          <Paragraph>
            This is achieved through advanced techniques that leverage operating system features to hide the application's presence and change it's name. By not showing up in task managers, Co-Interview adds an extra layer of discretion, ensuring that you can use it without worry about being detected.
          </Paragraph>

          <TaskManagerDiagram />
        </div>

        <div className="mt-16 pt-12 border-t border-zinc-800 text-center">
          <p className="text-sm text-gray-400 mb-8">
            Written by <span className="text-yellow-400 hover:text-yellow-300 underline cursor-pointer">Roy Lee</span>.
          </p>
          
          <h3 className="text-lg font-medium text-white mb-6">Ready to try Co-Interview?</h3>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-scale">
              <button className="flex items-center justify-center gap-2 bg-[#FACC15] hover:bg-yellow-400 text-black px-6 py-2.5 rounded-lg font-medium transition-colors min-w-[160px]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.07-3.11-1.06.05-2.36.71-3.13 1.61-.65.77-1.22 2-1.07 3.07 1.18.09 2.4-.64 3.13-1.57"/></svg>
                  Get For Mac
              </button>
              <button className="flex items-center justify-center gap-2 bg-zinc-900/90 border border-yellow-500/50 text-yellow-500 px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors min-w-[160px]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.47L10.37 4.5V11.6H3V5.47ZM11.63 4.33L21 3V11.6H11.63V4.33ZM21 21L11.63 19.67V12.4H21V21ZM10.37 19.5L3 18.53V12.4H10.37V19.5Z"/></svg>
                  Get for Windows
              </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Article;