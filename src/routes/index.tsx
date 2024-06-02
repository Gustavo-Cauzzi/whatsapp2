import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {View} from 'react-native';
import {Chat} from '../pages/Chat';
import {Home} from '../pages/Home';
import Login from '../pages/Login';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NotificationMiddleware} from './middlewares/NotificationMiddleware';

const Stack = createStackNavigator();

export type NavigationProps = NativeStackScreenProps<
  any,
  'Home' | 'Login' | 'Chat',
  'MyStack'
>;

export const Routes = () => {
  return (
    <NotificationMiddleware>
      <View className="flex-1">
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
            initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={Home} />
            {/* @ts-ignore */}
            <Stack.Screen name="Chat" component={Chat} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </NotificationMiddleware>
  );
};
