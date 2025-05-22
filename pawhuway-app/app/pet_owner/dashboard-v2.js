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
  const [image, setImage] = useState();
  const userName = "Jennifer";

  // Sample pet data
  const pets = [
    {
      id: "1",
      name: "Morphy",
      age: "2 Years 3 Months",
      gender: "female",
      //   illustration: <CorgiInTent />,
    },
    {
      id: "2",
      name: "Kitten",
      age: "3 Years 6 Months",
      gender: "male",
      //   illustration: <CatWithPlant />,
    },
    {
      id: "3",
      name: "Doggo",
      age: "1 Year 8 Months",
    },
  ];

  // Category data
  const categories = [
    { id: "1", name: "Calendar", color: "#3C3C4C" },
    { id: "2", name: "Search Clinic", color: "#3C3C4C" },
    // { id: '3', name: 'Search Clinic', icon: 'cut', color: '#F90' },
  ];

  const filter = [
    { id: "1", type: "Dog", color: "#3C3C4C", icon: "🐶" },
    { id: "2", type: "Cat", color: "#3C3C4C", icon: "🐱" },
    { id: "3", type: "Rodent", color: "#3C3C4C", icon: "🐹" },
    { id: "4", type: "Bird", color: "#3C3C4C", icon: "🐦" },
    { id: "5", type: "Reptile", color: "#3C3C4C", icon: "🐍" },
    { id: "6", type: "Fish", color: "#3C3C4C", icon: "🐠" },
  ];
  const profile = () => {
    router.push("/pet_owner/screens/Profile");
  };
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
      console.log("nigana");
      setFirstName(data.first_name);
      setImage(data.profile_picture || null);
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.homeText}>Home</Text>

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
            Let's take care of your cutie pets!
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryButton}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                {category.name === "Calendar" && (
                  <Ionicons name="calendar" size={30} color="#fff" />
                )}
                {category.name === "Search Clinic" && (
                  <FontAwesome5 name="Search" size={30} color="#fff" />
                )}
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.appointmentCard}>
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
                  color="#fff"
                  style={styles.timeIcon}
                />
                <Text style={styles.appointmentTimeText}>
                  09:00 AM • 14 July, 2020
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.appointmentImageContainer}>
            {/* <CatIllustration /> */}
          </View>
        </View>

        {/* Filter Section */}
        <View>
          <Text>Category</Text>
          <View style={styles.filterContainer}>
            {filter.map((type) => (
              <TouchableOpacity key={type.id} style={styles.filterButton}>
                <View>
                  <Text style={{ fontSize: 24 }}>{type.icon}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* My Pets Section */}
        <View style={styles.petsHeader}>
          <Text style={styles.petsTitle}>My Pets</Text>
          <TouchableOpacity style={styles.addPetButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Pet Cards */}
        {/* <Carousel
            /> */}
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          horizontal={true} // or true if you want horizontal scrolling
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petAge}>{item.age}</Text>
              {item.gender && (
                <View style={styles.genderIcon}>
                  <Ionicons
                    name={item.gender === "female" ? "female" : "male"}
                    size={16}
                    color="#8B80F9"
                  />
                </View>
              )}
            </View>
          )}
        />
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
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: "#888",
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  categoryButton: {
    alignItems: "center",
    width: "48%",
  },
  categoryIcon: {
    width: "100%",
    height: 75,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#333",
  },
  appointmentCard: {
    backgroundColor: "#8B80F9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
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
    fontSize: 12,
    color: "#fff",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addPetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9A880",
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
    height: 300,
    alignItems: "center",
  },
  petImageContainer: {
    width: 120,
    height: 120,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  petAge: {
    fontSize: 12,
    color: "#888",
  },
  genderIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    marginTop: 10,
  },
  filterButton: {
    backgroundColor: "#B3EBF2",
    borderRadius: 20,
    padding: 10,
  },
});

export default PetDashboard;
