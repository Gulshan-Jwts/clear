import { useState, useCallback } from "react";

export function useTunnel() {
  const [speed, setSpeed] = useState(30);
  const [tunnelSize, setTunnelSize] = useState(90);
  const [shapeMode, setShapeMode] = useState(3);
  const [starCount, setStarCount] = useState(1000);
  const [colorScheme, setColorScheme] = useState("default");
  const [settings, setSettings] = useState({
    antialiasing: true,
    tunnelRings: true,
    qualityLevel: "medium"
  });

  const reset = useCallback(() => {
    setSpeed(30);
    setTunnelSize(100);
    setShapeMode(3);
    setStarCount(2000);
    setColorScheme("default");
    setSettings({
      antialiasing: true,
      tunnelRings: true,
      qualityLevel: "medium"
    });
  }, []);

  const setAntialiasing = useCallback((value) => {
    setSettings(prev => ({ ...prev, antialiasing: value }));
  }, []);

  const setTunnelRings = useCallback((value) => {
    setSettings(prev => ({ ...prev, tunnelRings: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({
      antialiasing: true,
      tunnelRings: true,
      qualityLevel: "medium"
    });
  }, []);

  const saveSettings = useCallback(() => {
    localStorage.setItem('tunnelSettings', JSON.stringify(settings));
  }, [settings]);

  return {
    speed,
    tunnelSize,
    shapeMode,
    starCount,
    colorScheme,
    settings,
    setSpeed,
    setTunnelSize,
    setShapeMode,
    setStarCount,
    setColorScheme,
    setAntialiasing,
    setTunnelRings,
    reset,
    resetSettings,
    saveSettings
  };
}