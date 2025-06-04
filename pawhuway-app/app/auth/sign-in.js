import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";

// import { useEffect } from 'react';

const SignIn = () => {
  // const [form, setForm] = useState({
  //   email: '',
  //   password: '',
  // });
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  // useEffect(() => {s


  async function signInWithEmail() {
    try {
      // Login
      setIsLoading(true);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      // Check user type
      const { data: clinic, error: clinicError } = await supabase
        .from("vet_clinics")
        .select("id")
        .eq("clinic_email", email)
        .maybeSingle();

      if (clinicError) throw clinicError;

      // Redirect
      router.push(
        clinic
          ? "/vet_clinic/vet-clinic-dashboard"
          : "/components/landing-page-v2"
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  const goBack = () => {
    router.push("/starting-page");
  };
  return (
    // <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>
    <SafeAreaView style={styles.background}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />
      <TouchableOpacity style={styles.backbtn} onPress={goBack}>
        <View>
          <AntDesign name="left" size={15} color="black" />
        </View>
      </TouchableOpacity>
      <View>
        <Image
          source={require("../../assets/pictures/paw-logo2.png")}
          style={styles.logo}
          alt="logo"
        />
      </View>
      <View style={styles.container}>
        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.inputControl}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.inputControl}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>
          <View>
            <TouchableOpacity>
              <Text style={styles.forgot}> Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View>
            {/* <Button color = '#F9FE62' title='Log In' width = '80%'/> */}
            <TouchableOpacity
              style={styles.btn}
              onPress={signInWithEmail}
              disabled={isLoading} // Disable button during loading
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btn_txt}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.or}>Or</Text>
            <TouchableOpacity style={styles.googlebtn}>
              <Image
                source={require("../../assets/pictures/google-logo.png")}
                style={styles.google_logo}
                alt="logo"
              />
              <Text style={styles.google}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
    // </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },
  backbtn: {
    margin: 30,
    position: "absolute",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    zIndex: 10,
  },
  container: {
    backgroundColor: "#FFFFFF",
    height: "100%",
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    marginTop: 400,
  },
  logo: {
    width: 450,
    height: 450,
    alignSelf: "center",
    position: "absolute",
    // borderRadius: 200,
    // marginTop: 10,
    // marginBottom: -50,
  },
  google_logo: {
    width: 30,
    height: 30,
    alignSelf: "left",
    marginBottom: -25,
    marginLeft: 30,
  },
  inputControl: {
    fontFamily: "Poppins Light",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    borderColor: "#808080",
    borderWidth: 1 / 2,
    paddingLeft: 15,
    marginBottom: 20,
    borderRadius: 15,
    // alignSelf: 'center',
  },
  inputLabel: {
    fontFamily: "Kanit Medium",
    marginBottom: 10,
    textAlign: "left",
    paddingLeft: 25,
    fontSize: 14,
    fontWeight: "600",
  },

  form: {
    borderRadius: 10,
    // backgroundColor: '#FFFFFF',
    marginHorizontal: 40,
    marginVertical: 40,
    // paddingHorizontal: -90,
    // paddingVertical: 20,
    // borderColor: '#808080',
    // borderWidth: 1,
  },

  btn: {
    marginTop: 20,
    // color: '#B3EBF2',
    backgroundColor: "#3C3C4C",
    marginHorizontal: 10,
    borderColor: "#1E1E1E",
    borderWidth: 1 / 2,
    borderRadius: 15,
    paddingVertical: 8,
  },

  btn_txt: {
    textAlign: "center",
    fontFamily: "Poppins Light",
    color: "white",
  },
  forgot: {
    fontFamily: "Poppins Light",
    textAlign: "right",
    marginTop: -10,
    marginRight: 20,
    fontSize: 12,
  },
  or: {
    fontFamily: "Kanit Medium",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    // fontWeight: 'bold',
  },
  google: {
    fontFamily: "Poppins Light",
    textAlign: "center",
    fontSize: 16,
    // fontWeight: 'bold',
  },
  googlebtn: {
    marginTop: 20,
    backgroundColor: "#B3EBF2",
    marginHorizontal: 10,
    borderColor: "#808080",
    borderWidth: 1 / 2,
    paddingVertical: 6,
    borderRadius: 15,
  },
});

export default SignIn;
