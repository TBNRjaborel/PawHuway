import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack,useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';

const ticketPage = () => {
    const router = useRouter();

    const createTicket = () => {
        router.push('/components/create-ticket')
    }
    const goBack = () => {
        router.push('/components/landing-page')
    }
    // const fetchUserProfile = async () => {
    //             const { data: user, error } = await supabase.auth.getUser();
                
    //             if (error) {
    //                 console.error('Error fetching user:', error);
    //                 return;
    //             }
    //             const userEmail = user?.user?.email;
    //             // console.log("User ID:", userId);
    //             const { data, error: profileError } = await supabase
    //                 .from('user_accounts')
    //                 .select('*')
    //                 .eq('email_add',userEmail)
    //                 .maybeSingle();
                
    //             if (profileError) 
    //                 console.error('Error fetching user:', profileError);
    //             else{
    //                 setImage(data.profile_picture || null);
    //                 setFirstName(data.first_name)
    //                 setLastName(data.last_name)
    //             }
    // };

    return(
        <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>
            <SafeAreaView>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />
                <View>
                    <TouchableOpacity style = {styles.backbtn} onPress={goBack}>
                        <View>
                            <AntDesign name="left" size={24} color="black" />
                        </View>
                    </TouchableOpacity>
                    <Text style = {styles.yourTickets}>YOUR TICKETS</Text>
                    <Text style = {styles.subtext}>Send us a message</Text>
                </View>
                <View style = {styles.addTicket}>
                    <TouchableOpacity style = {styles.newbtn} onPress={createTicket}>
                        <Text style = {styles.newText}>+ New</Text>
                    </TouchableOpacity>
                </View>
                <View style = {styles.container}>
                    <TouchableOpacity>
                        <View style = {styles.tickets}>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style = {styles.tickets}>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style = {styles.tickets}>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style = {styles.tickets}>
                        </View>
                    </TouchableOpacity>
                    
                    


                </View>
            </SafeAreaView>
        </LinearGradient>

    )
}


const styles = StyleSheet.create({
    gradient:{
        flex: 1,
    },
    yourTickets:{
        fontFamily: 'Kanit Medium',
        fontSize: 40,
        marginLeft: 20,
        marginTop: 70,
        // position: 'absolute',
    },
    subtext:{
        fontFamily: 'Poppins Light',
        marginLeft: 25,
        fontSize: 18,
    },
    tickets:{
        backgroundColor: '#85D1DB',
        height: 120,
        width: '90%',
        alignSelf: 'center',
        // marginTop: 40,
        borderRadius: 20,
        borderColor: '#FFFFFF',
        borderWidth: 2,
        marginBottom: 15,
    },
    container:{
        marginTop: 40,
    },
    addTicket:{
        position: 'absolute',
        alignSelf: 'flex-end',

    },
    newText:{
        fontFamily: 'Poppins Light',
        textAlign: 'center',
    },
    newbtn:{
        // marginHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginVertical: 80,
        right: 30,
        padding: 10,
    },
    backbtn:{
        position: 'absolute',
        marginHorizontal: 20,
        marginVertical: 30,
    },





})

export default ticketPage

