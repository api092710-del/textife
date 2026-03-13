'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, Download, Share2, Check, RefreshCw, Crown, Zap, Heart, Laugh, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const VOICES = [
  { id:'baby',     emoji:'👶', name:'Baby Coo',      tagline:'Tiny & impossibly sweet',    mood:'Cute · Soft · Heart-melting',   shareCaption:'POV: I turned into the cutest baby 👶 my voice will never recover 🥺', tiktokTag:'#babychallenge #cuteaf #voicechanger #textife', color1:'#FF6B9D', color2:'#e8447a', glow:'rgba(255,107,157,0.5)', plan:'FREE' },
  { id:'chipmunk', emoji:'🐿️', name:'Chipmunk',      tagline:'Turbo squeaky & hilarious',  mood:'Funny · Fast · Viral',          shareCaption:'I turned into a chipmunk 🐿️ and I cannot stop replaying this 😭😂', tiktokTag:'#chipmunk #funny #voicechanger #trending', color1:'#FBBF24', color2:'#D97706', glow:'rgba(251,191,36,0.5)', plan:'FREE' },
  { id:'cartoon',  emoji:'🎭', name:'Cartoon Star',  tagline:'Animated character energy',  mood:'Playful · Expressive · Fun',    shareCaption:'Someone animate me please 🎭 I literally sound like a cartoon character now', tiktokTag:'#cartoon #animated #voicechanger #disney', color1:'#A855F7', color2:'#7C3AED', glow:'rgba(168,85,247,0.5)', plan:'FREE' },
  { id:'hero',     emoji:'🦸', name:'Action Hero',   tagline:'Deep, bold & cinematic',      mood:'Powerful · Bold · Cinematic',   shareCaption:'I now narrate my life like a movie trailer 🎬 this voice is too powerful', tiktokTag:'#epicvoice #actionhero #voiceover #cinematic', color1:'#3B82F6', color2:'#1D4ED8', glow:'rgba(59,130,246,0.5)', plan:'FREE' },
  { id:'elder',    emoji:'🧙', name:'Wise Wizard',   tagline:'Warm, deep & ancient',       mood:'Warm · Deep · Wise',            shareCaption:'I speak like an ancient wizard now 🧙 every word I say sounds profound', tiktokTag:'#wizard #storytelling #deepvoice #wisdomcheck', color1:'#F59E0B', color2:'#B45309', glow:'rgba(245,158,11,0.5)', plan:'FREE' },
  { id:'robot',    emoji:'🤖', name:'AI Robot',      tagline:'Metallic & futuristic',      mood:'Mechanical · Eerie · Sci-fi',   shareCaption:'UNIT 7 IS NOW ONLINE 🤖 BEEP BOOP THIS IS MY VOICE NOW', tiktokTag:'#robot #AI #scifi #voicechanger', color1:'#10B981', color2:'#047857', glow:'rgba(16,185,129,0.5)', plan:'FREE' },
  { id:'demon',    emoji:'😈', name:'Dark Demon',    tagline:'Spine-chilling & dark',      mood:'Dark · Scary · Dramatic',       shareCaption:'I scared my entire family with this voice 😈 they thought the house was haunted', tiktokTag:'#demon #horror #scary #voicechanger', color1:'#EF4444', color2:'#991B1B', glow:'rgba(239,68,68,0.5)', plan:'PRO' },
  { id:'fairy',    emoji:'🧚', name:'Magic Fairy',   tagline:'Ethereal & enchanting',      mood:'Magical · Airy · Enchanting',   shareCaption:"I'm a fairy now and there's nothing anyone can do about it 🧚✨", tiktokTag:'#fairy #magical #sparkle #cute', color1:'#EC4899', color2:'#BE185D', glow:'rgba(236,72,153,0.5)', plan:'PRO' },
]

