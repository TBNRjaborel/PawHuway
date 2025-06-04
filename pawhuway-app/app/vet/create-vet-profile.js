import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import React, { useEffect, useState } from 'react'
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import { supabase }from '../../src/lib/supabase';
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

const createVetProfile = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUserName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [vetLicense, setLicense] = useState('');
    const [vetClinicId, setVetClinicId] = useState('');
    const [image, setImage] = useState(null);



    useEffect(() => {
        async function insertName(){
            const { data: user, error } = await supabase.auth.getUser();
                if (error) {
                    console.error('Error fetching user:', error);
                    return;
                }
                
            const userEmail = user?.user?.email;
            const { data, error: profileError } = await supabase
                .from('user_accounts')
                .select('*')
                .eq('email_add',userEmail)
                .maybeSingle();

            if (profileError) 
                console.error('Error fetching user:', profileError)
            else{
                const { error:insertError } = await supabase
                    .from('vet_profiles')
                    .insert([

                        { id:user.user.id,
                            first_name: data.first_name, 
                            last_name: data.last_name,
                            username: data.username,
                        },
                    ])
                    .select()

                if (insertError) {
                    console.error('Error inserting data:', insertError);
                }
            }
        }
        async function fetchUserProfile(){
            const { data: user, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Error fetching user:', error);
                return;
            }
            const userId = user?.user?.id;
            // console.log("User ID:", userId);
            const { data, error: profileError } = await supabase
                .from('vet_profiles')
                .select('*')
                .eq('id',userId)
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
        insertName();
        fetchUserProfile();
    },[]);

    const updateVetProfile = async () => {
        const { data: user, error } = await supabase.auth.getUser();
    
        if (error) {
            console.error("Error fetching user:", error);
            return;
        }
    
        const userId = user?.user?.id;
    
        const { error: updateError } = await supabase
            .from('vet_profiles')
            .update({
                contact_info: contactInfo,
                vet_license: vetLicense,
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
    return(
        <SafeAreaView style = {styles.background}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View>
                <TouchableOpacity style = {styles.backbtn}>
                    <View>
                        <AntDesign name="left" size={24} color="black" />
                    </View>
                </TouchableOpacity>

                <View style = {styles.imageContainer}>
                    <Image source={image ? { uri: image } : require('../../assets/pictures/blank-profile-pic.png')} style={styles.image} />
                </View>
            </View>
            <View style = {styles.container}>
                <View style = {styles.profileSection}>
                    <View style = {styles.inputGroup}>
                        <Text style={styles.label}>FIRST NAME</Text>
                        <TextInput style={styles.input} value = {firstName} editable= {false}/>
                    </View>
                    <View style = {styles.inputGroup}>
                        <Text style={styles.label}>LAST NAME</Text>
                        <TextInput style={styles.input} value = {lastName} editable= {false}/>
                    </View>
                    <View style = {styles.inputGroup}>
                        <Text style={styles.label}>USERNAME</Text>
                        <TextInput style={styles.input} value = {username} editable = {false} />
                    </View>
                    <View style = {styles.inputGroup}>
                        <Text style={styles.label}>CONTACT INFO</Text>
                        <TextInput style={styles.input} value = {contactInfo} onChangeText={setContactInfo} />
                    </View>
                    <View style = {styles.inputGroup}>
                        <Text style={styles.label}>VET LICENSE</Text>
                        <TextInput style={styles.input} value = {vetLicense} onChangeText={setLicense}/>
                    </View>
                    <View style = {styles.inputGroup}>
                        <Text style={styles.label}>VET CLINIC ID</Text>
                        <TextInput style={styles.input} value = {vetClinicId} onChangeText={setVetClinicId}/>
                    </View>
                    <View style = {styles.buttons}>
                        <View>
                            <TouchableOpacity style = {styles.saveChanges} onPress={updateVetProfile}> 
                                <Text style = {styles.saveChangesText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background:{
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    imageContainer:{
        marginTop: 100,
        position:'absolute',
        alignSelf: 'center'
    },
    image:{
        width: 150,
        height: 150,
    },
    container:{
        backgroundColor: '#FFFFFF',
        height: '100%',
        marginTop: '75%', 
    },
    backbtn: {
        position: 'absolute',
        margin: 20,
    },
    input:{
        // position: 'absolute',
        fontFamily: 'Poppins Light',
        backgroundColor: '#B3EBF2',
        marginHorizontal: 20,
        borderColor: '#808080',
        borderWidth: 1/2,
        paddingLeft: 15,
        marginBottom: 10,
        borderRadius: 10,
        height: 40,
    },
    label:{
        fontFamily: 'Poppins Light',
        marginLeft: 20,
        
    },
    profileSection:{
        marginTop: 40,
    },
    saveChanges:{
        backgroundColor: '#B3EBF2',
        marginHorizontal: 90,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems:'center',

    },
    saveChangesText:{
        fontFamily: 'Poppins Light',
    }

})

export default createVetProfile;