import { useState, useEffect, useCallback } from 'react';

export const useRealtimeUpdates = (endpoint, interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // In a real implementation, this would make an API call
      // For now, we'll simulate data updates
      const mockData = {
        inventory: {
          lowStockItems: Math.floor(Math.random() * 20),
          expiringItems: Math.floor(Math.random() * 10),
          totalItems: 1247
        },
        sales: {
          todaySales: Math.floor(Math.random() * 5000) + 10000,
          transactions: Math.floor(Math.random() * 50) + 100
        },
        alerts: [
          {
            id: 1,
            type: 'low_stock',
            message: 'Paracetamol 500mg is running low',
            timestamp: new Date().toISOString()
          }
        ]
      };

      setData(mockData[endpoint] || mockData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(fetchData, interval);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
};