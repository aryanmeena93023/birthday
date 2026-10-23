import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { markDiscovered } from '../../utils/discoveryTracker';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'VAULT_UNLOCKED' || event.data.destination === '/personal-record')) {
        try {
          localStorage.setItem('birthdayWebsite_chestUnlocked', 'true');
        } catch (err) {}
        markDiscovered('forbidden');
        navigate('/personal-record');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050507', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/Nluja-Vault-Exact-Texture.html"
        title="The Restricted Record — Case File No. 04"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
};

export default Forbidden;
