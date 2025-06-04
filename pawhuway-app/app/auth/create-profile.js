// import React, { useState } from "react";
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   Image,
//   Button,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { supabase } from "../../src/lib/supabase";
// import { Stack } from "expo-router";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { LinearGradient } from "expo-linear-gradient";
// import { useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { set } from "lodash";

// // const createProfile = () => {
// //   const [username, setUserName] = useState("");
// //   const [firstName, setFirstName] = useState("");
// //   const [lastName, setLastName] = useState("");
// //   const [address, setAddress] = useState("");
// //   const [birthdate, setBirthDate] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [userId, setUserId] = useState(null);
// //   const router = useRouter();
// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <Stack.Screen options={{ headerShown: false }} />
// //       <StatusBar hidden={true} />
// //       <View></View>
// //     </SafeAreaView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     backgroundColor: "#fff",
// //     flex: 1,
// //   },
// // });

// const createProfile = () => {
//   const [username, setUserName] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [address, setAddress] = useState("");
//   const [birthdate, setBirthDate] = useState("");
//   // const [email, setEmail] = useState("");
//   const [userId, setUserId] = useState(null);
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const email = params.email || "";

//   async function addDetails() {
//     const { data, error } = await supabase
//       .from("user_accounts")
//       .insert([
//         {
//           first_name: firstName,
//           last_name: lastName,
//           username: username,
//           email_add: email,
//           birth_date: birthdate,
//           address: address,
//         },
//       ])
//       .select();

//     if (error) {
//       Alert.alert(error.message);
//       // console.log("userid",userId);
//       // console.log("authid",auth.uid());
//     } else {
//       Alert.alert("Finished Setting up Account!");
//       router.push("/components/landing-page-v2");
//     }
//   }

//   // useEffect(() => {
//   //   const fetchUser = async () => {
//   //     const {
//   //       data: { user },
//   //       error,
//   //     } = await supabase.auth.getUser();
//   //     if (user) {
//   //       setEmail(user.email); // Set the email from the logged-in user
//   //     }
//   //   };

//   //   fetchUser();
//   // }, []);

//   return (
//     <LinearGradient
//       colors={["#B3EBF2", "#85D1DB", "#C9FDF2", "#B6F2D1"]}
//       style={styles.gradient}
//     >
//       <SafeAreaView style={styles.container}>
//         <Stack.Screen options={{ headerShown: false }} />
//         <StatusBar hidden={true} />
//         <View>
//           <Text style={styles.welcometxt}>Welcome to Pawhuway!</Text>
//         </View>

//         <View style={styles.form}>
//           <View>
//             <View style={styles.input}>
//               <Text style={styles.title}>Username</Text>
//               <TextInput
//                 style={styles.inputControl}
//                 value={username}
//                 onChangeText={setUserName}
//               />
//             </View>
//             <View style={styles.input}>
//               <Text style={styles.title}>First Name</Text>
//               <TextInput
//                 style={styles.inputControl}
//                 value={firstName}
//                 onChangeText={setFirstName}
//               />
//             </View>
//             <View style={styles.input}>
//               <Text style={styles.title}>Last Name</Text>
//               <TextInput
//                 style={styles.inputControl}
//                 value={lastName}
//                 onChangeText={setLastName}
//               />
//             </View>
//             <View style={styles.input}>
//               <Text style={styles.title}>Address</Text>
//               <TextInput
//                 style={styles.inputControl}
//                 value={address}
//                 onChangeText={setAddress}
//               />
//             </View>
//             <View style={styles.input}>
//               <Text style={styles.title}>Date of Birth</Text>
//               <TextInput
//                 style={styles.inputControl}
//                 value={birthdate}
//                 placeholder="yyyy/mm/dd"
//                 onChangeText={setBirthDate}
//               />
//             </View>
//           </View>
//         </View>

//         <View>
//           <TouchableOpacity style={styles.btn} onPress={addDetails}>
//             <Text style={styles.btnTxt}>Save Changes</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   welcometxt: {
//     textAlign: "center",
//     marginTop: 100,
//     fontSize: 20,
//     fontFamily: "LEMON MILK Medium",
//   },

//   form: {
//     marginTop: 100,
//   },

//   title: {
//     fontFamily: "LEMON MILK Medium",
//     marginLeft: 20,
//   },
//   inputControl: {
//     backgroundColor: "#FFFFFF",
//     marginHorizontal: 20,
//     borderColor: "#808080",
//     borderWidth: 1 / 2,
//     paddingLeft: 15,
//     marginBottom: 20,
//     borderRadius: 10,
//     marginHorizontal: 20,
//     // alignSelf: 'center',
//   },
//   btn: {
//     color: "#F9FE62",
//     backgroundColor: "#F9FE62",
//     marginHorizontal: 20,
//     borderColor: "#1E1E1E",
//     borderWidth: 1 / 2,
//     borderRadius: 5,
//     paddingVertical: 8,
//     backgroundColor: "#B6F2D1",
//   },
//   btnTxt: {
//     textAlign: "center",
//     fontFamily: "LEMON MILK Medium",
//   },
// });

// export default createProfile;

import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { Stack } from "expo-router";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const CreateProfile = () => {
  const [username, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || "";

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!birthdate.trim()) newErrors.birthdate = "Date of birth is required";

    // Basic date format validation
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (birthdate && !dateRegex.test(birthdate)) {
      newErrors.birthdate = "Please use YYYY/MM/DD format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function addDetails() {
    if (!validateForm()) {
      Alert.alert("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_accounts")
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            username: username,
            email_add: email,
            birth_date: birthdate,
            address: address,
          },
        ])
        .select();

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Account setup completed successfully!", [
          {
            text: "Continue",
            onPress: () => router.push("/components/landing-page-v2"),
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    icon,
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? "#FF6B6B" : "#666"}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.inputField, icon && styles.inputWithIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="paw" size={40} color="black" />
            </View>
            <Text style={styles.welcomeTitle}>
              Welcome to{" "}
              <Text style={{ fontFamily: "Kanit Medium" }}>Pawhuway!</Text>
            </Text>
            <Text style={styles.subtitle}>Let's set up your profile</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <InputField
              label="Username"
              value={username}
              onChangeText={setUserName}
              placeholder="Enter your username"
              error={errors.username}
              icon="person-outline"
            />

            <InputField
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              error={errors.firstName}
              icon="person-outline"
            />

            <InputField
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              error={errors.lastName}
              icon="person-outline"
            />

            <InputField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              error={errors.address}
              icon="location-outline"
            />

            <InputField
              label="Date of Birth"
              value={birthdate}
              onChangeText={setBirthDate}
              placeholder="YYYY/MM/DD"
              error={errors.birthdate}
              icon="calendar-outline"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={addDetails}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.submitButtonText}>Creating Profile...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    // borderRadius: 40,
    // backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: "Poppins Light",
    // color: "#fff",
    fontWeight: "300",
    marginBottom: 5,
  },
  appName: {
    fontSize: 32,
    // color: "#fff",
    fontFamily: "Kanit Medium",
    // fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins Light",
    // color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
    // marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 15,
    height: 50,
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#fff5f5",
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: "#3C3C4C",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
    padding: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "Poppins Light",
    fontSize: 18,

    // fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CreateProfile;
