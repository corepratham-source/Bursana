import { useState } from "react";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";
import OnboardingPage from "./OnboardingPage";

export default function LandingPage({ onLogin }) {
  const [mode, setMode] = useState("login"); 
  // login | register | onboarding

  if (mode === "login" ) {
    return (
      <LoginPage
        onLogin={onLogin}
        goToRegister={() => setMode("register")}
        goToSupplierLogin={() => setMode("supplier")}
      />
    );
  }

  if (mode === "register") {
    return <RegistrationPage 
              goToLogin={() => setMode("login")} 
              goToOnboarding={() => setMode("onboarding")} />;
  }
  if (mode === "onboarding") {
    return <OnboardingPage goToLogin={() => setMode("login")} />;
  }

  return null;
}
