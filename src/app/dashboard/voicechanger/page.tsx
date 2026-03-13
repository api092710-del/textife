'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import { Download, Play, Square, Mic, Check, Share2, Sparkles, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Voice Characters ─────────────────────────────────────────────────────────
const VOICES = [
  {
    id: 'baby',
    emoji: '👶', label: 'Baby', subtitle: 'Adorably tiny',
    color: '#FF6B9D', colorDark: '#c94a7a', colorGlow: 'rgba(255,107,157,0.4)',
    bg: 'from-pink-400 via-rose-400 to-fuchsia-500',
    cardBg: 'from-pink-50 to-rose-50', cardBorder: '#fda4af',
    pitch: 8, rate: 1.18, ringMod: false,
    vibe: '🥺 So cute it hurts',
    sound: 'Tiny & sweet',
  },
  {
    id: 'chipmunk',
    emoji: '🐿️', label: 'Chipmunk', subtitle: 'Turbo squeaky',
    color: '#F59E0B', colorDark: '#b45309', colorGlow: 'rgba(245,158,11,0.4)',
    bg: 'from-amber-400 via-yellow-400 to-orange-400',
    cardBg: 'from-amber-50 to-yellow-50', cardBorder: '#fcd34d',
    pitch: 11, rate: 1.4, ringMod: false,
    vibe: '🥜 Speedy & hilarious',
    sound: 'Fast & squeaky',
  },
  {
    id: 'cartoon',
    emoji: '🐭', label: 'Cartoon', subtitle: 'Classic character',
    color: '#8B5CF6', colorDark: '#6d28d9', colorGlow: 'rgba(139,92,246,0.4)',
    bg: 'from-violet-400 via-purple-500 to-indigo-500',
    cardBg: 'from-violet-50 to-purple-50', cardBorder: '#c4b5fd',
    pitch: 10, rate: 1.22, ringMod: false,
    vibe: '🎨 Pure cartoon energy',
    sound: 'Playful & fun',
  },
  {
    id: 'hero',
    emoji: '🦸', label: 'Hero', subtitle: 'Cinematic power',
    color: '#3B82F6', colorDark: '#1d4ed8', colorGlow: 'rgba(59,130,246,0.4)',
    bg: 'from-blue-500 via-indigo-500 to-blue-700',
    cardBg: 'from-blue-50 to-indigo-50', cardBorder: '#93c5fd',
    pitch: -7, rate: 0.85, ringMod: false,
    vibe: '💪 Deep & powerful',
    sound: 'Bold & strong',
  },
  {
    id: 'elder',
    emoji: '👴', label: 'Wise Elder', subtitle: 'Warm grandpa',
    color: '#D97706', colorDark: '#92400e', colorGlow: 'rgba(217,119,6,0.4)',
    bg: 'from-orange-400 via-amber-500 to-yellow-600',
    cardBg: 'from-orange-50 to-amber-50', cardBorder: '#fbbf24',
    pitch: -5, rate: 0.78, ringMod: false,
    vibe: '📜 Slow & wise',
    sound: 'Calm & deep',
  },
  {
    id: 'robot',
    emoji: '🤖', label: 'Robot', subtitle: 'BEEP BOOP',
    color: '#10B981', colorDark: '#065f46', colorGlow: 'rgba(16,185,129,0.4)',
    bg: 'from-emerald-500 via-teal-500 to-cyan-600',
    cardBg: 'from-emerald-50 to-teal-50', cardBorder: '#6ee7b7',
    pitch: 0, rate: 0.92, ringMod: true,
    vibe: '⚙️ Mechanical & cool',
    sound: 'Robotic & metallic',
  },
  {
    id: 'demon',
    emoji: '😈', label: 'Demon', subtitle: 'Dark & eerie',
    color: '#EF4444', colorDark: '#7f1d1d', colorGlow: 'rgba(239,68,68,0.4)',
    bg: 'from-red-600 via-red-700 to-rose-900',
    cardBg: 'from-red-50 to-rose-50', cardBorder: '#fca5a5',
    pitch: -9, rate: 0.72, ringMod: false,
    vibe: '🔥 Scary & dramatic',
    sound: 'Dark & deep',
  },
  {
    id: 'fairy',
    emoji: '🧚', label: 'Fairy', subtitle: 'Magical & tiny',
    color: '#EC4899', colorDark: '#9d174d', colorGlow: 'rgba(236,72,153,0.4)',
    bg: 'from-pink-400 via-fuchsia-500 to-pink-600',
    cardBg: 'from-pink-50 to-fuchsia-50', cardBorder: '#f9a8d4',
    pitch: 14, rate: 1.28, ringMod: false,
    vibe: '✨ Magical & sparkly',
    sound: 'Tiny & magical',
  },
]

