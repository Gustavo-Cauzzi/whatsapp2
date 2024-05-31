import React from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {NavigationProps} from '../../routes';
import {WaTextInput} from '../../components/WaTextInput';
import {Controller, useForm} from 'react-hook-form';
import {useChats} from '../../contexts/chatsContext';

export const Chat: React.FC<NavigationProps> = ({navigation, route}) => {
  const chatId = route.params?.chatId;
  const chat = useChats(state => state.chats[chatId]);

  if (!chatId || !chat) {
    Alert.alert('Erro', 'Chat não encontrado');
    navigation.goBack();
    return <></>;
  }

  const {control, getValues} = useForm({
    defaultValues: {message: ''},
  });

  const handleSendMessage = () => {
    const {message} = getValues();
    if (!message) return;
  };

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

      <View className="flex-1">
        <Text>asd</Text>
      </View>

      <View className="p-2 bg-background">
        <Controller
          control={control}
          name="message"
          render={({field: {ref, ...field}}) => (
            <WaTextInput
              {...field}
              onChangeText={field.onChange}
              placeholder="Digite sua mensagem"
              endAdornment={
                <TouchableOpacity onPress={handleSendMessage}>
                  <FeatherIcon name="send" size={20} color="#aaa" />
                </TouchableOpacity>
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};
