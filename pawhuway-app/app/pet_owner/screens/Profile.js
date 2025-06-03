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
} from "react-native";
import { supabase } from "../../../src/lib/supabase";
import { Stack, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { set } from "lodash";

const editProfile = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [image, setImage] = useState(null);
  const [contact_number, setContactNumber] = useState("");
  const [petCount, setPetCount] = useState(0);

  const goBack = () => {
    router.push("/pet_owner/dashboard-v2");
  };

  const fetchUserProfile = async () => {
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error);
      return;
    }
    const userEmail = user?.user?.email;
    const userId = user?.user?.id;
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);
    const { data, error: profileError } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("email_add", userEmail)
      .maybeSingle();

    const { data: data2, error: profileError2 } = await supabase
      .from("pet_owners")
      .select("*")
      .eq("email", userEmail)
      .maybeSingle();
    const { data: petdata, error: petError } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", data2.id);

    if (profileError || profileError2 || petError)
      console.error("Error fetching user:", profileError);
    else {
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setBirthDate(data.birth_date);
      setAddress(data.address);
      setContactNumber(data2.contact_number || "");
      setPetCount(petdata?.length || 0);
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

    const { error: petOwnerError } = await supabase
      .from("pet_owners")
      .update({
        contact_number,
      })
      .eq("email", userEmail);

    if (petOwnerError) {
      console.error("Error updating profile:", updateError);
      Alert.alert("Update Failed", updateError.message);
    } else {
      console.log("Profile updated successfully!");
      // console.log(firstName, lastName);
      Alert.alert("Success", "Your profile has been updated.");
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.backbtn} onPress={goBack}>
          <View>
            <AntDesign name="left" size={24} color="black" />
          </View>
        </TouchableOpacity>
        <View style={styles.profileSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              editable={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LAST NAME</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              editable={false}
            />
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
            <Text style={styles.label}>CONTACT INFO</Text>
            <TextInput
              style={styles.input}
              value={contact_number}
              onChangeText={setContactNumber}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NO. OF PETS</Text>
            <TextInput
              style={styles.input}
              value={petCount.toString()}
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
              <TouchableOpacity style={styles.saveChanges}>
                <Text style={styles.savetext}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    backgroundColor: "#B3EBF2", // 🟢 Add background color to the entire screen
  },
  profileSection: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 90,
    paddingHorizontal: 25,
    marginTop: 120,
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
  },
  input: {
    // position: 'absolute',
    fontFamily: "Poppins Light",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderColor: "#808080",
    borderWidth: 1 / 2,
    paddingLeft: 15,
    marginBottom: 20,
    borderRadius: 10,
  },
  inputGroup: {
    // marginTop: 125
  },
  label: {
    fontFamily: "Kanit Medium",
    marginLeft: 25,
    marginBottom: 5,
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
});

export default editProfile;
