import React, {useEffect} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../../contexts/userContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NavigationProps} from '../../routes';

export const Home: React.FC<NavigationProps> = ({navigation}) => {
  const {user, authenticated, logout} = useUser();

  useEffect(() => {
    console.log('user, authenticated: ', user, authenticated);
    const a = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const messages = firestore()
        .collection('Messages')
        .where('userId', '==', '1')
        .get()
        .catch(a => console.log('a: ', a))
        .then(querySnapshot => {
          console.log('querySnapshot: ', querySnapshot);
        });
      console.log('messages: ', messages);
    };
    a();
  }, []);

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
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

      <View className="absolute bottom-20 left-0 right-0 items-center justify-around p-4">
        <TouchableOpacity>
          <Text>TEste</Text>
        </TouchableOpacity>
        <TouchableOpacity></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
