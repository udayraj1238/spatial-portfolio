'use client'

import { useChat } from '@ai-sdk/react'
import { Sparkles, Send, Code, User, Loader2, Cpu } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

// --- CINEMATIC TYPEWRITER COMPONENT ---
function SmoothStream({ text, isStreaming }: { text: string, isStreaming: boolean }) {
  const [displayedText, setDisplayedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastTextRef = useRef(text)

  useEffect(() => {
    // If we have new text and we're not already trickling
    if (text.length > displayedText.length) {
      if (timerRef.current) return;

      const trickle = () => {
        setDisplayedText(prev => {
          const nextPart = text.slice(prev.length);
          if (!nextPart) {
            timerRef.current = null;
            return prev;
          }

          // Find the next word or punctuation
          const match = nextPart.match(/^(\s*\S+)/);
          const chunk = match ? match[0] : nextPart.slice(0, 1);
          
          // SPEED CONTROL: 70ms per word creates that "deliberate" feel
          timerRef.current = setTimeout(trickle, 70); 
          return prev + chunk;
        });
      };

      trickle();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [text, displayedText.length]);

  const finalContent = isStreaming ? displayedText : text;

  return (
    <div className="markdown-content">
      <ReactMarkdown>{finalContent}</ReactMarkdown>
    </div>
  );
}

export default function ChatTerminal() {
  const { messages, sendMessage, error, status } = useChat()
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isLoading = status === 'submitted' || status === 'streaming'

  // SMOOTH SCROLLING: Instead of snapping, we gently scroll as content grows
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      const scrollContainer = containerRef.current;
      if (scrollContainer) {
        // We scroll a tiny bit on every render to ensure it feels like a "descent"
        const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const currentScroll = scrollContainer.scrollTop;
        
        if (targetScroll > currentScroll) {
          scrollContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [messages, status]);

  const handleSend = (content: string) => {
    if (!content.trim() || isLoading) return
    sendMessage({ text: content })
  }

  const getMessageText = (message: any) => {
    return message.parts
      ?.filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('\n') || '';
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '850px',
      height: '80vh',
      background: 'rgba(5, 10, 15, 0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      borderRadius: '24px',
      display: 'flex',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 240, 255, 0.05)',
      overflow: 'hidden',
      pointerEvents: 'auto',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.1), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
          <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: '#fff' }}>
            Uday Raj <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, marginLeft: '5px' }}>| Digital Assistant</span>
          </h2>
        </div>
        <Sparkles size={18} color="#00f0ff" opacity={0.6} />
      </div>

      {/* Chat Messages */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          scrollBehavior: 'smooth'
        }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
              <Cpu size={32} color="#00f0ff" />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Hi! I'm Uday's AI companion.</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: '450px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              I'm here to help you explore Uday's professional journey, technical expertise, and core engineering projects.
            </p>
          </div>
        )}

        {messages.map((m, index) => {
          const content = getMessageText(m);
          const isLatestLoading = index === messages.length - 1 && status === 'streaming';
          
          return (
            <div key={index} style={{
              display: 'flex',
              gap: '1.2rem',
              alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: m.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: m.role !== 'user' ? '1px solid rgba(0, 240, 255, 0.3)' : 'none', flexShrink: 0 }}>
                {m.role === 'user' ? <User size={18} color="#fff" /> : <Code size={18} color="#00f0ff" />}
              </div>
              <div style={{
                maxWidth: '75%',
                background: m.role === 'user' ? '#00f0ff' : 'rgba(255, 255, 255, 0.04)',
                color: m.role === 'user' ? '#000' : '#fff',
                padding: '1rem 1.2rem',
                borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                lineHeight: 1.6,
                fontSize: '1rem',
                boxShadow: m.role === 'user' ? '0 4px 15px rgba(0, 240, 255, 0.3)' : 'none'
              }}>
                {m.role === 'user' ? (
                  content
                ) : (
                  <SmoothStream text={content} isStreaming={isLatestLoading} />
                )}
              </div>
            </div>
          );
        })}
        
        {status === 'submitted' && (
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              <Loader2 size={18} className="animate-spin" color="#00f0ff" />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem 2rem 2rem', background: 'rgba(0,0,0,0.2)' }}>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim() || isLoading) return
          handleSend(text)
          setText('')
        }} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.2rem 4rem 1.2rem 1.5rem',
              borderRadius: '18px',
              color: '#fff',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            style={{
              position: 'absolute',
              right: '0.8rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: text.trim() && !isLoading ? '#00f0ff' : 'transparent',
              border: 'none',
              color: text.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.2)',
              padding: '0.7rem',
              borderRadius: '12px',
              display: 'flex'
            }}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}
