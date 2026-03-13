'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Play, Square, Download, Volume2, Waveform,
  Sparkles, RefreshCw, Heart, Star, Zap, Music2, Share2, Check
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Voice presets ──────────────────────────────────────────────
const VOICES = [
  {
    id: 'baby',
    emoji: '👶',
    label: 'Baby Voice',
    tagline: 'So cute it hurts 🥺',
    desc: 'Adorably tiny, high-pitched baby cooing',
    gradient: 'from-pink-400 to-rose-400',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    pitch: 8,
    rate: 1.15,
    fun: true,
  },
  {
    id: 'chipmunk',
    emoji: '🐿️',
    label: 'Chipmunk',
    tagline: 'Speedy & squeaky 🥜',
    desc: 'Super fast chipmunk energy',
    gradient: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    pitch: 10,
    rate: 1.35,
    fun: true,
  },
  {
    id: 'cartoon',
    emoji: '🐭',
    label: 'Cartoon Mouse',
    tagline: 'Squeaky & playful 🧀',
    desc: 'Classic cartoon character voice',
    gradient: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    pitch: 12,
    rate: 1.2,
    fun: true,
  },
  {
    id: 'hero',
    emoji: '🦸',
    label: 'Action Hero',
    tagline: 'Deep & powerful 💪',
    desc: 'Cinematic superhero voice',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    pitch: -6,
    rate: 0.88,
    fun: false,
  },
  {
    id: 'aged',
    emoji: '👴',
    label: 'Wise Elder',
    tagline: 'Slow & wise 📜',
    desc: 'Warm grandparent story-time voice',
    gradient: 'from-orange-400 to-amber-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    pitch: -4,
    rate: 0.8,
    fun: false,
  },
  {
    id: 'robot',
    emoji: '🤖',
    label: 'Robot',
    tagline: 'BEEP BOOP 🔧',
    desc: 'Mechanical metallic robot',
    gradient: 'from-slate-500 to-gray-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    pitch: 0,
    rate: 0.95,
    fun: true,
  },
]

