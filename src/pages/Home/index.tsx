import {yupResolver} from '@hookform/resolvers/yup';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {object, string} from 'yup';
import {WaButton} from '../../components/WaButton';
import WaModal from '../../components/WaModal';
import {WaTextInput} from '../../components/WaTextInput';
import {WaChat, useChats} from '../../contexts/chatsContext';
import {useUser} from '../../contexts/userContext';
import {NavigationProps} from '../../routes';

const newChatSchema = object({
  otherUserEmail: string()
    .required('Informe um email')
    .email('Deve ser um email'),
});

export const Home: React.FC<NavigationProps> = ({navigation}) => {
  const {user, authenticated, logout} = useUser();
  const {chats, createChat, loadChats, isLoading} = useChats();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
    reset,
  } = useForm({
    defaultValues: {
      otherUserEmail: '',
    },
    resolver: yupResolver(newChatSchema),
  });

  useEffect(() => {
    if (!authenticated || !user) return;
    loadChats();
  }, [authenticated]);

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  const handleNewMessage = () => {
    setIsNewChatModalOpen(true);
  };

  const handleCreateNewChat = async () => {
    if (isLoading) return;
    const {otherUserEmail} = getValues();
    try {
      const newChat = await createChat(otherUserEmail);
      console.log('newChat: ', newChat);
      reset();
    } catch (e) {
      Alert.alert('Erro', `${e}`);
    }
  };

  const handleGoToChat = (chat: WaChat) => {
    navigation.navigate('Chat', {chatId: chat.chatId});
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

      <View className="absolute bottom-4 right-4 rounded-full bg-teal-green z-1">
        <TouchableOpacity onPress={handleNewMessage} className="p-4">
          <MaterialCommunityIcons
            name="message-plus-outline"
            size={25}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <WaModal
        show={isNewChatModalOpen}
        onDimiss={() => setIsNewChatModalOpen(false)}>
        <View className="bg-background p-4 rounded-xl">
          <Text className="text-xl font-bold">Nova conversa:</Text>
          <Controller
            control={control}
            name="otherUserEmail"
            render={({field: {ref, ...field}}) => (
              <WaTextInput
                {...field}
                onChangeText={field.onChange}
                className="mt-2 mb-4"
                placeholder="E-mail do usuário"
                error={!!errors.otherUserEmail}
                helperText={errors.otherUserEmail?.message ?? ''}
              />
            )}
          />

          <View className="flex items-end">
            <WaButton
              text="Iniciar conversa"
              variant="contained"
              onPress={handleSubmit(handleCreateNewChat)}>
              {isLoading && (
                <ActivityIndicator color="#fff" className="px-[44px]" />
              )}
            </WaButton>
          </View>
        </View>
      </WaModal>

      <View>
        <FlatList
          data={Object.values(chats)}
          keyExtractor={chat => chat.chatId}
          ListEmptyComponent={() => (
            <View className="flex-1 py-4 items-center">
              <Text className="text-lg">Nenhuma conversa</Text>
            </View>
          )}
          renderItem={({item: chat}) => (
            <TouchableNativeFeedback onPress={() => handleGoToChat(chat)}>
              <View className="flex-1 flex-row px-2 py-4">
                <View className="bg-background-950 p-3 rounded-full">
                  <FeatherIcon name="user" size={25} />
                </View>

                <View className="px-2">
                  <View className="flex-row items-end">
                    <Text className="text-lg text-gray-300 pr-2">
                      {chat.otherUser.name}
                    </Text>
                    <Text className="text-gray-500 mb-[3px]">
                      ({chat.otherUser.email})
                    </Text>
                  </View>

                  <Text className="pr-2 text-gray-500">
                    {chat.messages[0]?.message ?? 'Nenhuma mensagem enviada'}
                  </Text>
                </View>
              </View>
            </TouchableNativeFeedback>
          )}
        />
      </View>
    </SafeAreaView>
  );
};
