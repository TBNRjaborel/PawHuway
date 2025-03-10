import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';

const deleteProfile = () => {
    const router = useRouter();

    async function deleteUserAcc() {
        const { data, error } = await supabase.auth.admin.deleteUser(
            '668a556e-61c9-48c6-988e-1fbfbe46c8d8'
        );

        if(error)
            Alert.alert(error.message);
        else {
            Alert.alert('Successfully deleted account!')
            
        }
        
    }
    return (
        <SafeAreaView>
            <View>
                <TouchableOpacity onPress={deleteUserAcc}>
                    <Text style = {styles.button}>Click here to delete account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    button:{
        color: 'blue'

    },
});

export default deleteProfile;