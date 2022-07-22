import React from 'react';
import { StatusBar } from 'react-native';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';

import { Routes } from './src/routes';

import { AppRoutes } from './src/routes/app.routes';
import { SignIn } from './src/screens/SignIn/index';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from  './src/hooks/Auth';



export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const {userStorageLoading} = useAuth();

  if(!fontsLoaded || userStorageLoading){
    return <AppLoading/>
  }
  
  return (
    <GestureHandlerRootView style ={{ flex: 1}}>

    <ThemeProvider theme={theme}>
          <StatusBar barStyle="light-content"/>
          <AuthProvider>
            <Routes/>
          </AuthProvider>
      </ThemeProvider>
      
    </GestureHandlerRootView>
    
  )}
