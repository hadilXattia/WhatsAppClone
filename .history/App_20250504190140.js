import { View, Text } from 'react-native'

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Screens/Home';
import NewUser from './Screens/NewUser';
import Chat from './Screens/Chat';
import MyAccount from './Screens/Home/MyAccount';
import Auth from './Screens/Auth';

const Stack=createNativeStackNavigator();
export default function App() {
  return <NavigationContainer>
<Stack.Navigator screenOptions={{headerShown:false}}>


<Stack.Screen name="Home" component={Home}  />
<Stack.Screen name="NewUser" component={NewUser} />
<Stack.Screen name="Chat" component={Chat} />
<Stack.Screen name="MyAccount" component={MyAccount} />
<Stack.Screen name="Auth" component={Auth}/>
</Stack.Navigator>

  </NavigationContainer>

 
}