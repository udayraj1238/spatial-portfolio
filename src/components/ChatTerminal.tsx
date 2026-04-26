'use client'

import { useChat } from '@ai-sdk/react'
import { Sparkles, Send, Code, User, Loader2, Cpu, Activity, Database, ShieldCheck } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

// --- APEX RICH OUTPUT COMPONENT ---
function SmoothStream({ text, isStreaming }: { text: string, isStreaming: boolean }) {
  const [displayedText, setDisplayedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (text.length > displayedText.length) {
      if (timerRef.current) return;
      const trickle = () => {
        setDisplayedText(prev => {
          const nextPart = text.slice(prev.length);
          if (!nextPart) { timerRef.current = null; return prev; }
          const match = nextPart.match(/^(\s*\S+)/);
          const chunk = match ? match[0] : nextPart.slice(0, 1);
          timerRef.current = setTimeout(trickle, 60); 
          return prev + chunk;
        });
      };
      trickle();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = null; };
  }, [text, displayedText.length]);

  const finalContent = isStreaming ? displayedText : text;
  return (
    <div className="markdown-content prose prose-invert max-w-none" style={{ animation: 'apexFade 0.4s ease-out forwards' }}>
      <ReactMarkdown>{finalContent}</ReactMarkdown>
      <style jsx global>{`
        @keyframes apexFade { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .markdown-content strong { color: #00f0ff; text-shadow: 0 0 8px rgba(0, 240, 255, 0.4); }
        .markdown-content code { background: rgba(0, 240, 255, 0.1); padding: 0.2rem 0.4rem; borderRadius: 4px; color: #00f0ff; }
      `}</style>
    </div>
  );
}

