import React, { useState } from 'react'
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';


const editProfile = () => {
    
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    // const [password, changePass] = useState('');

    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        // changePass: '',
        image: null,
    });


    const goBack = () => {
        router.push('/components/landing-page')
    }

    const fetchUserProfile = async () => {
        const { data: user, error } = await supabase.auth.getUser();
      
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        const userId = user?.user?.id;
        console.log("User ID:", userId);
        const { data, error: profileError } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('id',userId)
          .maybeSingle();
      
        if (profileError) 
          console.error('Error fetching user:', profileError);
        else{
            setFirstName(data.first_name);
            setLastName(data.last_name);
            setEmail(data.email);
        }
    };

    const updateUserProfile = async () => {
        const { data: user, error } = await supabase.auth.getUser();
    
        if (error) {
            console.error("Error fetching user:", error);
            return;
        }
    
        const userId = user?.user?.id;
        if (!userId) {
            console.error("User ID is undefined!");
            return;
        }
    
        const { error: updateError } = await supabase
            .from('user_accounts')
            .update({
                first_name: firstName,
                last_name: lastName,
                email,
            })
            .eq('id', userId)
    
        if (updateError) {
            console.error("Error updating profile:", updateError);
            Alert.alert("Update Failed", updateError.message);
        } else {
            console.log("Profile updated successfully!");
            // console.log(firstName, lastName);
            Alert.alert("Success", "Your profile has been updated.");
        }
    };
    useEffect(() => {
        fetchUserProfile();
    }, []);
    return (
        <SafeAreaView style = {styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View style = {styles.container}>
                <TouchableOpacity style = {styles.backbtn} onPress={goBack}>
                    <View>
                        <AntDesign name="left" size={24} color="black" />
                    </View>
                </TouchableOpacity>
                <View style = {styles.profileSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>FIRST NAME</Text>
                        <TextInput style={styles.input} value = {firstName} onChangeText={setFirstName} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>LAST NAME</Text>
                        <TextInput style={styles.input} value = {lastName} onChangeText={setLastName}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text  style={styles.label}>EMAIL</Text>
                        <TextInput style={styles.input} value = {email} onChangeText={setEmail}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CHANGE PASSWORD</Text>
                        <TextInput style={styles.input} value="*******" />
                    </View>
                    <View style = {styles.btn}>
                        <View>
                            <TouchableOpacity style = {styles.saveChanges} onPress={updateUserProfile}>
                                <Text style = {styles.savetext}>
                                    Save Changes
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TouchableOpacity style = {styles.saveChanges}>
                                <Text style = {styles.savetext}>
                                    Delete Account
                                </Text>
                            </TouchableOpacity>
                        </View>    
                    </View>
                </View>
                <View style= {styles.imgcontainer}>
                    <Image source={require('../../assets/pictures/blank-profile-pic.png')} style = {styles.image}/>
                </View>

                
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
    },
    profileSection: {
        height: '100%',    
        backgroundColor: '#D3D3D3',
        borderTopLeftRadius: 30,  
        borderTopRightRadius: 30, 
        paddingTop: 125,
        paddingHorizontal: 25,
        marginTop: 200,

    },
    btn:{
        gap: 20

    },
    backbtn: {
        position: 'absolute',
        margin: 40,
    },
    image: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginTop: 100,
        borderRadius: 100,
    },
    imgcontainer:{
        position:'absolute',
        alignSelf: 'center'
    },
    input:{
        // position: 'absolute',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#808080',
        borderWidth: 1/2,
        paddingLeft: 15,
        marginBottom: 20,
        borderRadius: 10,
    },
    inputGroup: {
        // marginTop: 125
    },
    label:{
        marginLeft: 25,
        marginBottom: 5,
    },
    saveChanges:{
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#1E1E1E',
        borderWidth: 1.5,
        borderRadius: 10,
        paddingVertical: 8

    },
    savetext:{
        textAlign: 'center'
    }
});

export default editProfile;