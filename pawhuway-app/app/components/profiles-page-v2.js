import React, { useEffect, useState } from "react";
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
import { supabase } from "../../src/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import PagerView from "react-native-pager-view";
import Icon from "react-native-vector-icons/Ionicons";

const profiles = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

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
      console.log("usersdfdsf: ", user.email);

      setUser(user);
    };

    getUser();
  }, []);

  const petProfile = async () => {
    if (!user?.email) {
      console.error("User email not found.");
      return;
    }

    try {
      const { data: existingOwner, error: fetchError } = await supabase
        .from("pet_owners")
        .select("id")
        .eq("email", user.email)
        .single();

      console.log("checked ", user.email, user.id, existingOwner);

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking existing pet owner:", fetchError.message);
        return;
      }

      if (!existingOwner) {
        console.log("making new profile");
        const { error: insertError } = await supabase
          .from("pet_owners")
          .insert([{ email: user.email }]);

        if (insertError) {
          console.error(
            "Error creating pet owner profile:",
            insertError.message
          );
          return;
        }
      }

      router.push("/pet_owner/dashboard-v2");
    } catch (error) {
      console.error("Unexpected error:", error);
      return;
    }
  };

  const vetProfile = async () => {
    if (!user?.id) {
      console.error("User id not found.");
      return;
    }

    try {
      const { data: existingVet, error: fetchError } = await supabase
        .from("vet_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      console.log("checked ", user.id, existingVet);

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking existing vet:", fetchError.message);
        return;
      }

      router.push("/vet/vet-dashboard");
    } catch (error) {
      console.error("Unexpected error:", error);
      return;
    }
  };

  const exit = () => {
    router.push("/components/landing-page-v2");
  };

  return (
    <SafeAreaView style={styles.background}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        <View key="1" style={styles.Pages}>
          <View style={styles.closeIconContainer}>
            <TouchableOpacity onPress={exit}>
              <Icon name="close" size={30} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.imageRow}>
              <Image
                source={require("../../assets/pictures/people_with_pets.png")}
                style={styles.pets}
              />
            </View>
          </View>
          <View style={styles.chooseOption}>
            <TouchableOpacity style={styles.button} onPress={petProfile}>
              <Text style={styles.PetOwner}>I am a Pet Owner</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View key="2" style={styles.Pages}>
          <View style={styles.closeIconContainer}>
            <TouchableOpacity onPress={exit}>
              <Icon name="close" size={30} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.imageRow}>
              <Image
                source={require("../../assets/pictures/vet_1.png")}
                style={styles.pets}
              />
            </View>
          </View>
          <View style={styles.chooseOption}>
            <TouchableOpacity style={styles.button} onPress={vetProfile}>
              <Text style={styles.PetOwner}>I am a Veterinarian</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View key="3" style={styles.Pages}>
          <View style={styles.closeIconContainer}>
            <TouchableOpacity onPress={exit}>
              <Icon name="close" size={30} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.imageRow}>
              <Image
                source={require("../../assets/pictures/vet_clinic_1.png")}
                style={styles.pets}
              />
            </View>
          </View>
          <View style={styles.chooseOption}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.PetOwner}>I represent a Vet Clinic</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PagerView>
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[styles.dot, currentPage === index && styles.activeDot]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },
  Pages: {
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: 'white',
  },
  pets: {
    width: 350,
    height: 350,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#3C3C4C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    // borderWidth: 1 / 2,
  },
  imageRow: {
    flexDirection: "row", // Arrange items in a row
    alignItems: "center", // Allow wrapping to the next row
    justifyContent: "center", // Center items horizontally
  },
  PetOwner: {
    fontFamily: "Poppins Light",
    fontSize: 20,
    color: "white",
  },
  chooseOption: {
    marginTop: 20,
  },
  closeIconContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1, // Ensure it appears above other elements
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#3C3C4C",
  },
});

export default profiles;
