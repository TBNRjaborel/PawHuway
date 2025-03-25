import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import {useRouter} from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    async function signUpWithEmail(){
        // const { email, password } = form;
        
        const { data,error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'exp://192.168.1.150:8081/auth/callback',  // Change this to your actual redirect URL
            data: { is_new: true },
        }});
        if(error){
          Alert.alert(error.message);
          return;
        }
        await AsyncStorage.setItem('userEmail', email);
        Alert.alert('Click the verification link we sent to your email to verify your email.')
        router.push('/auth/create-profile')
    }
    
    return(
      <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>

        <SafeAreaView style = {styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <View>
            <View>
              <Image source={require('../../assets/pictures/paw-logo.png')} style = {styles.logo} alt="logo"/>
            </View>
    
            <View style = {styles.form}>
              <View style = {styles.input}>
                <Text style = {styles.inputLabel}>Email Address</Text>
                <TextInput style ={styles.inputControl}
                  value = {email}
                  onChangeText = {setEmail}
                  placeholder='Enter your email address'
                  />
              </View>
    
              <View style = {styles.input}>
                <Text style = {styles.inputLabel}>Password</Text>
                <TextInput style ={styles.inputControl}
                  value = {password}
                  onChangeText = {setPassword}
                  placeholder='Enter your password'
                  secureTextEntry
                  />
              </View>
              <View style = {styles.regbtns}>
                <View>
                    {/* <Button color = '#F9FE62' title='Log In' width = '80%'/> */}
                    <TouchableOpacity style = {styles.btn} onPress={signUpWithEmail}>
                    <Text style = {styles.btn_sign_up}>Sign Up with Email</Text>
                    </TouchableOpacity>
        
                </View>

                <View>
                    {/* <Button color = '#F9FE62' title='Log In' width = '80%'/> */}
                    <TouchableOpacity style = {styles.btn}  >
                    <Image source={require('../../assets/pictures/google-logo.png')} style = {styles.google_logo} alt="logo"/>
                    <Text style = {styles.btn_continue_google}>Continue with Google</Text>
                    </TouchableOpacity>
                </View>
              </View>
              
            
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    
    );
};

const styles = StyleSheet.create({
    gradient:{
      flex: 1,
    },
    container: {
      // flex: 1,
      // backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
    },
    logo: {
      width: 350,
      height: 350,
      alignSelf: 'center',
      // borderRadius: 200, 
      marginTop: 80,
      marginBottom: -50,
    },
    google_logo: {
      width: 30,
      height: 30,
      alignSelf: 'left',
      marginBottom: -15,
      marginLeft: 30,

    },
    inputControl: {
      fontFamily: 'Poppins Light',
      backgroundColor: '#FFFFFF',
      marginHorizontal: 20,
      borderColor: '#808080',
      borderWidth: 1/2,
      paddingLeft: 15,
      marginBottom: 20,
      borderRadius: 10,
      // alignSelf: 'center',
      
  
    },
    inputLabel: {
      fontFamily: 'Kanit Medium',
      marginBottom: 10,
      textAlign: 'left',
      paddingLeft: 25,
      fontSize: 14,
      fontWeight: '600',
    },
  
    form: {
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      marginHorizontal: 50,
      // paddingHorizontal: -90,
      paddingVertical: 20,
      // borderColor: '#808080',
      // borderWidth: 1/2,
    },
  
    btn: {
      backgroundColor: '#B6F2D1',
      marginHorizontal: 20,
      borderColor: '#1E1E1E',
      borderWidth: 1/2,
      borderRadius: 5,
      paddingVertical: 8
    },
  
    btn_sign_up: {
      
      textAlign: 'center',
      fontFamily: 'Poppins Light',
      // marginVe,
    },
    btn_continue_google: {
      textAlign: 'center',
      marginTop: -10,
      fontFamily: 'Poppins Light',
      

    },

    regbtns: {
        gap: 10
    },
    
    
});


export default SignUp;