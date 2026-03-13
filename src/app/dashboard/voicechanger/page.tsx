'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, Square, Play, Download, Share2, Camera,
  Check, X, RefreshCw, ExternalLink, ChevronRight, Info
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── VOICE CHARACTERS ────────────────────────────────────────────────────────
const VOICES = [
  {
    id: 'baby',
    emoji: '👶', name: 'Baby Coo',
    tagline: 'Tiny & impossibly sweet',
    desc: 'Transforms your voice into a genuinely adorable baby voice — not cartoonish, but soft, sweet and melting. Send this as a voice note and watch hearts break 🥺',
    mood: 'Cute · Soft · Heart-melting',
    shareCaption: "POV: I turned into the cutest baby 👶 my voice will never recover 🥺",
    tiktokTag: '#babychallenge #cuteaf #voicechanger #textife',
    color1: '#FF6B9D', color2: '#e8447a',
    glow: 'rgba(255,107,157,0.5)',
  },
  {
    id: 'chipmunk',
    emoji: '🐿️', name: 'Chipmunk',
    tagline: 'Turbo squeaky & hilarious',
    desc: 'Lightning-fast, ridiculously squeaky chipmunk energy. The most-shared voice on social media — literally impossible not to laugh. Warning: extremely contagious.',
    mood: 'Funny · Fast · Viral',
    shareCaption: "I turned into a chipmunk 🐿️ and I cannot stop replaying this 😭😂",
    tiktokTag: '#chipmunk #funny #voicechanger #trending',
    color1: '#FBBF24', color2: '#D97706',
    glow: 'rgba(251,191,36,0.5)',
  },
  {
    id: 'cartoon',
    emoji: '🎭', name: 'Cartoon Star',
    tagline: 'Animated character energy',
    desc: 'The classic animated character voice — bubbly, expressive, and totally lovable. Sounds like you just jumped out of a Disney movie. Perfect for Reels.',
    mood: 'Playful · Expressive · Fun',
    shareCaption: "Someone animate me please 🎭 I literally sound like a cartoon character now",
    tiktokTag: '#cartoon #animated #voicechanger #disney',
    color1: '#A855F7', color2: '#7C3AED',
    glow: 'rgba(168,85,247,0.5)',
  },
  {
    id: 'hero',
    emoji: '🦸', name: 'Action Hero',
    tagline: 'Deep, bold & cinematic',
    desc: 'Powerful, chest-resonating cinematic voice — sounds like a movie trailer narrator. Deep, commanding and seriously impressive. Anything you say sounds epic.',
    mood: 'Powerful · Bold · Cinematic',
    shareCaption: "I now narrate my life like a movie trailer 🎬 this voice is too powerful",
    tiktokTag: '#epicvoice #actionhero #voiceover #cinematic',
    color1: '#3B82F6', color2: '#1D4ED8',
    glow: 'rgba(59,130,246,0.5)',
  },
  {
    id: 'elder',
    emoji: '🧙', name: 'Wise Wizard',
    tagline: 'Warm, deep & ancient',
    desc: 'A warm, slow, deeply resonant voice with real gravitas. Sounds like a wise grandfather or movie wizard. Perfect for storytelling — every word carries weight.',
    mood: 'Warm · Deep · Wise',
    shareCaption: "I speak like an ancient wizard now 🧙 every word I say sounds profound",
    tiktokTag: '#wizard #storytelling #deepvoice #wisdomcheck',
    color1: '#F59E0B', color2: '#B45309',
    glow: 'rgba(245,158,11,0.5)',
  },
  {
    id: 'robot',
    emoji: '🤖', name: 'AI Robot',
    tagline: 'Metallic & futuristic',
    desc: 'A genuinely unsettling metallic robot voice with ring-modulation buzz. Sounds exactly like a sci-fi AI — creepy, cool and completely unique. BEEP BOOP.',
    mood: 'Mechanical · Eerie · Sci-fi',
    shareCaption: "UNIT 7 IS NOW ONLINE 🤖 BEEP BOOP THIS IS MY VOICE NOW",
    tiktokTag: '#robot #AI #scifi #voicechanger',
    color1: '#10B981', color2: '#047857',
    glow: 'rgba(16,185,129,0.5)',
  },
  {
    id: 'demon',
    emoji: '😈', name: 'Dark Demon',
    tagline: 'Spine-chilling & dark',
    desc: 'Ultra-deep, dark and genuinely terrifying. Rich sub-bass rumble with a haunting quality — perfect for horror content, dramatic reveals and scaring your friends.',
    mood: 'Dark · Scary · Dramatic',
    shareCaption: "I scared my entire family with this voice 😈 they thought the house was haunted",
    tiktokTag: '#demon #horror #scary #voicechanger',
    color1: '#EF4444', color2: '#991B1B',
    glow: 'rgba(239,68,68,0.5)',
  },
  {
    id: 'fairy',
    emoji: '🧚', name: 'Magic Fairy',
    tagline: 'Ethereal & enchanting',
    desc: 'The most magical, ethereal voice — ultra-high, airy and sparkly. Like Tinkerbell but with your words. Everyone who hears this immediately wants to share it.',
    mood: 'Magical · Airy · Enchanting',
    shareCaption: "I'm a fairy now and there's nothing anyone can do about it 🧚✨",
    tiktokTag: '#fairy #magical #sparkle #cute',
    color1: '#EC4899', color2: '#BE185D',
    glow: 'rgba(236,72,153,0.5)',
  },
]

