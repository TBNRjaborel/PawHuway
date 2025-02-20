import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import SignIn from './app/auth/sign-in';
import SignUp from './app/auth/sign-up';



export default function App() {
  return (
    <View style = {styles.container}>
      <SignIn />
      <SignUp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAD6',
  },

  
});


