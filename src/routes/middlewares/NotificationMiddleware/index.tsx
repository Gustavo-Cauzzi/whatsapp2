import {PropsWithChildren, useEffect} from 'react';
import {useChats} from '../../../contexts/chatsContext';

import {PermissionsAndroid} from 'react-native';

export const NotificationMiddleware: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const {
    actions: {updateChats},
  } = useChats();

  useEffect(() => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    const interval = setInterval(() => {
      updateChats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
};
