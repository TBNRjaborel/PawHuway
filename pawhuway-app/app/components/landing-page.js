import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";


const LandingPage = () => {
    const router = useRouter();
    const [image, setImage] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if(error)
            Alert.alert(error.message);
        else
            router.push('/auth/sign-in')
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
                setImage(data.profile_picture || null);
                setFirstName(data.first_name)
                setLastName(data.last_name)
            }
        };

        useEffect(() => {
            fetchUserProfile();
        }, []);
        
    

    const edit = () => {
        router.push('/auth/edit-profile')
    };

    const help = () => {
        router.push('/components/help-page')
    };

    const profiles = () => {
        router.push('/components/profiles-page-v2')
    }

    
    return(
        // <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>

            <SafeAreaView style = {styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />
                <View style = {styles.container}>
                    <View>
                        <Image source={image ? { uri: image } : require('../../assets/pictures/blank-profile-pic.png')}style={styles.image}/>
                    </View>
                    <View>
                        <TextInput style = {styles.name}
                            editable={false}
                            value={firstName + ' ' + lastName}
                            placeholder='Your Name'
                        />
                    </View>
                    <View style = {styles.options}>
                        <View>
                            <TouchableOpacity style = {styles.btn} onPress={profiles} >
                                <Text style = {styles.btn_txt}>Profiles</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TouchableOpacity style = {styles.btn} onPress={edit} >
                                <Text style = {styles.btn_txt}>Account Details</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TouchableOpacity style = {styles.btn} >
                                <Text style = {styles.btn_txt} onPress={help}>Help & Support</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TouchableOpacity style = {styles.btn} onPress={signOut}>
                                <Text style = {styles.btn_txt}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        // </LinearGradient>

        
    );

    
};

const styles = StyleSheet.create({
    gradient:{
        // flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#B3EBF2', // 🟢 Add background color to the entire screen
    },
    image: {
        width: 175,
        height: 175,
        alignSelf: 'center',
        marginTop: 150,
        borderRadius: 100,
    },
    name: {
        fontFamily: 'Poppins Light',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 20,
        // fontWeight: '900'
    },
    btn_txt: {
        fontFamily: 'Poppins Light',
        textAlign: 'center',
        fontSize: 16,
        color: 'white',
    },
    btn: {
        backgroundColor: '#3C3C4C',
        marginHorizontal: 50,
        borderColor: '#1E1E1E',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 8
    },
    options: {
        marginTop: 50,
        gap: 25,
    },
    pickImg:{
        paddingLeft: 100,
        alignSelf:'center',
        position: 'absolute',
        marginTop: 290,
        

    },

});

export default LandingPage;