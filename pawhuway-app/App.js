import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';



const LoginScreen = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  return(
    <SafeAreaView>
      <View>
        <View>
          <Image source={require('./assets/pictures/paw-logo.png')} style = {styles.logo} alt="logo"/>
        </View>

        <View style = {styles.form}>
          <View style = {styles.input}>
            <Text style = {styles.inputLabel}>Email Address</Text>
            <TextInput style ={styles.inputControl}
              value = {form.email}
              onChangeText = {email => setForm({ ...form,email})}
              placeholder='magdugogabriel@gmail.com'
              />
          </View>

          <View style = {styles.input}>
            <Text style = {styles.inputLabel}>Password</Text>
            <TextInput style ={styles.inputControl}
              value = {form.email}
              onChangeText = {password => setForm({ ...form,password})}
              placeholder='*******'
              />
          </View>

          <View>
            <Button color = '#F9FE62' title='Log In' width = '80%'/ >


          </View>
        </View>
      </View>
    </SafeAreaView>

  );
};



export default function App() {
  return (
    <View style = {styles.container}>
      <LoginScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAD6',
  },

  logo: {
    width: 350,
    height: 350,
    alignSelf: 'center',
    // borderRadius: 200, 
    marginTop: 100,
    marginBottom: -50,
  },
  inputControl: {
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
    borderColor: '#808080',
    borderWidth: 1/2,
  },

  btn: {
    color: '#F9FE62',
  },
  
});