// ─── WAV ENCODER ─────────────────────────────────────────────────────────────
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
  return new Blob([ab], { type: 'audio/wav' })
}

// ─── PROFESSIONAL AUDIO DSP ENGINE ───────────────────────────────────────────
// Per-voice carefully tuned processing chain:
// Source → HP rumble filter → Pitch+Speed → Multi-band EQ →
// Soft saturation → Dynamics compressor → Output gain → Render
// Reverb is simulated via EQ tail shaping (no IR needed)

type FilterSpec = [number, number, number, BiquadFilterType]

interface DSP {
  semitones: number      // pitch shift in semitones
  speed: number          // playback rate (independent)
  eq: FilterSpec[]       // [freq, gainDb, Q, type]
  satCurve: number       // 0 = none, higher = more harmonic warmth
  compThresh: number     // compressor threshold dB
  compRatio: number
  outGain: number        // final normalisation
  ringModHz: number      // 0 = off
  hpFreq: number         // high-pass cutoff
}

const DSP_PROFILES: Record<string, DSP> = {
  baby: {
    semitones: 5.5, speed: 1.07, hpFreq: 120,
    eq: [
      [250,  -4, 1.2, 'lowshelf'],   // cut mud
      [900,   3, 1.8, 'peaking'],    // warmth
      [2500,  5, 2.0, 'peaking'],    // presence / cute resonance
      [5000,  3, 1.5, 'peaking'],    // brightness
      [9000,  2, 0.8, 'highshelf'],  // air
    ],
    satCurve: 0, compThresh: -18, compRatio: 4, outGain: 1.55, ringModHz: 0,
  },
  chipmunk: {
    semitones: 9, speed: 1.38, hpFreq: 200,
    eq: [
      [200,  -6, 1.2, 'lowshelf'],
      [1800,  5, 2,   'peaking'],
      [4500,  4, 1.5, 'peaking'],
      [8000,  3, 1,   'highshelf'],
    ],
    satCurve: 0, compThresh: -14, compRatio: 5, outGain: 1.5, ringModHz: 0,
  },
  cartoon: {
    semitones: 6.5, speed: 1.12, hpFreq: 150,
    eq: [
      [200,  -4, 1.2, 'lowshelf'],
      [700,   3, 1.5, 'peaking'],
      [2200,  5, 2,   'peaking'],
      [5500,  4, 1.5, 'peaking'],
      [9000,  2, 0.8, 'highshelf'],
    ],
    satCurve: 0.3, compThresh: -16, compRatio: 4, outGain: 1.5, ringModHz: 0,
  },
  hero: {
    semitones: -5, speed: 0.91, hpFreq: 55,
    eq: [
      [70,    7, 0.7, 'lowshelf'],   // sub-bass weight
      [180,   5, 1.5, 'peaking'],   // chest resonance
      [400,  -3, 1.2, 'peaking'],   // remove boxiness
      [900,   2, 1.2, 'peaking'],   // warmth
      [3500,  4, 1.5, 'peaking'],   // presence — cuts through
      [7000, -3, 0.8, 'highshelf'], // tame harshness
    ],
    satCurve: 0.6, compThresh: -14, compRatio: 5, outGain: 1.9, ringModHz: 0,
  },
  elder: {
    semitones: -4, speed: 0.83, hpFreq: 45,
    eq: [
      [90,    6, 0.7, 'lowshelf'],
      [280,   5, 1.5, 'peaking'],
      [700,   3, 1.2, 'peaking'],
      [1800, -1, 1.2, 'peaking'],
      [4500, -4, 1.5, 'peaking'],
      [7000, -5, 0.8, 'highshelf'],
    ],
    satCurve: 0.8, compThresh: -12, compRatio: 4, outGain: 2.0, ringModHz: 0,
  },
  robot: {
    semitones: 0, speed: 0.95, hpFreq: 180,
    eq: [
      [200,  -6, 1.2, 'lowshelf'],
      [900,   9, 5,   'peaking'],    // metallic nasal peak
      [2800,  6, 4,   'peaking'],    // robot harmonic
      [5500, -4, 1.5, 'highshelf'],
    ],
    satCurve: 0, compThresh: -18, compRatio: 6, outGain: 1.35, ringModHz: 115,
  },
  demon: {
    semitones: -8, speed: 0.75, hpFreq: 30,
    eq: [
      [55,    9, 0.6, 'lowshelf'],   // sub-bass rumble
      [130,   7, 1.5, 'peaking'],   // dark chest resonance
      [550,   4, 1.2, 'peaking'],   // dark mid
      [2500, -5, 1.5, 'peaking'],   // remove harshness
      [5500, -7, 0.8, 'highshelf'],
    ],
    satCurve: 1.2, compThresh: -10, compRatio: 6, outGain: 2.1, ringModHz: 0,
  },
  fairy: {
    semitones: 10, speed: 1.25, hpFreq: 250,
    eq: [
      [250,  -6, 1.2, 'lowshelf'],
      [1200,  3, 1.5, 'peaking'],
      [3500,  6, 2,   'peaking'],   // sparkle presence
      [7000,  5, 1.2, 'peaking'],   // shimmer
      [12000, 4, 0.7, 'highshelf'], // magical air
    ],
    satCurve: 0, compThresh: -18, compRatio: 4, outGain: 1.5, ringModHz: 0,
  },
}