// ── WAV encoder ──────────────────────────────────────────────────────────────
function encodeWAV(buf: AudioBuffer): Blob {
  const nc = buf.numberOfChannels, sr = buf.sampleRate
  const ba = (nc * 16) / 8, br = sr * ba, ds = buf.length * ba
  const ab = new ArrayBuffer(44 + ds); const v = new DataView(ab)
  const wr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  wr(0,'RIFF'); v.setUint32(4,36+ds,true); wr(8,'WAVE'); wr(12,'fmt ')
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,nc,true)
  v.setUint32(24,sr,true); v.setUint32(28,br,true); v.setUint16(32,ba,true)
  v.setUint16(34,16,true); wr(36,'data'); v.setUint32(40,ds,true)
  let off = 44
  for (let i = 0; i < buf.length; i++)
    for (let c = 0; c < nc; c++) {
      const s = Math.max(-1, Math.min(1, buf.getChannelData(c)[i]))
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); off += 2
    }
  return new Blob([ab], { type:'audio/wav' })
}

type FilterSpec = [number, number, number, BiquadFilterType]
interface DSP { semitones:number; speed:number; eq:FilterSpec[]; satCurve:number; compThresh:number; compRatio:number; outGain:number; ringModHz:number; hpFreq:number }

const DSP_PROFILES: Record<string,DSP> = {
  baby:     { semitones:5.5, speed:1.07, hpFreq:120, eq:[[250,-4,1.2,'lowshelf'],[900,3,1.8,'peaking'],[2500,5,2.0,'peaking'],[5000,3,1.5,'peaking'],[9000,2,0.8,'highshelf']], satCurve:0, compThresh:-18, compRatio:4, outGain:1.55, ringModHz:0 },
  chipmunk: { semitones:9,   speed:1.38, hpFreq:200, eq:[[200,-6,1.2,'lowshelf'],[1800,5,2,'peaking'],[4500,4,1.5,'peaking'],[8000,3,1,'highshelf']], satCurve:0, compThresh:-14, compRatio:5, outGain:1.5, ringModHz:0 },
  cartoon:  { semitones:6.5, speed:1.12, hpFreq:150, eq:[[200,-4,1.2,'lowshelf'],[700,3,1.5,'peaking'],[2200,5,2,'peaking'],[5500,4,1.5,'peaking'],[9000,2,0.8,'highshelf']], satCurve:0.3, compThresh:-16, compRatio:4, outGain:1.5, ringModHz:0 },
  hero:     { semitones:-5,  speed:0.91, hpFreq:55,  eq:[[70,7,0.7,'lowshelf'],[180,5,1.5,'peaking'],[400,-3,1.2,'peaking'],[900,2,1.2,'peaking'],[3500,4,1.5,'peaking'],[7000,-3,0.8,'highshelf']], satCurve:0.6, compThresh:-14, compRatio:5, outGain:1.9, ringModHz:0 },
  elder:    { semitones:-4,  speed:0.83, hpFreq:45,  eq:[[90,6,0.7,'lowshelf'],[280,5,1.5,'peaking'],[700,3,1.2,'peaking'],[1800,-1,1.2,'peaking'],[4500,-4,1.5,'peaking'],[7000,-5,0.8,'highshelf']], satCurve:0.8, compThresh:-12, compRatio:4, outGain:2.0, ringModHz:0 },
  robot:    { semitones:0,   speed:1.0,  hpFreq:100, eq:[[100,-5,1,'lowshelf'],[800,4,3,'peaking'],[1600,2,2,'peaking'],[3200,3,2,'peaking'],[6400,-4,1.5,'highshelf']], satCurve:0.2, compThresh:-10, compRatio:8, outGain:1.6, ringModHz:55 },
  demon:    { semitones:-9,  speed:0.78, hpFreq:30,  eq:[[80,9,0.6,'lowshelf'],[150,6,1.5,'peaking'],[400,-2,1.2,'peaking'],[3000,-4,1.5,'peaking'],[7000,-8,0.8,'highshelf']], satCurve:1.2, compThresh:-10, compRatio:6, outGain:2.2, ringModHz:0 },
  fairy:    { semitones:10,  speed:1.18, hpFreq:300, eq:[[300,-8,1.2,'lowshelf'],[1200,3,1.5,'peaking'],[3500,6,2,'peaking'],[7000,5,1.5,'peaking'],[12000,4,0.8,'highshelf']], satCurve:0, compThresh:-20, compRatio:3, outGain:1.4, ringModHz:0 },
}

