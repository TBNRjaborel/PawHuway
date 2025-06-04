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
// import React, { useEffect, useState } from "react";
// import { useRouter, Stack } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import { supabase } from "../../src/lib/supabase";
// import { Ionicons } from "@expo/vector-icons";
// import * as DocumentPicker from "expo-document-picker";

// const createVetProfile = () => {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [username, setUserName] = useState("");
//   const [contactInfo, setContactInfo] = useState("");
//   const [vetLicense, setLicense] = useState("");
//   const [vetClinicId, setVetClinicId] = useState("");
//   const [image, setImage] = useState(null);

//   useEffect(() => {
//     async function fetchUserProfile() {
//       const { data: user, error } = await supabase.auth.getUser();
//       const userId = user?.user?.id;
//       const userEmail = user?.user?.email;
//       if (error) {
//         console.error("Error fetching user:", error);
//         return;
//       }
//       const { data, error: profileError } = await supabase
//         .from("user_accounts")
//         .select("*")
//         .eq("email_add", userEmail)
//         .maybeSingle();
//       if (profileError) {
//         console.error("Error fetching user:", error);
//         return;
//       } else {
//         setFirstName(data.first_name);
//         setLastName(data.last_name);
//         setUserName(data.username);

//         setImage(data.profile_picture || null);
//       }
//     }

//     fetchUserProfile();
//   }, []);

//   const insertVetDetails = async () => {
//     const { data: user, error } = await supabase.auth.getUser();

//     if (error) {
//       console.error("Error fetching user:", error);
//       return;
//     }

//     const userId = user?.user?.id;
//     const userEmail = user?.user?.email;
//     const { error: updateError } = await supabase
//       .from("vet_profiles")
//       .insert([
//         {
//           id: userId,
//           contact_info: contactInfo,
//           vet_license: vetLicense,
//           email: userEmail,
//         },
//       ])
//       .select();

//     if (updateError) {
//       console.error("Error updating profile:", updateError);
//       Alert.alert("Update Failed", updateError.message);
//     } else {
//       Alert.alert("Success", "Your profile has been created.");
//     }
//   };
//   return (
//     <SafeAreaView style={styles.background}>
//       <Stack.Screen options={{ headerShown: false }} />
//       <StatusBar hidden={true} />
//       <View>
//         <TouchableOpacity style={styles.backbtn}>
//           <View>
//             <AntDesign name="left" size={24} color="black" />
//           </View>
//         </TouchableOpacity>

//         <View style={styles.imageContainer}>
//           <Image
//             source={
//               image
//                 ? { uri: image }
//                 : require("../../assets/pictures/blank-profile-pic.png")
//             }
//             style={styles.image}
//           />
//         </View>
//       </View>
//       <View style={styles.container}>
//         <View style={styles.profileSection}>
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>FIRST NAME</Text>
//             <TextInput
//               style={styles.input}
//               value={firstName}
//               editable={false}
//             />
//           </View>
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>LAST NAME</Text>
//             <TextInput style={styles.input} value={lastName} editable={false} />
//           </View>
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>USERNAME</Text>
//             <TextInput style={styles.input} value={username} editable={false} />
//           </View>
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>CONTACT INFO</Text>
//             <TextInput
//               style={styles.input}
//               value={contactInfo}
//               onChangeText={setContactInfo}
//             />
//           </View>
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>VET LICENSE</Text>
//             <TextInput
//               style={styles.input}
//               value={vetLicense}
//               onChangeText={setLicense}
//             />
//           </View>

//           <View style={styles.buttons}>
//             <View>
//               <TouchableOpacity
//                 style={styles.saveChanges}
//                 onPress={insertVetDetails}
//               >
//                 <Text style={styles.saveChangesText}>Save Changes</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     backgroundColor: "#B3EBF2",
//   },
//   imageContainer: {
//     marginTop: 100,
//     position: "absolute",
//     alignSelf: "center",
//   },
//   image: {
//     width: 150,
//     height: 150,
//   },
//   container: {
//     backgroundColor: "#FFFFFF",
//     height: "100%",
//     marginTop: "75%",
//   },
//   backbtn: {
//     position: "absolute",
//     margin: 20,
//   },
//   input: {
//     // position: 'absolute',
//     fontFamily: "Poppins Light",
//     backgroundColor: "#B3EBF2",
//     marginHorizontal: 20,
//     borderColor: "#808080",
//     borderWidth: 1 / 2,
//     paddingLeft: 15,
//     marginBottom: 10,
//     borderRadius: 10,
//     height: 40,
//   },
//   label: {
//     fontFamily: "Poppins Light",
//     marginLeft: 20,
//   },
//   profileSection: {
//     marginTop: 40,
//   },
//   saveChanges: {
//     backgroundColor: "#B3EBF2",
//     marginHorizontal: 90,
//     borderRadius: 10,
//     paddingVertical: 10,
//     alignItems: "center",
//   },
//   saveChangesText: {
//     fontFamily: "Poppins Light",
//   },
// });

// export default createVetProfile;
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import { supabase } from "../../src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

const createVetProfile = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [vetLicense, setLicense] = useState("");
  const [vetClinicId, setVetClinicId] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: user, error } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      const userEmail = user?.user?.email;
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      const { data, error: profileError } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("email_add", userEmail)
        .maybeSingle();
      if (profileError) {
        console.error("Error fetching user:", error);
        return;
      } else {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setUserName(data.username);
        setImage(data.profile_picture || null);
      }
    }

    fetchUserProfile();
  }, []);

  const insertVetDetails = async () => {
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    const userId = user?.user?.id;
    const userEmail = user?.user?.email;
    const { error: updateError } = await supabase
      .from("vet_profiles")
      .insert([
        {
          id: userId,
          contact_info: contactInfo,
          vet_license: vetLicense,
          email: userEmail,
        },
      ])
      .select();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      Alert.alert("Update Failed", updateError.message);
    } else {
      Alert.alert("Success", "Your profile has been created.");
    }
  };

  return (
    // <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
    <SafeAreaView style={styles.background}>
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
            <TouchableOpacity
              style={styles.backbtn}
              onPress={() => router.push("/components/profiles-page-v2")}
            >
              <AntDesign name="left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Veterinary Profile</Text>
          </View>

          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("../../assets/pictures/blank-profile-pic.png")
                }
                style={styles.image}
              />
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.container}>
            <View style={styles.profileSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>FIRST NAME</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>LAST NAME</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="at-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={username}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CONTACT INFO</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#667eea"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={contactInfo}
                    onChangeText={setContactInfo}
                    placeholder="Enter your contact information"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>VET LICENSE</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#667eea"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={vetLicense}
                    onChangeText={setLicense}
                    placeholder="Enter your license number"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.saveChanges}
                  onPress={insertVetDetails}
                >
                  <Text style={styles.saveChangesText}>Save Changes</Text>
                  {/* </LinearGradient> */}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    // </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    // fontWeight: "bold",
    fontFamily: "Poppins Light",
    // color: "#fff",
    marginLeft: 20,
  },
  backbtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 20,
    // backgroundColor: "#3C3C4C",
    justifyContent: "center",
    alignItems: "center",
  },
  imageSection: {
    alignItems: "center",
    paddingBottom: 20,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    flex: 1,
    paddingTop: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  profileSection: {
    paddingHorizontal: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 5,
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  buttons: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveChanges: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: "#3C3C4C",
    alignItems: "center",
    padding: 15,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveChangesText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default createVetProfile;
