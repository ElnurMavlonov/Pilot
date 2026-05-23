import { useRef, useCallback } from 'react'
import { useSimulationStore } from '../stores/simulationStore'

export default function useAudio() {
  const audioCtx = useRef(null)
  const buzzerOsc = useRef(null)
  const buzzerGain = useRef(null)
  const currentFreq = useRef(0)

  const ensureCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
    }
  }, [])

  const startTone = useCallback((freq) => {
    if (useSimulationStore.getState().audioMuted) return
    ensureCtx()
    if (buzzerOsc.current && currentFreq.current === freq) return
    stopTone()
    buzzerGain.current = audioCtx.current.createGain()
    buzzerGain.current.gain.setValueAtTime(0.25, audioCtx.current.currentTime)
    buzzerGain.current.connect(audioCtx.current.destination)
    buzzerOsc.current = audioCtx.current.createOscillator()
    buzzerOsc.current.type = 'square'
    buzzerOsc.current.frequency.setValueAtTime(freq, audioCtx.current.currentTime)
    buzzerOsc.current.connect(buzzerGain.current)
    buzzerOsc.current.start()
    currentFreq.current = freq
  }, [ensureCtx])

  const stopTone = useCallback(() => {
    if (buzzerOsc.current) {
      try {
        buzzerGain.current.gain.setTargetAtTime(0, audioCtx.current.currentTime, 0.05)
        buzzerOsc.current.stop(audioCtx.current.currentTime + 0.1)
      } catch {}
      buzzerOsc.current = null
      buzzerGain.current = null
      currentFreq.current = 0
    }
  }, [])

  return { startTone, stopTone }
}
