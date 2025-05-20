import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, ArrowDown, ChevronDown, Copy, DollarSign, Loader, Save, AlertTriangle } from 'lucide-react';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const OperationsHistory = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  // Estados para los filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [metodoFilter, setMetodoFilter] = useState('');

  // Estados para el calendario
const [showStartCalendar, setShowStartCalendar] = useState(false);
const [showEndCalendar, setShowEndCalendar] = useState(false);
const [currentMonth, setCurrentMonth] = useState(new Date());
const startCalendarRef = useRef(null);
const endCalendarRef = useRef(null);

// Cerrar calendarios cuando se hace clic fuera de ellos
useEffect(() => {
  function handleClickOutside(event) {
    if (startCalendarRef.current && !startCalendarRef.current.contains(event.target)) {
      setShowStartCalendar(false);
    }
    if (endCalendarRef.current && !endCalendarRef.current.contains(event.target)) {
      setShowEndCalendar(false);
    }
  }
  
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

// Función para formatear fecha en formato DD/MM/YYYY
const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Función para obtener días de un mes
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Función para obtener el primer día de la semana del mes
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Función para cambiar de mes en el calendario
const changeMonth = (increment) => {
  const newMonth = new Date(currentMonth);
  newMonth.setMonth(newMonth.getMonth() + increment);
  setCurrentMonth(newMonth);
};

// Función para seleccionar una fecha en el calendario
const selectDate = (day, isStartDate) => {
  const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
  const formattedDate = formatDate(selectedDate);
  
  if (isStartDate) {
    setFechaInicio(formattedDate);
    setShowStartCalendar(false);
    // Si la fecha de inicio es posterior a la fecha de fin, actualizar la fecha de fin
    if (fechaFin) {
      const fechaFinDate = new Date(convertirFecha(fechaFin));
      if (selectedDate > fechaFinDate) {
        setFechaFin(formattedDate);
      }
    }
  } else {
    setFechaFin(formattedDate);
    setShowEndCalendar(false);
    // Si la fecha de fin es anterior a la fecha de inicio, actualizar la fecha de inicio
    if (fechaInicio) {
      const fechaInicioDate = new Date(convertirFecha(fechaInicio));
      if (selectedDate < fechaInicioDate) {
        setFechaInicio(formattedDate);
      }
    }
  }
};

// Renderizar el calendario
const renderCalendar = (isStartDate) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const days = [];
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Agregar días vacíos para el comienzo del mes
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
  }
  
  // Agregar los días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const formattedDate = formatDate(date);
    const isSelected = isStartDate 
      ? formattedDate === fechaInicio 
      : formattedDate === fechaFin;
    
    const isInRange = fechaInicio && fechaFin && 
      date >= new Date(convertirFecha(fechaInicio)) && 
      date <= new Date(convertirFecha(fechaFin));
    
    days.push(
      <div 
        key={day} 
        className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer text-sm
          ${isSelected ? 'bg-cyan-500 text-white' : ''}
          ${!isSelected && isInRange ? 'bg-cyan-900/30 text-white' : ''}
          ${!isSelected && !isInRange ? 'hover:bg-[#333]' : ''}`}
        onClick={() => selectDate(day, isStartDate)}
      >
        {day}
      </div>
    );
  }
  
  return (
    <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-lg z-10 w-64">
      <div className="flex justify-between items-center mb-3">
        <button 
          className="p-1 hover:bg-[#333] rounded"
          onClick={() => changeMonth(-1)}
        >
          <ArrowDown size={16} className="transform rotate-90 text-gray-400" />
        </button>
        <div className="font-medium">
          {monthNames[month]} {year}
        </div>
        <button 
          className="p-1 hover:bg-[#333] rounded"
          onClick={() => changeMonth(1)}
        >
          <ArrowDown size={16} className="transform -rotate-90 text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map(day => (
          <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para las ganancias y proceso de retiro
  const [gananciaRetirable, setGananciaRetirable] = useState('$0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  
  // Estados para la dirección de wallet
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState('');
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [walletSuccessMessage, setWalletSuccessMessage] = useState('');
  
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Simular carga de datos de ganancias desde una API
  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      setGananciaRetirable('$0.00'); // Default to string display
      return;
    }

      setIsLoading(true);
    const userDocRef = doc(db, 'users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Assume withdrawableBalance in Firestore is the display string e.g., "$1,234.56"
        // or a status string like "Processing..."
        setGananciaRetirable(userData.withdrawableBalance || '$0.00'); 
        setLastUpdate(new Date());
      } else {
        setGananciaRetirable('$0.00'); // Default display string
        console.log("User document not found or no withdrawableBalance field.");
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching withdrawable balance:', error);
      setGananciaRetirable('Error'); // Display error string
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);
  
  // Cargar la dirección de la wallet desde Firebase
  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().withdrawals_wallet) {
            setWalletAddress(userDoc.data().withdrawals_wallet);
            setEditWalletAddress(userDoc.data().withdrawals_wallet);
          }
        }
      } catch (err) {
        console.error('Error al obtener la dirección de wallet:', err);
        setWalletError('Error al cargar los datos. Intente de nuevo más tarde.');
      }
    };
    
    fetchWalletAddress();
  }, []);

  // Función para formatear cantidades monetarias
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Función para manejar el retiro de ganancias
  const handleWithdraw = async () => {
    if (typeof gananciaRetirable === 'string' && parseFloat(gananciaRetirable.replace(/[^\d.-]/g, '')) <= 0) {
      setWithdrawError('No hay ganancias disponibles para retirar');
      return;
    }
    
    if (!walletAddress) {
      setWithdrawError('Debe configurar una dirección de wallet antes de retirar');
      return;
    }
    
    setIsWithdrawing(true);
    setWithdrawError(null);
    
    try {
      // Simulación de proceso de retiro
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const withdrawalAmount = parseFloat(gananciaRetirable.replace(/[^\d.-]/g, ''));
      
      // Simulación de éxito con 80% de probabilidad
      if (Math.random() > 0.2) {
        setWithdrawSuccess(true);
        // Ganancia retirable will be updated by Firestore listener.
        // We might need to trigger an update to the user's withdrawableBalance in Firestore here.
        // For now, just visually reset if needed or rely on Firestore sync.
        // setGananciaRetirable('$0.00'); // Or let Firestore update it.
        
        // Agregar el retiro como una nueva operación en Firestore
        const newOperation = {
          userId: auth.currentUser.uid,
          timestamp: serverTimestamp(), // Firestore server timestamp
          status: 'Pendiente', // Withdrawals start as Pendiente
          orderNumber: `WD-${Date.now().toString()}`,
          operationType: 'Withdrawal',
          details: 'Retiro de ganancias',
          paymentMethod: 'Criptomoneda', // Assuming crypto for now as per wallet context
          amount: withdrawalAmount,
          currency: 'USD',
        };
        
        await addDoc(collection(db, 'operations'), newOperation);
        console.log("Withdrawal operation logged successfully:", newOperation);
        
        // Resetear el estado de éxito después de 3 segundos
        setTimeout(() => {
          setWithdrawSuccess(false);
        }, 3000);
      } else {
        // Simulación de error
        setWithdrawError('Error en la red de la blockchain. Intente nuevamente.');
      }
    } catch (error) {
      console.error('Error al procesar el retiro:', error); // Log the actual error
      setWithdrawError('Error al procesar el retiro. Intente más tarde.');
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  // Funciones para la gestión de la wallet
  const toggleWalletEditMode = () => {
    setIsEditingWallet(!isEditingWallet);
    setEditWalletAddress(walletAddress);
    setWalletError('');
    setWalletSuccessMessage('');
  };
  
  const saveWalletAddress = async () => {
    // Validación básica
    if (!editWalletAddress.trim()) {
      setWalletError('Por favor, introduzca una dirección de wallet válida.');
      return;
    }
    
    setIsSavingWallet(true);
    setWalletError('');
    
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Actualizar sólo el campo withdrawals_wallet
        await setDoc(userDocRef, { withdrawals_wallet: editWalletAddress.trim() }, { merge: true });
        
        setWalletAddress(editWalletAddress.trim());
        setWalletSuccessMessage('Dirección de wallet actualizada correctamente');
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setWalletSuccessMessage('');
        }, 3000);
        
        setIsEditingWallet(false);
      } else {
        setWalletError('Debe iniciar sesión para actualizar la dirección de wallet.');
      }
    } catch (err) {
      console.error('Error al actualizar la wallet:', err);
      setWalletError('Error al guardar los cambios. Intente de nuevo más tarde.');
    } finally {
      setIsSavingWallet(false);
    }
  };

  // Aplicar filtros cuando cambian
  useEffect(() => {
    // This useEffect is for client-side filtering of the 'operaciones' state.
    // The actual data fetching from Firestore will be in a separate useEffect.
    // For now, let's assume 'allOperaciones' is the data fetched from Firestore
    // and this filtering logic will apply to it.
    // We'll need to adjust this if 'allOperaciones' is no longer a static array.

    // If isLoadingHistory is true, or no user, don't filter yet.
    if (isLoadingHistory || !auth.currentUser) {
      setOperaciones([]); // Clear operations if loading or no user
      return;
    }

    // The filtering logic will be applied to the 'fetchedOperaciones' from Firestore.
    // This part needs to be connected to the Firestore data source.
    // For now, I will comment out the direct dependency on 'allOperaciones'
    // and assume the filtering will happen on the 'operaciones' state
    // which will be populated by Firestore.

    // The existing filtering logic is mostly fine, but it acts on `allOperaciones`
    // which we are removing. We need to make sure this filtering runs *after* data is fetched.
    // It's better to apply filters to the data that's already in the 'operaciones' state
    // if that state is directly populated from Firestore and represents the complete unfiltered list initially.
    // Or, keep a separate state for all fetched operations and then a filtered state.
    // For simplicity, let's assume 'operaciones' will hold ALL user operations from Firestore
    // and the filter props will trigger re-filtering on this list.
    // This requires the Firestore fetching logic to set 'operaciones' to the full list first.

    // The actual filtering logic based on searchQuery, fechaInicio, etc. 
    // will be refactored to work with the Firestore-backed 'operaciones' state in the next step.
    // For now, this useEffect will be responsible for re-triggering filtering when filter criteria change.
    // The data it filters will come from the Firestore listener.

  }, [searchQuery, fechaInicio, fechaFin, estadoFilter, metodoFilter, isLoadingHistory]); // Added isLoadingHistory


  // Fetch operations from Firestore
  useEffect(() => {
    if (!auth.currentUser) {
      setOperaciones([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    const q = query(
      collection(db, 'operations'), 
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOperations = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Transform Firestore data to the structure expected by the table
        fetchedOperations.push({
          id: doc.id,
          estado: data.status,
          // Firestore timestamp to JS Date, then format. Handle null timestamps.
          fecha: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A',
          numOrden: data.orderNumber,
          tipo: data.operationType === 'Purchase Challenge' ? data.details : data.operationType, // Use 'details' for purchase type, otherwise operationType
          metodo: data.paymentMethod,
          cantidad: `$${Number(data.amount).toFixed(2)}`,
          // Add other fields from 'data' if needed for new columns or logic
          rawDetails: data.details // keep raw details if needed for 'Cuenta' logic
        });
      });
      setOperaciones(fetchedOperations); // This will be the full list for the user
      setIsLoadingHistory(false);
    }, (error) => {
      console.error("Error fetching operations history: ", error);
      setIsLoadingHistory(false);
      // Optionally set an error state to display to the user
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [auth.currentUser]); // Re-run if user changes
  
  // This useEffect will now handle filtering on the 'operaciones' state populated by Firestore
  useEffect(() => {
    if (isLoadingHistory) return; // Don't filter if still loading

    let filteredData = [...operaciones]; // Start with all fetched operations
    
    // Filtrar por búsqueda de número de orden
    if (searchQuery) {
      filteredData = filteredData.filter(op => 
        op.numOrden.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (estadoFilter) {
      filteredData = filteredData.filter(op => op.estado === estadoFilter);
    }
    
    // Filtrar por método de pago
    if (metodoFilter) {
      filteredData = filteredData.filter(op => op.metodo === metodoFilter);
    }
    
    // Filtrar por fecha de inicio
    if (fechaInicio) {
      const fechaInicioObj = new Date(convertirFecha(fechaInicio));
      filteredData = filteredData.filter(op => {
        if (!op.fecha || op.fecha === 'N/A') return false;
        const opFecha = new Date(convertirFecha(op.fecha.split(' ')[0]));
        return opFecha >= fechaInicioObj;
      });
    }
    
    // Filtrar por fecha de fin
    if (fechaFin) {
      const fechaFinObj = new Date(convertirFecha(fechaFin));
      filteredData = filteredData.filter(op => {
        if (!op.fecha || op.fecha === 'N/A') return false;
        const opFecha = new Date(convertirFecha(op.fecha.split(' ')[0]));
        return opFecha <= fechaFinObj;
      });
    }
    
    // If you want to keep the 'operaciones' state as the source of truth from Firestore,
    // and have a separate state for *displaying* filtered operations:
    // setFilteredDisplayOperaciones(filteredData);
    // For now, I'll update 'setOperaciones' itself, but this means original sort order might be lost
    // on subsequent non-filter-related re-renders if not handled carefully.
    // A better approach is often: rawFirestoreData -> setRawOperaciones -> applyFilters -> setDisplayOperaciones
    // For this iteration, let's assume the filtering is applied and the paginatedOperaciones
    // will use the result of this filtering. We'll use a different state for the filtered results.

    // To avoid modifying the 'operaciones' state directly by filters, create a new state for filtered operations
    // This will be done in the next step if needed. For now, this filtering logic should be applied
    // to derive `paginatedOperaciones`.

    // The `paginatedOperaciones` should be derived from the result of these filters.
    // Let's store the filtered result in a new state variable if we want to preserve `operaciones` as the raw list.
    // For now, I will use a variable `currentDisplayOps` that `paginatedOperaciones` will use.
    // This means `paginatedOperaciones` needs to be redefined to use this filtered set.

  }, [searchQuery, fechaInicio, fechaFin, estadoFilter, metodoFilter, operaciones, isLoadingHistory]);


  // Derived state for display after filtering
  const [displayOperaciones, setDisplayOperaciones] = useState([]);

  useEffect(() => {
    if (isLoadingHistory) {
      setDisplayOperaciones([]);
      return;
    }
    let filteredData = [...operaciones]; // Start with all fetched operations from Firestore

    if (searchQuery) {
      filteredData = filteredData.filter(op => 
        op.numOrden.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (estadoFilter) {
      filteredData = filteredData.filter(op => op.estado === estadoFilter);
    }
    if (metodoFilter) {
      filteredData = filteredData.filter(op => op.metodo === metodoFilter);
    }
    if (fechaInicio) {
      const fechaInicioObj = new Date(convertirFecha(fechaInicio));
      filteredData = filteredData.filter(op => {
        if (!op.fecha || op.fecha === 'N/A') return false;
        const opFechaParts = op.fecha.split(' ')[0];
        const opFecha = new Date(convertirFecha(opFechaParts));
        return opFecha >= fechaInicioObj;
      });
    }
    if (fechaFin) {
      const fechaFinObj = new Date(convertirFecha(fechaFin));
      filteredData = filteredData.filter(op => {
        if (!op.fecha || op.fecha === 'N/A') return false;
        const opFechaParts = op.fecha.split(' ')[0];
        const opFecha = new Date(convertirFecha(opFechaParts));
        return opFecha <= fechaFinObj;
      });
    }
    setDisplayOperaciones(filteredData);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, fechaInicio, fechaFin, estadoFilter, metodoFilter, operaciones, isLoadingHistory]);

  
  // Función para convertir fecha de formato DD/MM/YYYY a MM/DD/YYYY para comparación
  const convertirFecha = (fecha) => {
    if (!fecha) return '';
    const partes = fecha.split('/');
    if (partes.length !== 3) return fecha; // Si no tiene el formato esperado, devolver como está
    return `${partes[1]}/${partes[0]}/${partes[2]}`;
  };

  // Estado del color de cada fila
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Terminado': // Corresponds to 'Approved' in TradingAccounts
        return 'bg-gradient-to-br from-[#3a5311] to-[#2b2b2b]';
      case 'Pendiente': // Should be yellow
        return 'bg-gradient-to-br from-yellow-500 to-[#2b2b2b]'; // Changed to yellow gradient
      case 'Vencido': // Corresponds to 'Lost' in TradingAccounts
        return 'bg-gradient-to-br from-red-500/40 to-[#2b2b2b]';
      default:
        return 'bg-gradient-to-br from-gray-700 to-[#2b2b2b]';
    }
  };

  // Estado del color de fondo de cada registro
  const getRowColor = (estado) => {
    switch (estado) {
      case 'Terminado':
        return 'bg-[#232323] hover:bg-[#2a2a2a]';
      case 'Pendiente':
        return 'bg-[#232323] hover:bg-[#2a2a2a]';
      case 'Vencido':
        return 'bg-[#232323] hover:bg-[#2a2a2a]';
      default:
        return 'bg-[#232323] hover:bg-[#2a2a2a]';
    }
  };
  
  // Obtener operaciones para la página actual
  const paginatedOperaciones = displayOperaciones.slice( // Use displayOperaciones for pagination
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(displayOperaciones.length / itemsPerPage); // Use displayOperaciones for total pages
  
  // Manejar cambio de página
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Función para copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowSnackbar(true);
        setTimeout(() => {
          setShowSnackbar(false);
        }, 3000); // Ocultar después de 3 segundos
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#232323] text-white p-4 md:p-6">
      {/* Top Section - Ganancia Retirable y Billetera */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Ganancia Retirable */}
        <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333] relative">
          <h2 className="text-2xl md:text-3xl font-medium mb-2 flex items-center">
            Ganancia Retirable
            {isLoading && (
              <Loader size={18} className="ml-2 animate-spin text-cyan-500" />
            )}
          </h2>
          <div className="flex items-center mb-1">
            <p className="text-2xl md:text-3xl font-regular">
              {isLoading ? (
                <span className="text-gray-400">Cargando...</span>
              ) : (
                gananciaRetirable // Display the string directly
              )}
            </p>
            {!isLoading && lastUpdate && (
              <span className="text-xs text-gray-400 ml-2">
                Actualizado: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {!isLoading && gananciaRetirable > 0 && (
            <p className="text-sm text-gray-400 mb-4">
              Mínimo de retiro: {formatCurrency(100)} - Disponible para retirar
            </p>
          )}
          {!isLoading && gananciaRetirable <= 0 && (
            <p className="text-sm text-yellow-400 mb-4">
              No hay ganancias disponibles para retirar
            </p>
          )}
          
          <div className="mb-4">
            {withdrawSuccess && (
              <div className="text-green-400 text-sm mb-2 bg-green-900/20 p-2 rounded">
                Solicitud de retiro enviada con éxito. El proceso puede tardar hasta 24 horas.
              </div>
            )}
            {withdrawError && (
              <div className="text-red-400 text-sm mb-2 bg-red-900/20 p-2 rounded">
                {withdrawError}
              </div>
            )}
          </div>
          
          <button 
            className={`relative overflow-hidden ${
              gananciaRetirable > 0 && !isLoading
                ? "bg-transparent border border-cyan-500 text-white py-2 px-4 md:px-6 rounded-full hover:bg-cyan-900/20 transition"
                : "bg-transparent border border-gray-600 text-gray-400 py-2 px-4 md:px-6 rounded-full"
            }`}
            style={{ outline: 'none' }}
            onClick={handleWithdraw}
            disabled={gananciaRetirable <= 0 || isLoading || isWithdrawing}
          >
            {isWithdrawing ? (
              <>
                <span className="flex items-center justify-center">
                  <Loader size={16} className="animate-spin mr-2" />
                  Procesando...
                </span>
              </>
            ) : (
              "Retirar Ganancia"
            )}
          </button>
        </div>

        {/* Billetera de retiros */}
        <div className="p-4 md:p-6 bg-gradient-to-br from-[#202c36] to-[#0a5a72] rounded-xl border border-[#333] relative">
          <h2 className="text-2xl md:text-3xl font-medium mb-2">Billetera de retiros</h2>
          <p className="text-lg md:text-2xl text-gray-300 mb-1">Tether USDT (Tron TRC20 Network)</p>

          {walletSuccessMessage && (
            <div className="bg-green-900/20 border border-green-600 text-green-400 p-3 rounded-lg mb-3">
              {walletSuccessMessage}
            </div>
          )}
          
          {walletError && (
            <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-3 flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              {walletError}
            </div>
          )}
          
          {isEditingWallet ? (
            <div className="flex flex-col space-y-3">
              <input
                type="text"
                className="flex-grow p-3 bg-[#1a1a1a] rounded-lg border border-[#333] text-white"
                value={editWalletAddress}
                onChange={(e) => setEditWalletAddress(e.target.value)}
                placeholder="Ingrese su dirección TRC20 USDT"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  className="px-6 py-3 bg-[#232323] text-white rounded-full hover:bg-[#2a2a2a] transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={saveWalletAddress}
                  disabled={isSavingWallet}
                >
                  {isSavingWallet ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Guardar
                    </>
                  )}
                </button>
                <button 
                  className="px-6 py-3 bg-[#1a1a1a] text-white rounded-full hover:bg-[#333] transition"
                  onClick={toggleWalletEditMode}
                  disabled={isSavingWallet}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#1a1a1a] p-3 rounded-md mb-4 flex items-center">
                <span className="text-gray-400 font-mono text-sm truncate">
                  {walletAddress || 'No se ha establecido una dirección de wallet'}
                </span>
                {walletAddress && (
                  <button 
                    className="ml-2 p-1 hover:bg-[#333] rounded" 
                    onClick={() => copyToClipboard(walletAddress)}
                  >
                    <Copy size={12} className="text-gray-400" />
                  </button>
                )}
              </div>
              <button 
                className="bg-[#232323] border border-transparent text-white py-2 px-4 md:px-6 rounded-full hover:bg-[#2a2a2a] transition"
                style={{ outline: 'none' }}
                onClick={toggleWalletEditMode}
              >
                Cambiar Billetera
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenedor principal de Historial y Filtros */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333] mb-6">
        {/* Título y buscador */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Historial de Operaciones</h2>
          
          <div className="relative w-full md:w-64 mt-2 md:mt-0">
            <input
              type="text"
              placeholder="Numero de orden"
              className="pl-4 pr-10 py-2 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
{/* Filtros */}
<div className="mb-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Filtro de fecha */}
    <div className="flex flex-col space-y-2">
      <span className="text-lg font-medium">Fecha</span>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative" ref={startCalendarRef}>
          <input
            type="text"
            placeholder="De"
            className="pl-4 pr-9 py-5 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] w-full text-lg cursor-pointer"
            value={fechaInicio}
            readOnly
            onClick={() => {
              setShowStartCalendar(!showStartCalendar);
              setShowEndCalendar(false);
            }}
          />
          <Calendar 
            size={14} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
            onClick={() => {
              setShowStartCalendar(!showStartCalendar);
              setShowEndCalendar(false);
            }}
          />
          {showStartCalendar && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-lg z-10 w-64">
              <div className="flex justify-between items-center mb-3">
                <button 
                  className="p-1 hover:bg-[#333] rounded"
                  onClick={() => changeMonth(-1)}
                >
                  <ArrowDown size={16} className="transform rotate-90 text-gray-400" />
                </button>
                <div className="font-medium">
                  {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button 
                  className="p-1 hover:bg-[#333] rounded"
                  onClick={() => changeMonth(1)}
                >
                  <ArrowDown size={16} className="transform -rotate-90 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const firstDayOfMonth = new Date(year, month, 1).getDay();
                  
                  const days = [];
                  
                  // Agregar días vacíos para el comienzo del mes
                  for (let i = 0; i < firstDayOfMonth; i++) {
                    days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
                  }
                  
                  // Agregar los días del mes
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const formattedDate = formatDate(date);
                    const isSelected = formattedDate === fechaInicio;
                    
                    const isInRange = fechaInicio && fechaFin && 
                      date >= new Date(convertirFecha(fechaInicio)) && 
                      date <= new Date(convertirFecha(fechaFin));
                    
                    days.push(
                      <div 
                        key={day} 
                        className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer text-sm
                          ${isSelected ? 'bg-cyan-500 text-white' : ''}
                          ${!isSelected && isInRange ? 'bg-cyan-900/30 text-white' : ''}
                          ${!isSelected && !isInRange ? 'hover:bg-[#333]' : ''}`}
                        onClick={() => selectDate(day, true)}
                      >
                        {day}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative" ref={endCalendarRef}>
          <input
            type="text"
            placeholder="A"
            className="pl-4 pr-9 py-5 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] w-full text-lg cursor-pointer"
            value={fechaFin}
            readOnly
            onClick={() => {
              setShowEndCalendar(!showEndCalendar);
              setShowStartCalendar(false);
            }}
          />
          <Calendar 
            size={14} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
            onClick={() => {
              setShowEndCalendar(!showEndCalendar);
              setShowStartCalendar(false);
            }}
          />
          {showEndCalendar && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-lg z-10 w-64">
              <div className="flex justify-between items-center mb-3">
                <button 
                  className="p-1 hover:bg-[#333] rounded"
                  onClick={() => changeMonth(-1)}
                >
                  <ArrowDown size={16} className="transform rotate-90 text-gray-400" />
                </button>
                <div className="font-medium">
                  {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button 
                  className="p-1 hover:bg-[#333] rounded"
                  onClick={() => changeMonth(1)}
                >
                  <ArrowDown size={16} className="transform -rotate-90 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const firstDayOfMonth = new Date(year, month, 1).getDay();
                  
                  const days = [];
                  
                  // Agregar días vacíos para el comienzo del mes
                  for (let i = 0; i < firstDayOfMonth; i++) {
                    days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
                  }
                  
                  // Agregar los días del mes
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const formattedDate = formatDate(date);
                    const isSelected = formattedDate === fechaFin;
                    
                    const isInRange = fechaInicio && fechaFin && 
                      date >= new Date(convertirFecha(fechaInicio)) && 
                      date <= new Date(convertirFecha(fechaFin));
                    
                    days.push(
                      <div 
                        key={day} 
                        className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer text-sm
                          ${isSelected ? 'bg-cyan-500 text-white' : ''}
                          ${!isSelected && isInRange ? 'bg-cyan-900/30 text-white' : ''}
                          ${!isSelected && !isInRange ? 'hover:bg-[#333]' : ''}`}
                        onClick={() => selectDate(day, false)}
                      >
                        {day}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Filtro de Estado */}
    <div className="flex flex-col space-y-2">
      <span className="text-lg font-medium">Estado</span>
      <div className="relative">
        <select 
          className="appearance-none pl-4 pr-9 py-5 rounded-full bg-gradient-to-br text-[#929292] from-[#232323] to-[#2d2d2d] border border-[#333] w-full text-lg"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="">Todo</option>
          <option value="Terminado">Terminado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Vencido">Vencido</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
    
    {/* Filtro de Tipo de pago */}
    <div className="flex flex-col space-y-2">
      <span className="text-lg font-medium">Tipo de pago</span>
      <div className="relative">
        <select 
          className="appearance-none pl-4 pr-9 py-5 bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-[#929292] rounded-full border border-[#333] w-full text-lg"
          value={metodoFilter}
          onChange={(e) => setMetodoFilter(e.target.value)}
        >
          <option value="">Todo</option>
          <option value="Criptomoneda">Criptomoneda</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  </div>
</div>
</div>
      
      {/* Tabla de operaciones - Contenedor separado */}
      <div className="bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333] p-4 md:p-6 mb-6">
        {/* Cabecera de la tabla */}
        <div className="hidden md:grid grid-cols-8 items-center text-left text-gray-300 border-b border-gray-700 py-3 mb-3 gap-2">
          <div className="font-semibold text-sm px-2">Estado</div>
          <div className="font-semibold text-sm px-2">Fecha De Solicitud</div>
          <div className="font-semibold text-sm px-2">Tiempo De Pago</div>
          <div className="font-semibold text-sm px-2 flex justify-between items-center">
            <span>Hash</span>
    <div className="w-6"></div>
  </div>
          <div className="font-semibold text-sm px-2">Cuenta</div>
          <div className="font-semibold text-sm px-2">Tipo De Producto</div>
          <div className="font-semibold text-sm px-2">Cantidad</div>
          <div className="font-semibold text-sm px-2">Retiros Totales</div>
</div>
        
        {/* Tabla de operaciones - con mensaje si no hay resultados */}
        <div className="overflow-x-auto">
          {paginatedOperaciones.length > 0 ? (
            paginatedOperaciones.map((op, index) => {
              const fechaParts = op.fecha.split(' ');
              const fechaSolicitud = op.fecha !== 'N/A' ? fechaParts[0] : 'N/A';
              const tiempoDePago = op.fecha !== 'N/A' && fechaParts.length > 1 ? fechaParts[1] : 'N/A';

              let cuentaDisplay = op.tipo; // Default to operation type
              // Use rawDetails for 'Cuenta' logic if it was preserved from Firestore data
              const challengeDetails = op.rawDetails || op.tipo; 
              const numOrdenSuffix = op.numOrden && op.numOrden.length > 4 ? op.numOrden.slice(-4) : op.numOrden || 'xxxx';
              
              if (op.tipo && op.tipo.startsWith('Purchase Challenge')) {
                // Extract details like "5K Standard" from `challengeDetails` if possible
                // Assuming `challengeDetails` holds something like "$5.000 Estándar"
                const parts = typeof challengeDetails === 'string' ? challengeDetails.split(' ') : [];
                if (parts.length >= 2) {
                  cuentaDisplay = `${parts.slice(1).join(' ')} (${numOrdenSuffix})`; // e.g. "Estándar (c03)" or "5K Standard (c03)"
                } else {
                  cuentaDisplay = `${challengeDetails} (${numOrdenSuffix})`;
                }
              } else if (op.tipo === 'Withdrawal') {
                cuentaDisplay = `Retiro Wallet (${numOrdenSuffix})`;
              }

              let retirosTotalesDisplay;
              if (op.tipo === 'Withdrawal') {
                retirosTotalesDisplay = op.cantidad;
              } else {
                retirosTotalesDisplay = '$0.00';
              }

              return (
              <div 
                key={index} 
                  className={`grid grid-cols-1 md:grid-cols-8 border-b border-gray-800 ${getRowColor(op.estado)} py-2 md:py-3 gap-y-2 md:gap-y-0 md:gap-x-2 text-sm rounded-lg mb-2`}
              >
                {/* Para móvil */}
                <div className="md:hidden grid grid-cols-2 gap-2 px-2">
                  <div className="text-gray-400">Estado:</div>
                    <div className={`px-4 py-2 rounded-full text-xs font-medium text-white ${getEstadoColor(op.estado)} inline-block w-fit`}>
                    {op.estado}
                  </div>
                  
                    <div className="text-gray-400">Fecha De Solicitud:</div>
                    <div>{fechaSolicitud}</div>
                  
                    <div className="text-gray-400">Tiempo De Pago:</div>
                    <div>{tiempoDePago}</div>
                    
                    <div className="text-gray-400">Hash:</div>
                    <div className="flex items-center justify-between">
                      <span>{op.numOrden.substring(0, 10)}...</span>
                      <button 
                        className="!bg-transparent !p-0 !border-0 !shadow-none focus:!outline-none focus:!ring-0 focus:!bg-transparent hover:!bg-transparent flex items-center justify-center w-6 h-6" 
                        onClick={() => copyToClipboard(op.numOrden)}
                        style={{background: 'transparent'}}
                      >
                        <Copy size={12} className="text-gray-500" />
                      </button>
                    </div>
                  
                    <div className="text-gray-400">Cuenta:</div>
                    <div>{cuentaDisplay}</div>
                    
                    <div className="text-gray-400">Tipo De Producto:</div>
                  <div>{op.tipo}</div>
                  
                  <div className="text-gray-400">Cantidad:</div>
                  <div className="font-medium">{op.cantidad}</div>

                    <div className="text-gray-400">Retiros Totales:</div>
                    <div>{retirosTotalesDisplay}</div>
                </div>
                
                {/* Para desktop */}
                <div className="hidden md:block px-2">
                    <div className={`px-4 py-2 rounded-full text-xs font-medium text-white ${getEstadoColor(op.estado)} inline-block`}>
                    {op.estado}
                  </div>
                </div>
                  <div className="hidden md:block px-2">{fechaSolicitud}</div>
                  <div className="hidden md:block px-2">{tiempoDePago}</div>
                    <div className="hidden md:flex items-center px-8 justify-between">
                      <span className="truncate">{op.numOrden}</span>
                      <button 
                        className="!bg-transparent !p-0 !border-0 !shadow-none focus:!outline-none focus:!ring-0 focus:!bg-transparent hover:!bg-transparent flex items-center justify-center w-6 h-6" 
                        onClick={() => copyToClipboard(op.numOrden)}
                        style={{background: 'transparent'}}
                      >
                        <Copy size={12} className="text-gray-500" />
                      </button>
                    </div>
                  <div className="hidden md:block px-2">{cuentaDisplay}</div>
                <div className="hidden md:block px-2">{op.tipo}</div>
                <div className="hidden md:block px-2 font-medium">{op.cantidad}</div>
                  <div className="hidden md:block px-2">{retirosTotalesDisplay}</div>
              </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              No se encontraron operaciones con los filtros aplicados
            </div>
          )}
        </div>
        
        {/* Paginación */}
        {operaciones.length > 0 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <button 
                className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ArrowDown size={16} className="transform rotate-90 text-gray-400" />
              </button>
              
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                // Determinar qué páginas mostrar basado en la página actual
                let pageNum;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage === 1) {
                  pageNum = i + 1;
                } else if (currentPage === totalPages) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                
                return (
                  <button 
                    key={i}
                    className={`w-8 h-8 rounded-full ${
                      pageNum === currentPage 
                        ? 'bg-cyan-900/30 border border-cyan-500' 
                        : 'border border-[#333]'
                    } flex items-center justify-center`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ArrowDown size={16} className="transform -rotate-90 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
      {showSnackbar && (
  <div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-fade-in-out">
    <span>Texto copiado al portapapeles</span>
  </div>
)}
    </div>
  );
};

export default OperationsHistory;