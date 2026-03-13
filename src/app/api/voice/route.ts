import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

// Voice transformation using Web Audio API parameters
// This endpoint returns audio processing config for client-side Web Audio processing
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { voiceType } = await req.json()

    // Return processing parameters for each voice type
    const voiceConfigs: Record<string, any> = {
      baby: {
        label: '👶 Baby Voice',
        pitchShift: 8,        // semitones up
        tempo: 1.15,           // slightly faster
        reverb: 0.1,
        eq: { bass: -6, mid: 2, treble: 6 },
        description: 'Adorable tiny baby voice'
      },
      cartoon: {
        label: '🐭 Cartoon Mouse',
        pitchShift: 12,
        tempo: 1.25,
        reverb: 0.05,
        eq: { bass: -8, mid: 4, treble: 8 },
        description: 'Squeaky cartoon character'
      },
      hero: {
        label: '🦸 Action Hero',
        pitchShift: -6,
        tempo: 0.88,
        reverb: 0.35,
        eq: { bass: 8, mid: 2, treble: -2 },
        description: 'Deep powerful hero voice'
      },
      aged: {
        label: '👴 Wise Elder',
        pitchShift: -4,
        tempo: 0.82,
        reverb: 0.2,
        eq: { bass: 4, mid: -2, treble: -4 },
        description: 'Wise old grandparent voice'
      },
      robot: {
        label: '🤖 Robot',
        pitchShift: 0,
        tempo: 1.0,
        reverb: 0.0,
        eq: { bass: 2, mid: 8, treble: 2 },
        description: 'Mechanical robot voice',
        ringMod: 150
      },
      chipmunk: {
        label: '🐿️ Chipmunk',
        pitchShift: 10,
        tempo: 1.3,
        reverb: 0.08,
        eq: { bass: -10, mid: 6, treble: 10 },
        description: 'Super speedy chipmunk'
      }
    }

    const config = voiceConfigs[voiceType]
    if (!config) return NextResponse.json({ error: 'Unknown voice type' }, { status: 400 })

    return NextResponse.json({ config, voiceType })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
