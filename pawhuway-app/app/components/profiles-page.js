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
import AntDesign from "@expo/vector-icons/AntDesign";
import { BottomTabBar } from "@react-navigation/bottom-tabs";

const profiles = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

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

      router.push("/pet_owner/dashboard");
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

      // if (!existingVet) {
      //   console.log("making new profile");
      //   const { error: insertError } = await supabase
      //     .from("pet_owners")
      //     .insert([{ email: user.email }]);

      //   if (insertError) {
      //     console.error(
      //       "Error creating pet owner profile:",
      //       insertError.message
      //     );
      //     return;
      //   }
      // }

      router.push("/vet/vet-dashboard");
    } catch (error) {
      console.error("Unexpected error:", error);
      return;
    }
  };

  return (
    <LinearGradient
      colors={["#B3EBF2", "#85D1DB", "#C9FDF2", "#B6F2D1"]}
      style={styles.gradient}
    >
      <SafeAreaView>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar hidden={true} />
        <View>
          <Text style={styles.intro}> I am a ...</Text>
        </View>
        <View>
          <TouchableOpacity style={styles.buttons} onPress={petProfile}>
            <Text>Pet Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttons} onPress={vetProfile}>
            <Text>Veterinarian</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttons}>
            <Text>Vet Clinic</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  intro: {
    fontFamily: "Red Display",
    alignSelf: "center",
    marginTop: 200,
    marginBottom: 100,
    fontSize: 30,
  },
  buttons: {
    backgroundColor: "#FFFFFF",
    marginBottom: 30,
    width: 150,
    paddingVertical: 20,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 20,
  },
});

export default profiles;
