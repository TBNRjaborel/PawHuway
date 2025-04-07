import React, { useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';

const createTicket = () => {
    const [subject,setSubject] = useState('');
    const [body, setBody] = useState('');
    const [userId, setUserId] = useState(null);
    const router = useRouter();
    
    async function sendTicket(){
        
        const {data,error} = await supabase
        .from('tickets')
        .insert([
            {
                subject,
                body,
                user_id: userId,
            }
        ])
        .select()

        if (error){
            Alert.alert(error.message)
        }
        else{
            Alert.alert('Ticket Created!')
        }
    }

    const fetchUserProfile = async () => {
            const { data: user, error } = await supabase.auth.getUser();
            if (error) {
              console.error('Error fetching user:', error);
              return;
            } 
            else{
                setUserId(user?.user?.id);
            }
    };

    const goBack = () => {
        router.push('/components/help-page')
    }
    useEffect(() => {
        fetchUserProfile();
    }, []);
    
    return(
        // <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>
            <SafeAreaView style = {styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />
                <View>
                    <TouchableOpacity style = {styles.backbtn} onPress={goBack}>
                        <View>
                            <AntDesign name="left" size={24} color="black" />
                        </View>
                    </TouchableOpacity>
                    <View style = {styles.subject_form}>
                        <Text style = {styles.subjectheader}>Subject</Text>
                        <TextInput style = {styles.input}
                            placeholder='Enter your subject here'
                            onChangeText={setSubject}
                        />
                    </View>

                    <View style = {styles.body_form}>
                        <Text style = {styles.bodyheader}>Body</Text>
                        <TextInput style = {styles.bodyinput} 
                            multiline={true}  // Enables text wrapping
                            numberOfLines={10}
                            placeholder='Enter your message here'
                            onChangeText={setBody}
                        />
                    </View>

                    
                </View>
                <View>
                    <TouchableOpacity style = {styles.createbutton} onPress={sendTicket}>
                        <Text style = {styles.createText}>Create Ticket</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        // </LinearGradient>
    )
}


const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    subject_form:{
        marginTop: 100,

    },
    subjectheader:{
        fontFamily: 'Poppins Light',
        fontSize: 20,
        marginLeft: 20,
    },
    input:{
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#808080',
        borderWidth: 1/2,
        borderRadius: 10,
    },
    bodyinput:{
        alignSelf: 'center',
        width: '90%',
        paddingBottom: 500,
        backgroundColor: '#FFFFFF',
        borderColor: '#808080',
        borderWidth: 1/2,
        borderRadius: 10,
    },
    bodyheader:{
        marginTop: 20,
        marginLeft: 20,
        fontSize: 20,
        fontFamily: 'Poppins Light',
    },
    createText:{
        color: 'white',
        fontFamily: 'Poppins Light',
        fontSize: 20,
        textAlign: 'center',
        // alignSelf: 'center'
    },
    createbutton:{
        alignSelf: 'center',
        backgroundColor: '#3C3C4C',
        marginTop: 20,
        width:'90%',
        borderRadius: 10,
        padding: 10,
        
    },
    backbtn: {
        position: 'absolute',
        marginHorizontal: 20,
        marginVertical: 30,
    },
})

export default createTicket