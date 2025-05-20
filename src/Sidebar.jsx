import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { 
  RiDashboardLine, 
  RiArrowRightSLine,
  RiMenuLine,
  RiCloseLine,
  RiLogoutBoxRLine
} from "react-icons/ri";
import { useAuth } from "./contexts/AuthContext";
import { getTranslator } from "./utils/i18n";

const Sidebar = ({ selectedOption, setSelectedOption, onLogout }) => {
    const { language } = useAuth();
    const t = getTranslator(language);

    const [expandedOptions, setExpandedOptions] = useState({
        Herramientas: false,
        Plataformas: false
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar si es dispositivo móvil
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        // Verificar al cargar y al cambiar tamaño
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const handleNavigation = (optionKey) => {
        if (optionKey === "Herramientas" || optionKey === "Plataformas") {
            setExpandedOptions({
                ...expandedOptions,
                [optionKey]: !expandedOptions[optionKey]
            });
        } else {
            setSelectedOption(optionKey);
            if (isMobile) {
                setIsMobileMenuOpen(false);
            }
        }
    };
    
    const handleSubOptionClick = (optionKey) => {
        if (optionKey === "Broker") {
            window.location.href = "https://broker-agm.netlify.app/";
            return;
        }
        
        if (optionKey === "PropFirm") {
            setExpandedOptions({
                ...expandedOptions,
                Plataformas: false
            });
            return;
        }
        
        setSelectedOption(optionKey);
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        onLogout();
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const menuItems = [
        { key: "Dashboard", name: t('sidebar_dashboard'), icon: <img src="./darhboard_alt.svg" className="w-8 h-8" alt={t('sidebar_alt_agmLogo')} /> },
        { key: "Cuentas", name: t('sidebar_accounts'), icon: <img src="./Flag.svg" className="w-8 h-8" alt={t('sidebar_accounts')} /> },
        { key: "Afiliados", name: t('sidebar_affiliates'), icon: <img src="./Group_light.svg" className="w-8 h-8" alt={t('sidebar_affiliates')} /> },
        { 
            key: "Herramientas", 
            name: t('sidebar_tools'), 
            icon: <img src="./Setting_sidebar.svg" className="w-8 h-8" alt={t('sidebar_tools')} />,
            subOptionKeys: ["Calculadora", "Descargas", "Noticias"]
        },
        { key: "Certificados", name: t('sidebar_certificates'), icon: <img src="./notebook.svg" className="w-8 h-8" alt={t('sidebar_certificates')} /> },
        { key: "Pagos", name: t('sidebar_payments'), icon: <img src="./Money.svg" className="w-8 h-8" alt={t('sidebar_payments')} /> },
    ];

    // Helper to get translated subOption name
    const getTranslatedSubOptionName = (subOptionKey) => {
        switch(subOptionKey) {
            case "Calculadora": return t('sidebar_calculator');
            case "Descargas": return t('sidebar_downloads');
            case "Noticias": return t('sidebar_news');
            default: return subOptionKey;
        }
    };

    return (
        <>
            {/* Botón hamburguesa para móviles */}
            {isMobile && (
                <button 
                    onClick={toggleMobileMenu}
                    className="fixed top-4 left-4 z-50 p-2 bg-[#232323] rounded-md shadow-lg text-white"
                >
                    {isMobileMenuOpen ? 
                        <RiCloseLine className="w-6 h-6" /> : 
                        <RiMenuLine className="w-6 h-6" />
                    }
                </button>
            )}
            
            {/* Overlay para cerrar el menú al hacer clic afuera (solo en móvil) */}
            {isMobile && isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <div 
                className={`${isMobile ? 'fixed left-0 top-0 z-50' : 'relative'} h-screen ${isMobile ? (isMobileMenuOpen ? 'w-[80%] max-w-[300px]' : 'w-0') : 'w-[300px]'} 
                bg-[#232323] text-white  border-opacity-20 flex flex-col
                transition-all duration-300 ease-in-out overflow-hidden`}
            >
                {/* Logo section - fixed */}
                <div className="flex justify-center px-4 pt-8 pb-4">
                    <img 
                        src="/logo.png" 
                        alt={t('sidebar_alt_agmLogo')} 
                        className="w-20 h-auto"
                        onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23333333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='white'%3EAGM%3C/text%3E%3C/svg%3E";
                        }}
                    />
                </div>
                
                {/* Plataformas button - ahora con flecha y desplegable */}
                {/*
                <div className="mx-4">
                    <button
                        onClick={() => handleNavigation("Plataformas")}
                        className={`flex items-center justify-between py-3 px-6 w-full rounded-full border border-[#333] text-lg bg-gradient-to-br from-[#232323] to-[#2d2d2d]
                            ${expandedOptions.Plataformas 
                                ? "bg-[#232323]" 
                                : "hover:bg-[#232323]"}`}
                        style={{ outline: 'none' }}
                    >
                        <div className="flex items-center">
                            <img src="./Widget.svg" className="w-8 h-8 mr-3" alt="Widget" />
                            <span className="font-regular">Plataformas</span>
                        </div>
                        <RiArrowRightSLine 
                            className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                                expandedOptions.Plataformas ? 'rotate-90' : ''
                            }`} 
                        />
                    </button>
                    
                    <div 
                        className={`pl-8 space-y-1 overflow-hidden transition-all duration-500 ease-in-out w-full
                            ${expandedOptions.Plataformas ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                    >
                        <button
                            onClick={() => handleSubOptionClick("PropFirm")}
                            className={`flex items-center py-2 px-4 w-full text-md font-regular rounded-lg transition-colors
                                ${selectedOption === "PropFirm" 
                                    ? "bg-transparent border-cyan-500" 
                                    : "text-gray-400 hover:text-white bg-transparent hover:bg-white hover:bg-opacity-5"}`}
                            style={{ outline: 'none' }}
                        >
                            <span className="w-5 h-5 mr-3 flex items-center justify-center">
                                <img src="./candlestick.png" alt="Prop Firm" className="w-7 h-7" onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ffffff\' d=\'M4 4h16v2H4v-2zm0 3h16v2H4V7zm0 3h16v2H4v-2zm0 3h10v2H4v-2z\'/%3E%3C/svg%3E"} />
                            </span>
                            <span>Prop Firm</span>
                        </button>
                        <button
                            onClick={() => handleSubOptionClick("Broker")}
                            className={`flex items-center py-2 px-4 w-full text-md font-regular rounded-lg transition-colors
                                ${selectedOption === "Broker" 
                                    ? "bg-transparent border-cyan-500" 
                                    : "text-gray-400 hover:text-white bg-transparent hover:bg-white hover:bg-opacity-5"}`}
                            style={{ outline: 'none' }}
                        >
                            <span className="w-5 h-5 mr-3 flex items-center justify-center">
                                <img src="./waterfall.png" alt="Broker" className="w-7 h-7" onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ffffff\' d=\'M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8z\'/%3E%3C/svg%3E"} />
                            </span>
                            <span>Broker</span>
                        </button>
                    </div>
                </div>
                */}
                
                <div className="h-px w-full bg-gray-700 my-4"></div>
                
                {/* Scrollable menu section */}
                <div className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out flex flex-col justify-center" style={{ scrollbarWidth: 'thin', scrollbarColor: '#555 #333' }}>
                    <nav className="space-y-3 px-1">
                        {menuItems.map((item) => (
                            <div key={item.key}>
                                <button
                                    onClick={() => handleNavigation(item.key)}
                                    className={`flex items-center justify-between py-4 px-6 w-full bg-[#232323] text-lg font-regular
                                        ${selectedOption === item.key || (item.subOptionKeys && item.subOptionKeys.includes(selectedOption))
                                            ? "bg-[#191919]" 
                                            : "hover:bg-[#2a2a2a]"}`}
                                    style={{ outline: 'none' }}
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 flex justify-center mr-3">
                                            {item.icon}
                                        </div>
                                        <span>{item.name}</span>
                                    </div>
                                    {item.subOptionKeys && (
                                        <RiArrowRightSLine 
                                            className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                                                expandedOptions[item.key] ? 'rotate-90' : ''
                                            }`} 
                                        />
                                    )}
                                </button>
                                
                                {/* Subopciones para Herramientas con transición suave */}
                                {item.subOptionKeys && (
                                    <div 
                                        className={`pl-8 space-y-1 overflow-hidden transition-all duration-500 ease-in-out w-full
                                            ${expandedOptions[item.key] ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                                    >
                                        {item.subOptionKeys.map(subOptionKey => {
                                            // Iconos para cada subopción
                                            let icon;
                                            let altText = '';
                                            switch(subOptionKey) {
                                                case "Calculadora":
                                                    altText = t('sidebar_calculator');
                                                    icon = <img src="./calculator.png" alt={altText} className="w-5 h-5" onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' d='M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h16V4H4zm2 2h5v5H6V6zm7 0h5v2h-5V6zm0 4h5v2h-5v-2zm0 4h5v2h-5v-2zm-7 1h2v2H6v-2zm4 0h2v2h-2v-2z'/%3E%3C/svg%3E"} />;
                                                    break;
                                                case "Descargas":
                                                    altText = t('sidebar_downloads');
                                                    icon = <img src="./download.png" alt={altText} className="w-5 h-5" onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/%3E%3C/svg%3E"} />;
                                                    break;
                                                case "Noticias":
                                                    altText = t('sidebar_news');
                                                    icon = <img src="./news.png" alt={altText} className="w-5 h-5" onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' d='M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E"} />;
                                                    break;
                                                default:
                                                    icon = null;
                                            }
                                            
                                            return (
                                                <button
                                                    key={subOptionKey}
                                                    onClick={() => handleSubOptionClick(subOptionKey)}
                                                    className={`flex items-center py-2 px-4 w-full text-md font-regular rounded-lg transition-colors
                                                        ${selectedOption === subOptionKey 
                                                            ? "bg-transparent border-cyan-500" 
                                                            : "text-gray-400 hover:text-white bg-transparent hover:bg-white hover:bg-opacity-10"}`}
                                                    style={{ outline: 'none' }}
                                                >
                                                    <span className="w-5 h-5 mr-3 flex items-center justify-center">
                                                        {icon}
                                                    </span>
                                                    <span>{getTranslatedSubOptionName(subOptionKey)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
                
                {/* Bottom section - fixed */}
                <div className="mt-2 px-4">
                    <div className="h-px w-full bg-gray-700 my-4"></div>
                    <button
                        onClick={() => handleNavigation("Desafio")}
                        className="flex items-center justify-center space-x-2 py-3 px-6 rounded-md w-full bg-gradient-to-r from-[#0F7490] to-[#0A5A72] hover:opacity-90 transition text-lg"
                        style={{ outline: 'none' }}
                    >
                        <span className="text-xl mr-2">+</span>
                        <span>{t('sidebar_newChallenge')}</span>
                    </button>
                    <div className="h-px w-full bg-[#333] my-4"></div>
                    
                    <button onClick={handleLogout} 
                        className="w-full bg-transparent flex items-center space-x-3 py-4 px-6 text-gray-300 hover:bg-white hover:bg-opacity-5 mb-6 md:mb-2 style={{ outline: 'none' }}"
                        >
                        <img src="./Sign-out.svg" className="w-8 h-8" alt={t('sidebar_alt_logout')} />
                        <span className="text-lg">{t('sidebar_logout')}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

Sidebar.propTypes = {
    selectedOption: PropTypes.string,
    setSelectedOption: PropTypes.func,
    onLogout: PropTypes.func
};

Sidebar.defaultProps = {
    selectedOption: "",
    setSelectedOption: () => {},
    onLogout: () => {}
};

export default Sidebar;