import React, {RefAttributes, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {NavigationProps} from '../../routes';
import {WaTextInput} from '../../components/WaTextInput';
import {Controller, useForm} from 'react-hook-form';
import {useChats} from '../../contexts/chatsContext';
import {useUser} from '../../contexts/userContext';

export const Chat: React.FC<NavigationProps> = ({navigation, route}) => {
  const chat = useChats(state => state.chats[state.openChatId!]);
  const messagesLength = useChats(
    // Provoca um rerender quando a quantidade muda. Zustand parece se perder nas referências e não percebe que um array mudou de tamanho sozinho (???)
    state =>
      Object.values(state.chats[state.openChatId!]?.messages ?? {})?.length,
  );
  const userId = useUser(state => state.user?.uid);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const {setOpenChat, sendMessage, removeUnseenFlag} = useChats(
    state => state.actions,
  );

  const flatListRef = useRef<FlatList>(null);

  const {control, getValues, reset} = useForm({
    defaultValues: {message: ''},
  });

  useEffect(() => {
    if (chat) removeUnseenFlag(chat.chatId);
  }, [messagesLength]);

  if (!chat) {
    console.error('Erro', 'Chat não encontrado');
    navigation.goBack();
    return <></>;
  }

  const handleSendMessage = async () => {
    const {message} = getValues();
    if (!message || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await sendMessage({chatId: chat.chatId, message: message.trim()});
    } catch (e) {
      Alert.alert('Error', `${e}`);
    }
    reset();
    setIsSendingMessage(false);
  };

  const handleGoBack = async () => {
    navigation.goBack();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOpenChat(undefined);
  };

  const messages = Object.values(chat.messages);

  return (
    <SafeAreaView className="flex-1 bg-background-925">
      <View
        className="flex-row justify-between items-center p-4 bg-background"
        style={{elevation: 10}}>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-2" onPress={handleGoBack}>
            <FeatherIcon name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>

          <View className="bg-background-950 p-2 mr-2 rounded-full">
            <FeatherIcon name="user" color="#fff" size={18} />
          </View>
          <Text className="text-xl text-white mr-2">{chat.otherUser.name}</Text>
          <Text className="text-gray-500">({chat.otherUser.email})</Text>
        </View>
      </View>

      <View className="flex-1 pt-4 px-2 pb-2">
        <FlatList
          data={messages}
          keyExtractor={message => message.messageId}
          ref={flatListRef}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({animated: true})
          }
          onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
          renderItem={({item: message, index}) => (
            <View
              className={`${
                message.senderId === userId ? 'items-end' : 'items-start'
              } ${
                messages[index + 1]?.senderId !== message.senderId
                  ? `mb-3`
                  : `mb-1`
              }`}>
              <View
                className={`py-1 px-2 rounded-lg max-w-[95%] ${
                  message.senderId === userId
                    ? `rounded-br-none bg-teal-800`
                    : `rounded-bl-none bg-background-800`
                }`}>
                <Text className="text-lg">{message.message}</Text>
              </View>
            </View>
          )}
        />
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
                isSendingMessage ? (
                  <ActivityIndicator />
                ) : (
                  <TouchableOpacity onPress={handleSendMessage}>
                    <FeatherIcon name="send" size={20} color="#aaa" />
                  </TouchableOpacity>
                )
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};