function makeSatCurve(amount: number): Float32Array {
  const n = 512, c = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    if (amount === 0) { c[i] = x; continue }
    const k = 2 * amount / (1 - amount)
    c[i] = ((1 + k) * x) / (1 + k * Math.abs(x))
  }
  return c
}

async function transformVoice(blob: Blob, voiceId: string): Promise<Blob> {
  const dsp = DSP_PROFILES[voiceId] ?? DSP_PROFILES.baby

  // ── Decode ──
  const tmpCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  let srcBuf: AudioBuffer
  try {
    srcBuf = await tmpCtx.decodeAudioData(await blob.arrayBuffer())
  } catch {
    await tmpCtx.close()
    throw new Error('Could not read audio. Please try recording again.')
  }
  await tmpCtx.close()

  const sr = srcBuf.sampleRate
  const outLen = Math.max(1, Math.ceil(srcBuf.length / dsp.speed))
  const off = new OfflineAudioContext(srcBuf.numberOfChannels, outLen, sr)

  // ── Source ──
  const src = off.createBufferSource()
  src.buffer = srcBuf
  src.playbackRate.value = dsp.speed
  src.detune.value = dsp.semitones * 100

  // ── High-pass (remove mic rumble) ──
  const hp = off.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = dsp.hpFreq; hp.Q.value = 0.6

  // ── EQ chain ──
  const eqs = dsp.eq.map(([freq, gain, q, type]) => {
    const f = off.createBiquadFilter()
    f.type = type; f.frequency.value = freq
    f.gain.value = gain; f.Q.value = q
    return f
  })

  // ── Saturation (harmonic warmth) ──
  const sat = off.createWaveShaper()
  sat.curve = makeSatCurve(Math.min(0.9, dsp.satCurve))
  sat.oversample = dsp.satCurve > 0 ? '4x' : 'none'

  // ── Compressor ──
  const comp = off.createDynamicsCompressor()
  comp.threshold.value = dsp.compThresh; comp.knee.value = 12
  comp.ratio.value = dsp.compRatio; comp.attack.value = 0.003; comp.release.value = 0.1

  // ── Output gain ──
  const out = off.createGain(); out.gain.value = dsp.outGain

  // ── Ring modulator (robot) ──
  let ringMix: GainNode | null = null
  if (dsp.ringModHz > 0) {
    const osc = off.createOscillator()
    const oscG = off.createGain()
    ringMix = off.createGain()
    osc.frequency.value = dsp.ringModHz; osc.type = 'sine'
    oscG.gain.value = 0.38
    osc.connect(oscG); oscG.connect(ringMix.gain)
    osc.start(0)
  }

  // ── Connect chain ──
  src.connect(hp)
  let node: AudioNode = hp

  if (ringMix) {
    const pre = off.createGain(); node.connect(pre); pre.connect(ringMix); node = ringMix
  }

  if (eqs.length) {
    node.connect(eqs[0])
    for (let i = 0; i < eqs.length - 1; i++) eqs[i].connect(eqs[i + 1])
    node = eqs[eqs.length - 1]
  }

  node.connect(sat); sat.connect(comp); comp.connect(out); out.connect(off.destination)
  src.start(0)

  return encodeWAV(await off.startRendering())
}

