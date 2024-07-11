import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import {AsyncStorageKeys} from '../../../utils/constants/AsyncStorageKeys';

const config = {
  logs: true,
  changeMsgEvery: 5,
};

const backgroundLog: typeof console.log = (...args) =>
  config.logs && console.log('[Background]', ...args);

const possibleIrritatingMessages: ((time: number) => string)[] = [
  timeOutOfTheApp =>
    `Você está a ${timeOutOfTheApp} segundos sem usar o Whatsapp 2. Volte imediatamente!`,
  timeOutOfTheApp =>
    `Seus amigos está sentido sua falta! Faz ${timeOutOfTheApp} segundos já!`,
  timeOutOfTheApp => `Faz ${timeOutOfTheApp} segundos que você não me abre`,
  timeOutOfTheApp =>
    `Saudades de ${timeOutOfTheApp} segundos atrás, era tão legal com você perdendo seu tempo no aplicativo`,
  timeOutOfTheApp =>
    `Por favor, volte, estamos ${timeOutOfTheApp} segundos sem coletar seus dados`,
  timeOutOfTheApp =>
    `AAAAAAAAAAAAAAAAAAAAAAAAAAAAA MUITO TEMPO (${timeOutOfTheApp} segundos)`,
];

export const timeOutOfTheAppTask = async (_taskDataArguments: any) => {
  backgroundLog(`Starting evil background service >:)`);
  await new Promise(async _whyResolveAPromiseIfItNeverEndsMuaHaHaHa => {
    let timeOutOfTheApp = 0,
      messageTemplate = possibleIrritatingMessages[0];

    setInterval(() => {
      if (AppState.currentState !== 'background') {
        if (timeOutOfTheApp) {
          backgroundLog('Salvando timeOutOfTheApp: ', timeOutOfTheApp);
          AsyncStorage.setItem(
            AsyncStorageKeys.TIMER_SINCE_YOU_WERE_GONE,
            String(timeOutOfTheApp),
          );
          timeOutOfTheApp = 0;
        }

        return;
      }

      timeOutOfTheApp += 1;
      backgroundLog('timeOutOfTheApp: ', timeOutOfTheApp);
      if (
        timeOutOfTheApp === 1 ||
        timeOutOfTheApp % config.changeMsgEvery === 0
      ) {
        messageTemplate =
          possibleIrritatingMessages[
            Math.floor(Math.random() * possibleIrritatingMessages.length)
          ];
      }

      BackgroundService.updateNotification({
        taskDesc: messageTemplate(timeOutOfTheApp),
      });
    }, 1000);
  });
};
