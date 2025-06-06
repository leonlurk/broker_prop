import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Home from "./components/Home";
import TradingChallenge from './components/TradingChallenge';
import PipCalculator from './components/PipCalculator';
import CertificateComponent from './components/CertificateComponent';
import LeaderboardModal from './components/LeaderboardModal';
import TradingDashboard from './components/TradingDashboard';
import OperationsHistory from './components/OperationsHistory';
import Descargas from './components/Descargas';
import AfiliadosDashboard from './components/AfiliadosDashboard';
import Noticias2 from './components/Noticias2';
import TradingAccounts from "./components/TradingAccounts";
import CompetitionCards from "./components/CompetitionCards";
import Settings from "./components/Settings";

const Dashboard = ({ onLogout }) => {
  const [selectedOption, setSelectedOption] = useState("Dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [previousSection, setPreviousSection] = useState("Dashboard");
  
  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Función para renderizar el contenido según la opción seleccionada
  const renderContent = () => {
    // Si estamos en Dashboard y hay una cuenta seleccionada, mostrar TradingDashboard
    if (selectedOption === "Dashboard" && selectedAccount !== null) {
      return <TradingDashboard 
        accountId={selectedAccount} 
        onBack={() => setSelectedAccount(null)}
        previousSection={previousSection}
      />;
    }
    
    // Si estamos mostrando la configuración
    if (showSettings) {
      return <Settings onBack={() => setShowSettings(false)} />;
    }
    
    switch (selectedOption) {
      case "Dashboard":
        return <Home 
          onViewDetails={(accountId) => {
            setPreviousSection(selectedOption); 
            setSelectedAccount(accountId);
          }} 
          onSettingsClick={() => setShowSettings(true)}
          setSelectedOption={setSelectedOption}
        />;
      case "Certificados":
        return <CertificateComponent />;
      case "Pagos":
        return <OperationsHistory />;
      case "Desafio":
        return <TradingChallenge />;
      case "Calculadora":
        return <PipCalculator />;
      case "Competicion":
        return <CompetitionCards />;
      case "Leaderboard":
        return <LeaderboardModal />;
      case "Descargas":
        return <Descargas />;
      case "Afiliados":
        return <AfiliadosDashboard />;
      case "Noticias":
        return <Noticias2 />;
      case "Cuentas":
        return <TradingAccounts 
          setSelectedOption={setSelectedOption}
          setSelectedAccount={setSelectedAccount}
        />;
      case "PropFirm":
        return (
          <div className="p-6 bg-[#232323] text-white">
            <h1 className="text-2xl font-semibold mb-4">Prop Firm</h1>
            <p className="text-gray-400">Gestiona tus cuentas de Prop Firm.</p>
          </div>
        );
      case "Broker":
        return (
          <div className="p-6 bg-[#232323] text-white">
            <h1 className="text-2xl font-semibold mb-4">Broker</h1>
            <p className="text-gray-400">Gestiona tus cuentas de Broker.</p>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{selectedOption}</h1>
            <p className="text-gray-600">Contenido en construcción...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#232323] relative overflow-x-hidden">
      {/* El Sidebar siempre está presente y funcional, independientemente de la subsección activa */}
      <Sidebar 
        selectedOption={selectedOption} 
        setSelectedOption={(option) => {
          // Al navegar desde el sidebar a una nueva sección, resetear estados de subsecciones
          setSelectedOption(option);
          setSelectedAccount(null);
          setShowSettings(false);
        }}
        onLogout={onLogout}
      />
      <main className={`p-4 ${isMobile ? 'w-full ml-0' : 'ml-[300px] w-[calc(100%-300px)]'} transition-all duration-300 overflow-y-auto h-screen`}>
        <div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;