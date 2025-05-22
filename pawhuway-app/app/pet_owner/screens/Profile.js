import React, { useState } from "react";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
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
} from "react-native";
import { supabase } from "../../../src/lib/supabase";
import { Stack, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState(null);
  // const [password, changePass] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return null;
      }
      console.log("user: ", user.email);

      setUser(user);
    };

    getUser();
  }, []);
  
  async function profilePic() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*", // Allow image files only
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets) return;

    const file = result.assets[0];
    const fileName = `profile_${Date.now()}.jpg`; // Unique filename
    const filePath = `profiles/${fileName}`; // Folder in Supabase Storage

    try {
      const { data, error } = await supabase.storage
        .from("user-profile-images") // Ensure bucket name matches
        .upload(filePath, {
          uri: file.uri,
          type: file.mimeType,
          name: fileName,
        });

      if (error) throw error;

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from("user-profile-images")
        .getPublicUrl(filePath);

      setImage(urlData.publicUrl); // Update state with new image URL
      await updateProfilePicture(urlData.publicUrl); // Store in database
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Image upload failed.");
    }
  }
  async function updateProfilePicture(imageUrl) {
    const { data: user, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    const userEmail = user?.user?.email;
    const { error: updateError } = await supabase
      .from("user_accounts")
      .update({ profile_picture: imageUrl })
      .eq("email_add", userEmail);

    if (updateError) {
      console.error("Error updating profile picture:", updateError);
      Alert.alert("Update Failed", updateError.message);
    } else {
      console.log("Profile picture updated successfully!");
      Alert.alert("Success", "Profile picture updated.");
    }
  }

  const fetchUserProfile = async () => {
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error);
      return;
    }
    const userEmail = user?.user?.email;
    // console.log("User ID:", userId);
    const { data, error: profileError } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("email_add", userEmail)
      .maybeSingle();

    if (profileError) console.error("Error fetching user:", profileError);
    else {
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setUserName(data.username);
      setEmail(data.email_add);
      setBirthDate(data.birth_date);
      setAddress(data.address);
      setImage(data.profile_picture || null);
    }

    const { data: ownerData, error: ownerError } = await supabase
      .from("pet_owners")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (ownerError) console.error("Error fetching user:", ownerError);
    else {
      setNumber(ownerData.contact_number);
    }
  };

  const updateUserProfile = async () => {
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    const userEmail = user?.user?.email;

    const { error: updateError } = await supabase
      .from("user_accounts")
      .update({
        first_name: firstName,
        last_name: lastName,
        username: username,
        email_add: email,
        birth_date: birthdate,
        address: address,
      })
      .eq("email_add", userEmail);

    const { error: updateError2 } = await supabase
      .from("pet_owners")
      .update({
        contact_number: number,
      })
      .eq("email", userEmail);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      Alert.alert("Update Failed", updateError.message);
    } else if (updateError2) {
      console.error("Error updating profile:", updateError2);
      Alert.alert("Update Failed", updateError2.message);
    } else {
      console.log("Profile updated successfully!");
      Alert.alert("Success", "Your profile has been updated.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);


  const deleteOwnerProfile = async () => {
    Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this profile?",
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const { data: petOwner, error: ownerError } = await supabase
                            .from("pet_owners")
                            .select("id")
                            .eq("email", user.email)
                            .single();

                        if (ownerError) {
                            console.error("Error fetching pet owner:", ownerError);
                            Alert.alert("Error", "Failed to fetch pet owner.");
                            return;
                        }

                        const ownerId = petOwner.id;

                        const { data: pets, error: petsError } = await supabase
                            .from("pets")
                            .select("id")
                            .eq("owner_id", ownerId);

                        if (petsError) {
                            console.error("Error fetching pets:", petsError);
                            Alert.alert("Error", "Failed to fetch pets.");
                            return;
                        }

                        for (const pet of pets) {
                            const petId = pet.id;

                            const { data: imageFiles, error: imageError } = await supabase
                                .storage
                                .from("pet-images")
                                .list("", { search: `${petId}-` });

                            if (imageError) {
                                console.error(`Error listing files for pet ${petId} in pet-images:`, imageError);
                            } else {
                                for (const file of imageFiles) {
                                    const { error: deleteImageError } = await supabase
                                        .storage
                                        .from("pet-images")
                                        .remove([file.name]);

                                    if (deleteImageError) {
                                        console.error(`Error deleting file ${file.name} in pet-images:`, deleteImageError);
                                    }
                                }
                            }

                            const { data: medFiles, error: medError } = await supabase
                                .storage
                                .from("pet-medical-history")
                                .list("", { search: `${petId}-` });

                            if (medError) {
                                console.error(`Error listing files for pet ${petId} in pet-medical-history:`, medError);
                            } else {
                                for (const file of medFiles) {
                                    const { error: deleteMedError } = await supabase
                                        .storage
                                        .from("pet-medical-history")
                                        .remove([file.name]);

                                    if (deleteMedError) {
                                        console.error(`Error deleting file ${file.name} in pet-medical-history:`, deleteMedError);
                                    }
                                }
                            }
                        }

                        // Delete the pet owner profile
                        const { error } = await supabase
                            .from("pet_owners")
                            .delete()
                            .eq("email", user.email);

                        if (error) {
                            console.error("Error deleting profile:", error);
                            Alert.alert("Error", "Failed to delete profile.");
                            return;
                        }

                        Alert.alert("Success", "Profile deleted successfully!");
                        router.push("/components/landing-page");
                    } catch (err) {
                        console.error("Unexpected error deleting profile:", err);
                        Alert.alert("Error", "An unexpected error occurred.");
                    }
                },
            },
        ]
    );
};

  return (
    <LinearGradient
      colors={["#B3EBF2", "#85D1DB", "#C9FDF2", "#B6F2D1"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar hidden={true} />

        <TouchableOpacity style={styles.backButton} onPress={() => {router.push("/components/landing-page-v2")}}>
          <AntDesign name="home" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.container}>
          
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.imgcontainer}>
            <Image
              source={
                image
                  ? { uri: image }
                  : require("../../../assets/pictures/blank-profile-pic.png")
              }
              style={styles.image}
            />
            <TouchableOpacity style={styles.pickImg} onPress={profilePic}>
              <Ionicons name="camera" size={25} />
            </TouchableOpacity>
          </View>
            <View style={styles.profileSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>FIRST NAME</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>LAST NAME</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  editable={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput style={styles.input} value={email} editable={false} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DATE OF BIRTH</Text>
                <TextInput
                  style={styles.input}
                  value={birthdate}
                  onChangeText={setBirthDate}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CONTACT NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={number}
                  onChangeText={setNumber}
                />
              </View>
              <View style={styles.btn}>
                <View>
                  <TouchableOpacity
                    style={styles.saveChanges}
                    onPress={updateUserProfile}
                  >
                    <Text style={styles.savetext}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity
                    style={styles.saveChanges}
                    onPress={deleteOwnerProfile}
                  >
                    <Text style={styles.savetext}>Delete Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  pickImg: {
    alignSelf: "center",
    position: "absolute",
    marginTop: 190,
    paddingLeft: 100,
  },
  container: {
    // flex: 1,
    // backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileSection: {
    height: "100%",
    backgroundColor: "#C9FDF2",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 125,
    paddingHorizontal: 25,
    marginTop: 100,
  },
  btn: {
    gap: 20,
  },
  backbtn: {
    position: "absolute",
    margin: 40,
  },
  image: {
    width: 175,
    height: 175,
    alignSelf: "center",
    // marginLeft: 100,
    marginTop: 50,
    borderRadius: 100,
  },
  imgcontainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 1,
  },
  input: {
    // position: 'absolute',
    fontFamily: "Poppins Light",
    backgroundColor: "#B3EBF2",
    marginHorizontal: 20,
    borderColor: "#808080",
    borderWidth: 1 / 2,
    paddingLeft: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  inputGroup: {
    // marginTop: 125
  },
  label: {
    fontFamily: "Kanit Medium",
    marginLeft: 25,
    marginBottom: 0,
  },
  saveChanges: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderColor: "#1E1E1E",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 8,
  },
  savetext: {
    fontFamily: "Poppins Light",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});

export default Profile;
