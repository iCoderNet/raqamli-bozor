import React, { useState, useRef, useEffect } from 'react'
import {
  Bot, X, Send, ChevronDown, Trash2,
  Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2, Loader2,
} from 'lucide-react'
import api, { agentApi } from '../api/client'

// ─── Markdown renderer (no external lib) ──────────────────────────────────
function MarkdownLine({ text }) {
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

// Jadval qatori ajratuvchimi? (|---|---|)
const _isSep = l => /^\s*\|[-| :]+\|\s*$/.test(l)
// Jadval qatorimi? (| ... | ... |)
const _isTbl = l => /^\s*\|.+\|\s*$/.test(l)

function parseRow(l) {
  return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
}

function MarkdownTable({ lines, id }) {
  const rows = lines.filter(l => !_isSep(l)).map(parseRow)
  if (!rows.length) return null
  const [header, ...data] = rows
  return (
    <div className="overflow-x-auto my-2 rounded-lg border border-base-300">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-base-300/80">
            {header.map((cell, ci) => (
              <th key={ci} className="px-2.5 py-1.5 text-left font-semibold whitespace-nowrap">
                <MarkdownLine text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? 'bg-base-200/40' : ''}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-2.5 py-1.5 border-t border-base-300 whitespace-nowrap">
                  <MarkdownLine text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Markdown({ text }) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // ── Jadval ───────────────────────────────────────────────────────────
    if (_isTbl(line)) {
      const tblLines = []
      while (i < lines.length && _isTbl(lines[i])) tblLines.push(lines[i++])
      elements.push(<MarkdownTable key={`tbl-${i}`} lines={tblLines} />)
      continue   // i already advanced — skip i++ below
    }

    // ── Boshqa elementlar ─────────────────────────────────────────────
    if (/^###\s/.test(line)) {
      elements.push(<p key={i} className="font-bold text-sm mt-2 mb-0.5">{line.replace(/^###\s/, '')}</p>)
    } else if (/^##\s/.test(line)) {
      elements.push(<p key={i} className="font-bold mt-2 mb-1">{line.replace(/^##\s/, '')}</p>)
    } else if (/^[-*•]\s/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
          <span><MarkdownLine text={line.replace(/^[-*•]\s/, '')} /></span>
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1]
      elements.push(
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="flex-shrink-0 font-mono text-xs opacity-60 mt-0.5 w-4">{num}.</span>
          <span><MarkdownLine text={line.replace(/^\d+\.\s/, '')} /></span>
        </div>
      )
    } else if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-current opacity-20 my-2" />)
    } else if (line.trim() === '') {
      if (i > 0) elements.push(<div key={i} className="h-1.5" />)
    } else {
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

// ─── Init message ─────────────────────────────────────────────────────────
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

// ─── Voice helpers ─────────────────────────────────────────────────────────

function getRecordingMime() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
  return candidates.find(t => {
    try { return MediaRecorder.isTypeSupported(t) } catch { return false }
  }) ?? ''
}

async function doSTT(blob) {
  const fd = new FormData()
  fd.append('audio', blob, 'recording.webm')
  const { data } = await api.post('/voice/stt', fd, { timeout: 30000 })
  return data.text ?? ''
}

async function doTTS(rawText) {
  // markdown va kod bloklarini tozalash
  const text = rawText
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*#`_~>]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 512)
  const { data } = await api.post('/voice/tts', { text, speaker: 1 }, { responseType: 'blob' })
  return URL.createObjectURL(data)
}

// ─── Chat component ───────────────────────────────────────────────────────
export default function AgentChat({ marketId, year, month }) {
  const [open,       setOpen]       = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [messages,   setMessages]   = useState([INIT_MSG])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)

  // Voice
  const [recording,  setRecording]  = useState(false)
  const [sttPending, setSttPending] = useState(false)
  const [autoTts,    setAutoTts]    = useState(false)
  const [playingIdx, setPlayingIdx] = useState(null)

  const mrRef     = useRef(null)
  const chunksRef = useRef([])
  const audioRef  = useRef(null)
  const bottomRef = useRef(null)
  const taRef     = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages, open])

  useEffect(() => {
    if (!open) { stopAudio(); if (recording) stopRec() }
  }, [open]) // eslint-disable-line

  // ── Audio ──────────────────────────────────────────────────────────────
  function stopAudio() {
    audioRef.current?.pause()
    audioRef.current = null
    setPlayingIdx(null)
  }

  async function playTTS(text, idx) {
    if (playingIdx === idx) { stopAudio(); return }
    stopAudio()
    setPlayingIdx(idx)
    try {
      const url  = await doTTS(text)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play()
      audio.onended = () => { setPlayingIdx(null); URL.revokeObjectURL(url) }
      audio.onerror = () => { setPlayingIdx(null); URL.revokeObjectURL(url) }
    } catch {
      setPlayingIdx(null)
    }
  }

  // ── Recording ──────────────────────────────────────────────────────────
  async function startRec() {
    if (!navigator.mediaDevices?.getUserMedia) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mime = getRecordingMime()
      const mr   = new MediaRecorder(stream, mime ? { mimeType: mime } : {})

      mr.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        setSttPending(true)
        try {
          const text = await doSTT(blob)
          if (text) { setInput(text); taRef.current?.focus() }
        } catch (e) {
          console.warn('STT failed:', e)
        } finally {
          setSttPending(false)
        }
      }

      mr.start()
      mrRef.current = mr
      setRecording(true)
    } catch (e) {
      console.warn('Mikrofon ruxsati berilmadi:', e)
    }
  }

  function stopRec() {
    mrRef.current?.stop()
    mrRef.current = null
    setRecording(false)
  }

  // ── Send ───────────────────────────────────────────────────────────────
  async function send(text) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    taRef.current?.focus()

    const updated = [...messages, { role: 'user', content }]
    setMessages(updated)
    setLoading(true)

    try {
      const apiMsgs = updated
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }))
      const res = await agentApi.chat(apiMsgs, { marketId, year, month })

      const botIdx = updated.length   // index yangi bot xabari
      setMessages(prev => [...prev, { role: 'assistant', content: res.message }])

      if (autoTts) {
        doTTS(res.message).then(url => {
          const a = new Audio(url)
          audioRef.current = a
          setPlayingIdx(botIdx)
          a.play()
          a.onended = () => { setPlayingIdx(null); URL.revokeObjectURL(url) }
          a.onerror = () => { setPlayingIdx(null); URL.revokeObjectURL(url) }
        }).catch(() => {})
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Serverga ulanishda xatolik. Qaytadan urinib ko'ring.",
      }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() { stopAudio(); setMessages([INIT_MSG]) }

  // ── Shared panel content ───────────────────────────────────────────────
  const panel = (
    <>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-primary-content flex-shrink-0 ${fullscreen ? '' : 'rounded-t-2xl'}`}>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Bot size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">Bozor AI Yordamchi</p>
          <p className="text-xs opacity-70 leading-tight">Ovoz va matn bilan ishlaydi</p>
        </div>

        {/* Auto-TTS toggle */}
        <button
          onClick={() => { setAutoTts(v => !v); if (autoTts) stopAudio() }}
          className="btn btn-ghost btn-xs btn-circle opacity-70 hover:opacity-100"
          title={autoTts ? "Ovozli javobni o'chirish" : "Ovozli javobni yoqish"}
        >
          {autoTts ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={() => setFullscreen(f => !f)}
          className="btn btn-ghost btn-xs btn-circle opacity-70 hover:opacity-100"
          title={fullscreen ? "Kichraytirish" : "Kattalashtirish"}
        >
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {/* Clear */}
        <button
          onClick={clearChat}
          className="btn btn-ghost btn-xs btn-circle opacity-70 hover:opacity-100"
          title="Chatni tozalash"
        >
          <Trash2 size={14} />
        </button>

        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="btn btn-ghost btn-xs btn-circle opacity-70 hover:opacity-100"
        >
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
            <div className={`rounded-2xl px-3 py-2 max-w-[82%] ${
              msg.role === 'user'
                ? 'bg-primary text-primary-content rounded-tr-sm'
                : 'bg-base-200 text-base-content rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <>
                  <Markdown text={msg.content} />
                  {/* TTS tugmasi */}
                  <button
                    onClick={() => playTTS(msg.content, i)}
                    className="mt-1.5 flex items-center gap-1 text-xs opacity-40 hover:opacity-90 transition-opacity"
                    title="Ovozda o'qish"
                  >
                    {playingIdx === i
                      ? <><span className="loading loading-ring loading-xs" /><span>To'xtatish</span></>
                      : <><Volume2 size={11} /><span>Tinglash</span></>
                    }
                  </button>
                </>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
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
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="btn btn-xs btn-ghost border border-base-300 normal-case text-xs font-normal
                         hover:btn-primary hover:border-primary transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-base-200 flex gap-2 flex-shrink-0">
        <textarea
          ref={taRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={
            sttPending ? "Ovoz matnga aylantirilmoqda..." :
            recording  ? "Gapiring... (to'xtatish uchun bosing)" :
                         "Savolingizni yozing... (Enter = yuborish)"
          }
          rows={1}
          disabled={sttPending}
          className="textarea textarea-bordered flex-1 text-sm resize-none min-h-[2.5rem]
                     max-h-20 focus:outline-none focus:textarea-primary leading-relaxed"
        />

        {/* Mic tugmasi */}
        <button
          onClick={recording ? stopRec : startRec}
          disabled={sttPending || loading}
          title={recording ? "Yozishni to'xtatish" : "Ovozdan gapirish"}
          className={`btn btn-square flex-shrink-0 transition-all ${
            recording
              ? 'btn-error animate-pulse'
              : 'btn-ghost border border-base-300 hover:btn-primary hover:border-primary'
          }`}
        >
          {sttPending
            ? <Loader2 size={15} className="animate-spin" />
            : recording
              ? <MicOff size={15} />
              : <Mic size={15} />
          }
        </button>

        {/* Send tugmasi */}
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn btn-primary btn-square flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </>
  )

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

      {/* Compact window */}
      {open && !fullscreen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[22rem] max-w-[calc(100vw-2rem)]
                     flex flex-col bg-base-100 rounded-2xl shadow-2xl border border-base-200"
          style={{ height: '540px' }}
        >
          {panel}
        </div>
      )}

      {/* Fullscreen — butun ekranni qoplaydi */}
      {open && fullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-base-100">
          {panel}
        </div>
      )}
    </>
  )
}
