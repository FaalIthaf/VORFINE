import { Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

/**
 * Polyfill untuk kompatibilitas Accelerometer di platform Web (Expo SDK 58).
 * Pada platform Web, modul internal ExponentAccelerometer tidak menyediakan metode .addListener()
 * sehingga pemanggilan Accelerometer.addListener() dapat menyebabkan crash `this._nativeModule.addListener is not a function`.
 * Polyfill ini memastikan Accelerometer dapat dipanggil dengan aman di Web maupun Mobile.
 */
if (Platform.OS === "web") {
  const nativeModule = (Accelerometer as any)?._nativeModule;

  if (nativeModule) {
    // Pastikan isAvailableAsync mengembalikan true di Web agar UI dapat diuji
    nativeModule.isAvailableAsync = async () => true;

    if (typeof nativeModule.setUpdateInterval !== "function") {
      nativeModule.setUpdateInterval = (_intervalMs: number) => {};
    }

    if (typeof nativeModule.addListener !== "function") {
      const listeners = new Set<(data: any) => void>();
      let intervalTimer: any = null;

      nativeModule.addListener = (
        _eventName: string,
        listener: (data: any) => void
      ) => {
        listeners.add(listener);

        // Coba aktifkan listener browser native jika tersedia
        if (
          typeof window !== "undefined" &&
          typeof nativeModule.startObserving === "function"
        ) {
          try {
            nativeModule.startObserving();
          } catch {
            // Abaikan jika tidak didukung oleh browser desktop
          }
        }

        // Sediakan simulasi telemetri stabil gravitasi bumi untuk browser desktop (z ~ 0.98g)
        if (!intervalTimer) {
          let t = 0;
          intervalTimer = setInterval(() => {
            t += 0.1;
            const simulatedData = {
              x: Math.sin(t * 0.4) * 0.03,
              y: Math.cos(t * 0.3) * 0.02,
              z: 0.98 + Math.sin(t) * 0.01,
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
            if (listeners.size === 0) {
              if (intervalTimer) {
                clearInterval(intervalTimer);
                intervalTimer = null;
              }
              if (typeof nativeModule.stopObserving === "function") {
                try {
                  nativeModule.stopObserving();
                } catch {}
              }
            }
          },
        };
      };

      nativeModule.removeAllListeners = () => {
        listeners.clear();
        if (intervalTimer) {
          clearInterval(intervalTimer);
          intervalTimer = null;
        }
      };

      nativeModule.listenerCount = () => listeners.size;
    }
  }
}

export {};