async function processAudio(blob: Blob, voiceId: string): Promise<Blob> {
  const ctx = new AudioContext()
  const dsp = DSP_PROFILES[voiceId]
  const ab = await blob.arrayBuffer()
  const src = await ctx.decodeAudioData(ab)
  const rate = dsp.speed * Math.pow(2, dsp.semitones / 12)
  const outLen = Math.ceil(src.length / rate)
  const out = ctx.createBuffer(src.numberOfChannels, outLen, src.sampleRate)
  for (let c = 0; c < src.numberOfChannels; c++) {
    const inp = src.getChannelData(c); const outp = out.getChannelData(c)
    for (let i = 0; i < outLen; i++) {
      const pos = i * rate
      const f = Math.floor(pos); const fr = pos - f
      outp[i] = (inp[f] ?? 0) * (1 - fr) + (inp[f + 1] ?? 0) * fr
    }
  }
  const offline = new OfflineAudioContext(out.numberOfChannels, out.length, out.sampleRate)
  const srcNode = offline.createBufferSource(); srcNode.buffer = out
  let current: AudioNode = srcNode
  const hp = offline.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = dsp.hpFreq; hp.Q.value = 0.7
  current.connect(hp); current = hp
  for (const [freq, gain, q, type] of dsp.eq) {
    const f = offline.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.gain.value = gain; f.Q.value = q
    current.connect(f); current = f
  }
  if (dsp.ringModHz > 0) {
    const rm = offline.createOscillator(); rm.frequency.value = dsp.ringModHz; rm.type = 'sine'
    const rmGain = offline.createGain(); rmGain.gain.value = 0.35
    rm.connect(rmGain); const mix = offline.createGain(); mix.gain.value = 1
    current.connect(mix); rmGain.connect(mix); current = mix; rm.start(0)
  }
  const comp = offline.createDynamicsCompressor()
  comp.threshold.value = dsp.compThresh; comp.knee.value = 6; comp.ratio.value = dsp.compRatio
  comp.attack.value = 0.004; comp.release.value = 0.1
  current.connect(comp); current = comp
  const gain = offline.createGain(); gain.gain.value = dsp.outGain
  current.connect(gain); gain.connect(offline.destination)
  srcNode.start(0)
  const rendered = await offline.startRendering()
  ctx.close()
  return encodeWAV(rendered)
}

