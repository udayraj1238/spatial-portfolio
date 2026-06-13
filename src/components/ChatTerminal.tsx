/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useChat } from '@ai-sdk/react'
import {
  Send,
  Loader2,
  Mic,
  MicOff,
  Minimize2,
  Maximize2,
  GitFork,
  Link2,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react'
import { useRef, useEffect, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

// ─── Strip DeepSeek R1 <think> reasoning blocks ──────────────────────────────
function stripThinkTags(text: string): string {
  let result = text.replace(/<think>[\s\S]*?<\/think>/gi, '')
  const openIdx = result.indexOf('<think>')
  if (openIdx !== -1) result = result.slice(0, openIdx)
  return result.trim()
}

// ─── Direct Text Renderer ─────────────────────────────────────────────────────
function StreamText({ text }: { text: string }) {
  const clean = stripThinkTags(text)
  return (
    <div className="md">
      <ReactMarkdown>{clean}</ReactMarkdown>
    </div>
  )
}

// ─── CourtSense Interactive Demo ──────────────────────────────────────────────
function CourtSenseDemo() {
  return (
    <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,240,255,0.3)', background: '#000' }}>
      <div style={{ padding: '8px 12px', background: 'rgba(0,240,255,0.1)', fontSize: '0.8rem', color: '#00f0ff', display: 'flex', justifyContent: 'space-between' }}>
        <span>COURTSENSE AI // 3D INTERACTIVE DEMO</span>
        <span>LIVE</span>
      </div>
      <div style={{ position: 'relative', height: '200px', background: '#001a1a', overflow: 'hidden' }}>
        {/* Tennis Court Lines */}
        <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '20%', right: '20%', border: '2px solid rgba(0, 240, 255, 0.2)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '20%', right: '20%', borderTop: '2px solid rgba(0, 240, 255, 0.2)' }} />
        <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '50%', borderLeft: '2px solid rgba(0, 240, 255, 0.2)' }} />

        {/* Animated Ball & Bounding Box */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes trackBall {
            0% { transform: translate(0px, 0px); }
            25% { transform: translate(100px, -50px); }
            50% { transform: translate(200px, 20px); }
            75% { transform: translate(100px, 80px); }
            100% { transform: translate(0px, 0px); }
          }
          .cv-target { animation: trackBall 3s infinite linear; }
          @keyframes p2Move {
            0% { transform: translate(0px, 0px); }
            25% { transform: translate(-30px, -15px); }
            50% { transform: translate(-60px, 10px); }
            75% { transform: translate(-30px, 25px); }
            100% { transform: translate(0px, 0px); }
          }
          .cv-p2 { animation: p2Move 4s infinite ease-in-out; }
        `}} />
        <div className="cv-target" style={{ position: 'absolute', top: '80px', left: '100px', width: '20px', height: '20px' }}>
           <div style={{ width: '10px', height: '10px', background: '#e1ff00', borderRadius: '50%', margin: '5px', boxShadow: '0 0 10px #e1ff00' }} />
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid #00f0ff', boxShadow: '0 0 8px rgba(0,240,255,0.5) inset' }}>
             <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#00f0ff', color: '#000', fontSize: '8px', padding: '1px 4px', fontWeight: 'bold' }}>ball 0.98</span>
           </div>
        </div>

        {/* Player 1 Bounding Box (top-left area) */}
        <div style={{ position: 'absolute', top: '25px', left: '28%', width: '28px', height: '50px', border: '1px solid #00ff88', boxShadow: '0 0 6px rgba(0,255,136,0.4) inset' }}>
          <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#00ff88', color: '#000', fontSize: '8px', padding: '1px 4px', fontWeight: 'bold' }}>P1 0.96</span>
        </div>

        {/* Player 2 Bounding Box (bottom-right area) */}
        <div className="cv-p2" style={{ position: 'absolute', bottom: '22px', right: '25%', width: '28px', height: '50px', border: '1px solid #ff8800', boxShadow: '0 0 6px rgba(255,136,0,0.4) inset' }}>
          <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#ff8800', color: '#000', fontSize: '8px', padding: '1px 4px', fontWeight: 'bold' }}>P2 0.94</span>
        </div>

        {/* FPS Counter */}
        <div style={{ position: 'absolute', top: 8, right: 10, fontSize: '0.7rem', color: '#00f0ff', fontFamily: "'Courier New', monospace", background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>
          32 FPS · TensorRT · Jetson
        </div>

        {/* Scanning Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,240,255,0) 0%, rgba(0,240,255,0.1) 50%, rgba(0,240,255,0) 100%)', animation: 'scan 2s infinite linear' }} />
      </div>
      <div style={{ padding: 12, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(0,240,255,0.2)' }}>
        YOLOv8-Pose + SegFormer-B2 + Kalman Filter · FastAPI backend · Three.js frontend
      </div>
    </div>
  )
}

// ─── Quick Prompt Chips ──────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: '⚔️', label: 'Nuclear Attack', prompt: 'Explain the Nuclear Attack on SegFormer Stage 4. What exactly happened to accuracy?' },
  { icon: '🧠', label: 'PaliGemma VLM', prompt: 'Walk me through the PaliGemma implementation — SigLIP encoder, cross-modal projector, Gemma-2B decoder.' },
  { icon: '🏆', label: 'Global Rankings', prompt: 'What are his competition rankings and global standings?' },
  { icon: '💼', label: 'Why Hire?', prompt: 'Make the strongest possible case for hiring Uday Raj for an ML research role.' },
  { icon: '🤖', label: 'CourtSense Demo', prompt: 'Show me the CourtSense AI demo and explain the full CV pipeline.' },
  { icon: '📚', label: 'All Projects', prompt: 'List all 6 GitHub projects with full technical details.' },
]

// ─── Social Links ────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  { href: 'https://github.com/udayraj1238', icon: GitFork, label: 'GitHub' },
  { href: 'https://linkedin.com/in/uday6002', icon: Link2, label: 'LinkedIn' },
  { href: 'mailto:rajuday6002@gmail.com', icon: Mail, label: 'Email' },
  { href: 'https://udayraj1238.vercel.app', icon: ExternalLink, label: 'Portfolio' },
]

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ChatTerminal() {
  const [minimized, setMinimized] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const isVoiceModeRef = useRef(false)
  const [isListening, setIsListening] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // Voice Synthesis (Text-to-Speech)
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1.0
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

  // Track scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const distFromBottom = scrollHeight - scrollTop - clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  const handleSend = useCallback((content: string) => {
    if (!content.trim() || isLoading) return
    sendMessage({ text: content })
    setInput('')
    if (isVoiceMode) setIsVoiceMode(false)
  }, [isLoading, sendMessage, isVoiceMode])

  const getText = (m: any) =>
    m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') || m.content || ''

  const getErrorMessage = (err: Error) => {
    const msg = err.message || ''
    if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
      return 'Rate limit reached — please wait a moment'
    }
    return 'APEX encountered an error. Please try again.'
  }

  return (
    <>
      <style>{`
        :root {
          --c: #00f0ff;
          --bg: rgba(3,6,18,0.97);
        }

        .apex-shell {
          width: min(920px, 96vw);
          height: min(90vh, 880px);
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
          transition: height 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .apex-shell.minimized {
          height: 58px !important;
        }

        /* Corner Brackets */
        .apex-shell::before, .apex-shell::after,
        .corner-br, .corner-bl {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          z-index: 10;
          pointer-events: none;
        }
        .apex-shell::before { top: 14px; left: 14px; border-top: 1.5px solid rgba(0,240,255,0.5); border-left: 1.5px solid rgba(0,240,255,0.5); border-radius: 4px 0 0 0; }
        .apex-shell::after  { top: 14px; right: 14px; border-top: 1.5px solid rgba(0,240,255,0.5); border-right: 1.5px solid rgba(0,240,255,0.5); border-radius: 0 4px 0 0; }
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

        /* Topbar */
        .apex-topbar {
          padding: 10px 24px;
          background: rgba(0,240,255,0.04);
          border-bottom: 1px solid rgba(0,240,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 3;
          flex-shrink: 0;
          min-height: 38px;
        }
        .apex-topbar-left {
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
          background: var(--c);
          box-shadow: 0 0 8px var(--c);
          animation: blink 2.4s ease-in-out infinite;
        }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .apex-minimize-btn {
          background: none;
          border: 1px solid rgba(0,240,255,0.15);
          border-radius: 8px;
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(0,240,255,0.5);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .apex-minimize-btn:hover {
          border-color: rgba(0,240,255,0.5);
          background: rgba(0,240,255,0.08);
          color: var(--c);
        }

        /* Identity Bar */
        .apex-identity {
          padding: 14px 28px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 3;
          flex-shrink: 0;
        }
        .apex-id-left {
          display: flex;
          align-items: center;
          gap: 14px;
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
          font-size: 1.3rem;
        }
        .apex-id-name { font-size: 1.05rem; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
        .apex-id-sub { font-size: 0.7rem; color: rgba(0,240,255,0.5); letter-spacing: 1.5px; margin-top: 2px; }
        .apex-id-right {
          display: flex;
          gap: 8px;
        }
        .apex-social-btn {
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.45);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .apex-social-btn:hover {
          border-color: rgba(0,240,255,0.4);
          background: rgba(0,240,255,0.08);
          color: var(--c);
          transform: translateY(-1px);
        }

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
          position: relative;
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
        .md p { margin: 0 0 10px; }
        .md p:last-child { margin-bottom: 0; }
        .md strong { color: var(--c); font-weight: 600; }
        .md em { color: rgba(0,240,255,0.7); font-style: italic; }
        .md ul, .md ol { margin: 8px 0; padding-left: 20px; }
        .md li { margin-bottom: 4px; }
        .md code {
          background: rgba(0,240,255,0.1);
          color: var(--c);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
        }
        .md pre {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(0,240,255,0.15);
          border-radius: 8px;
          padding: 12px;
          overflow-x: auto;
          margin: 10px 0;
        }
        .md h1, .md h2, .md h3 {
          color: var(--c);
          margin: 14px 0 8px;
          letter-spacing: 0.5px;
        }
        .md blockquote {
          border-left: 3px solid rgba(0,240,255,0.4);
          padding-left: 12px;
          color: rgba(255,255,255,0.6);
          margin: 8px 0;
        }
        .md table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 0.85em; }
        .md th { background: rgba(0,240,255,0.1); color: var(--c); padding: 6px 10px; text-align: left; }
        .md td { padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .md a { color: var(--c); text-decoration: underline; text-decoration-color: rgba(0,240,255,0.3); }

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
          font-size: 2rem;
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

        /* Scroll-to-bottom button */
        .apex-scroll-btn {
          position: sticky;
          bottom: 4px;
          align-self: center;
          background: var(--c);
          color: #000;
          border: none;
          border-radius: 20px;
          padding: 5px 14px 5px 10px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 5;
          box-shadow: 0 4px 16px rgba(0,240,255,0.4);
          animation: fadeInUp 0.25s ease;
        }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }

        /* Messages wrapper for relative positioning */
        .apex-messages-wrap {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 2;
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
          caret-color: var(--c);
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

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scan {
          0% { background-position: 0 -200px; }
          100% { background-position: 0 200px; }
        }
      `}</style>

      <div className={`apex-shell${minimized ? ' minimized' : ''}`}>
        <div className="corner-br" />
        <div className="corner-bl" />
        <div className="apex-scan" />

        {/* Topbar */}
        <div className="apex-topbar">
          <div className="apex-topbar-left">
            <div className="apex-status-dot" />
            <span>APEX AI · ACTIVE</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>EDGE RUNTIME</span>
          </div>
          <button
            className="apex-minimize-btn"
            onClick={() => setMinimized(prev => !prev)}
            title={minimized ? 'Maximize' : 'Minimize'}
          >
            {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>

        {/* Identity Bar */}
        <div className="apex-identity">
          <div className="apex-id-left">
            <div className="apex-avatar">🧠</div>
            <div>
              <div className="apex-id-name">UDAY RAJ <span style={{ color: 'rgba(0,240,255,0.4)', fontWeight: 300 }}>/ AI PORTFOLIO</span></div>
              <div className="apex-id-sub">TRAINED ON RESUME · GITHUB · RESEARCH</div>
            </div>
          </div>
          <div className="apex-id-right">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="apex-social-btn"
                title={link.label}
              >
                <link.icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Content: Welcome or Messages */}
        {!hasMessages ? (
          <div className="apex-welcome">
            <div className="apex-welcome-icon">🧠</div>
            <h1>Hi, I&apos;m <span style={{ color: '#00f0ff' }}>APEX</span></h1>
            <p>
              Uday&apos;s AI — trained exhaustively on his <span>resume</span>, <span>GitHub repos</span>, and <span>research papers</span>.
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
          <div className="apex-messages-wrap">
            <div className="apex-messages" ref={scrollRef} onScroll={handleScroll}>
              {messages.map((m, i) => {
                const text = getText(m)
                const hasDemoTrigger = text.includes('[COURTSENSE_DEMO_TRIGGER]')
                const displayText = hasDemoTrigger ? text.replace('[COURTSENSE_DEMO_TRIGGER]', '') : text
                return (
                  <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
                    <div className={`msg-icon ${m.role === 'user' ? 'user-ic' : 'ai'}`}>
                      {m.role === 'user'
                        ? <User size={18} color="rgba(255,255,255,0.6)" />
                        : <span style={{ fontSize: '1rem' }}>🧠</span>
                      }
                    </div>
                    <div className={`msg-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
                      {m.role === 'user'
                        ? displayText
                        : <StreamText text={displayText} />
                      }
                      {hasDemoTrigger && <CourtSenseDemo key={'demo-' + i} />}
                    </div>
                  </div>
                )
              })}
              {status === 'submitted' && (
                <div className="msg-row">
                  <div className="msg-icon ai"><span style={{ fontSize: '1rem' }}>🧠</span></div>
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
                  <div className="msg-icon ai" style={{ background: 'rgba(255,60,60,0.15)' }}>
                    <span style={{ fontSize: '1rem' }}>🧠</span>
                  </div>
                  <div className="msg-bubble ai" style={{ borderColor: 'rgba(255,60,60,0.3)', color: '#ff8888' }}>
                    ⚠ {getErrorMessage(error)}
                  </div>
                </div>
              )}
              {showScrollBtn && (
                <button className="apex-scroll-btn" onClick={scrollToBottom}>
                  <ChevronDown size={14} /> SCROLL DOWN
                </button>
              )}
            </div>
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
                className={`apex-send ${isListening ? 'active' : isVoiceMode ? 'active' : 'inactive'}`}
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
            {isVoiceMode ? <span style={{color: '#00f0ff'}}>Voice Mode Active</span> : "Trained on Uday's complete profile"}
          </p>
        </div>
      </div>
    </>
  )
}
