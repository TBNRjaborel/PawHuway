// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";
import VetClinicSVG from "../../assets/pictures/vet_clinic.svg";
import { TextInput } from "react-native-paper";
import { FlatList } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";

// export default Dashboard;
const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);
const VetClinicDashboard = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [vetName, searchVet] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinic, setClinic] = useState(null);
  const [vetlist, setVetList] = useState([]);
  const [selectedVet, setSelectedVet] = useState(null);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      const userEmail = user?.user?.email;
      if (error) console.error("Error fetching User");

      const { data: clinicProfile, error: dataError } = await supabase
        .from("vet_clinics")
        .select("*")
        .eq("clinic_email", userEmail)
        .maybeSingle();

      if (dataError) console.error("Error fetching Clinic");
      else {
        setDescription(clinicProfile.description);
        setClinicName(clinicProfile.clinic_name);
      }
    };
    fetchClinic();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw new Error(error.message);
        setUser(user);
        // console.log(user.id)
        const { data: clinicData, error: clinicError } = await supabase
          .from("vet_clinics")
          .select("*")
          .eq("id", user.id)
          .single();

        if (clinicError) throw new Error(clinicError.message);
        setClinic(clinicData);

        //fetch vet from this clinic
        const { data: vetData, error: vetError } = await supabase
          .from("clinic_vet_relation")
          .select(
            `
                          vet_id,
                          vet_profiles(
                          email, user_accounts(*)
                          )
                      `
          )
          .eq("vet_clinic_id", clinicData.id);

        if (vetError) throw new Error(vetError.message);
        setVetlist(vetData);
        // console.log("vets", vetData[0])
        // console.log("vet_profiles", vetData[0].vet_profiles)
        // console.log("user_accounts", vetData[0].vet_profiles.user_accounts)
      } catch (err) {
        console.error("Fetch error:", err.message);
      } finally {
        setIsLoading(false); // Done loading
      }
    };

    fetchData();
    // console.log("vets2", vetList)
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />
      <ScrollView>
        <View style={styles.content}>
          {/*Header*/}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push("/components/landing-page-v2")}
            >
              <Text style={styles.homeText}>Home</Text>
            </TouchableOpacity>

            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>PawHuway</Text>
            </View>

            <TouchableOpacity style={styles.profileButton}>
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("../../assets/pictures/blank-profile-pic.png") // <-- your placeholder image
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>{clinicName}</Text>
          </View>
          <View>
            <TouchableOpacity style={styles.calendarButton}>
              <View style={styles.calendarText}>
                <Text
                  style={{
                    fontFamily: "Poppins Light",
                    fontSize: 18,
                    color: "white",
                  }}
                >
                  Calendar
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.descriptionBox}>
            <VetClinicSVG
              width={180}
              height={180}
              fill="#B3EBF2"
              stroke="#3C3C4C"
              strokeWidth={0.5}
            />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text
                style={{
                  flexWrap: "wrap",
                  fontFamily: "Poppins Light",
                  fontSize: 18,
                }}
              >
                {description || "No description available"}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 40 }}>
            <Text
              style={{
                fontFamily: "Poppins Light",
                fontSize: 18,
              }}
            >
              Veterinarians
            </Text>
          </View>
          <View style={{ marginTop: 20 }}>
            <TextInput
              style={styles.searchbar}
              placeholder="Search Vet Here"
              onChangeText={searchVet}
              underlineColor="transparent"
            />
          </View>
          <View
            style={{
              alignItems: vetlist.length > 1 ? "center" : "flex-start",
              marginTop: 20,
              width: vetlist.length > 1 ? "100%" : "94%",
            }}
          >
            <Text style={[styles.title, { alignSelf: "center" }]}>
              Veterinarian List
            </Text>
            {isLoading ? (
              <View
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "80%",
                }}
              >
                <ActivityIndicator size="large" color="#3C3C4C" />
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                {vetlist.map((item, index) => (
                  <View key={item.vet_id || index} style={styles.cardWrapper}>
                    <TouchableOpacity
                      style={styles.vetCard}
                      onPress={() => setSelectedVet(item)}
                    >
                      <Fontisto name="doctor" size={75} color="white" />
                      <Text
                        style={[
                          styles.label,
                          { marginTop: 10, color: "white" },
                        ]}
                      >
                        {capitalizeFirstLetter(
                          item.vet_profiles.user_accounts.first_name
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
          {selectedVet && (
            <View style={styles.fullScreenOverlay}>
              <Modal
                visible={!!selectedVet}
                transparent={true}
                onRequestClose={() => setSelectedVet(null)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      {/* Remove */}
                      <TouchableOpacity
                        onPress={() => handleRemoveVet(selectedVet.vet_id)}
                      >
                        <Ionicons name="trash-outline" size={24} color="grey" />
                      </TouchableOpacity>

                      {/* Close */}
                      <TouchableOpacity onPress={() => setSelectedVet(null)}>
                        <Text style={styles.closeText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    {selectedVet && (
                      <>
                        <Text style={styles.label}>Vet Details</Text>
                        <Fontisto name="doctor" size={75} color="#3C3C4C" />
                        <View style={styles.vetDetailsContent}>
                          <Text style={styles.label}>
                            Name:{" "}
                            <Text style={styles.value}>
                              {capitalizeFirstLetter(
                                selectedVet.vet_profiles.user_accounts
                                  .first_name
                              )}{" "}
                              {capitalizeFirstLetter(
                                selectedVet.vet_profiles.user_accounts.last_name
                                  ? selectedVet.vet_profiles.user_accounts
                                      .last_name
                                  : ""
                              )}
                            </Text>
                          </Text>
                          <Text style={styles.label}>
                            Address:{" "}
                            <Text style={styles.value}>
                              {selectedVet.vet_profiles.user_accounts.address}
                            </Text>
                          </Text>
                          <Text style={styles.label}>
                            Birthdate:{" "}
                            <Text style={styles.value}>
                              {
                                selectedVet.vet_profiles.user_accounts
                                  .birth_date
                              }
                            </Text>
                          </Text>
                          <Text style={styles.label}>
                            Email:{" "}
                            <Text style={styles.value}>
                              {selectedVet.vet_profiles.user_accounts.email_add}
                            </Text>
                          </Text>
                        </View>
                        <Text
                          style={styles.label}
                          onPress={() => {
                            setSelectedVet(null);
                            router.push(
                              `/vet_clinic/screens/petList?vetId=${selectedVet.vet_id}`
                            );
                          }}
                        >
                          VIEW PETS
                        </Text>

                        {/* Add more details (e.g., specialty, contact) here */}
                      </>
                    )}
                  </View>
                </View>
              </Modal>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  homeText: {
    fontFamily: "Poppins Light",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontFamily: "Poppins Light",
    fontSize: 20,
    color: "#333",
    marginLeft: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    marginBottom: 25,
  },
  greetingTitle: {
    fontFamily: "Kanit Medium",
    fontSize: 24,
    // fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  calendarButton: {
    backgroundColor: "#3C3C4C",
    borderRadius: 10,
    paddingVertical: 10,
  },
  calendarText: {
    alignItems: "center",
  },
  descriptionBox: {
    marginTop: 40,
    flexDirection: "row",
    // flexWrap: "wrap",
    gap: 10,
  },
  searchbar: {
    backgroundColor: "#fff",
    borderColor: "#3C3C4C",
    borderWidth: 1 / 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 40,
    paddingHorizontal: 16,
  },
});
export default VetClinicDashboard;
