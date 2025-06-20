import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { Stack, useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { FlatList } from "react-native";

const PetDashboard = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [user, setUser] = useState(null);
  const [image, setImage] = useState();
  const [owner, setOwner] = useState(null);
  const [patients, setPatients] = useState([]);
  const [vetId, setVetId] = useState(null);

  // Category data
  const categories = [
    { id: "1", name: "Calendar", color: "#3C3C4C" },
    { id: "2", name: "QR Code", color: "#3C3C4C" },
    // { id: '3', name: 'Search Clinic', icon: 'cut', color: '#F90' },
  ];

  const profile = () => {
    router.push("/vet/screens/Profile");
  };
  useEffect(() => {
    const fetchUserProfileAndPatients = async () => {
      const { data: user, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      const userEmail = user?.user?.email;

      // 1. Get vet ID from vet_profiles using email
      const { data: vetProfile, error: vetProfileError } = await supabase
        .from("vet_profiles")
        .select("id")
        .eq("email", userEmail)
        .maybeSingle();

      let vetId = null;
      if (vetProfileError) {
        console.error("Error fetching vet profile:", vetProfileError);
      } else if (vetProfile) {
        setVetId(vetProfile.id);
        vetId = vetProfile.id;
        console.log("Vet profile found:", vetProfile);
      } else {
        console.warn("No vet profile found for email:", userEmail);
      }

      // ...existing user_accounts fetch...
      const { data: userData, error: profileError } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("email_add", userEmail)
        .maybeSingle();

      if (profileError) console.error("Error fetching user:", profileError);
      else {
        setFirstName(userData.first_name);
        setImage(userData.profile_picture || null);
      }

      // 2. Get all pet_ids for this vet from vet_pet_relation
      if (vetId) {
        const { data: relations, error: relationError } = await supabase
          .from("vet_pet_relation")
          .select("pet_id")
          .eq("vet_id", vetId);

        if (relationError) {
          console.error("Error fetching vet_pet_relation:", relationError);
          setPatients([]);
          return;
        }
        if (!relations || relations.length === 0) {
          setPatients([]);
          return;
        }

        const petIds = relations.map((r) => r.pet_id);
        console.log("Pet IDs for this vet:", petIds);

        // 3. Fetch pet details for these pet_ids
        const { data: petDetails, error: petsError } = await supabase
          .from("pets")
          .select(
            "id, name, age, sex, type, height, weight, owner_id, img_path, file_path"
          )
          .in("id", petIds);

        if (petsError) {
          console.error("Error fetching pets:", petsError);
          setPatients([]);
          return;
        }

        console.log("Fetched pets:", petDetails);
        setPatients(petDetails);
      }
    };

    fetchUserProfileAndPatients();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/components/landing-page-v2")}
          >
            <Text style={styles.homeText}>Home</Text>
          </TouchableOpacity>

          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>PawHuway</Text>
          </View>

          <TouchableOpacity style={styles.profileButton} onPress={profile}>
            <Image source={{ uri: image }} style={styles.profileImage} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hi {firstName},</Text>
          <Text style={styles.greetingSubtitle}>
            Time to find the best care for your patients!
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryButton}
              onPress={() => {
                if (category.name === "Calendar") {
                  router.push("/vet/screens/Calendar");
                } else if (category.name === "QR Code") {
                  router.push("/vet/screens/Scan-qr");
                }
              }}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                {category.name === "Calendar" && (
                  <Ionicons name="calendar" size={40} color="#fff" />
                )}
                {category.name === "QR Code" && (
                  <Ionicons
                    name="scan-outline"
                    size={40}
                    color="#fff"
                  ></Ionicons>
                )}
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.viewClinicContainer}>
          <TouchableOpacity
            onPress={() => {
              router.push("/vet/view-clinics");
            }}
          >
            <View style={styles.viewClinic}>
              <Text style={{ fontFamily: 'Poppins Light', fontSize: 18 }}>View Clinic Affiliation</Text>
              <Image
                source={require('../../assets/pictures/back-btn.png')}
                style={{
                  tintColor: 'black',
                  transform: [{ scaleX: -1 }],
                  height: 18,
                  width: 18,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment */}
        {/* <View style={styles.appointmentCard}>
          <View style={styles.appointmentContent}>
            <View style={styles.appointmentIcon}>
              <Ionicons name="link" size={20} color="#fff" />
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentTitle}>Health Checkup</Text>
              <View style={styles.appointmentTime}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="black"
                  style={styles.timeIcon}
                />
                <Text style={styles.appointmentTimeText}>
                  09:00 AM • 14 July, 2020
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.appointmentImageContainer}>
          
          </View>
        </View> */}

        <View style={styles.petsHeader}>
          <Text style={styles.petsTitle}>Patients</Text>
          <TouchableOpacity
            style={styles.addPetButton}
            onPress={() => {
              router.push("/vet/screens/add_patients");
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Pet Cards */}
        {patients.length > 0 ? (
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id}
            horizontal={true} // or true if you want horizontal scrolling
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  router.push(
                    `/pet_owner/screens/Pets/pet-details?petId=${item.id}`
                  );
                }}
              >
                <View style={styles.petCard}>

                  <Text style={styles.petName}>{item.name}</Text>
                  <Text style={styles.petType}>{item.type}</Text>
                  <Text style={styles.petAge}>Age: {item.age}</Text>
                  <View style={styles.petImageContainer}>
                    {item.img_path ? (
                      <Image
                        fill
                        height={200}
                        width={200}
                        source={{ uri: item.img_path }}
                        style={{ borderRadius: 10 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="paw" size={80} color="#ccc" style={{ marginBottom: 10 }} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Text style={{ fontFamily: "Poppins Light", fontSize: 16, color: "gray", fontStyle: 'italic' }}>
              No pet patients found. Add your first pet patient!
            </Text>
          </View>
        )}

        {/* Filter Button */}
      </View>
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  profileImage: {
    width: "100%",
    height: "100%",
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
  greetingSubtitle: {
    fontFamily: "Poppins Light",
    fontSize: 16,
    color: "#888",
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: "center",
    width: "48%",
  },
  categoryIcon: {
    width: "100%",
    height: 100,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontFamily: "Poppins Light",
    fontSize: 12,
    color: "#333",
  },
  appointmentCard: {
    backgroundColor: "#B3EBF2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appointmentContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 3,
  },
  appointmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3C3C4C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontFamily: "Poppins Light",
    fontSize: 16,
    color: "Black",
    marginBottom: 6,
  },
  appointmentTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  appointmentTimeText: {
    fontFamily: "Poppins Light",
    fontSize: 12,
    color: "black",
    opacity: 0.9,
  },
  appointmentImageContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  petsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  petsTitle: {
    fontFamily: "Poppins Light",
    fontSize: 20,
    color: "#333",
  },
  addPetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3C3C4C",
    justifyContent: "center",
    alignItems: "center",
  },
  petsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  petCard: {
    backgroundColor: "#B3EBF2",
    borderRadius: 16,
    padding: 16,
    width: 300,
    height: 350,
    alignItems: "center",
  },
  petImageContainer: {
    marginTop: 10,
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  petName: {
    fontFamily: "Poppins Light",
    fontSize: 18,
    color: "black",
  },
  petType: {
    fontFamily: "Poppins Light",
    fontSize: 14,
    color: "black",
  },
  petAge: {
    fontFamily: "Poppins Light",
    fontSize: 12,
    color: "black",
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    marginTop: 10,
  },
  filterButton: {
    backgroundColor: "#3C3C4C",
    borderRadius: 20,
    padding: 10,
  },
  viewClinicContainer: {
    marginBottom: 20,

  },
  viewClinic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    // gap: '40%',
    alignItems: 'center',
    backgroundColor: '#B3EBF2',
    height: 85,
    borderRadius: 15,
    marginBottom: 20,
  },
});

export default PetDashboard;
