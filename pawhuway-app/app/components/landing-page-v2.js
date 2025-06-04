import { SafeAreaView, View,StyleSheet, Text, TouchableOpacity, Image, Alert, Dimensions,ScrollView, TextInput} from "react-native"
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase }from '../../src/lib/supabase';
import { useEffect, useState } from "react";



const GoalCard = ({ title, icon, color, onPress }) => (
    
    <TouchableOpacity style={styles.goalCard} onPress={onPress}>
        <View style={[styles.goalIcon, { backgroundColor: color }]}>
            <Text style={styles.goalIconText}>{icon}</Text>
        </View> 
        <Text style={styles.goalTitle}>{title}</Text>
    </TouchableOpacity>
);

const LandingPageV2 = () => {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if(error)
            Alert.alert(error.message);
        else
            router.push('/auth/sign-in')
    };
    const fetchUserProfile = async () => {
        const { data: user, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('Error fetching user:', error);
            return;
        }
        const userEmail = user?.user?.email;
        console.log("User Email:", userEmail);
        const { data, error: profileError } = await supabase
            .from('user_accounts')
            .select('*')
            .eq('email_add',userEmail)
            .maybeSingle();
        
        if (profileError) 
            console.error('Error fetching user:', profileError);
        else{
            setFirstName(data.first_name)
            setLastName(data.last_name)
        }
    };
    
    useEffect(() => {
        fetchUserProfile(); 
    }, []);

return (
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar hidden={true} />
        
            {/* Background with illustration */}
            <View style={styles.header}>
                <View style={styles.illustrationContainer}>
                    <View style={styles.bubble1} />
                    <View style={styles.bubble2} />
                    <View style={styles.bubble3} />
                    <View style={styles.personContainer}>
                        <Image source={require("../../assets/pictures/16.png")}
                            style={styles.image}
                            resizeMode="contain"
                            overflow = "hidden"
                        />
                    </View>
                </View>
                
                {/* Greeting and intro text */}
                <View style={styles.greetingContainer}> 
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.name}>{firstName} {lastName}</Text>
                    <Text style={styles.subtitle}>Pick up where you left off.</Text>
                    
                </View>
            </View>

            {/* Popular Goals Section */}
            <View style={styles.sectionContainer}>
            
                <View style={styles.goalsRow}>
                    <GoalCard title="Profiles" icon="🧔" onPress={() => {
                        router.push('/components/profiles-page-v2')
                    }} />
                    <GoalCard title="Account Details" icon="📝" onPress={()=>{
                        router.push('/auth/edit-profile')
                    }} />
                </View>
            </View>

            {/* New Goals Section */}
            <View style={styles.sectionContainer}>
            
                <View style={styles.goalsRow}>
                    <GoalCard title="Help & Support" icon="❓" onPress={()=>{
                        router.push('/components/help-page')
                    }}/>
                    <GoalCard title="Log Out" icon="👋" onPress={signOut}/>
                </View>
            </View>
            <View>
                <Image source={require("../../assets/pictures/bg-paws.png")}
                style={styles.paws}/>
            </View>
        
        </SafeAreaView>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        backgroundColor: '#B3EBF2',
        // borderBottomLeftRadius: 30,
        borderBottomRightRadius: 100,
        paddingBottom: 15,
        overflow: 'hidden',
        marginBottom: 20,
    },
    illustrationContainer: {
        height: 200,
        position: 'relative',
        // backgroundColor: 'red',
    },
    bubble1: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        top: 40,
        left: 60,
    },
    bubble2: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        top: 30,
        left: 120,
    },
    bubble3: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        top: 80,
        left: 40,
    },
    personContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        marginTop: 165,
        left: 80,
        justifyContent: 'center',
        
    },
    greetingContainer: {
        paddingHorizontal: 25,
        paddingBottom: 20,
        // backgroundColor: 'yellow',
    },
    greeting: {
        fontSize: 20,
        fontWeight: '500',
        fontFamily: 'Kanit Medium',
        color: '#333',
        marginBottom: 5,
    },
    name:{
        fontSize: 24,
        fontWeight: '500',
        fontFamily: 'Poppins Light',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontFamily: 'Poppins Light',
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
    },
    sectionContainer: {
        marginTop: 25,
        paddingHorizontal: 25,
    },
    goalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    goalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 50,
        // width: (width - 70) / 2,
        
        shadowColor: '#3C3C4C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 130,
    },
    goalIcon: {
        // width: 60,
        // height: 60,
        borderRadius: 20,
        backgroundColor: '#FFD6E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    goalIconText: {
        fontSize: 36,
    },
    goalTitle: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Kanit Medium',
        // color: '#FFFFFF',
        textAlign: 'center',
    },
    image: {
        width: 300,
        height: 300,
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    paws: {
        display: 'flex',
        marginTop: 10,
    },
    
}); 


export default LandingPageV2;