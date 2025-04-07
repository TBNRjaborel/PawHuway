import { Stack } from "expo-router"
import { SafeAreaView,StyleSheet,View,Text, TextInput } from "react-native"
import { StatusBar } from 'expo-status-bar';


const searchClinic = () => {
    return(
        <SafeAreaView style = {styles.background}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View >
                <View style = {styles.header}>
                    <Text style = {styles.textheader}>
                        Search Clinics
                    </Text>
                </View>
                <View style = {styles.subtextContainer}>
                    <Text style = {styles.subtext}>
                        Cannot find your preferred clinic? Search for it here!
                    </Text>
                </View>
            </View>
            <View style = {styles.searchBar}>
                <TextInput style = {styles.searchInput} placeholder = "Search for clinics" />
            </View>
            <View style = {styles.container}>

            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    background:{
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    header:{
        margin : 20,
    },
    subtextContainer:{
        marginTop: 10,
        marginHorizontal: 20,
    },
    textheader:{
        fontFamily:'Kanit Medium',
        fontSize:30,
    },
    subtext:{
        fontFamily: 'Poppins Light',
        fontSize: 12,
    },
    searchBar:{
        marginHorizontal: 18,
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    container:{
        backgroundColor: '#FFFFFF',
        height: '100%',
        borderTopLeftRadius: 70,  
        borderTopRightRadius: 70, 
        marginTop: '5%', 
    }
})

export default searchClinic