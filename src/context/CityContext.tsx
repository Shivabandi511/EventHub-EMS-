import React, { createContext, useContext, useState } from 'react';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  isCityModalOpen: boolean;
  setIsCityModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openCityModal: () => void;
  closeCityModal: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('eventhub_selected_city') || 'Hyderabad';
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('eventhub_selected_city', city);
  };

  const openCityModal = () => setIsCityModalOpen(true);
  const closeCityModal = () => setIsCityModalOpen(false);

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        isCityModalOpen,
        setIsCityModalOpen,
        searchQuery,
        setSearchQuery,
        openCityModal,
        closeCityModal,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within a CityProvider');
  return ctx;
};
