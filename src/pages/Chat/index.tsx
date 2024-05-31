import React from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {WaChat} from '../../contexts/chatsContext';
import {NavigationProps} from '../../routes';

export const Chat: React.FC<NavigationProps> = ({navigation, route}) => {
  const chat = route.params?.chat;

  if (!chat) {
    Alert.alert('Erro', 'Chat não encontrado');
    navigation.goBack();
    return <></>;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-925">
      <View
        className="flex-row justify-between items-center p-4 bg-background"
        style={{elevation: 10}}>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-2">
            <FeatherIcon name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>

          <View className="bg-background-950 p-2 mr-2 rounded-full">
            <FeatherIcon name="user" size={18} />
          </View>
          <Text className="text-xl text-white mr-2">{chat.otherUser.name}</Text>
          <Text className="text-gray-500">({chat.otherUser.email})</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
