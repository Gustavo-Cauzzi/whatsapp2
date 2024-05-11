import React, {useState} from 'react';
import auth, {firebase} from '@react-native-firebase/auth';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {WaTextInput} from '../../components/WaTextInput';
import {Button} from 'react-native';
import {WaButton} from '../../components/WaButton';
import {Controller, useForm} from 'react-hook-form';

// import { Container } from './styles';

const Login: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isActionsEnabled, setIsActionsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {control, getValues, watch} = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleCheckIfFieldsAreFilled =
    (onChange: (text: string) => any) => (text: string) => {
      onChange(text);
      const {password, username} = getValues();
      setIsActionsEnabled(!!(password && username));
    };

  const handleLogIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const {username, password} = getValues();
    try {
      // await firebase.auth().createUserWithEmailAndPassword(username, password);
    } catch (e) {
      Alert.alert('Erro', String(e));
    }
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const {username, password} = getValues();
    try {
      await firebase.auth().createUserWithEmailAndPassword(username, password);
    } catch (e) {
      Alert.alert('Erro', String(e));
    }
    setIsLoading(false);
  };

  return (
    <View className="flex-1 p-4 pt-8 items-center bg-background">
      <View className="flex-row items-center mb-4">
        <Text className="text-2xl text-teal-green font-bold">
          Bem-vindo ao Whatsapp 2
        </Text>
      </View>

      <View className="flex-1 justify-center items-center w-full">
        <View className="flex-[0.1] w-full" />
        <View className="flex-[0.5] justify-center">
          <Icon name="whatsapp" size={120} color={'#128C7E'} />
        </View>
        <KeyboardAvoidingView className="max-w-[260px] w-full flex-[0.7] mt-8">
          <Controller
            control={control}
            name="username"
            render={({field}) => (
              <WaTextInput
                {...field}
                className="mb-2"
                placeholder="Usuário"
                onChangeText={handleCheckIfFieldsAreFilled(field.onChange)}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({field}) => (
              <WaTextInput
                {...field}
                placeholder="Senha"
                secureTextEntry
                onChangeText={handleCheckIfFieldsAreFilled(field.onChange)}
                endAdornment={
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <FeatherIcon
                      name={isPasswordVisible ? 'eye-off' : 'eye'}
                      size={20}
                      color="#128C7E"
                    />
                  </TouchableOpacity>
                }
              />
            )}
          />

          {isLoading ? (
            <View className="mt-4">
              <ActivityIndicator size={35} color="#128C7E" />
            </View>
          ) : (
            <>
              <WaButton
                text="Login"
                variant={isActionsEnabled ? 'contained' : 'outlined'}
                size="large"
                className="mt-4"
                disabled={!isActionsEnabled}
                onPress={handleLogIn}>
                {isLoading && <ActivityIndicator />}
              </WaButton>
              <WaButton
                text="Cadastrar"
                variant={isActionsEnabled ? 'outlined' : 'text'}
                size="large"
                className="mt-2"
                disabled={!isActionsEnabled}
                onPress={handleSignIn}>
                {isLoading && <ActivityIndicator />}
              </WaButton>
            </>
          )}
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default Login;
