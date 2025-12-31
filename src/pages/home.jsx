import { useState, useEffect } from "react";
import { Canvas } from "@/components/r3f/Canvas";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePerformance } from "@/hooks/usePerformance";
import { useTunnel } from "@/hooks/useTunnel";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const performance = usePerformance();
  const tunnel = useTunnel();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleResetSimulation = () => {
    tunnel.reset();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-screen relative space-gradient">
      <h2 className='absolute text-center left-1/2 inline-block pt-[2rem] font-["Ubuntu"] -translate-x-1/2 text-white hover:text-[#895fe9]'>
        Click anywhere to Start exploring!
      </h2>
      <Canvas tunnel={tunnel} />
    </div>
  );
}
