import { createContext, useContext, useEffect, useState } from 'react';
import { useMapillaryUserConnection } from '@hazmapper/hooks';

type MapillaryTokenContextType = {
  accessToken: string | null;
};

const MapillaryTokenContext = createContext<MapillaryTokenContextType>({
  accessToken: null,
});

export const useMapillaryToken = () => useContext(MapillaryTokenContext);

export function MapillaryTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: connection } = useMapillaryUserConnection();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (connection?.token) {
      setAccessToken(connection.token);
    }
  }, [connection]);

  return (
    <MapillaryTokenContext.Provider value={{ accessToken }}>
      {children}
    </MapillaryTokenContext.Provider>
  );
}
