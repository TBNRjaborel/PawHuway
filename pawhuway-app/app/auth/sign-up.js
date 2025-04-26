import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import {useRouter} from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
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
    const goBack = () => {
      router.push('/starting-page');
    }
    return(
      // <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>

        <SafeAreaView style = {styles.background}>
          <Stack.Screen options={{ headerShown: false }} />
          <View>
            <TouchableOpacity style = {styles.backbtn} onPress={goBack}>
              <View>
                  <AntDesign name="left" size={15} color="black"  />
              </View>
            </TouchableOpacity>
            <View>
              <Image source={require('../../assets/pictures/paw-logo2.png')} style = {styles.logo} alt="logo"/>
            </View>
            <View style = {styles.container}>

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
                      <Text style = {styles.or}>
                        Or
                      </Text>
                      <TouchableOpacity style = {styles.google_button}  >
                        <Image source={require('../../assets/pictures/google-logo.png')} style = {styles.google_logo} alt="logo"/>
                        <Text style = {styles.btn_continue_google}>Continue with Google</Text>
                      </TouchableOpacity>
                  </View>
                </View>
                
              
              </View>
            </View>
          </View>
        </SafeAreaView>
      // </LinearGradient>
    
    );
};

const styles = StyleSheet.create({
    background:{
      flex: 1,
      backgroundColor: '#B3EBF2',
      // alignItems: 'center',
      // justifyContent: 'center',
    },
    backbtn: {
      margin: 30,
      position: 'absolute',
      padding: 10,
      backgroundColor: '#FFFFFF',
      borderRadius: 50,
      zIndex: 10, 
    },
    container: {
      backgroundColor: '#FFFFFF',
      height: '100%',
      borderTopLeftRadius: 70,  
      borderTopRightRadius: 70, 
      marginTop: 400,
    },
    logo: {
      width: 450,
      height: 450,
      alignSelf: 'center',
      position: 'absolute',
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
      marginHorizontal: 10,
      borderColor: '#808080',
      borderWidth: 1/2,
      paddingLeft: 15,
      marginBottom: 20,
      borderRadius: 15,
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
      marginHorizontal: 40,
      marginVertical: 40,
      
    },
  
    btn: {
      marginTop: 20,
      backgroundColor: '#3C3C4C',
      marginHorizontal: 10,
      borderColor: '#1E1E1E',
      borderWidth: 1/2,
      borderRadius: 15,
      paddingVertical: 8,
    },
    google_button:{
      marginTop: 20,
      backgroundColor: '#B3EBF2',
      marginHorizontal: 10,
      borderColor: '#1E1E1E',
      borderWidth: 1/2,
      borderRadius: 15,
      paddingVertical: 8,
    },
  
    btn_sign_up: {
      
      textAlign: 'center',
      fontFamily: 'Poppins Light',
      color: 'white',
      // marginVe,
    },
    btn_continue_google: {
      textAlign: 'center',
      marginTop: -10,
      fontFamily: 'Poppins Light',
      color: 'black',
      

    },
    or:{
      fontFamily: 'Kanit Medium',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      // fontWeight: 'bold',
    },

    regbtns: {
        gap: 10
    },
    
    
});


export default SignUp;