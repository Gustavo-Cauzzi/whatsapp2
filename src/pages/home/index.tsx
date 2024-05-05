import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export const Home: React.FC = () => {
  return (
    <SafeAreaView className="flex-1">
      <View
        className="flex-row justify-between p-4 bg-emerald-700"
        style={{elevation: 10}}>
        <Text className="text-xl text-white font-bold">Whatsapp 2</Text>
      </View>

      <View className="absolute bottom-0 left-0 right-0 justify-around">
        <TouchableOpacity></TouchableOpacity>
        <TouchableOpacity></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