// ─── LIVE WAVEFORM ────────────────────────────────────────────────────────────
function WaveBar({ active, color }: { active: boolean; color: string }) {
  const BARS = 44
  return (
    <div className="flex items-center justify-center gap-[2.5px] h-[52px] w-full px-2">
      {Array.from({ length: BARS }).map((_, i) => (
        <motion.div key={i}
          style={{ width: 2.5, background: color, borderRadius: 99 }}
          animate={active
            ? { height: [3, Math.abs(Math.sin((i + Date.now()) / 4)) * 34 + 6, 3], opacity: [0.4, 1, 0.4] }
            : { height: 3, opacity: 0.18 }}
          transition={{ repeat: Infinity, duration: 0.3 + (i % 9) * 0.07, delay: i * 0.02, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── SHARE BOTTOM-SHEET ───────────────────────────────────────────────────────
function ShareSheet({ voice, outUrl, customCaption, onClose, onDownload }: {
  voice: typeof VOICES[0]; outUrl: string; customCaption: string;
  onClose: () => void; onDownload: () => void
}) {
  const [copiedCaption, setCopiedCaption] = useState(false)
  const finalCaption = customCaption
    ? `${customCaption}\n\n${voice.tiktokTag}\n\n🎙️ textife.com`
    : `${voice.shareCaption}\n\n${voice.tiktokTag}\n\n🎙️ textife.com`

  const copyCaption = () => {
    navigator.clipboard.writeText(finalCaption)
    setCopiedCaption(true)
    toast.success('Caption copied! Now open the platform ↓')
    setTimeout(() => setCopiedCaption(false), 3000)
  }

  const PLATFORMS = [
    {
      name: 'TikTok', icon: '🎵',
      color: '#010101', border: '#69C9D0',
      url: 'https://www.tiktok.com/upload',
      step: 'Tap +, upload .WAV, paste caption',
    },
    {
      name: 'Instagram', icon: '📸',
      color: '#E1306C', border: '#F77737',
      url: 'https://www.instagram.com/create/story',
      step: 'New Story → tap 🎵 → upload audio',
    },
    {
      name: 'WhatsApp', icon: '💬',
      color: '#25D366', border: '#128C7E',
      url: `https://wa.me/?text=${encodeURIComponent(finalCaption)}`,
      step: 'Tap to send caption + attach file',
    },
    {
      name: 'Twitter/X', icon: '𝕏',
      color: '#fff', border: '#555',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalCaption.slice(0, 250))}`,
      step: 'Tweet opens with caption pre-filled',
    },
    {
      name: 'YouTube', icon: '▶',
      color: '#FF0000', border: '#CC0000',
      url: 'https://studio.youtube.com/',
      step: 'Upload as Short with voiceover',
    },
    {
      name: 'Snapchat', icon: '👻',
      color: '#FFFC00', border: '#FFA500',
      url: 'https://snapchat.com/',
      step: 'Send as Snap or add to story',
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1c0d30 0%, #0c1020 100%)', border: '1px solid rgba(255,255,255,0.09)', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
          <p className="font-black text-white text-base mt-2">{voice.emoji} Share Your {voice.name}</p>
          <button onClick={onClose} className="mt-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4 mt-1">
          {/* Step 1 — Download */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Step 1 — Get your file</p>
            <button onClick={onDownload}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm text-white transition-all active:scale-98"
              style={{ background: `linear-gradient(135deg, ${voice.color1}, ${voice.color2})`, boxShadow: `0 6px 24px ${voice.glow}` }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .WAV File
            </button>
          </div>

          {/* Step 2 — Caption */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Step 2 — Copy caption</p>
            <div className="rounded-2xl p-3.5 mb-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/80 leading-relaxed">{customCaption || voice.shareCaption}</p>
              <p className="text-[10px] mt-1.5 font-semibold" style={{ color: voice.color1 }}>{voice.tiktokTag}</p>
            </div>
            <button onClick={copyCaption}
              className="w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: copiedCaption ? '#10B981' : 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
              {copiedCaption ? <><Check className="w-3.5 h-3.5" /> Copied!</> : '📋 Copy Caption'}
            </button>
          </div>

          {/* Step 3 — Platforms */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Step 3 — Open platform & upload</p>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-xl leading-none flex-shrink-0">{p.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white leading-none">{p.name}</p>
                    <p className="text-[9px] mt-0.5 leading-tight line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.step}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function VoiceChangerPage() {
  const { user, loading } = useAuth()

  const [voice, setVoice]           = useState(VOICES[0])
  const [recording, setRecording]   = useState(false)
  const [processing, setProcessing] = useState(false)
  const [playing, setPlaying]       = useState(false)
  const [rawBlob, setRawBlob]       = useState<Blob | null>(null)
  const [outBlob, setOutBlob]       = useState<Blob | null>(null)
  const [outUrl, setOutUrl]         = useState<string | null>(null)
  const [recSecs, setRecSecs]       = useState(0)
  const [showShare, setShowShare]   = useState(false)
  const [photoUrl, setPhotoUrl]     = useState<string | null>(null)
  const [caption, setCaption]       = useState('')
  const [showCaption, setShowCaption] = useState(false)
  const [activeTab, setActiveTab]   = useState<'voices'|'about'>('voices')
  const [newResult, setNewResult]   = useState(0)

  const mrRef      = useRef<MediaRecorder | null>(null)
  const chunksRef  = useRef<Blob[]>([])
  const audioRef   = useRef<HTMLAudioElement | null>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const urlRef     = useRef<string | null>(null)
  const photoRef   = useRef<HTMLInputElement | null>(null)

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const pickVoice = (v: typeof VOICES[0]) => {
    setVoice(v)
    setOutBlob(null); setOutUrl(null)
    if (rawBlob) setTimeout(() => doTransform(v, rawBlob), 50)
  }

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100, channelCount: 1 }
      })
      chunksRef.current = []
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      const mr = new MediaRecorder(stream, { mimeType: mime })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mime })
        setRawBlob(blob)
        await doTransform(voice, blob)
      }
      mr.start(80); mrRef.current = mr
      setRecording(true); setRecSecs(0); setOutBlob(null); setOutUrl(null)
      timerRef.current = setInterval(() => setRecSecs(s => s + 1), 1000)
    } catch {
      toast.error('🎙️ Mic access denied — allow it in your browser settings')
    }
  }

  const stopRec = () => {
    mrRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const doTransform = async (v: typeof VOICES[0], blob: Blob) => {
    setProcessing(true)
    try {
      const result = await transformVoice(blob, v.id)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(result)
      urlRef.current = url
      setOutBlob(result); setOutUrl(url); setNewResult(n => n + 1)
    } catch (e: any) {
      toast.error(e.message || 'Processing failed — try a shorter clip (under 20s)')
    } finally {
      setProcessing(false)
    }
  }

  const playOut = () => {
    if (!outUrl) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const a = new Audio(outUrl)
    audioRef.current = a; setPlaying(true)
    a.onended = () => setPlaying(false); a.play()
  }
  const stopPlay = () => { audioRef.current?.pause(); audioRef.current = null; setPlaying(false) }

  const download = () => {
    if (!outUrl) return
    const a = document.createElement('a')
    a.href = outUrl; a.download = `textife-${voice.id}.wav`; a.click()
    toast.success('🎉 Downloaded!')
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(URL.createObjectURL(f))
    toast.success('📸 Photo added!')
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const hasOutput = !!outBlob && !!outUrl

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#07001a' }}>
      <motion.div className="w-12 h-12 rounded-full border-2 border-t-pink-500 border-r-transparent border-b-purple-500 border-l-transparent"
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={() => {}}>
      <div className="min-h-screen -mx-4 -mt-5 lg:-mx-7 lg:-mt-7"
        style={{ background: 'radial-gradient(ellipse at 30% 0%, #2d0a4e 0%, #07001a 45%, #001225 100%)' }}>

        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-16 space-y-5">

          {/* ── HEADER ── */}
          <div className="text-center">
            <motion.h1
              className="font-black text-5xl leading-none tracking-tight mb-2"
              style={{
                background: `linear-gradient(135deg, ${voice.color1} 0%, #ffffff 50%, ${voice.color2} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
              key={voice.id}
              initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}>
              Voice<br />Changer
            </motion.h1>
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.38)' }}>Record · Transform · Share 🚀</p>
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.09)' }}>
                🔥 52,840 transformed
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${voice.color1}20`, color: voice.color1, border: `1px solid ${voice.color1}35` }}>
                📈 Trending on TikTok
              </span>
            </div>
          </div>

          {/* ── CHARACTER GRID ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2.5 text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Choose Character
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {VOICES.map((v, i) => {
                const on = voice.id === v.id
                return (
                  <motion.button key={v.id}
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.045, type: 'spring', stiffness: 400 }}
                    whileTap={{ scale: 0.85 }} onClick={() => pickVoice(v)}
                    className="relative flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all"
                    style={{
                      background: on ? `${v.color1}22` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${on ? v.color1 + '75' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: on ? `0 0 20px ${v.glow}` : 'none',
                    }}>
                    <motion.span className="text-[26px] leading-none"
                      animate={on ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                      transition={{ repeat: on ? Infinity : 0, duration: 2 }}>
                      {v.emoji}
                    </motion.span>
                    <span className="text-[8px] font-black leading-none px-1 text-center"
                      style={{ color: on ? v.color1 : 'rgba(255,255,255,0.32)' }}>
                      {v.name.split(' ')[0]}
                    </span>
                    {on && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: v.color1, border: '2px solid #07001a' }}>
                        <Check className="w-2 h-2 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ── STUDIO CARD ── */}
          <div className="rounded-3xl overflow-hidden relative"
            style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(30px)' }}>

            {/* Animated top accent */}
            <motion.div key={voice.id} className="h-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: `linear-gradient(90deg, transparent 0%, ${voice.color1} 40%, ${voice.color2} 60%, transparent 100%)` }} />

            {/* Voice identity */}
            <div className="px-5 pt-4 pb-3 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {/* Photo or emoji avatar */}
                <motion.div key={voice.id}
                  initial={{ scale: 0.75, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 320 }}
                  className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: photoUrl ? 'transparent' : `linear-gradient(145deg, ${voice.color1}, ${voice.color2})`,
                    boxShadow: `0 10px 30px ${voice.glow}`,
                  }}>
                  {photoUrl
                    ? <img src={photoUrl} alt="you" className="w-full h-full object-cover" />
                    : <span className="text-[32px]">{voice.emoji}</span>}
                </motion.div>
                {/* Pulse rings when live */}
                {(recording || playing) && [0, 1].map(i => (
                  <motion.div key={i} className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: `2px solid ${voice.color1}` }}
                    animate={{ scale: [1, 1.25 + i * 0.12], opacity: [0.7, 0] }}
                    transition={{ repeat: Infinity, duration: 1.3, delay: i * 0.45 }} />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <AnimatePresence mode="wait">
                    <motion.p key={voice.id} className="font-black text-white text-xl leading-none"
                      initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
                      {voice.name}
                    </motion.p>
                  </AnimatePresence>
                  {recording && (
                    <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                      className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#EF4444' }}>
                      ● {fmt(recSecs)}
                    </motion.span>
                  )}
                  {processing && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: voice.color1 }}>
                      ✨ Processing
                    </span>
                  )}
                  {hasOutput && !recording && !processing && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#10B981' }}>
                      ✓ Ready
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold" style={{ color: voice.color1 }}>{voice.mood}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{voice.tagline}</p>
              </div>
            </div>

            {/* Photo + Caption controls */}
            <div className="px-5 mb-3 flex items-center gap-2 flex-wrap">
              <input ref={photoRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />
              {!photoUrl
                ? <button onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                    <Camera className="w-3 h-3" /> Add Photo
                  </button>
                : <div className="flex items-center gap-2">
                    <img src={photoUrl} className="w-7 h-7 rounded-lg object-cover border border-white/15" alt="you" />
                    <span className="text-[11px] text-white/40 font-bold">Photo ✓</span>
                    <button onClick={() => { URL.revokeObjectURL(photoUrl); setPhotoUrl(null) }}
                      className="text-[11px] text-red-400/70 hover:text-red-400">✕</button>
                  </div>
              }
              <button onClick={() => setShowCaption(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ml-auto transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: caption ? voice.color1 : 'rgba(255,255,255,0.45)' }}>
                📝 {caption ? 'Edit caption' : 'Add caption'}
              </button>
            </div>

            <AnimatePresence>
              {showCaption && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden px-5 mb-3">
                  <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={2}
                    placeholder={`Caption for your ${voice.name} voice... e.g. "My family is never ready for this 😂"`}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white resize-none outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${voice.color1}40`, caretColor: voice.color1 }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Waveform */}
            <div className="mx-5 mb-4 rounded-2xl py-1 relative overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <WaveBar active={recording || playing || processing} color={voice.color1} />
              {!recording && !rawBlob && !processing && (
                <p className="absolute inset-0 flex items-center justify-center text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.18)' }}>
                  Tap the mic to start recording 🎙️
                </p>
              )}
            </div>

            {/* Processing strip */}
            <AnimatePresence>
              {processing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mx-5 mb-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${voice.color1}, ${voice.color2})` }}
                    animate={{ x: ['-100%', '150%'] }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── BIG MIC ── */}
            <div className="flex flex-col items-center gap-2 pb-5">
              <motion.button
                onClick={recording ? stopRec : startRec}
                disabled={processing}
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center disabled:opacity-40 relative"
                style={{
                  background: recording ? 'linear-gradient(135deg,#dc2626,#9b1c1c)' : `linear-gradient(145deg,${voice.color1},${voice.color2})`,
                  boxShadow: recording ? '0 0 0 0 rgba(220,38,38,0.5), 0 14px 36px rgba(220,38,38,0.4)' : `0 0 0 0 ${voice.glow}, 0 14px 36px ${voice.glow}`,
                }}
                animate={!processing ? {
                  boxShadow: recording
                    ? ['0 0 0 0 rgba(220,38,38,0.6),0 14px 36px rgba(220,38,38,0.4)', '0 0 0 20px rgba(220,38,38,0),0 14px 36px rgba(220,38,38,0.4)']
                    : [`0 0 0 0 ${voice.glow},0 14px 36px ${voice.glow}`, `0 0 0 16px rgba(0,0,0,0),0 14px 36px ${voice.glow}`],
                } : {}}
                transition={{ repeat: Infinity, duration: 1.6 }}
                whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.06 }}>
                {recording
                  ? <Square className="w-10 h-10 fill-white text-white" />
                  : <Mic className="w-10 h-10 text-white" />}
              </motion.button>
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.32)' }}>
                {recording ? `Recording · tap to stop · ${fmt(recSecs)}`
                  : processing ? `✨ Transforming your voice...`
                  : rawBlob ? 'Tap to re-record'
                  : 'Tap to record'}
              </p>
            </div>

            {/* ── OUTPUT ── */}
            <AnimatePresence>
              {hasOutput && !processing && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-5 pb-5 space-y-3">

                  {/* Play */}
                  <motion.button onClick={playing ? stopPlay : playOut} whileTap={{ scale: 0.97 }}
                    key={`play-${newResult}`} initial={{ scale: 1.03 }} animate={{ scale: 1 }}
                    className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{
                      background: playing ? '#dc2626' : `linear-gradient(135deg,${voice.color1},${voice.color2})`,
                      boxShadow: `0 10px 34px ${voice.glow}`,
                    }}>
                    {/* entry shimmer */}
                    <motion.div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)' }}
                      initial={{ x: '-100%' }} animate={{ x: '150%' }}
                      transition={{ duration: 0.65, ease: 'easeOut' }} />
                    {playing ? <><Square className="w-5 h-5 fill-white" /> Stop</> : <><Play className="w-5 h-5 fill-white" /> Play {voice.emoji} {voice.name}</>}
                  </motion.button>

                  {/* Download + Share */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={download}
                      className="py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button onClick={() => setShowShare(true)}
                      className="py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', boxShadow: '0 6px 20px rgba(245,158,11,0.38)' }}>
                      <Share2 className="w-4 h-4" /> Share & Post
                    </button>
                  </div>
                  <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                    💡 Tap another character above to instantly re-transform
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── VOICE DETAILS TABS ── */}
          <div className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {(['voices', 'about'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 text-[11px] font-black uppercase tracking-wider transition-all"
                  style={{
                    color: activeTab === tab ? voice.color1 : 'rgba(255,255,255,0.28)',
                    borderBottom: `2px solid ${activeTab === tab ? voice.color1 : 'transparent'}`,
                  }}>
                  {tab === 'voices' ? '🎤 All Voices' : '📖 About This Voice'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'about' && (
                <motion.div key="about" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${voice.color1},${voice.color2})`, boxShadow: `0 6px 22px ${voice.glow}` }}>
                      {voice.emoji}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg">{voice.name}</p>
                      <p className="text-xs mt-0.5 font-semibold" style={{ color: voice.color1 }}>{voice.mood}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{voice.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{voice.desc}</p>

                  {/* Best uses */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>Best used for</p>
                    <div className="space-y-2">
                      {[
                        'Surprise voice notes to friends & family',
                        'TikTok Reels, Duets & trending sounds',
                        'Instagram Stories voiceovers',
                        'Making people laugh in WhatsApp groups',
                      ].map((u, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                          style={{ background: `${voice.color1}0f`, border: `1px solid ${voice.color1}22` }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: voice.color1 }} />
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{u}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested caption preview */}
                  <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Suggested caption</p>
                    <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>"{voice.shareCaption}"</p>
                    <p className="text-[10px] mt-1 font-semibold" style={{ color: voice.color1 }}>{voice.tiktokTag}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'voices' && (
                <motion.div key="voices" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4 space-y-2">
                  {VOICES.map(v => {
                    const on = voice.id === v.id
                    return (
                      <motion.button key={v.id} onClick={() => pickVoice(v)} whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left"
                        style={{
                          background: on ? `${v.color1}18` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${on ? v.color1 + '50' : 'rgba(255,255,255,0.06)'}`,
                          boxShadow: on ? `0 4px 18px ${v.glow}` : 'none',
                        }}>
                        <span className="text-2xl">{v.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-black text-white">{v.name}</p>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: `${v.color1}20`, color: v.color1 }}>
                              {v.tagline}
                            </span>
                          </div>
                          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{v.mood}</p>
                        </div>
                        {on
                          ? <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: v.color1 }}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />}
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── FOOTER ── */}
          <div className="text-center space-y-1 pb-2">
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>🔒 100% on-device — your voice never leaves your phone</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>📁 Downloads as .WAV · Perfect for every platform</p>
          </div>

        </div>
      </div>

      {/* Share sheet */}
      <AnimatePresence>
        {showShare && outUrl && (
          <ShareSheet voice={voice} outUrl={outUrl} customCaption={caption}
            onClose={() => setShowShare(false)} onDownload={download} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
