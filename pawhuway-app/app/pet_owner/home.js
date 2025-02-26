import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';

const OwnerHome = () => {
    const router = useRouter();

    return(
        <SafeAreaView style = {styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <View>
            <View>
              <Image source={require('../../assets/pictures/paw-logo.png')} style = {styles.logo} alt="logo"/>
            </View>
    
            <View style = {styles.regbtns} width = '50%'>
                <View>
                    <TouchableOpacity style = {styles.btn} onPress={() => router.push('/pet_owner/add-pet')}>
                    <Text style = {styles.btn_sign_up}>Add a pet</Text>
                    </TouchableOpacity>
        
                </View>
            </View>
          </View>
        </SafeAreaView>
    
      );
};

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
      marginTop: 180,
      marginBottom: -75,
    },
  
    btn: {
      color: '#F9FE62',
      backgroundColor: '#F9FE62',
      marginHorizontal: 20,
      borderColor: '#1E1E1E',
      borderWidth: 1/2,
      borderRadius: 5,
      paddingVertical: 8
    },
  
    btn_sign_up: {
      
      textAlign: 'center',
      // marginVe,
    },

    regbtns: {
        gap: 10,
        alignSelf: 'center'
    },
    
});

export default OwnerHome;