export default function ChatTerminal() {
  const { messages, sendMessage, error, status } = useChat()
  const [text, setText] = useState('')
  const [booting, setBooting] = useState(true)
  const [diag, setDiag] = useState({ cpu: '2.4%', mem: '128MB', ping: '12ms' })
  const containerRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    const interval = setInterval(() => {
      setDiag({
        cpu: (Math.random() * 5 + 1).toFixed(1) + '%',
        mem: (120 + Math.random() * 20).toFixed(0) + 'MB',
        ping: (10 + Math.random() * 5).toFixed(0) + 'ms'
      });
    }, 3000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      const scrollContainer = containerRef.current;
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, status]);

  const quickPrompts = [
    { label: "Deep-Dive Strategy", prompt: "What is the strategic narrative behind Uday's Adversarial ML research?" },
    { label: "Apex Competitiveness", prompt: "Explain how Uday's Shell.ai Top 20 ranking translates to real-world impact." },
    { label: "Future Trajectory", prompt: "Describe Uday's journey toward leading secure multimodal AI research." },
  ]

  const handleSend = (content: string) => {
    if (!content.trim() || isLoading) return
    sendMessage({ text: content })
  }

  const getMessageText = (message: any) => {
    return message.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') || '';
  }

  if (booting) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#00f0ff', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>INITIALIZING APEX MATRIX...</div>
          <div style={{ width: '300px', height: '2px', background: 'rgba(0, 240, 255, 0.1)', margin: '0 auto', overflow: 'hidden' }}>
            <div className="loading-bar" style={{ width: '100%', height: '100%', background: '#00f0ff', transformOrigin: 'left' }} />
          </div>
          <style>{`
            @keyframes load { from { transform: scaleX(0); } to { transform: scaleX(1); } }
            .loading-bar { animation: load 2s ease-in-out forwards; }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%', maxWidth: '1000px', height: '88vh',
      background: 'linear-gradient(165deg, rgba(2, 8, 15, 0.95), rgba(0, 2, 5, 0.98))',
      backdropFilter: 'blur(30px)', border: '1px solid rgba(0, 240, 255, 0.2)',
      borderRadius: '40px', display: 'flex', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.9), inset 0 0 60px rgba(0, 240, 255, 0.05)',
      overflow: 'hidden', pointerEvents: 'auto', flexDirection: 'column'
    }}>
      {/* Top Diagnostics Bar */}
      <div style={{ padding: '0.8rem 2.5rem', background: 'rgba(0, 240, 255, 0.03)', borderBottom: '1px solid rgba(0, 240, 255, 0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(0, 240, 255, 0.6)', letterSpacing: '2px' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={12} /> CPU: {diag.cpu}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={12} /> MEM: {diag.mem}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={12} /> SECURE LINK ACTIVE</span>
        </div>
        <span>IIITDM_KURNOOL_NODE_04</span>
      </div>

      {/* Header */}
      <div style={{ padding: '1.8rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 20px #00f0ff' }} />
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>
            APEX DIGITAL TWIN <span style={{ color: 'rgba(0, 240, 255, 0.4)', fontWeight: 300, fontSize: '0.8rem' }}>v4.0_QUANTUM</span>
          </h2>
        </div>
        <Sparkles size={24} color="#00f0ff" className="animate-pulse" />
      </div>

      {/* Messages */}
      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '3rem', scrollBehavior: 'smooth' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'rgba(0, 240, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', border: '1px solid rgba(0, 240, 255, 0.25)', boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)' }}>
              <Cpu size={50} color="#00f0ff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Command Center</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', maxWidth: '650px', margin: '0 auto 4rem', lineHeight: 1.8, fontSize: '1.2rem' }}>
              The Apex Intelligence Hub is online. You are now communicating with a high-fidelity digital projection of Uday Raj's research matrix.
            </p>
            <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {quickPrompts.map((q, i) => (
                <button key={i} onClick={() => handleSend(q.prompt)} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '1.2rem 2.5rem', borderRadius: '24px', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'auto' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; e.currentTarget.style.borderColor = '#00f0ff'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, index) => {
          const content = getMessageText(m);
          const isLatestLoading = index === messages.length - 1 && status === 'streaming';
          return (
            <div key={index} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '18px', background: m.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {m.role === 'user' ? <User size={24} color="#fff" /> : <Code size={24} color="#00f0ff" />}
              </div>
              <div style={{ maxWidth: '80%', background: m.role === 'user' ? 'linear-gradient(135deg, #00f0ff, #0072ff)' : 'rgba(255, 255, 255, 0.03)', color: m.role === 'user' ? '#000' : '#fff', padding: '1.5rem 2rem', borderRadius: m.role === 'user' ? '28px 28px 4px 28px' : '4px 28px 28px 28px', fontSize: '1.15rem', boxShadow: m.role === 'user' ? '0 20px 40px rgba(0, 114, 255, 0.3)' : 'none', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {m.role === 'user' ? content : <SmoothStream text={content} isStreaming={isLatestLoading} />}
              </div>
            </div>
          );
        })}
        {status === 'submitted' && <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}><div style={{ width: '48px', height: '48px', borderRadius: '18px', background: 'rgba(0, 240, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 240, 255, 0.2)' }}><Loader2 size={24} className="animate-spin" color="#00f0ff" /></div><div style={{ color: '#00f0ff', letterSpacing: '4px', fontSize: '0.8rem' }}>APEX_PROCESSING...</div></div>}
      </div>

      {/* Input */}
      <div style={{ padding: '2.5rem 3.5rem 3.5rem', background: 'rgba(0,0,0,0.4)' }}>
        <form onSubmit={(e) => { e.preventDefault(); if (!text.trim() || isLoading) return; handleSend(text); setText(''); }} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Send encrypted command to Apex Matrix..." disabled={isLoading} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.6rem 5rem 1.6rem 2.2rem', borderRadius: '28px', color: '#fff', fontSize: '1.2rem', outline: 'none' }} />
          <button type="submit" disabled={!text.trim() || isLoading} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: text.trim() && !isLoading ? '#00f0ff' : 'transparent', border: 'none', color: text.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '18px', display: 'flex' }}>
            {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Send size={28} />}
          </button>
        </form>
      </div>
    </div>
  )
}
