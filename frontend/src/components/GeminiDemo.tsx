import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, RefreshCw, AlertCircle, Code, Terminal } from 'lucide-react';
import Button from './ui/Button';
import { DemoState } from '../types';

const GeminiDemo: React.FC = () => {
    const [prompt, setPrompt] = useState('Write a function to reverse a linked list.');
    const [response, setResponse] = useState<string | null>(null);
    const [state, setState] = useState<DemoState>(DemoState.IDLE);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        // Check for API key (in a real app, this would be handled differently, 
        // but per prompt instructions we check process.env.API_KEY)
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            setError("No API Key detected. This is a frontend demo. In a real environment, the API key would be securely loaded.");
            setState(DemoState.ERROR);
            // Fallback for visual demo purposes if no key
            setTimeout(() => {
                setResponse(`// Simulated AI Response (No API Key)
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}
// Time Complexity: O(n)
// Space Complexity: O(1)`);
                setState(DemoState.SUCCESS);
                setError(null);
            }, 1500);
            setState(DemoState.LOADING);
            return;
        }

        try {
            setState(DemoState.LOADING);
            setError(null);

            const ai = new GoogleGenAI({ apiKey });
            const result = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Provide a concise code solution in Java for the following interview problem: ${prompt}. Include time/space complexity comments.`,
            });

            setResponse(result.text || "No response generated.");
            setState(DemoState.SUCCESS);
        } catch (err: any) {
            console.error("Gemini API Error:", err);
            setError("Failed to connect to AI. Please try again later.");
            setState(DemoState.ERROR);
        }
    };

    return (
        <section className="py-32 bg-black relative overflow-hidden border-t border-white/5">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#EFCC3A]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 bg-[#EFCC3A]/10 border border-[#EFCC3A]/20 rounded-full px-4 py-1.5 mb-6">
                        <Sparkles className="w-4 h-4 text-[#EFCC3A]" />
                        <span className="text-sm font-bold text-[#EFCC3A]">Powered by Gemini 2.0 Flash</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Try the magic
                    </h2>
                    <p className="text-gray-400 font-light">
                        Experience the speed and accuracy of our AI engine right here.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#111] rounded-3xl border border-white/10 p-2 md:p-8 backdrop-blur-sm shadow-2xl">

                    {/* Input Area */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-sm font-medium text-gray-300 flex items-center">
                            <Terminal className="w-4 h-4 mr-2 text-[#EFCC3A]" />
                            Problem Statement
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#EFCC3A]/50 focus:border-[#EFCC3A]/50 resize-none min-h-[300px] font-mono text-sm placeholder-gray-700"
                            placeholder="e.g. Find the longest substring without repeating characters..."
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={state === DemoState.LOADING}
                            className="w-full"
                        >
                            {state === DemoState.LOADING ? (
                                <span className="flex items-center justify-center">
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Thinking...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <Send className="w-4 h-4 mr-2" />
                                    Generate Solution
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Output Area */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-sm font-medium text-gray-300 flex items-center">
                            <Code className="w-4 h-4 mr-2 text-[#EFCC3A]" />
                            Solution
                        </label>
                        <div className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 overflow-hidden relative min-h-[300px]">
                            {state === DemoState.ERROR && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center">
                                    <AlertCircle className="w-8 h-8 mb-2" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {state === DemoState.IDLE && !response && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
                                    <Code className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm font-mono">Waiting for input...</p>
                                </div>
                            )}

                            {(state === DemoState.SUCCESS || state === DemoState.LOADING) && (
                                <pre className={`font-mono text-xs md:text-sm text-gray-300 whitespace-pre-wrap ${state === DemoState.LOADING ? 'opacity-50 blur-sm' : 'opacity-100'} h-full overflow-y-auto custom-scrollbar`}>
                                    {response || "Thinking..."}
                                </pre>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default GeminiDemo;
