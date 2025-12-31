import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 space-gradient z-50 flex items-center justify-center transition-opacity duration-1000">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-[var(--electric)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-[var(--purple)] border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s', animationDuration: '1.5s' }}></div>
        </div>
        <h2 className="text-2xl font-semibold text-[var(--electric)] mb-2">Initializing Space Tunnel</h2>
        <p className="text-gray-400">Preparing WebGL renderer...</p>
        <div className="mt-4 w-64 bg-gray-800 rounded-full h-2 mx-auto">
          <div 
            className="bg-gradient-to-r from-[var(--electric)] to-[var(--purple)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}