// ── WAV encoder ──────────────────────────────────────────────────────────────
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels
  const sr = buffer.sampleRate
  const bDepth = 16
  const bAlign = (numCh * bDepth) / 8
  const byteRate = sr * bAlign
  const dataSize = buffer.length * bAlign
  const ab = new ArrayBuffer(44 + dataSize)
  const v = new DataView(ab)
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  ws(0,'RIFF'); v.setUint32(4,36+dataSize,true); ws(8,'WAVE'); ws(12,'fmt ')
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,numCh,true)
  v.setUint32(24,sr,true); v.setUint32(28,byteRate,true); v.setUint16(32,bAlign,true)
  v.setUint16(34,bDepth,true); ws(36,'data'); v.setUint32(40,dataSize,true)
  let off = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1,Math.min(1,buffer.getChannelData(ch)[i]))
      v.setInt16(off, s < 0 ? s*0x8000 : s*0x7fff, true); off += 2
    }
  }
  return new Blob([ab], { type: 'audio/wav' })
}

// ── Audio processor ──────────────────────────────────────────────────────────
async function processVoice(blob: Blob, voice: typeof VOICES[0]): Promise<Blob> {
  const actx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const ab = await blob.arrayBuffer()
  const srcBuf = await actx.decodeAudioData(ab)
  const offCtx = new OfflineAudioContext(
    srcBuf.numberOfChannels,
    Math.max(1, Math.ceil(srcBuf.length / voice.rate)),
    srcBuf.sampleRate
  )
  const src = offCtx.createBufferSource()
  src.buffer = srcBuf
  src.playbackRate.value = voice.rate
  src.detune.value = voice.pitch * 100

  const comp = offCtx.createDynamicsCompressor()
  comp.threshold.value = -18; comp.knee.value = 12
  comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15

  if (voice.ringMod) {
    const osc = offCtx.createOscillator()
    const oscGain = offCtx.createGain()
    const mix = offCtx.createGain()
    osc.frequency.value = 140; osc.type = 'sine'
    oscGain.gain.value = 0.4; mix.gain.value = 0.8
    osc.connect(oscGain); oscGain.connect(mix.gain)
    src.connect(mix); mix.connect(comp); osc.start()
  } else {
    src.connect(comp)
  }
  comp.connect(offCtx.destination)
  src.start(0)
  const rendered = await offCtx.startRendering()
  actx.close()
  return audioBufferToWav(rendered)
}

// ── Animated orbital ring ────────────────────────────────────────────────────
function OrbitalRing({ color, active, size = 120 }: { color: string; active: boolean; size?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[1,2,3].map((i) => (
        <motion.div key={i}
          className="absolute rounded-full border"
          style={{ width: size + i*28, height: size + i*28, borderColor: color, opacity: active ? 0.6 / i : 0.15 / i }}
          animate={active ? { scale: [1, 1.08, 1], opacity: [0.5/i, 0.15/i, 0.5/i] } : { scale: 1 }}
          transition={{ duration: 1.2 + i*0.4, repeat: Infinity, ease: 'easeInOut', delay: i*0.2 }}
        />
      ))}
    </div>
  )
}

