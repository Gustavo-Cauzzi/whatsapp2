import {PropsWithChildren, useEffect} from 'react';
import {useChats} from '../../../contexts/chatsContext';

export const NotificationMiddleware: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const {
    actions: {updateChats},
  } = useChats();

  useEffect(() => {
    const interval = setInterval(() => {
      updateChats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
};
