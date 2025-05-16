import React, { useState } from 'react'
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack,useRouter  } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";


const editProfile = () => {
    
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username,setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [birthdate, setBirthDate] = useState('');
    const [image, setImage] = useState(null);
    // const [password, changePass] = useState('');

    const goBack = () => {
        router.push('/components/landing-page-v2')
    }

    async function profilePic() {
        const result = await DocumentPicker.getDocumentAsync({
            type: "image/*", // Allow image files only
            copyToCacheDirectory: true,
        });
    
        if (result.canceled || !result.assets) return;
    
        const file = result.assets[0];
        const fileName = `profile_${Date.now()}.jpg`; // Unique filename
        const filePath = `profiles/${fileName}`; // Folder in Supabase Storage
    
        try {
            const { data, error } = await supabase.storage
                .from("user-profile-images") // Ensure bucket name matches
                .upload(filePath, {
                    uri: file.uri,
                    type: file.mimeType,
                    name: fileName,
                });
    
            if (error) throw error;
    
            // Get Public URL
            const { data: urlData } = supabase.storage
                .from("user-profile-images")
                .getPublicUrl(filePath);
    
            setImage(urlData.publicUrl); // Update state with new image URL
            await updateProfilePicture(urlData.publicUrl); // Store in database
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Error", "Image upload failed.");
        }
    }
    async function updateProfilePicture(imageUrl) {
        const { data: user, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error fetching user:", error);
            return;
        }
    
        const userEmail = user?.user?.email;
        const { error: updateError } = await supabase
            .from("user_accounts")
            .update({ profile_picture: imageUrl })
            .eq("email_add", userEmail);
    
        if (updateError) {
            console.error("Error updating profile picture:", updateError);
            Alert.alert("Update Failed", updateError.message);
        } else {
            console.log("Profile picture updated successfully!");
            Alert.alert("Success", "Profile picture updated.");
        }
    }
    
    

    const fetchUserProfile = async () => {
        const { data: user, error } = await supabase.auth.getUser();
      
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        const userEmail = user?.user?.email;
        // console.log("User ID:", userId);
        const { data, error: profileError } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('email_add',userEmail)
          .maybeSingle();
      
        if (profileError) 
          console.error('Error fetching user:', profileError);
        else{
            setFirstName(data.first_name);
            setLastName(data.last_name);
            setUserName(data.username);
            setEmail(data.email_add);
            setBirthDate(data.birth_date);
            setAddress(data.address);
            setImage(data.profile_picture || null);
        }
    };

    const updateUserProfile = async () => {
        const { data: user, error } = await supabase.auth.getUser();
    
        if (error) {
            console.error("Error fetching user:", error);
            return;
        }
    
        const userEmail = user?.user?.email;
    
        const { error: updateError } = await supabase
            .from('user_accounts')
            .update({
                first_name: firstName,
                last_name: lastName,
                username: username,
                email_add: email,
                birth_date: birthdate,
                address: address,
            })
            .eq('email_add', userEmail)
    
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
                        <Text  style={styles.label}>USERNAME</Text>
                        <TextInput style={styles.input} value = {username} editable = {false}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text  style={styles.label}>EMAIL</Text>
                        <TextInput style={styles.input} value = {email} editable = {false}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text  style={styles.label}>DATE OF BIRTH</Text>
                        <TextInput style={styles.input} value = {birthdate}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ADDRESS</Text>
                        <TextInput style={styles.input} value= {address} />
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
                <View style={styles.imgcontainer}>
                    <Image source={image ? { uri: image } : require('../../assets/pictures/blank-profile-pic.png')} style={styles.image} />
                    <TouchableOpacity style={styles.pickImg} onPress={profilePic}>
                        <Ionicons name="camera" size={25} />
                    </TouchableOpacity>
                </View>


                
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    pickImg:{
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 190,
        paddingLeft: 100,
    },
    container: {
        flex: 1,
        backgroundColor: '#B3EBF2', // 🟢 Add background color to the entire screen
    },
    profileSection: {
        height: '100%',    
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 50,  
        borderTopRightRadius: 50, 
        paddingTop: 90,
        paddingHorizontal: 25,
        marginTop: 120,

    },
    btn:{
        gap: 20

    },
    backbtn: {
        position: 'absolute',
        margin: 40,
    },
    image: {
        width: 175,
        height: 175,
        alignSelf: 'center',
        // marginLeft: 100,
        marginTop: 50,
        borderRadius: 100,
    },
    imgcontainer:{
        position:'absolute',
        alignSelf: 'center'
    },
    input:{
        // position: 'absolute',
        fontFamily: 'Poppins Light',
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
        fontFamily: 'Kanit Medium',
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
        fontFamily: 'Poppins Light',
        textAlign: 'center'
    }
});

export default editProfile;