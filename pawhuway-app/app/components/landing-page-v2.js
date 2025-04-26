import { SafeAreaView, View,StyleSheet, Text } from "react-native"
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
const LandingPageV2 = () => {
    return(
        <SafeAreaView style = {styles.background}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View>

            </View>
        </SafeAreaView>
    )

}


const styles = StyleSheet.create({
    background:{
        flex: 1,
        backgroundColor: '#B3EBF2',
    },

})

export default LandingPageV2;