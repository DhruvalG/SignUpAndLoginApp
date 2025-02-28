import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getToken } from './Services/tokenService';
import SignUp from './navigation/screens/SignUp';
import Login from './navigation/screens/Login';
import Profile from './navigation/screens/Profile';


const Stack = createNativeStackNavigator();

export function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');
  useEffect(() => {
    async function prepare() {
      try {
        // Load assets
        await Asset.loadAsync([
          ...NavigationAssets,
          require('./assets/newspaper.png'),
          require('./assets/bell.png'),
        ]);
        const token = await getToken();
        if (token) {
          setInitialRoute('Profile'); // Or 'SignUp' if preferred
        } else {
          setInitialRoute('Login'); // Navigate to Profile if token exists
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
        await SplashScreen.hideAsync(); // Hide Splash Screen
      }
    }
    
    prepare();
  }, []);
  
  // Keep the splash screen until assets are loaded
  if (!isAppReady) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

      // import { Navigation } from './navigation';
      
      // Asset.loadAsync([
        //   ...NavigationAssets,
        //   require('./assets/newspaper.png'),
        //   require('./assets/bell.png'),
        // ])
        
        // Prevent the splash screen from auto-hiding before asset loading is complete.
        // SplashScreen.preventAutoHideAsync();
        
        // <Navigation
        //   linking={{
          //     enabled: 'auto',
          //     prefixes: [
            //       'helloworld://',
            //     ],
            //   }}
            //   onReady={() => {
              //     SplashScreen.hideAsync();
              //   }}
              // >
              // </Navigation>