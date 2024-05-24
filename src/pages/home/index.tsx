import React, {useEffect, useState} from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../../contexts/userContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NavigationProps} from '../../routes';
import WaModal from '../../components/WaModal';
import {WaTextInput} from '../../components/WaTextInput';
import {WaButton} from '../../components/WaButton';

export const Home: React.FC<NavigationProps> = ({navigation}) => {
  const {user, authenticated, logout} = useUser();
  const [isNewConversionModalOpen, setIsNewConversionModalOpen] =
    useState(false);

  useEffect(() => {
    if (!authenticated || !user) return;
    console.log('user, authenticated: ', user, authenticated);
    const loadMessages = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const messages = firestore()
        .collection('Messages')
        .where('userId', '==', user.user.uid)
        .get()
        .catch(a => console.log('a: ', a))
        .then(querySnapshot => {
          console.log('querySnapshot: ', querySnapshot);
        });
      console.log('messages: ', messages);
    };
    loadMessages();
  }, [authenticated]);

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  const handleNewMessage = () => {
    setIsNewConversionModalOpen(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-925">
      <View
        className="flex-row justify-between p-4 bg-background"
        style={{elevation: 10}}>
        <Text className="text-xl text-white">Whatsapp 2</Text>

        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={25} color="#128C7E" />
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-4 right-4 rounded-full bg-teal-green">
        <TouchableOpacity onPress={handleNewMessage} className="p-4">
          <MaterialCommunityIcons
            name="message-plus-outline"
            size={25}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <WaModal
        show={isNewConversionModalOpen}
        onDimiss={() => setIsNewConversionModalOpen(false)}>
        <View className="bg-background p-4 rounded-xl">
          <Text className="text-xl font-bold">Nova conversa:</Text>
          <WaTextInput className="mt-2 mb-4" placeholder="E-mail do usuário" />
          <View className="flex items-end">
            <WaButton text="Iniciar conversa" variant="contained" />
          </View>
        </View>
      </WaModal>

      {/* <View className="absolute bottom-20 left-0 right-0 items-center justify-around p-4">
        <TouchableOpacity>
          <Text>TEste</Text>
        </TouchableOpacity>
        <TouchableOpacity></TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};
