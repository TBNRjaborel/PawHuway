import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const resetPassword = async () => {
        try {
            if (!newPassword.trim() || !confirmPassword.trim()) {
                Alert.alert("Error", "All fields are required");
                return;
            }

            if (newPassword !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return;
            }
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                throw new Error(error.message);
            } else {
                Alert.alert("Success", "Password updated successfully!");
            }
        } catch (err) {
            Alert.alert("Error", err.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>


                <View style={styles.form}>
                    <Text style={styles.title}>Reset Password</Text>

                    <View style={styles.input}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput style={styles.inputControl}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder='Enter your new password'
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.input}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <TextInput style={styles.inputControl}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder='Confirm password'
                            secureTextEntry
                        />
                    </View>

                    <View>
                        <TouchableOpacity style={styles.btn} onPress={resetPassword}>
                            <Text style={styles.btn_txt}>Reset Password</Text>
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


export default ResetPassword;