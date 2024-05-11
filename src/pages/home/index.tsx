import React, {useEffect} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';

export const Home: React.FC = () => {
  useEffect(() => {
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

  return (
    <SafeAreaView className="flex-1">
      <View
        className="flex-row justify-between p-4 bg-emerald-700"
        style={{elevation: 10}}>
        <Text className="text-xl text-white font-bold">Whatsapp 2</Text>
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
