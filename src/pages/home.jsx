import { useState, useEffect } from "react";
import { Canvas } from "@/components/r3f/Canvas";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePerformance } from "@/hooks/usePerformance";
import { useTunnel } from "@/hooks/useTunnel";
import Navbar from "../components/ui/Navbar";
import MakeItYours from "../components/ui/makeItYours";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const tunnel = useTunnel();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-screen relative space-gradient">
      <Navbar />
      <Canvas tunnel={tunnel} />
      <MakeItYours />
    </div>
  );
}
