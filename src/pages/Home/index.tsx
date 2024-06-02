import {yupResolver} from '@hookform/resolvers/yup';
import React, {useEffect, useMemo, useState} from 'react';
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
  const {
    chats,
    isLoading,
    actions: {createChat, loadChats, setOpenChat},
  } = useChats();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewChatLoading, setIsNewChatLoading] = useState(false);

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

  const handleNewChat = () => {
    setIsNewChatModalOpen(true);
  };

  const handleCreateNewChat = async () => {
    if (isLoading) return;
    const {otherUserEmail} = getValues();
    try {
      setIsNewChatLoading(true);
      await createChat(otherUserEmail);
      setIsNewChatModalOpen(false);
      reset();
    } catch (e) {
      Alert.alert('Erro', `${e}`);
    } finally {
      setIsNewChatLoading(false);
    }
  };

  const handleGoToChat = async (chat: WaChat) => {
    setOpenChat(chat.chatId);
    navigation.navigate('Chat');
  };

  const sortedChats = useMemo(() => {
    return Object.values(chats)
      .map(chat => ({
        ...chat,
        lastMessage: Object.values(chat.messages).at(-1),
      }))
      .sort(
        (a, b) =>
          (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0),
      );
  }, [chats]);

  return (
    <SafeAreaView className="flex-1 bg-background-925">
      <View
        className="flex-row justify-between p-4 bg-background"
        style={{elevation: 10}}>
        <View className="flex-row items-end">
          <Text className="text-xl text-white mr-2">Whatsapp 2</Text>
          <Text className="text-gray-500 mb-[3px]">({user?.email})</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={25} color="#128C7E" />
        </TouchableOpacity>
      </View>

      <WaModal
        show={isNewChatModalOpen}
        onDimiss={() => setIsNewChatModalOpen(false)}>
        <View className="bg-background p-4 rounded-xl">
          <Text className="text-xl font-bold text-white">Nova conversa:</Text>
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
              {isNewChatLoading && (
                <ActivityIndicator color="#fff" className="px-[44px]" />
              )}
            </WaButton>
          </View>
        </View>
      </WaModal>

      <View className="flex-1">
        <View
          className="absolute bottom-4 right-4 rounded-full bg-teal-green z-10"
          style={{elevation: 10}}>
          <TouchableOpacity onPress={handleNewChat} className="p-4">
            <MaterialCommunityIcons
              name="message-plus-outline"
              size={25}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {isLoading && !isNewChatLoading ? (
          <ActivityIndicator className="mt-4" size={30} />
        ) : (
          <FlatList
            data={sortedChats}
            keyExtractor={chat => chat.chatId}
            ListEmptyComponent={() => (
              <View className="flex-1 py-4 items-center">
                <Text className="text-lg">Nenhuma conversa</Text>
              </View>
            )}
            renderItem={({item: chat}) => (
              <View className="h-20">
                <TouchableNativeFeedback onPress={() => handleGoToChat(chat)}>
                  <View className="flex-1 flex-row px-2 py-4">
                    <View className="bg-background-950 p-3 rounded-full">
                      <FeatherIcon name="user" size={25} />
                    </View>

                    <View className="px-2 flex-1">
                      <View className="flex-row items-end">
                        <Text className="text-lg text-gray-300 pr-2">
                          {chat.otherUser.name}
                        </Text>
                        <Text className="text-gray-500 mb-[3px]">
                          ({chat.otherUser.email})
                        </Text>
                      </View>

                      <View className="justify-between flex-row items-center flex-">
                        <Text
                          className={`pr-2 ${
                            chat.hasUnseenMessage
                              ? 'text-white'
                              : 'text-gray-500'
                          }`}>
                          {Object.values(chat.messages).at(-1)?.message ??
                            'Nenhuma mensagem enviada'}
                        </Text>

                        {chat.hasUnseenMessage && (
                          <View className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableNativeFeedback>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