// Audio processing using Web Speech API + AudioContext pitch shifting
function usePitchShift() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const processAudioBlob = useCallback(async (
    blob: Blob,
    pitch: number,
    rate: number,
    isRobot = false
  ): Promise<Blob> => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioCtxRef.current

    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

    // Create offline context for processing
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      Math.ceil(audioBuffer.length / rate),
      audioBuffer.sampleRate
    )

    const source = offlineCtx.createBufferSource()
    source.buffer = audioBuffer
    source.playbackRate.value = rate

    // Pitch shift via detune (100 cents = 1 semitone)
    source.detune.value = pitch * 100

    let lastNode: AudioNode = source

    if (isRobot) {
      // Ring modulation for robot effect
      const osc = offlineCtx.createOscillator()
      const gain = offlineCtx.createGain()
      const ringGain = offlineCtx.createGain()
      osc.frequency.value = 150
      osc.type = 'sine'
      gain.gain.value = 0.5
      ringGain.gain.value = 0.7
      osc.connect(gain)
      gain.connect(ringGain.gain)
      lastNode.connect(ringGain)
      osc.start()
      lastNode = ringGain
    }

    // Soft compressor for cleaner output
    const compressor = offlineCtx.createDynamicsCompressor()
    compressor.threshold.value = -20
    compressor.knee.value = 10
    compressor.ratio.value = 4
    compressor.attack.value = 0.002
    compressor.release.value = 0.1

    lastNode.connect(compressor)
    compressor.connect(offlineCtx.destination)
    source.start(0)

    const rendered = await offlineCtx.startRendering()

    // Convert AudioBuffer → WAV Blob
    const wavBlob = audioBufferToWav(rendered)
    return wavBlob
  }, [])

  return { processAudioBlob }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate  = buffer.sampleRate
  const format      = 1 // PCM
  const bitDepth    = 16
  const blockAlign  = (numChannels * bitDepth) / 8
  const byteRate    = sampleRate * blockAlign
  const dataSize    = buffer.length * blockAlign
  const headerSize  = 44

  const arrayBuffer = new ArrayBuffer(headerSize + dataSize)
  const view        = new DataView(arrayBuffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeStr(0,  'RIFF')
  view.setUint32(4,  36 + dataSize, true)
  writeStr(8,  'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

// Animated waveform bars
function WaveformViz({ active, color }: { active: boolean; color: string }) {
  const bars = 20
  return (
    <div className="flex items-center justify-center gap-0.5 h-12">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={active ? {
            height: [4, Math.random() * 36 + 8, 4],
            opacity: [0.4, 1, 0.4],
          } : { height: 4, opacity: 0.3 }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function VoiceChangerPage() {
  const { user, loading, logout } = useAuth()
  const { processAudioBlob } = usePitchShift()

  const [selectedVoice, setSelectedVoice] = useState(VOICES[0])
  const [isRecording, setIsRecording]     = useState(false)
  const [isProcessing, setIsProcessing]   = useState(false)
  const [isPlaying, setIsPlaying]         = useState(false)
  const [rawBlob, setRawBlob]             = useState<Blob | null>(null)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [processedUrl, setProcessedUrl]   = useState<string | null>(null)
  const [recordTime, setRecordTime]       = useState(0)
  const [hearts, setHearts]               = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const audioRef         = useRef<HTMLAudioElement | null>(null)
  const timerRef         = useRef<NodeJS.Timeout | null>(null)
  const prevUrlRef       = useRef<string | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRawBlob(blob)
        setProcessedBlob(null)
        setProcessedUrl(null)
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start(100)
      mediaRecorderRef.current = mr
      setIsRecording(true)
      setRecordTime(0)
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000)
    } catch {
      toast.error('Microphone access denied. Please allow mic in browser settings.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const applyVoice = async (voice = selectedVoice) => {
    if (!rawBlob) { toast.error('Record something first! 🎙️'); return }
    setIsProcessing(true)
    try {
      const processed = await processAudioBlob(
        rawBlob,
        voice.pitch,
        voice.rate,
        voice.id === 'robot'
      )
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      const url = URL.createObjectURL(processed)
      prevUrlRef.current = url
      setProcessedBlob(processed)
      setProcessedUrl(url)
      toast.success(`${voice.emoji} ${voice.label} applied!`)
      // Shoot hearts for fun voices
      if (voice.fun) {
        setHearts(prev => [...prev, Date.now()])
        setTimeout(() => setHearts(prev => prev.slice(1)), 1500)
      }
    } catch (e) {
      toast.error('Voice processing failed. Try a shorter recording.')
      console.error(e)
    }
    setIsProcessing(false)
  }

  const playProcessed = () => {
    if (!processedUrl) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    const audio = new Audio(processedUrl)
    audioRef.current = audio
    setIsPlaying(true)
    audio.onended = () => setIsPlaying(false)
    audio.play()
  }

  const stopPlaying = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setIsPlaying(false)
  }

  const downloadVoice = () => {
    if (!processedBlob) return
    const a = document.createElement('a')
    a.href = processedUrl!
    a.download = `textife-${selectedVoice.id}-voice.wav`
    a.click()
    toast.success('🎉 Downloaded! Share it on socials!')
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="w-full max-w-2xl mx-auto space-y-5 pb-8 relative">

        {/* Floating hearts animation */}
        <AnimatePresence>
          {hearts.map(id => (
            <motion.div key={id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -80, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className="fixed left-1/2 bottom-32 z-50 pointer-events-none text-4xl"
              style={{ translateX: '-50%' }}
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 40%, #a855f7 80%, #6366f1 100%)' }}>
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🎙️</span>
              <Music2 className="w-6 h-6 text-pink-200" />
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">Voice Changer</h1>
            <p className="text-pink-100 text-sm">Transform your voice into baby, cartoon, hero & more. Download & share!</p>
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {['🎉 Fun', '💕 Cute', '🦸 Epic', '📲 Shareable'].map(tag => (
                <span key={tag} className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold">{tag}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── VOICE SELECTOR ── */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Choose Your Voice ✨</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VOICES.map((v, i) => (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedVoice(v)
                  setProcessedBlob(null)
                  setProcessedUrl(null)
                  if (rawBlob) setTimeout(() => applyVoice(v), 100)
                }}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                  selectedVoice.id === v.id
                    ? `${v.border} ${v.bg} shadow-md scale-[1.02]`
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {selectedVoice.id === v.id && (
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br ${v.gradient} flex items-center justify-center`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-3xl block mb-2 leading-none">{v.emoji}</span>
                <p className={`font-display font-black text-sm ${selectedVoice.id === v.id ? v.text : 'text-gray-900'}`}>
                  {v.label}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{v.tagline}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── RECORDER ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          {/* Selected voice display */}
          <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${selectedVoice.bg} border ${selectedVoice.border}`}>
            <span className="text-2xl leading-none">{selectedVoice.emoji}</span>
            <div>
              <p className={`font-bold text-sm ${selectedVoice.text}`}>{selectedVoice.label}</p>
              <p className="text-xs text-gray-500">{selectedVoice.desc}</p>
            </div>
            <div className={`ml-auto px-2 py-1 rounded-lg bg-gradient-to-r ${selectedVoice.gradient} text-white text-[10px] font-black`}>
              ACTIVE
            </div>
          </div>

          {/* Waveform visualization */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <WaveformViz
              active={isRecording || isPlaying}
              color={isRecording ? 'bg-red-400' : isPlaying ? 'bg-indigo-400' : 'bg-gray-300'}
            />
            <div className="text-center mt-1">
              {isRecording && (
                <p className="text-xs font-bold text-red-500 animate-pulse">
                  🔴 Recording... {formatTime(recordTime)}
                </p>
              )}
              {isPlaying && <p className="text-xs font-bold text-indigo-500 animate-pulse">🔊 Playing transformed voice...</p>}
              {!isRecording && !isPlaying && !rawBlob && (
                <p className="text-xs text-gray-400">Press record to start 👇</p>
              )}
              {!isRecording && !isPlaying && rawBlob && !processedBlob && (
                <p className="text-xs text-gray-400">Recording ready — apply voice below</p>
              )}
              {processedBlob && !isPlaying && (
                <p className="text-xs text-green-600 font-bold">✅ Voice transformed! Play or download</p>
              )}
            </div>
          </div>

          {/* Record button — big tap target */}
          <div className="flex flex-col items-center gap-3">
            {!isRecording ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', boxShadow: '0 8px 30px rgba(244,63,94,0.4)' }}
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-xl"
                style={{ boxShadow: '0 8px 30px rgba(220,38,38,0.5)' }}
              >
                <Square className="w-7 h-7 text-white fill-white" />
              </motion.button>
            )}
            <p className="text-xs text-gray-400 font-medium">
              {isRecording ? `Tap to stop (${formatTime(recordTime)})` : rawBlob ? 'Tap to re-record' : 'Tap to record your voice'}
            </p>
          </div>

          {/* Apply + Play + Download row */}
          {rawBlob && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 grid grid-cols-1 gap-3">
              {/* Apply voice */}
              <button onClick={() => applyVoice(selectedVoice)} disabled={isProcessing}
                className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${selectedVoice.gradient.replace('from-', '').replace(' to-', ', ')})`,
                  background: 'linear-gradient(135deg, #f43f5e, #a855f7)',
                  boxShadow: '0 6px 20px rgba(244,63,94,0.35)'
                }}>
                {isProcessing
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Transforming magic...</>
                  : <><Sparkles className="w-4 h-4" /> {selectedVoice.emoji} Apply {selectedVoice.label}</>
                }
              </button>

              {/* Play + Download */}
              {processedBlob && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={isPlaying ? stopPlaying : playProcessed}
                    className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-2 ${
                      isPlaying
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    }`}>
                    {isPlaying
                      ? <><Square className="w-4 h-4 fill-current" /> Stop</>
                      : <><Play className="w-4 h-4 fill-current" /> Play</>
                    }
                  </button>
                  <button onClick={downloadVoice}
                    className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 transition-all">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* ── SHARE TIPS ── */}
        {processedBlob && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-pink-600" />
              <p className="font-bold text-sm text-gray-900">Share Ideas 📲</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { platform: '📸 Instagram', tip: 'Use as Reel voiceover' },
                { platform: '🎵 TikTok',    tip: 'Duet or stitch with it' },
                { platform: '💬 WhatsApp',  tip: 'Send as voice note' },
                { platform: '🐦 Twitter',   tip: 'Post as voice tweet' },
              ].map(s => (
                <div key={s.platform} className="bg-white rounded-xl p-3 border border-pink-100">
                  <p className="text-sm font-bold text-gray-900">{s.platform}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.tip}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-pink-500 font-bold mt-3">
              💕 Tag us @Textife when you post!
            </p>
          </motion.div>
        )}

        {/* ── HOW TO USE ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> How to use
          </p>
          <div className="space-y-3">
            {[
              { step: '1', icon: '🎙️', title: 'Pick a voice', desc: 'Choose baby, chipmunk, hero, robot or more' },
              { step: '2', icon: '🔴', title: 'Record yourself', desc: 'Tap the red button and speak naturally' },
              { step: '3', icon: '✨', title: 'Apply the magic', desc: 'Hit Apply and hear your transformed voice' },
              { step: '4', icon: '📲', title: 'Download & share', desc: 'Save the WAV file and post on social media' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{s.icon} {s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  )
}
