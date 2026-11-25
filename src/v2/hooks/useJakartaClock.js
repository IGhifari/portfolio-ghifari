import { useEffect, useState } from 'react';

/**
 * Live formatted clock for Asia/Jakarta (GMT+7), updated every 30 seconds.
 */
export function useJakartaClock() {
  const [jakartaTime, setJakartaTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Jakarta',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
        setJakartaTime(formatted);
      } catch {
        setJakartaTime('4:50 PM');
      }
    };

    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  return jakartaTime;
}
