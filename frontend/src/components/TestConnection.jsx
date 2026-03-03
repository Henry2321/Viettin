import { useState } from 'react';
import { apiClient } from '../api/client';

export default function TestConnection() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getStatus();
      setStatus(result);
    } catch (error) {
      setStatus({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Backend Connection</h2>
      <button onClick={testConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {status && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}