import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {PropsWithChildren, useEffect, useState} from 'react';
import {useChats} from '../../../contexts/chatsContext';

import {useNavigation} from '@react-navigation/native';
import {ToastAndroid} from 'react-native';
import {useUser} from '../../../contexts/userContext';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

let notificationSubscription: any = null,
  fcmSubscripted = false,
  updateChatsInterval: NodeJS.Timeout | null = null;

export type WaNotification =
  | {
      channel: 'new-message';
      data: {
        fromUserId: string;
        toUserId: string;
        chatId: string;
        toUserEmail: string;
      };
    }
  | {
      channel: 'new-chat';
      data: {
        // é a mesma coisa mas é só para mostrar que funcionaria se fosse diferente
        fromUserId: string;
        toUserId: string;
        chatId: string;
        toUserEmail: string;
      };
    };

const waitForUserAuthenticated = async () => {
  return new Promise<FirebaseAuthTypes.User>(resolve => {
    const interval = setInterval(() => {
      const {authenticated, user} = useUser.getState();
      console.log('authenticated: ', authenticated);
      if (authenticated && user) {
        clearInterval(interval);
        resolve(user);
      }
    }, 25);
  });
};

const getWaDataFromNotification = (
  message: FirebaseMessagingTypes.RemoteMessage,
) => {
  return JSON.parse((message.data as {json: string}).json) as WaNotification;
};

export const NotificationActions: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [notificationsPermitted, setNotificationsPermitted] = useState(false);
  const navigation = useNavigation();
  const {user, authenticated} = useUser();
  const {
    actions: {setOpenChat, loadChats, updateChats},
    initialLoadExecuted: wereChatsLoaded,
  } = useChats();

  const assertLoggedWith = async (email: string) => {
    const user = await waitForUserAuthenticated();
    console.log('uesr: ', user);
    console.log('email: ', email);
    console.log('user?.email !== email: ', user?.email !== email);
    if (user?.email !== email) {
      console.log(`tasto`);
      ToastAndroid.show('Usuário inválido', ToastAndroid.LONG);
      return false;
    }
    return true;
  };

  const handleMessage = async (
    message: FirebaseMessagingTypes.RemoteMessage | null,
  ) => {
    console.log('message: ', message);
    if (!message?.data) return;

    const {channel, data} = getWaDataFromNotification(message);

    if (channel === 'new-message') {
      if (!(await assertLoggedWith(data.toUserEmail))) return;

      console.log(`handling 1`);
      if (!wereChatsLoaded) await loadChats();
      setOpenChat(data.chatId);

      //@ts-ignore
      navigation.navigate('Chat');
    } else if (channel === 'new-chat') {
      if (!(await assertLoggedWith(data.toUserEmail))) return;

      console.log(`handling 2`);
      ToastAndroid.show('Novo chat', ToastAndroid.LONG);

      if (!wereChatsLoaded) await loadChats();
      setOpenChat(data.chatId);

      //@ts-ignore
      navigation.navigate('Chat');
    }
  };

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      setNotificationsPermitted(enabled);
    }
    requestUserPermission();
  }, []);

  useEffect(() => {
    if (updateChatsInterval) clearInterval(updateChatsInterval);
    if (!authenticated) return () => {};

    updateChatsInterval = setInterval(() => {
      updateChats();
    }, 5000);

    return () => updateChatsInterval && clearInterval(updateChatsInterval);
  }, [authenticated]);

  useEffect(() => {
    const setupNotificationHandlers = async () => {
      if (!notificationsPermitted || fcmSubscripted) return;

      const fcmMessaging = messaging();
      fcmMessaging.onNotificationOpenedApp(handleMessage);
      fcmMessaging.setBackgroundMessageHandler(async () => void 0);
      fcmMessaging.getInitialNotification().then(handleMessage);

      if (!notificationSubscription) {
        notificationSubscription = fcmMessaging.onMessage(message => {
          if (message.notification?.title)
            ToastAndroid.show(message.notification?.title, ToastAndroid.SHORT);
        });
      }
    };

    setupNotificationHandlers();
  }, [notificationsPermitted]);

  return <>{children}</>;
};
