import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {AppState, Text, View} from 'react-native';
import {WaButton} from '../../../components/WaButton';
import WaModal from '../../../components/WaModal';
import {AsyncStorageKeys} from '../../../utils/constants/AsyncStorageKeys';
import {useIsFocused} from '@react-navigation/native';

export const OutOfTheAppDialog: React.FC = () => {
  const [timeOutOfTheApp, setTimeOutOfTheApp] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('focus', () => {
      setTimeout(async () => {
        const storedTimeOutOfTheApp = await AsyncStorage.getItem(
          AsyncStorageKeys.TIMER_SINCE_YOU_WERE_GONE,
        );
        if (Number(storedTimeOutOfTheApp) > 10) {
          setTimeOutOfTheApp(Number(storedTimeOutOfTheApp));
          AsyncStorage.removeItem(AsyncStorageKeys.TIMER_SINCE_YOU_WERE_GONE);
        }
      }, 1500);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <WaModal show={!!timeOutOfTheApp} onDimiss={() => setTimeOutOfTheApp(0)}>
      <View className="bg-background p-4 rounded-xl">
        <Text className="text-xl font-bold text-white mb-2">
          Sentimos sua falta
        </Text>

        <Text className="text-white text-[16px] leading-5 mb-4">
          Detectamos que você ficou {timeOutOfTheApp} segundos fora do
          aplicativo! Que isso não se repita!
        </Text>

        <View className="flex items-end">
          <WaButton
            text="Desculpe!"
            variant="contained"
            onPress={() => setTimeOutOfTheApp(0)}
          />
        </View>
      </View>
    </WaModal>
  );
};
