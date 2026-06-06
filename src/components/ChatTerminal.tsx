'use client'

import { useChat } from '@ai-sdk/react'
import { Sparkles, Send, Loader2, ChevronRight, Cpu, Zap, Brain, User, Mic, MicOff } from 'lucide-react'
import { useRef, useEffect, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

// ─── Strip DeepSeek R1 <think> reasoning blocks ──────────────────────────────
function stripThinkTags(text: string): string {
  // Remove complete <think>...</think> blocks
  let result = text.replace(/<think>[\s\S]*?<\/think>/gi, '')
  // If a <think> block is still open (streaming), hide everything from <think> onward
  const openIdx = result.indexOf('<think>')
  if (openIdx !== -1) result = result.slice(0, openIdx)
  return result.trim()
}

// ─── Direct Text Renderer ─────────────────────────────────────────────────────
function StreamText({ text }: { text: string }) {
  const clean = stripThinkTags(text)
  return (
    <div className="md-body">
      <ReactMarkdown>{clean}</ReactMarkdown>
    </div>
  )
}

// ─── Interactive UI Components ────────────────────────────────────────────────
function CourtSenseDemo() {
  return (
    <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,240,255,0.3)', background: '#000' }}>
      <div style={{ padding: '8px 12px', background: 'rgba(0,240,255,0.1)', fontSize: '0.8rem', color: '#00f0ff', display: 'flex', justifyContent: 'space-between' }}>
        <span>COURTSENSE AI // 3D INTERACTIVE DEMO</span>
        <span>LIVE</span>
      </div>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe 
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; encrypted-media"
          title="CourtSense Demo"
        />
      </div>
      <div style={{ padding: 12, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
        Rendered via AI Tool Call • Full 3D Physics & Homography engine active.
      </div>
    </div>
  )
}


// ─── Quick Prompt Chips ──────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: '⚔️', label: 'Flagship Research', prompt: 'Tell me about his adversarial attack research on SegFormer. What were the exact results?' },
  { icon: '🧠', label: 'PaliGemma VLM', prompt: 'Explain his PaliGemma multimodal implementation. What technical breakthroughs did he achieve?' },
  { icon: '🏆', label: 'Competitions', prompt: 'What are his competition rankings and global standings?' },
  { icon: '💼', label: 'Why Hire Him?', prompt: 'Give me a strong case for why Uday Raj is exceptional for an AI research or engineering role.' },
  { icon: '📚', label: 'All Projects', prompt: 'List all his GitHub projects with technical details.' },
  { icon: '🎯', label: 'Skills & Stack', prompt: 'What is his complete technical skill set and ML stack?' },
]

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ChatTerminal() {
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const isVoiceModeRef = useRef(false)
  const [isListening, setIsListening] = useState(false)
  
  // Voice Synthesis (Text-to-Speech)
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel() // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1.0
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0]
    if (preferredVoice) utterance.voice = preferredVoice
    window.speechSynthesis.speak(utterance)
  }, [])

  const { messages, sendMessage, status, error } = useChat({
    onError: (e) => console.error('[APEX]', e),
    onFinish: (event: any) => {
      if (isVoiceModeRef.current && event.message?.content) {
        speak(stripThinkTags(event.message.content))
      }
    }
  })
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'
  const hasMessages = messages.length > 0

  // Keep ref in sync for useChat callback
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode
    if (!isVoiceMode) {
      window.speechSynthesis?.cancel()
      setIsListening(false)
    }
  }, [isVoiceMode])

  // Voice Recognition (Speech-to-Text)
  const toggleListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser.')
      return
    }
    
    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setIsVoiceMode(true)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalStr = event.results[i][0].transcript
          setInput(finalStr)
          // Auto-send when done talking
          sendMessage({ text: finalStr })
          setInput('')
        } else {
          interimTranscript += event.results[i][0].transcript
          setInput(interimTranscript)
        }
      }
    }

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [isListening, sendMessage])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  const handleSend = useCallback((content: string) => {
    if (!content.trim() || isLoading) return
    sendMessage({ text: content })
    setInput('')
    // If manually typing, disable voice output
    if (isVoiceMode) setIsVoiceMode(false)
  }, [isLoading, sendMessage, isVoiceMode])

  const getText = (m: any) =>
    m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') || m.content || ''

  return (
    <>
      <style>{`
        .apex-terminal {
          width: min(900px, 96vw);
          height: min(88vh, 860px);
          display: flex;
          flex-direction: column;
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(160deg, rgba(4,8,20,0.97) 0%, rgba(2,4,14,0.99) 100%);
          border: 1px solid rgba(0,240,255,0.12);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 40px 120px rgba(0,0,0,0.9),
            0 0 80px rgba(0,240,255,0.04),
            inset 0 1px 0 rgba(0,240,255,0.08);
          pointer-events: auto;
        }

        /* Corner Brackets */
        .apex-terminal::before, .apex-terminal::after,
        .corner-br, .corner-bl {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          z-index: 10;
          pointer-events: none;
        }
        .apex-terminal::before { top: 14px; left: 14px; border-top: 1.5px solid rgba(0,240,255,0.5); border-left: 1.5px solid rgba(0,240,255,0.5); border-radius: 4px 0 0 0; }
        .apex-terminal::after  { top: 14px; right: 14px; border-top: 1.5px solid rgba(0,240,255,0.5); border-right: 1.5px solid rgba(0,240,255,0.5); border-radius: 0 4px 0 0; }
        .corner-br { bottom: 14px; right: 14px; border-bottom: 1.5px solid rgba(0,240,255,0.5); border-right: 1.5px solid rgba(0,240,255,0.5); border-radius: 0 0 4px 0; }
        .corner-bl { bottom: 14px; left: 14px; border-bottom: 1.5px solid rgba(0,240,255,0.5); border-left: 1.5px solid rgba(0,240,255,0.5); border-radius: 0 0 0 4px; }

        /* Scanline */
        .apex-scan {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, rgba(0,240,255,0.015) 0px, transparent 1px, transparent 3px);
          pointer-events: none;
          z-index: 1;
        }

        /* Header */
        .apex-header {
          padding: 10px 24px;
          background: rgba(0,240,255,0.04);
          border-bottom: 1px solid rgba(0,240,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 3;
          flex-shrink: 0;
        }
        .apex-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.65rem;
          letter-spacing: 2px;
          color: rgba(0,240,255,0.45);
          font-family: 'Courier New', monospace;
        }
        .apex-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 8px #00f0ff;
          animation: blink 2.4s ease-in-out infinite;
        }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        /* Title bar */
        .apex-title-bar {
          padding: 16px 28px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 3;
          flex-shrink: 0;
        }
        .apex-avatar {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,80,255,0.15));
          border: 1px solid rgba(0,240,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0,240,255,0.1);
          flex-shrink: 0;
        }
        .apex-title { font-size: 1.05rem; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
        .apex-subtitle { font-size: 0.7rem; color: rgba(0,240,255,0.5); letter-spacing: 1.5px; margin-top: 2px; }

        /* Messages area */
        .apex-messages {
          flex: 1;
          overflow-y: auto;
          padding: 28px 28px 12px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          z-index: 2;
          scroll-behavior: smooth;
        }
        .apex-messages::-webkit-scrollbar { width: 4px; }
        .apex-messages::-webkit-scrollbar-track { background: transparent; }
        .apex-messages::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); border-radius: 2px; }
        .apex-messages::-webkit-scrollbar-thumb:hover { background: rgba(0,240,255,0.4); }

        /* Message bubbles */
        .msg-row { display: flex; gap: 12px; align-items: flex-start; animation: msgIn 0.3s ease; }
        .msg-row.user { flex-direction: row-reverse; }
        @keyframes msgIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }

        .msg-icon {
          width: 36px; height: 36px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .msg-icon.ai { background: rgba(0,240,255,0.12); }
        .msg-icon.user-ic { background: rgba(255,255,255,0.06); }

        .msg-bubble {
          max-width: 78%;
          padding: 14px 18px;
          border-radius: 20px;
          font-size: 0.95rem;
          line-height: 1.65;
        }
        .msg-bubble.ai {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.9);
          border-radius: 4px 20px 20px 20px;
        }
        .msg-bubble.user {
          background: linear-gradient(135deg, #00d4ff, #0066ff);
          color: #000;
          font-weight: 500;
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 8px 24px rgba(0,102,255,0.3);
        }

        /* Markdown in AI messages */
        .md-body p { margin: 0 0 10px; }
        .md-body p:last-child { margin-bottom: 0; }
        .md-body strong { color: #00f0ff; font-weight: 600; }
        .md-body em { color: rgba(0,240,255,0.7); font-style: italic; }
        .md-body ul, .md-body ol { margin: 8px 0; padding-left: 20px; }
        .md-body li { margin-bottom: 4px; }
        .md-body code {
          background: rgba(0,240,255,0.1);
          color: #00f0ff;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
        }
        .md-body pre {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(0,240,255,0.15);
          border-radius: 8px;
          padding: 12px;
          overflow-x: auto;
          margin: 10px 0;
        }
        .md-body h1, .md-body h2, .md-body h3 {
          color: #00f0ff;
          margin: 14px 0 8px;
          letter-spacing: 0.5px;
        }
        .md-body blockquote {
          border-left: 3px solid rgba(0,240,255,0.4);
          padding-left: 12px;
          color: rgba(255,255,255,0.6);
          margin: 8px 0;
        }

        /* Thinking indicator */
        .apex-thinking {
          display: flex; align-items: center; gap: 10px;
          padding: 0 4px;
          color: rgba(0,240,255,0.45);
          font-size: 0.78rem;
          letter-spacing: 2px;
        }
        .think-dots { display:flex; gap: 5px; }
        .think-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(0,240,255,0.5);
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        .think-dot:nth-child(2) { animation-delay: 0.2s; }
        .think-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotPulse { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:1; transform:scale(1.3); } }

        /* Welcome screen */
        .apex-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          text-align: center;
          padding: 20px 24px 0;
          z-index: 2;
        }
        .apex-welcome-icon {
          width: 72px; height: 72px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,60,255,0.08));
          border: 1px solid rgba(0,240,255,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 0 40px rgba(0,240,255,0.08), inset 0 1px 0 rgba(0,240,255,0.1);
        }
        .apex-welcome h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 10px;
          letter-spacing: -0.5px;
        }
        .apex-welcome p {
          color: rgba(255,255,255,0.45);
          font-size: 0.95rem;
          max-width: 480px;
          line-height: 1.7;
          margin: 0 0 28px;
        }
        .apex-welcome span { color: rgba(0,240,255,0.7); }

        /* Quick prompt chips */
        .apex-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          max-width: 700px;
        }
        .apex-chip {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.75);
          padding: 9px 16px;
          border-radius: 20px;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          align-items: center;
          gap: 7px;
          letter-spacing: 0.3px;
          pointer-events: auto;
        }
        .apex-chip:hover {
          background: rgba(0,240,255,0.08);
          border-color: rgba(0,240,255,0.35);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        /* Input area */
        .apex-input-area {
          padding: 16px 22px 22px;
          background: rgba(0,0,0,0.25);
          border-top: 1px solid rgba(255,255,255,0.04);
          z-index: 3;
          flex-shrink: 0;
        }
        .apex-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 6px 6px 6px 18px;
          transition: all 0.25s ease;
        }
        .apex-input-wrap.focused {
          border-color: rgba(0,240,255,0.35);
          background: rgba(0,240,255,0.04);
          box-shadow: 0 0 0 3px rgba(0,240,255,0.06);
        }
        .apex-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          padding: 8px 0;
          caret-color: #00f0ff;
        }
        .apex-input::placeholder { color: rgba(255,255,255,0.22); }
        .apex-send {
          width: 42px; height: 42px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .apex-send.active {
          background: linear-gradient(135deg, #00d4ff, #0066ff);
          box-shadow: 0 4px 16px rgba(0,102,255,0.4);
        }
        .apex-send.active:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,102,255,0.5); }
        .apex-send.inactive { background: rgba(255,255,255,0.05); cursor: not-allowed; }
        .apex-hint {
          text-align: center;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.18);
          margin-top: 10px;
          letter-spacing: 0.5px;
        }
        .apex-hint span { color: rgba(0,240,255,0.3); }
      `}</style>

      <div className="apex-terminal">
        <div className="corner-br" />
        <div className="corner-bl" />
        <div className="apex-scan" />

        {/* Status Header */}
        <div className="apex-header">
          <div className="apex-header-left">
            <div className="apex-status-dot" />
            <span>APEX AI · ACTIVE</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Cpu size={10} /> GROQ · LLAMA-3.3-70B
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap size={10} /> LIVE GITHUB SYNC
            </span>
          </div>
          <Sparkles size={14} color="rgba(0,240,255,0.5)" />
        </div>

        {/* Title */}
        <div className="apex-title-bar">
          <div className="apex-avatar">
            <Brain size={22} color="#00f0ff" />
          </div>
          <div>
            <div className="apex-title">UDAY RAJ <span style={{ color: 'rgba(0,240,255,0.4)', fontWeight: 300 }}>/ AI PORTFOLIO</span></div>
            <div className="apex-subtitle">TRAINED ON RESUME · GITHUB · RESEARCH</div>
          </div>
        </div>

        {/* Content: Welcome or Messages */}
        {!hasMessages ? (
          <div className="apex-welcome">
            <div className="apex-welcome-icon">
              <Brain size={36} color="#00f0ff" />
            </div>
            <h1>Hi, I'm <span style={{ color: '#00f0ff' }}>APEX</span></h1>
            <p>
              Uday's AI — trained exhaustively on his <span>resume</span>, <span>GitHub repos</span>, and <span>research papers</span>.
              Ask me literally anything about his projects, skills, or background.
            </p>
            <div className="apex-chips">
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} className="apex-chip" onClick={() => handleSend(q.prompt)}>
                  <span>{q.icon}</span> {q.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="apex-messages" ref={scrollRef}>
            {messages.map((m, i) => {
              const text = getText(m)
              const isLatestStreaming = i === messages.length - 1 && status === 'streaming'
              return (
                <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
                  <div className={`msg-icon ${m.role === 'user' ? 'user-ic' : 'ai'}`}>
                    {m.role === 'user'
                      ? <User size={18} color="rgba(255,255,255,0.6)" />
                      : <Brain size={18} color="#00f0ff" />
                    }
                  </div>
                  <div className={`msg-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
                    {m.role === 'user'
                      ? text
                      : <StreamText text={text} />
                    }
                    {/* Render tool invocations */}
                    {m.toolInvocations?.map((toolInvocation: any) => {
                      if (toolInvocation.toolName === 'show_courtsense_demo' && 'result' in toolInvocation) {
                        return <CourtSenseDemo key={toolInvocation.toolCallId} />
                      }
                      if (toolInvocation.toolName === 'show_courtsense_demo' && !('result' in toolInvocation)) {
                        return <div key={toolInvocation.toolCallId} className="apex-thinking" style={{marginTop: 10}}><Loader2 size={14} className="animate-spin"/> Launching 3D Demo...</div>
                      }
                      return null
                    })}
                  </div>
                </div>
              )
            })}
            {status === 'submitted' && (
              <div className="msg-row">
                <div className="msg-icon ai"><Brain size={18} color="#00f0ff" /></div>
                <div className="apex-thinking">
                  <div className="think-dots">
                    <div className="think-dot" />
                    <div className="think-dot" />
                    <div className="think-dot" />
                  </div>
                  THINKING
                </div>
              </div>
            )}
            {error && (
              <div className="msg-row">
                <div className="msg-icon ai"><Brain size={18} color="#ff4444" /></div>
                <div className="msg-bubble ai" style={{ borderColor: 'rgba(255,60,60,0.3)', color: '#ff8888' }}>
                  ⚠ APEX encountered an error. Please try again in a moment.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="apex-input-area">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input) }}
          >
            <div className={`apex-input-wrap ${isFocused ? 'focused' : ''}`}>
              <ChevronRight size={16} color="rgba(0,240,255,0.4)" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                className="apex-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask anything about Uday..."
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`apex-send ${isListening ? 'listening' : isVoiceMode ? 'voice-active' : 'inactive'}`}
                title="Voice Mode"
              >
                {isListening ? <Loader2 size={18} color="#ff4444" style={{ animation: 'spin 1s linear infinite' }} /> : 
                 isVoiceMode ? <Mic size={18} color="#00f0ff" /> : <MicOff size={18} color="rgba(255,255,255,0.3)" />}
              </button>
              <button
                type="submit"
                className={`apex-send ${input.trim() && !isLoading ? 'active' : 'inactive'}`}
                disabled={!input.trim() || isLoading}
              >
                {isLoading
                  ? <Loader2 size={18} color="rgba(255,255,255,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={18} color={input.trim() ? '#000' : 'rgba(255,255,255,0.3)'} />
                }
              </button>
            </div>
          </form>
          <p className="apex-hint">
            Powered by <span>Groq · LLaMA 3.3 70B</span> · {isVoiceMode ? <span style={{color: '#00f0ff'}}>Voice Mode Active</span> : "Trained on Uday's complete profile"}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