// ── Live waveform bars ───────────────────────────────────────────────────────
function LiveWave({ active, color, barCount = 32 }: { active: boolean; color: string; barCount?: number }) {
  return (
    <div className="flex items-center justify-center gap-[2px] h-16 w-full">
      {Array.from({length: barCount}).map((_, i) => (
        <motion.div key={i}
          className="rounded-full flex-shrink-0"
          style={{ width: 3, backgroundColor: color, originY: '50%' }}
          animate={active ? {
            height: [4, Math.random()*44+8, Math.random()*28+4, 4],
            opacity: [0.5, 1, 0.8, 0.5],
          } : { height: 4, opacity: 0.2 }}
          transition={{
            duration: 0.4 + (i % 5)*0.12,
            repeat: Infinity,
            delay: i * 0.03,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ── Floating particle burst ──────────────────────────────────────────────────
function ParticleBurst({ trigger, color }: { trigger: number; color: string }) {
  const particles = Array.from({length: 12})
  return (
    <AnimatePresence>
      {trigger > 0 && particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2
        const dist  = 60 + Math.random() * 50
        return (
          <motion.div key={`${trigger}-${i}`}
            className="absolute w-2 h-2 rounded-full pointer-events-none z-50"
            style={{ backgroundColor: color, left: '50%', top: '50%', marginLeft: -4, marginTop: -4 }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(angle)*dist, y: Math.sin(angle)*dist, scale: 0, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.7 + Math.random()*0.3, ease: 'easeOut' }}
          />
        )
      })}
    </AnimatePresence>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function VoiceChangerPage() {
  const { user, loading, logout } = useAuth()
  const [selected, setSelected]     = useState(VOICES[0])
  const [recording, setRecording]   = useState(false)
  const [processing, setProcessing] = useState(false)
  const [playing, setPlaying]       = useState(false)
  const [rawBlob, setRawBlob]       = useState<Blob|null>(null)
  const [outBlob, setOutBlob]       = useState<Blob|null>(null)
  const [outUrl, setOutUrl]         = useState<string|null>(null)
  const [recSecs, setRecSecs]       = useState(0)
  const [burst, setBurst]           = useState(0)
  const [justDone, setJustDone]     = useState(false)
  const [shareCount, setShareCount] = useState(0)

  const mrRef    = useRef<MediaRecorder|null>(null)
  const chunksRef= useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const urlRef   = useRef<string|null>(null)

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const pick = (v: typeof VOICES[0]) => {
    setSelected(v)
    setOutBlob(null); setOutUrl(null); setJustDone(false)
    // Re-process if we have a raw recording
    if (rawBlob) setTimeout(() => applyVoice(v, rawBlob), 80)
  }

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRawBlob(blob)
        stream.getTracks().forEach(t => t.stop())
        await applyVoice(selected, blob)
      }
      mr.start(100)
      mrRef.current = mr
      setRecording(true); setRecSecs(0); setOutBlob(null); setOutUrl(null)
      timerRef.current = setInterval(() => setRecSecs(s => s + 1), 1000)
    } catch {
      toast.error('🎙️ Mic access needed — allow it in your browser!')
    }
  }

  const stopRec = () => {
    mrRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const applyVoice = async (voice: typeof VOICES[0], blob: Blob) => {
    setProcessing(true); setJustDone(false)
    try {
      const result = await processVoice(blob, voice)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(result)
      urlRef.current = url
      setOutBlob(result); setOutUrl(url)
      setJustDone(true)
      setBurst(Date.now())
      setTimeout(() => setJustDone(false), 2000)
    } catch (e) {
      toast.error('Processing failed — try a shorter recording (under 30s)')
      console.error(e)
    } finally {
      setProcessing(false)
    }
  }

  const playOut = () => {
    if (!outUrl) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const a = new Audio(outUrl)
    audioRef.current = a
    setPlaying(true)
    a.onended = () => setPlaying(false)
    a.onerror = () => { setPlaying(false); toast.error('Playback error') }
    a.play()
  }

  const stopPlay = () => { audioRef.current?.pause(); audioRef.current = null; setPlaying(false) }

  const download = () => {
    if (!outBlob || !outUrl) return
    const a = document.createElement('a')
    a.href = outUrl; a.download = `textife-${selected.id}-voice.wav`; a.click()
    toast.success('🎉 Downloaded! Post it on TikTok!')
  }

  const share = () => {
    setShareCount(c => c + 1)
    const text = `😂 I just transformed my voice into ${selected.emoji} ${selected.label} on Textife! Try it free → textife.com`
    if (navigator.share) {
      navigator.share({ title: 'My Voice Transformation 🎙️', text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Share text copied! Paste it anywhere 📋')
    }
  }

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const hasOutput = !!outBlob && !!outUrl

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0524 0%, #1a0533 50%, #0d1a3a 100%)' }}>
      <motion.div animate={{ scale: [1,1.1,1], rotate: [0,10,-10,0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <span className="text-6xl">🎙️</span>
      </motion.div>
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={() => {}}>
      {/* Dark immersive background */}
      <div className="min-h-screen -mx-4 -mt-5 px-4 pt-5 lg:-mx-7 lg:-mt-7 lg:px-7 lg:pt-7"
        style={{ background: 'linear-gradient(160deg, #0f0524 0%, #1a0533 30%, #0d1a3a 70%, #001a12 100%)' }}>

        <div className="w-full max-w-xl mx-auto space-y-6 pb-12">

          {/* ── HERO HEADER ── */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center pt-4">
            {/* Animated logo */}
            <motion.div
              className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-4"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.colorDark})` }} />
              <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-4xl shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.colorDark})` }}>
                🎙️
              </div>
            </motion.div>

            <h1 className="font-black text-4xl text-white mb-2 tracking-tight"
              style={{ fontFamily: 'system-ui', textShadow: `0 0 40px ${selected.colorGlow}` }}>
              Voice Changer
            </h1>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Record → Transform → Share ✨
            </p>

            {/* Social proof */}
            <motion.div className="flex items-center justify-center gap-3 mt-3 flex-wrap"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
                <span className="text-xs">🔥</span>
                <span className="text-xs font-bold text-white/80">47K voices transformed</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
                <span className="text-xs">⭐</span>
                <span className="text-xs font-bold text-white/80">Going viral on TikTok</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── VOICE CHARACTER SELECTOR ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-center"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              Choose Your Character
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {VOICES.map((v, i) => {
                const isActive = selected.id === v.id
                return (
                  <motion.button key={v.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                    onClick={() => pick(v)}
                    className="relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all"
                    style={{
                      background: isActive ? `linear-gradient(135deg, ${v.color}22, ${v.colorDark}44)` : 'rgba(255,255,255,0.05)',
                      border: isActive ? `2px solid ${v.color}88` : '2px solid rgba(255,255,255,0.08)',
                      boxShadow: isActive ? `0 0 20px ${v.colorGlow}` : 'none',
                    }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span
                      className="text-2xl leading-none"
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                    >
                      {v.emoji}
                    </motion.span>
                    <span className="text-[9px] font-black leading-tight text-center"
                      style={{ color: isActive ? v.color : 'rgba(255,255,255,0.4)' }}>
                      {v.label}
                    </span>
                    {isActive && (
                      <motion.div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ background: v.color }}>
                        <Check className="w-2 h-2 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ── MAIN STUDIO CARD ── */}
          <motion.div layout className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid rgba(255,255,255,0.08)`,
              backdropFilter: 'blur(20px)',
            }}>

            {/* Glow top border */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${selected.color}88, transparent)` }} />

            {/* Character banner */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-4">
              <motion.div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.colorDark})`, boxShadow: `0 8px 24px ${selected.colorGlow}` }}
                key={selected.id}
                initial={{ scale: 0.7, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {selected.emoji}
                <OrbitalRing color={selected.color} active={recording || playing} size={56} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.p key={selected.label} className="font-black text-white text-lg leading-tight"
                  initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  {selected.label}
                </motion.p>
                <p className="text-xs font-medium" style={{ color: selected.color }}>{selected.vibe}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{selected.sound}</p>
              </div>
              {/* Status pill */}
              <div className="flex-shrink-0">
                {recording && (
                  <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs font-black text-red-400">{fmt(recSecs)}</span>
                  </motion.div>
                )}
                {processing && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: `${selected.color}22`, border: `1px solid ${selected.color}44` }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <RefreshCw className="w-3 h-3" style={{ color: selected.color }} />
                    </motion.div>
                    <span className="text-xs font-black" style={{ color: selected.color }}>Magic...</span>
                  </div>
                )}
                {hasOutput && !processing && !recording && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400">Ready!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Waveform zone */}
            <div className="mx-5 mb-4 rounded-2xl px-4 py-3 relative overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <LiveWave active={recording || playing || processing} color={selected.color} barCount={36} />
              {!recording && !playing && !processing && !rawBlob && (
                <p className="text-center text-[11px] absolute inset-0 flex items-center justify-center font-medium"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Tap the mic below to start recording 🎙️
                </p>
              )}
            </div>

            {/* ── BIG MIC BUTTON ── */}
            <div className="flex flex-col items-center gap-2 pb-5 relative">
              <ParticleBurst trigger={burst} color={selected.color} />

              <motion.button
                onClick={recording ? stopRec : startRec}
                disabled={processing}
                className="relative w-24 h-24 rounded-full flex items-center justify-center disabled:opacity-40"
                style={{
                  background: recording
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : `linear-gradient(135deg, ${selected.color}, ${selected.colorDark})`,
                  boxShadow: recording
                    ? '0 0 0 0 rgba(239,68,68,0.4), 0 12px 40px rgba(239,68,68,0.5)'
                    : `0 0 0 0 ${selected.colorGlow}, 0 12px 40px ${selected.colorGlow}`,
                }}
                animate={recording ? {
                  boxShadow: [
                    `0 0 0 0 rgba(239,68,68,0.6), 0 12px 40px rgba(239,68,68,0.5)`,
                    `0 0 0 20px rgba(239,68,68,0), 0 12px 40px rgba(239,68,68,0.5)`,
                  ]
                } : {
                  boxShadow: [
                    `0 0 0 0 ${selected.colorGlow}, 0 12px 40px ${selected.colorGlow}`,
                    `0 0 0 16px rgba(0,0,0,0), 0 12px 40px ${selected.colorGlow}`,
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.06 }}
              >
                {recording
                  ? <Square className="w-9 h-9 text-white fill-white" />
                  : <Mic className="w-9 h-9 text-white" />
                }
              </motion.button>

              <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {recording ? `Recording... tap to stop` : rawBlob ? 'Tap to re-record' : 'Tap to record'}
              </p>

              {/* Processing progress bar */}
              <AnimatePresence>
                {processing && (
                  <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: '80%' }} exit={{ opacity: 0 }}
                    className="h-0.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${selected.color}, ${selected.colorDark})` }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── OUTPUT CONTROLS ── */}
            <AnimatePresence>
              {hasOutput && !processing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-5 mb-5 space-y-3"
                >
                  {/* Play/Stop full-width */}
                  <motion.button
                    onClick={playing ? stopPlay : playOut}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-white relative overflow-hidden"
                    style={{
                      background: playing
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : `linear-gradient(135deg, ${selected.color}, ${selected.colorDark})`,
                      boxShadow: `0 8px 32px ${selected.colorGlow}`,
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={justDone ? { scale: [1, 1.02, 1] } : {}}
                  >
                    {/* Shimmer */}
                    {justDone && (
                      <motion.div className="absolute inset-0"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 0.6 }} />
                    )}
                    {playing
                      ? <><Square className="w-5 h-5 fill-white" /> <span>Stop Playback</span></>
                      : <><Play className="w-5 h-5 fill-white" /> <span>▶ Play {selected.emoji} {selected.label}</span></>
                    }
                  </motion.button>

                  {/* Download + Share row */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button onClick={download} whileTap={{ scale: 0.96 }}
                      className="py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff',
                      }}>
                      <Download className="w-4 h-4" /> Download
                    </motion.button>
                    <motion.button onClick={share} whileTap={{ scale: 0.96 }}
                      className="py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        color: '#fff',
                        boxShadow: '0 6px 20px rgba(245,158,11,0.35)',
                      }}>
                      <Share2 className="w-4 h-4" />
                      Share {shareCount > 0 ? `(${shareCount})` : ''}
                    </motion.button>
                  </div>

                  {/* Re-apply with different voice hint */}
                  <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    👆 Tap any character above to instantly hear a new voice
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom glow line */}
            <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${selected.color}44, transparent)` }} />
          </motion.div>

          {/* ── HOW TO GO VIRAL ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="rounded-3xl p-5 overflow-hidden relative"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: `radial-gradient(circle at 80% 20%, ${selected.colorGlow}, transparent 60%)` }} />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                🚀 How to Go Viral
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: '📱', platform: 'TikTok',     tip: 'Duet or react to trending sounds with your voice' },
                  { icon: '📸', platform: 'Instagram',  tip: 'Add to Stories or Reels as a funny voiceover' },
                  { icon: '💬', platform: 'WhatsApp',   tip: 'Send as a surprise voice note to your group' },
                  { icon: '🐦', platform: 'Twitter/X',  tip: 'Quote-tweet a video with your transformed voice' },
                ].map((s, i) => (
                  <motion.div key={s.platform}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i*0.1 }}
                    className="rounded-2xl p-3"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-base mb-1">{s.icon}</p>
                    <p className="text-xs font-black text-white mb-0.5">{s.platform}</p>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── CHARACTER DESCRIPTIONS ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="rounded-3xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              ✨ All 8 Characters
            </p>
            <div className="space-y-2">
              {VOICES.map((v) => (
                <motion.button key={v.id} onClick={() => pick(v)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                  style={{
                    background: selected.id === v.id ? `${v.color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected.id === v.id ? v.color+'44' : 'rgba(255,255,255,0.06)'}`,
                  }}
                  whileTap={{ scale: 0.98 }}>
                  <span className="text-2xl flex-shrink-0">{v.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white">{v.label}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${v.color}22`, color: v.color }}>
                        {v.sound}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{v.vibe}</p>
                  </div>
                  {selected.id === v.id && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: v.color }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ── FUN FACTS ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-center space-y-2 pb-4">
            <p className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
              🎤 All processing happens on your device — your voice never leaves your phone
            </p>
            <p className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
              📁 Downloads as .WAV — perfect quality for every platform
            </p>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  )
}
