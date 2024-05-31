import {yupResolver} from '@hookform/resolvers/yup';
import {firebase} from '@react-native-firebase/auth';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import {object, string} from 'yup';
import {WaButton} from '../../components/WaButton';
import {WaTextInput} from '../../components/WaTextInput';
import {loadLastLoggedUser, useUser} from '../../contexts/userContext';
import {useWaNavigation} from '../../routes/nao_rolou/stackNavigatorBuilder';
import {NavigationProps} from '../../routes';

const schema = object({
  email: string().required('Informe um usuário'),
  password: string()
    .required('Informe uma senha')
    .min(6, 'No mínimo 6 caracteres'),
});

const Login: React.FC<NavigationProps> = ({navigation}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isActionsEnabled, setIsActionsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {setUser, authenticated, signUp} = useUser();
  const [isAuthLoading, setIsAuthLoading] = useState(authenticated);

  useEffect(() => {
    if (authenticated) {
      navigation.navigate('Home');
      return;
    }
    loadLastLoggedUser().then(() => setIsAuthLoading(false));
  }, [authenticated]);

  const {
    control,
    getValues,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(schema),
  });

  const handleCheckIfFieldsAreFilled =
    (onChange: (text: string) => any) => (text: string) => {
      onChange(text);
      const {password, email} = getValues();
      setIsActionsEnabled(!!(password && email));
    };

  const handleLogIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const {email, password} = getValues();
    try {
      const {user} = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      setUser(user);
    } catch (e) {
      Alert.alert('Erro', String(e));
    }
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const {email, password} = getValues();
    try {
      await signUp({email, password});
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
            name="email"
            render={({field: {ref, ...field}}) => (
              <WaTextInput
                {...field}
                placeholder="Usuário"
                placeholderTextColor="#145b54"
                onChangeText={handleCheckIfFieldsAreFilled(field.onChange)}
                error={!!errors.email}
                helperText={errors?.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({field: {ref, ...field}}) => (
              <WaTextInput
                {...field}
                placeholder="Senha"
                placeholderTextColor="#145b54"
                className="mt-2"
                secureTextEntry={!isPasswordVisible}
                onChangeText={handleCheckIfFieldsAreFilled(field.onChange)}
                error={!!errors.password}
                helperText={errors?.password?.message}
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
                variant="contained"
                size="large"
                className="mt-4"
                onPress={handleSubmit(handleLogIn)}>
                {isLoading && <ActivityIndicator />}
              </WaButton>
              <WaButton
                text="Cadastrar"
                variant="outlined"
                size="large"
                className="mt-2"
                onPress={handleSubmit(handleSignIn)}>
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
