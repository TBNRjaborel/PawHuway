import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { View, StyleSheet,SafeAreaView, Text, Image } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useEffect, useState} from 'react';
import { useRouter } from 'expo-router';

const Dashboard = () => {
    const router = useRouter();
    const [image, setImage] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

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

    return(
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View>
                <Image source={image ? { uri: image } : require('../../assets/pictures/blank-profile-pic.png')}style={styles.image}/>
                <Text>Welcome back,</Text>
                <Text>{firstName}</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    image:{
        width: 50,
        height: 50,
        
    },
});

export default Dashboard