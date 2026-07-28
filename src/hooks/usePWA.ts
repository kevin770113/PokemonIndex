import { useRegisterSW } from 'virtual:pwa-register/react';

export const usePWA = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  return {
    needRefresh,
    setNeedRefresh,
    updateServiceWorker,
  };
};