export default function VoiceChangerPage() {
  const { user, loading, logout } = useAuth()
  const [voice, setVoice]         = useState(VOICES[0])
  const [phase, setPhase]         = useState<'idle'|'recording'|'processing'|'done'>('idle')
  const [seconds, setSeconds]     = useState(0)
  const [rawBlob, setRawBlob]     = useState<Blob|null>(null)
  const [changedUrl, setChangedUrl] = useState<string|null>(null)
  const [rawUrl, setRawUrl]       = useState<string|null>(null)
  const [playing, setPlaying]     = useState<'raw'|'changed'|null>(null)
  const [shared, setShared]       = useState(false)
  const [funFact, setFunFact]     = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const mediaRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null)
  const audioRef  = useRef<HTMLAudioElement|null>(null)

  const isPro = user?.plan === 'PRO' || user?.plan === 'BUSINESS'

  const FUN_FACTS = [
    `${voice.emoji} "${voice.name}" pitch: ${DSP_PROFILES[voice.id]?.semitones > 0 ? '+' : ''}${DSP_PROFILES[voice.id]?.semitones} semitones`,
    '🎵 Professional DSP audio processing',
    '📱 Ready to share on TikTok & Reels',
    '🎙️ No account or app needed to play',
    '⚡ Processed in your browser — 100% private',
  ]
  useEffect(() => { const t = setInterval(() => setFunFact(i => (i+1) % FUN_FACTS.length), 3000); return () => clearInterval(t) }, [voice])

  const startRec = async () => {
    const locked = voice.plan === 'PRO' && !isPro
    if (locked) { setShowUpgrade(true); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true })
      chunksRef.current = []; setSeconds(0); setPhase('recording')
      setChangedUrl(null); setRawUrl(null); setRawBlob(null)
      const mr = new MediaRecorder(stream, { mimeType:'audio/webm;codecs=opus' })
      mediaRef.current = mr
      mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const raw = new Blob(chunksRef.current, { type:'audio/webm' })
        setRawBlob(raw); setRawUrl(URL.createObjectURL(raw))
        setPhase('processing')
        try {
          const out = await processAudio(raw, voice.id)
          setChangedUrl(URL.createObjectURL(out))
          setPhase('done')
        } catch { toast.error('Processing failed — try again'); setPhase('idle') }
      }
      mr.start(100)
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 29) { stopRec(); return 30 }
          return s + 1
        })
      }, 1000)
    } catch { toast.error('Mic access needed — allow it in browser settings') }
  }

  const stopRec = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRef.current?.stop(); setPhase('processing')
  }

  const playAudio = (url: string, which: 'raw'|'changed') => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playing === which) { setPlaying(null); return }
    const a = new Audio(url); audioRef.current = a; setPlaying(which)
    a.onended = () => setPlaying(null)
    a.play().catch(() => toast.error('Playback failed'))
  }

  const download = () => {
    if (!changedUrl) return
    const a = document.createElement('a')
    a.href = changedUrl; a.download = `textife-${voice.id}-voice.wav`; a.click()
    toast.success('🎉 Saved! Share it everywhere.')
  }

  const shareToClipboard = () => {
    const text = `${voice.shareCaption}\n\nCreated with Textife AI 🚀 textife.com\n${voice.tiktokTag}`
    navigator.clipboard.writeText(text)
    setShared(true); toast.success('Caption copied! Open TikTok/Reels & paste 🎉')
    setTimeout(() => setShared(false), 3000)
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto animate-bounce" style={{ background:'linear-gradient(135deg,#EC4899,#F59E0B)' }}>
          <Mic className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm text-gray-400">Loading Voice Studio...</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-2xl space-y-5 pb-10">

        {/* Hero */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden rounded-2xl p-5 sm:p-7 text-white"
          style={{ background:'linear-gradient(135deg,#EC4899 0%,#F59E0B 50%,#EF4444 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'22px 22px' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-pink-200 font-bold text-xs uppercase tracking-widest">AI Voice Changer</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">Make Viral Voice Content 🎙️</h1>
            <p className="text-pink-100 text-sm max-w-md">Record → Transform → Share. 8 hilarious voices that get reactions every time. Used by 12k+ creators.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['👶 Baby','🐿️ Chipmunk','🎭 Cartoon','🦸 Hero','🧙 Wizard','🤖 Robot'].map(v => (
                <span key={v} className="bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">{v}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Voice Picker */}
        <div>
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Choose Your Voice</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {VOICES.map(v => {
              const locked = v.plan === 'PRO' && !isPro
              return (
                <button key={v.id} onClick={() => { if (locked) { setShowUpgrade(true); return } setVoice(v); setPhase('idle'); setChangedUrl(null) }}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                    voice.id === v.id
                      ? 'border-transparent shadow-lg'
                      : 'border-gray-100 bg-white hover:border-gray-300'
                  } ${locked ? 'opacity-60' : ''}`}
                  style={voice.id === v.id ? { background:`linear-gradient(135deg,${v.color1},${v.color2})` } : {}}>
                  {locked && <Crown className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-500" />}
                  <span className="text-2xl leading-none">{v.emoji}</span>
                  <p className={`text-[9px] font-bold leading-tight text-center ${voice.id === v.id ? 'text-white' : 'text-gray-600'}`}>{v.name}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Voice Info */}
        <AnimatePresence mode="wait">
          <motion.div key={voice.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            className="rounded-2xl overflow-hidden border-2"
            style={{ borderColor:voice.color1 + '60' }}>
            <div className="p-4 sm:p-5 text-white" style={{ background:`linear-gradient(135deg,${voice.color1},${voice.color2})` }}>
              <div className="flex items-start gap-3">
                <span className="text-4xl">{voice.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-display font-black text-xl">{voice.name}</h2>
                  <p className="text-white/80 text-xs font-semibold mt-0.5">{voice.tagline}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {voice.mood.split(' · ').map(m => (
                      <span key={m} className="bg-white/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fun fact ticker */}
            <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
              <motion.p key={funFact} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} className="text-[10px] text-gray-400 font-mono">
                {FUN_FACTS[funFact]}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Record Panel */}
        <div className="card p-5 space-y-4">
          {phase === 'idle' && (
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ background:`linear-gradient(135deg,${voice.color1},${voice.color2})`, boxShadow:`0 0 40px ${voice.glow}` }}>
                  <span className="text-4xl">{voice.emoji}</span>
                </div>
              </div>
              <div>
                <p className="font-display font-bold text-gray-900 dark:text-white">Ready to record</p>
                <p className="text-xs text-gray-400 mt-1">Tap the button · Speak clearly · Max 30 seconds</p>
              </div>
              <button onClick={startRec}
                className="inline-flex items-center gap-2 text-white font-black px-8 py-4 rounded-2xl text-base transition-all active:scale-95"
                style={{ background:`linear-gradient(135deg,${voice.color1},${voice.color2})`, boxShadow:`0 8px 24px ${voice.glow}` }}>
                <Mic className="w-5 h-5" />Hold & Speak
              </button>
            </div>
          )}

          {phase === 'recording' && (
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse" style={{ background:`linear-gradient(135deg,${voice.color1},${voice.color2})`, boxShadow:`0 0 60px ${voice.glow}` }}>
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 animate-ping opacity-40" style={{ borderColor:voice.color1 }} />
              </div>
              <div>
                <p className="font-display font-bold text-gray-900 dark:text-white text-lg">🔴 Recording...</p>
                <p className="text-2xl font-black text-red-500 font-mono">{seconds}s / 30s</p>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-200 rounded-full mt-2 max-w-xs mx-auto overflow-hidden">
                  <div className="h-full rounded-full transition-all bg-red-500" style={{ width:`${(seconds/30)*100}%` }} />
                </div>
              </div>
              <button onClick={stopRec}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black px-8 py-4 rounded-2xl text-base transition-all active:scale-95 shadow-lg">
                <Square className="w-5 h-5" />Stop Recording
              </button>
            </div>
          )}

          {phase === 'processing' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background:`linear-gradient(135deg,${voice.color1},${voice.color2})` }}>
                <span className="text-3xl animate-spin inline-block">{voice.emoji}</span>
              </div>
              <div>
                <p className="font-display font-bold text-gray-900 dark:text-white">Transforming your voice...</p>
                <p className="text-xs text-gray-400 mt-1">DSP magic in progress ✨</p>
              </div>
              <div className="flex justify-center gap-1.5">
                {[0,100,200,300,400].map(d => (
                  <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background:voice.color1, animationDelay:`${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {phase === 'done' && changedUrl && (
            <div className="space-y-4">
              {/* Reaction message */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background:`linear-gradient(135deg,${voice.color1},${voice.color2})`, boxShadow:`0 8px 24px ${voice.glow}` }}>
                  <span className="text-3xl">{voice.emoji}</span>
                </div>
                <p className="font-display font-black text-gray-900 dark:text-white text-lg">Voice transformed! 🎉</p>
                <p className="text-xs text-gray-400 mt-1">Play it, save it, share it — people will react!</p>
              </div>

              {/* Playback comparison */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => rawUrl && playAudio(rawUrl, 'raw')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${playing==='raw' ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${playing==='raw' ? 'bg-gray-400' : 'bg-gray-300'}`}>
                    {playing==='raw' ? <Square className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                  </div>
                  <p className="text-xs font-bold text-gray-600">Original Voice</p>
                </button>
                <button onClick={() => playAudio(changedUrl, 'changed')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${playing==='changed' ? 'border-transparent' : 'border-gray-200 hover:border-gray-300'}`}
                  style={playing==='changed' ? { background:`linear-gradient(135deg,${voice.color1},${voice.color2})`, borderColor:'transparent' } : {}}>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {playing==='changed' ? <Square className="w-5 h-5 text-white" /> : <span className="text-xl">{voice.emoji}</span>}
                  </div>
                  <p className={`text-xs font-bold ${playing==='changed' ? 'text-white' : 'text-gray-600'}`}>{voice.name} Voice</p>
                </button>
              </div>

              {/* Share caption preview */}
              <div className="bg-gradient-to-br from-pink-50 to-orange-50 border border-pink-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1.5">📱 Viral Caption</p>
                <p className="text-sm text-gray-700 font-medium leading-relaxed mb-1">"{voice.shareCaption}"</p>
                <p className="text-xs text-pink-400 font-mono">{voice.tiktokTag}</p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={shareToClipboard}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 ${shared ? 'bg-green-500 text-white' : 'text-white'}`}
                  style={!shared ? { background:`linear-gradient(135deg,${voice.color1},${voice.color2})`, boxShadow:`0 6px 20px ${voice.glow}` } : {}}>
                  {shared ? <><Check className="w-4 h-4" />Caption Copied!</> : <><Share2 className="w-4 h-4" />Copy Caption</>}
                </button>
                <button onClick={download}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm bg-gray-900 text-white hover:bg-gray-800 transition-all active:scale-95">
                  <Download className="w-4 h-4" />Save .WAV
                </button>
              </div>

              {/* Try again */}
              <button onClick={() => { setPhase('idle'); setChangedUrl(null); setPlaying(null) }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all">
                <RefreshCw className="w-4 h-4" />Record Again
              </button>
            </div>
          )}
        </div>

        {/* Leaderboard / social proof */}
        <div className="card p-4">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">🔥 Most Shared Today</p>
          <div className="space-y-2">
            {[
              { v:VOICES[1], shares:'2,847', reactions:'😂😂😂' },
              { v:VOICES[0], shares:'1,923', reactions:'🥺💕🥺' },
              { v:VOICES[3], shares:'1,456', reactions:'🔥👏🔥' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                <span className="font-black text-gray-400 text-xs w-5">#{i+1}</span>
                <span className="text-xl">{item.v.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-xs text-gray-900 dark:text-white">{item.v.name}</p>
                  <p className="text-[10px] text-gray-400">{item.v.mood}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-gray-700 dark:text-gray-300">{item.shares} shares</p>
                  <p className="text-[10px]">{item.reactions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Upsell */}
        {!isPro && (
          <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background:'linear-gradient(135deg,#7c3aed,#EC4899)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'18px 18px' }} />
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-black text-base mb-1">Unlock Dark Demon 😈 & Magic Fairy 🧚</h3>
                <p className="text-purple-200 text-xs mb-3">Pro users get 2 exclusive voices + unlimited recordings + priority AI</p>
              </div>
              <Link href="/dashboard/billing"
                className="flex-shrink-0 bg-yellow-400 text-yellow-900 rounded-xl px-4 py-2.5 font-black text-xs hover:bg-yellow-300 transition-all">
                Upgrade
              </Link>
            </div>
          </div>
        )}

        {/* Upgrade modal */}
        <AnimatePresence>
          {showUpgrade && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
                transition={{ type:'spring', damping:28, stiffness:300 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <button onClick={() => setShowUpgrade(false)} className="float-right p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 text-lg">×</button>
                <div className="pt-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'linear-gradient(135deg,#7c3aed,#EC4899)' }}>
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-display font-black text-xl text-gray-900 mb-2">Pro Voice Locked 🔒</h2>
                  <p className="text-gray-500 text-sm mb-5">Upgrade to Pro to unlock Demon 😈 & Fairy 🧚 voices + unlimited recordings.</p>
                  <Link href="/dashboard/billing" onClick={() => setShowUpgrade(false)}
                    className="block w-full py-3.5 rounded-xl font-black text-white text-base"
                    style={{ background:'linear-gradient(135deg,#7c3aed,#EC4899)' }}>
                    🚀 Upgrade to Pro — $19/mo
                  </Link>
                  <button onClick={() => setShowUpgrade(false)} className="w-full mt-2 text-sm text-gray-400 py-2">Maybe later</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  )
}
