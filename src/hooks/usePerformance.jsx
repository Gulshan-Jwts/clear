import { useState, useEffect } from "react";

export function usePerformance() {
  const [fps, setFps] = useState(60);
  const [renderCalls, setRenderCalls] = useState(847);
  const [triangles, setTriangles] = useState("12.4K");
  const [memory, setMemory] = useState("32MB");
  const [uptime, setUptime] = useState("0:00");
  const [level, setLevel] = useState("High");

  useEffect(() => {
    const startTime = Date.now();
    
    const updatePerformance = () => {
      // Simulate realistic performance metrics
      const currentFps = Math.floor(Math.random() * 10) + 55;
      const currentRenderCalls = Math.floor(Math.random() * 100) + 800;
      const currentTriangles = (Math.random() * 5 + 10).toFixed(1) + "K";
      const currentMemory = Math.floor(Math.random() * 10) + 28 + "MB";
      
      // Calculate uptime
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const currentUptime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Determine performance level
      let currentLevel = "High";
      if (currentFps < 30) currentLevel = "Low";
      else if (currentFps < 45) currentLevel = "Medium";
      
      setFps(currentFps);
      setRenderCalls(currentRenderCalls);
      setTriangles(currentTriangles);
      setMemory(currentMemory);
      setUptime(currentUptime);
      setLevel(currentLevel);
    };

    const interval = setInterval(updatePerformance, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    fps,
    renderCalls,
    triangles,
    memory,
    uptime,
    level
  };
}