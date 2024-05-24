import {NavigationContainer} from '@react-navigation/native';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {View} from 'react-native';
import Login from '../pages/Login';
import {Home} from '../pages/home';

export type NavigationProps = NativeStackScreenProps<any, 'Home', 'MyStack'>;

export const Routes = () => {
  const Stack = createNativeStackNavigator();

  return (
    <View className="flex-1">
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};
