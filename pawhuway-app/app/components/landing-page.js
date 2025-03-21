import React, { useState } from 'react'
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
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if(error)
            Alert.alert(error.message);
        else
            router.push('/auth/sign-in')
    }

    async function profilePic() {
        
        // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // if (status !== "granted") {
        //     Alert.alert("Permission Denied", "We need camera roll permission to proceed.");
        // return;
        // }

        // const result = await ImagePicker.launchImageLibraryAsync({
        //     mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
        //     allowsEditing: true, // Enable cropping
        //     aspect: [4, 3], // Crop ratio
        //     quality: 1, // Full quality
        // });
        const result = await DocumentPicker.getDocumentAsync({
            type: "image/*", // Allow image files only
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
        setImage(result.assets[0].uri); // Save image URI
        }

    };

    const edit = () => {
        router.push('/auth/edit-profile')
        
    };

    
    return(
        <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>

            <SafeAreaView style = {styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />
                <View style = {styles.container}>
                    <View>
                        <Image source={image ? { uri: image } : require('../../assets/pictures/blank-profile-pic.png')}style={styles.image}/>
                        <TouchableOpacity style = {styles.pickImg} onPress={profilePic}>
                            <Ionicons name="camera" size={25}/>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style = {styles.name}>
                            GABRIEL PAUL MAGDUGO
                        </Text>
                    </View>
                    <View style = {styles.options}>
                        <View>
                            <TouchableOpacity style = {styles.btn} >
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
                                <Text style = {styles.btn_txt}>Help & Support</Text>
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
        </LinearGradient>

        
    );

    
};

const styles = StyleSheet.create({
    gradient:{
        flex: 1,
    },
    container: {
        // flex: 1,
        // backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
    },
    image: {
        width: 175,
        height: 175,
        alignSelf: 'center',
        marginTop: 150,
        borderRadius: 100,
    },
    name: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 20,
        fontWeight: '900'
    },
    btn_txt: {
        textAlign: 'center',
        fontSize: 16,
    },
    btn: {
        backgroundColor: '#FFFFFF',
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