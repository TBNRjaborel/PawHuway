import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import * as Linking from "expo-linking";

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const sendResetEmail = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Email is required");
            return;
        }

        try {
            const resetPasswordURL = Linking.createURL("/auth/reset-password");
            console.log(resetPasswordURL)
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: resetPasswordURL
            });
            if (error) throw error;
            Alert.alert("Success", "Password reset email sent!");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>


                <View style={styles.form}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <View style={styles.input}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput style={styles.inputControl}
                            value={email}
                            onChangeText={setEmail}
                            placeholder='Enter your email address'
                        />
                    </View>

                    <View>
                        <TouchableOpacity style={styles.btn} onPress={sendResetEmail}>
                            <Text style={styles.btn_txt}>Continue</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
        justifyContent: 'center'
    },

    inputControl: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#808080',
        borderWidth: 1 / 2,
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
        borderWidth: 1 / 2,
        justifyContent: "center"
    },

    btn: {
        color: '#F9FE62',
        backgroundColor: '#F9FE62',
        marginHorizontal: 20,
        borderColor: '#1E1E1E',
        borderWidth: 1 / 2,
        borderRadius: 5,
        paddingVertical: 8
    },

    btn_txt: {
        textAlign: 'center',
    },

    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24
    }
});


export default ForgotPassword;