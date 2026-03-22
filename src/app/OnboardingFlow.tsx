import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { OnboardingOne } from "./components/OnboardingOne";
import { OnboardingTwo } from "./components/OnboardingTwo";
import { OnboardingThree } from "./components/OnboardingThree";
import { LoadingScreen } from "./components/LoadingScreen";
import WaterRippleCanvas from "./components/WaterRippleCanvas";

export default function OnboardingFlow() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [showLoading, setShowLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (showLoading) {
      const timer = setTimeout(() => {
        navigate("/feed");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showLoading, navigate]);

  const handleContinue = (name?: string) => {
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // On screen 3, we need a name to continue
      if (name && name.trim()) {
        setUserName(name);
        setShowLoading(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleDotClick = (screen: number) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="relative">
       <WaterRippleCanvas />
      {showLoading ? (
        <LoadingScreen userName={userName} />
      ) : (
        <>
          {/* Screen 1: Intro */}
          {currentScreen === 1 && (
            <OnboardingOne onContinue={handleContinue} onNext={handleContinue} />
          )}
          {/* Screen 2: Half-life explanation */}
          {currentScreen === 2 && (
            <OnboardingThree onContinue={handleContinue} onBack={handlePrevious} onNext={handleContinue} />
          )}
          {/* Screen 3: Name input */}
          {currentScreen === 3 && (
            <OnboardingTwo onContinue={handleContinue} onBack={handlePrevious} />
          )}
        </>
      )}
    </div>
  );
}