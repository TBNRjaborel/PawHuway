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
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState(null);
  const [license, setLicense] = useState("");
  // const [password, changePass] = useState('');

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
      setBirthDate(data.birth_date);
      setAddress(data.address);
      setNumber(data.contact_number);
      setImage(data.profile_picture || null);
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
      .from("vet_profiles")
      .update({
        contact_info: number,
        vet_license: license,
      })
      .eq("email_add", userEmail);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      Alert.alert("Update Failed", updateError.message);
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
              const { error } = await supabase
                .from("pet_owners")
                .delete()
                .eq("email", user.email);
              if (error) console.error("Error deleting profile:", error);

              Alert.alert("Success", "Profile deleted successfully!");
              router.push("/components/landing-page");
            } catch (err) {
              console.error("Unexpected error deleting profile:", err);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />

      <TouchableOpacity
        style={styles.backbtn}
        onPress={() => router.push("/vet/vet-dashboard")}
      >
        <View>
          <AntDesign name="left" size={24} color="black" />
        </View>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.imgcontainer}>
          <Image
            source={
              image
                ? { uri: image }
                : require("../../../assets/pictures/blank-profile-pic.png")
            }
            style={styles.image}
          />
        </View>
        <View style={styles.profileSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              editable={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LAST NAME</Text>
            <TextInput style={styles.input} value={lastName} editable={false} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DATE OF BIRTH</Text>
            <TextInput
              style={styles.input}
              value={birthdate}
              editable={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ADDRESS</Text>
            <TextInput style={styles.input} value={address} editable={false} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTACT NUMBER</Text>
            <TextInput style={styles.input} value={number} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LICENSE NO.</Text>
            <TextInput
              style={styles.input}
              value={license}
              onChangeText={setLicense}
              editable={false}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pickImg: {
    alignSelf: "center",
    position: "absolute",
    marginTop: 190,
    paddingLeft: 100,
  },
  container: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },
  profileSection: {
    height: "100%",
    backgroundColor: "#fff",
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
    top: 40, // Add this
    left: 40, // Add this
    zIndex: 10,
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
    zIndex: 1,
    position: "absolute",
    alignSelf: "center",
  },
  input: {
    // position: 'absolute',
    fontFamily: "Poppins Light",
    // backgroundColor: "#B3EBF2",
    marginHorizontal: 20,
    borderColor: "#808080",
    borderWidth: 1 / 2,
    paddingLeft: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  inputGroup: {
    // marginTop: 125,
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
  btn: {
    marginTop: 30,
    gap: 20,
  },
});

export default Profile;
