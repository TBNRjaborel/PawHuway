import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
// import { useEffect } from 'react';



const SignIn = () => {
  // const [form, setForm] = useState({
  //   email: '',
  //   password: '',
  // });
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signInWithEmail(){
    // const { email, password } = form;`
    
    const { error } = await supabase.auth.signInWithPassword({email,password});
    if(error)
      Alert.alert(error.message);
    else
      router.push('/components/landing-page')
  }
  
  return(
    <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar hidden={true} />
        <View style={styles.container}>
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

            <View>
              {/* <Button color = '#F9FE62' title='Log In' width = '80%'/> */}
              <TouchableOpacity style = {styles.btn} onPress={signInWithEmail}>
                <Text style = {styles.btn_txt}>Login</Text>
              </TouchableOpacity>

            </View>
            <View>
              <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
                <Text style = {styles.toSignUp}>Don't have an account?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>

  );
};


const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    // flex: 1,
    // backgroundColor: '#C9FDF2', // 🟢 Add background color to the entire screen
  },
  logo: {
    width: 350,
    height: 350,
    alignSelf: 'center',
    // borderRadius: 200, 
    marginTop: 80,
    marginBottom: -50,
  },
  inputControl: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderColor: '#808080',
    borderWidth: 1/2,
    paddingLeft: 15,
    marginBottom: 20,
    borderRadius: 20,
    // alignSelf: 'center',
    

  },
  inputLabel: {
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
    paddingHorizontal: -90,
    paddingVertical: 20,
    // borderColor: '#808080',
    // borderWidth: 1,
  },

  btn: {
    color: '#B6F2D1',
    backgroundColor: '#B6F2D1',
    marginHorizontal: 20,
    borderColor: '#1E1E1E',
    borderWidth: 1/2,
    borderRadius: 20,
    paddingVertical: 8
  },

  btn_txt: {
    textAlign: 'center',
  },

  toSignUp: {
    textAlign: 'center',
    marginTop: 10,
    color: '#85D1DB'
  },
  
});

export default SignIn;