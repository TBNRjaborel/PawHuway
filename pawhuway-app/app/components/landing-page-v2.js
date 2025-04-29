import { SafeAreaView, View,StyleSheet, Text, TouchableOpacity, Image, Alert} from "react-native"
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase }from '../../src/lib/supabase';




const LandingPageV2 = () => {
    const router = useRouter();
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if(error)
            Alert.alert(error.message);
        else
            router.push('/auth/sign-in')
    }

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
        <SafeAreaView style = {styles.background}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View>
                <View style={styles.header}>
                    <Text style={styles.appName}>
                        PAWHUWAY
                    </Text>
                </View>
                <View style = {styles.choices}>
                    <TouchableOpacity onPress={profiles}>
                        <Text style={styles.textChoices}>
                            Profiles
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={edit}>
                        <Text style={styles.textChoices}>
                            Account Details
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={help}>
                        <Text style={styles.textChoices}>
                            Help & Support
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={signOut}>
                        <Text style={styles.textChoices}>
                            Log Out
                        </Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Image source={require("../../assets/pictures/cat_1.png")}
                        style = {styles.cat}
                        
                    />
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
    appName:{
        fontFamily: 'Poppins Light',
        fontSize: 18,
    },
    header:{
        margin: 40,
        
    },
    choices:{
        gap: 40,
        marginLeft: 40,
        marginTop: 40,
    },
    textChoices:{
        fontFamily: 'Poppins Light',
        fontSize: 28
    },
    cat:{
        alignSelf: 'center',
        // marginBottom: 20,
    },

})

export default LandingPageV2;