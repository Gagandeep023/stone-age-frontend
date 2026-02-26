import { useCallback, useRef } from 'react';
import type { CameraPreset, AnimationEventType } from '../types/three.js';

const CAMERA_PRESETS: Record<string, CameraPreset> = {
  overview: { position: [0, 18, 14], target: [0, 0, 0] },
  workerPlacement: { position: [0, 16, 12], target: [0, 0, 0] },
  actionResolution: { position: [-2, 12, 10], target: [-2, 0, 0] },
  feeding: { position: [2, 14, 10], target: [0, 0, 0] },
  closeUp: { position: [0, 8, 8], target: [0, 0, 0] },
  victory: { position: [0, 20, 16], target: [0, 0, 0] },
};

export function useCameraController() {
  const targetPresetRef = useRef<CameraPreset>(CAMERA_PRESETS.overview);

  const getPresetForPhase = useCallback((phase: string): CameraPreset => {
    return CAMERA_PRESETS[phase] || CAMERA_PRESETS.overview;
  }, []);

  const getPresetForAnimation = useCallback((type: AnimationEventType): CameraPreset | null => {
    switch (type) {
      case 'diceRoll': return CAMERA_PRESETS.closeUp;
      case 'gameOver': return CAMERA_PRESETS.victory;
      default: return null;
    }
  }, []);

  const setPreset = useCallback((preset: CameraPreset) => {
    targetPresetRef.current = preset;
  }, []);

  const reset = useCallback(() => {
    targetPresetRef.current = CAMERA_PRESETS.overview;
  }, []);

  return {
    targetPreset: targetPresetRef.current,
    getPresetForPhase,
    getPresetForAnimation,
    setPreset,
    reset,
    presets: CAMERA_PRESETS,
  };
}
