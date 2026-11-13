import { Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

/**
 * Polyfill untuk kompatibilitas Accelerometer di platform Web (Expo SDK 58).
 * Mencegah error 'Cannot observe event: deviceorientation' di desktop browser (Chrome/Edge/Safari)
 * tanpa secure context (HTTPS) atau tanpa sensor orientasi fisik.
 * Menyediakan simulasi telemetri stabil gravitasi bumi untuk browser desktop (z ~ 0.98g).
 */
if (Platform.OS === "web") {
  try {
    const nativeModule = (Accelerometer as any)?._nativeModule;
    if (nativeModule) {
      nativeModule.isAvailableAsync = async () => true;
      nativeModule.startObserving = () => {};
      nativeModule.stopObserving = () => {};
      nativeModule.setUpdateInterval = (_intervalMs: number) => {};
    }

    const listeners = new Set<(data: { x: number; y: number; z: number; timestamp: number }) => void>();
    let intervalTimer: any = null;

    // Override Accelerometer.addListener secara langsung untuk platform Web
    Accelerometer.addListener = ((listener: (data: any) => void) => {
      listeners.add(listener);

      if (!intervalTimer) {
        let t = 0;
        intervalTimer = setInterval(() => {
          t += 0.1;
          const simulatedData = {
            x: Number((Math.sin(t * 0.4) * 0.03).toFixed(2)),
            y: Number((Math.cos(t * 0.3) * 0.02).toFixed(2)),
            z: Number((0.98 + Math.sin(t) * 0.01).toFixed(2)),
            timestamp: Date.now() / 1000,
          };
          listeners.forEach((fn) => {
            try {
              fn(simulatedData);
            } catch (err) {
              console.warn("[SensorPolyfill] Error in listener:", err);
            }
          });
        }, 100);
      }

      return {
        remove: () => {
          listeners.delete(listener);
          if (listeners.size === 0 && intervalTimer) {
            clearInterval(intervalTimer);
            intervalTimer = null;
          }
        },
      };
    }) as any;

    Accelerometer.removeAllListeners = () => {
      listeners.clear();
      if (intervalTimer) {
        clearInterval(intervalTimer);
        intervalTimer = null;
      }
    };

    Accelerometer.isAvailableAsync = async () => true;
    Accelerometer.setUpdateInterval = (_interval: number) => {};
  } catch (err) {
    console.warn("[sensorPolyfill] Gagal memasang polyfill accelerometer:", err);
  }
}

export {};
