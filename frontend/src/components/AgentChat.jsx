import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Loader2, ChevronDown, Trash2 } from 'lucide-react'
import { agentApi } from '../api/client'

// ─── Markdown renderer (no external lib) ──────────────────────────────────
function MarkdownLine({ text }) {
  // Bold, italic, inline code
  const parts = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0, m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>)
    if (m[0].startsWith('**'))
      parts.push(<strong key={m.index} className="font-semibold">{m[2]}</strong>)
    else if (m[0].startsWith('*'))
      parts.push(<em key={m.index}>{m[3]}</em>)
    else
      parts.push(<code key={m.index} className="bg-base-300 px-1 rounded text-xs font-mono">{m[4]}</code>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>)
  return <>{parts}</>
}

function Markdown({ text }) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Heading
    if (/^###\s/.test(line)) {
      elements.push(<p key={i} className="font-bold text-sm mt-2 mb-0.5">{line.replace(/^###\s/, '')}</p>)
    } else if (/^##\s/.test(line)) {
      elements.push(<p key={i} className="font-bold mt-2 mb-1">{line.replace(/^##\s/, '')}</p>)
    }
    // Bullet list
    else if (/^[-*•]\s/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
          <span><MarkdownLine text={line.replace(/^[-*•]\s/, '')} /></span>
        </div>
      )
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1]
      elements.push(
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="flex-shrink-0 font-mono text-xs opacity-60 mt-0.5 w-4">{num}.</span>
          <span><MarkdownLine text={line.replace(/^\d+\.\s/, '')} /></span>
        </div>
      )
    }
    // Horizontal rule
    else if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-current opacity-20 my-2" />)
    }
    // Empty line → spacing
    else if (line.trim() === '') {
      if (i > 0) elements.push(<div key={i} className="h-1.5" />)
    }
    // Normal text
    else {
      elements.push(<p key={i} className="leading-relaxed"><MarkdownLine text={line} /></p>)
    }
    i++
  }
  return <div className="text-sm flex flex-col gap-0.5">{elements}</div>
}

// ─── Suggestions ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Jami daromad qancha?",
  "Eng ko'p qarzdor kim?",
  "Qaysi bozorda savdo joylari ko'proq?",
  "Transport kirishi statistikasi?",
]

// ─── Chat component ───────────────────────────────────────────────────────
const INIT_MSG = {
  role: 'assistant',
  content: `Salom! Men **Raqamli Bozor** AI yordamchisiman 🤖

Bozorlar statistikasi bo'yicha savollaringizga javob beraman:
- Daromad va qarz tahlili
- Savdo joylari (magazin, rasta, ochiq savdo)
- Transport kirishi
- Qarzdorlar

Quyidagi savollardan birini tanlang yoki o'z savolingizni yozing.`,
}

export default function AgentChat() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([INIT_MSG])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages, open])

  async function send(text) {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')
    textareaRef.current?.focus()

    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)
    try {
      // Send only user/assistant turns (no system — backend handles it)
      const apiMsgs = newMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }))
      const res = await agentApi.chat(apiMsgs)
      setMessages(prev => [...prev, { role: 'assistant', content: res.message }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Serverga ulanishda xatolik. Qaytadan urinib ko\'ring.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([INIT_MSG])
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 btn btn-primary btn-circle shadow-xl w-14 h-14"
        title="AI Yordamchi"
      >
        {open ? <ChevronDown size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[22rem] max-w-[calc(100vw-2rem)]
                     flex flex-col bg-base-100 rounded-2xl shadow-2xl border border-base-200"
          style={{ height: '540px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl
                          bg-gradient-to-r from-primary to-secondary text-primary-content flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Bozor AI Yordamchi</p>
              <p className="text-xs opacity-70 leading-tight">Har doim yangi ma'lumot bilan</p>
            </div>
            <button onClick={clearChat} className="btn btn-ghost btn-xs btn-circle opacity-70 hover:opacity-100"
                    title="Chatni tozalash">
              <Trash2 size={14} />
            </button>
            <button onClick={() => setOpen(false)} className="btn btn-ghost btn-xs btn-circle opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} className="text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 max-w-[82%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-content rounded-tr-sm'
                      : 'bg-base-200 text-base-content rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'assistant'
                    ? <Markdown text={msg.content} />
                    : <p className="text-sm leading-relaxed">{msg.content}</p>
                  }
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-primary" />
                </div>
                <div className="bg-base-200 rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-2">
                  <span className="loading loading-dots loading-xs text-primary" />
                  <span className="text-xs text-base-content/50">Javob tayyorlanmoqda...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} disabled={loading}
                  className="btn btn-xs btn-ghost border border-base-300 normal-case text-xs font-normal
                             hover:btn-primary hover:border-primary transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-base-200 flex gap-2 flex-shrink-0">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Savolingizni yozing... (Enter = yuborish)"
              rows={1}
              className="textarea textarea-bordered flex-1 text-sm resize-none min-h-[2.5rem]
                         max-h-20 focus:outline-none focus:textarea-primary leading-relaxed"
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="btn btn-primary btn-square flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
