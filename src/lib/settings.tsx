import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface BusinessSettings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  maps_link: string;
  opening_hours: string;
  instagram?: string;
  facebook?: string;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  name: "Tawa Shawarma",
  tagline: "Authentic Taste, Delivered Fresh",
  phone: "+91 9765986539",
  whatsapp: "+919765986539",
  email: "contact@tawashawarma.com",
  address: "Beside Hotel New Bilal, Farhat Nagar Main Road, Nanded",
  maps_link: "https://goo.gl/maps/1",
  opening_hours: "12:00 PM - 11:30 PM",
};

interface SettingsContextType {
  settings: BusinessSettings;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('key', 'business_info').single();
        if (data && !error) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.value });
        }
      } catch (err) {
        console.error('Failed to load business settings, using defaults', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
