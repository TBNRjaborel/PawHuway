import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { supabase } from "../../../../src/lib/supabase";
import { Ionicons } from '@expo/vector-icons';

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const Patients = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);

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

      const { data: petOwner, error: ownerError } = await supabase
        .from("pet_owners")
        .select("*")
        .eq("email", user.email)
        .single();

      if (ownerError) {
        console.error("Error fetching pet owner:", ownerError.message);
        return;
      }

      setOwner(petOwner);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) return;

      // 1. Get all pet_ids for this vet from vet_pet_relation
      const { data: relations, error: relationError } = await supabase
        .from("vet_pet_relation")
        .select("pet_id")
        .eq("vet_id", user.id);

      if (relationError) {
        console.error("Error fetching vet_pet_relation:", relationError);
        return;
      }
      if (!relations || relations.length === 0) {
        setPets([]);
        return;
      }

      const petIds = relations.map(r => r.pet_id);
      console.log("Pet IDs enrolled with this vet:", petIds);

      // 2. Fetch pet details for these pet_ids
      const { data: petDetails, error: petsError } = await supabase
        .from("pets")
        .select(
          "id, name, age, sex, type, height, weight, owner_id, img_path, file_path"
        )
        .in("id", petIds);

      if (petsError) {
        console.error("Error fetching pets:", petsError);
        return;
      }

      console.log("Fetched pets:", petDetails);
      setPets(petDetails);
    };

    fetchPets();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.logo_container}>
        {/* style={styles.logo_container} */}
        <Image
          source={require("../../../../assets/pictures/paw-logo.png")}
          style={styles.logo}
          resizeMode="stretch"
          alt="logo"
        />
        <Text style={styles.title}>PawHuway</Text>
      </View>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          // <View style={styles.petCard}>
          //   <Image source={{ uri: item.imageUrl || '../../../assets/pictures/paw-logo.png' }} style={styles.petImage} />
          //   <View style={styles.petInfo}>
          //     <Text>Name: {item.name}</Text>
          //     <Text>Age: {item.age}</Text>
          //     <Text>Sex: {item.sex}</Text>
          //     <Text>Type: {item.type}</Text>
          //     <Text>Height: {item.height}</Text>
          //     <Text>Weight: {item.weight}</Text>
          //     <View style={styles.buttonContainer}>
          //       <TouchableOpacity style={styles.viewButton} onPress={() => router.push(`/pet_owner/edit-pet?petId=${item.id}`)}>
          //         <Text>Edit</Text>
          //       </TouchableOpacity>
          //       <TouchableOpacity style={styles.viewButton} onPress={() => deletePet(item.id)}>
          //         <Text>Delete</Text>
          //       </TouchableOpacity>
          //       <TouchableOpacity style={styles.viewButton} onPress={() => handleGenerateQR(item)}>
          //         <Text>Generate QR Code</Text>
          //       </TouchableOpacity>
          //     </View>
          //   </View>
          // </View>
          <TouchableOpacity
            style={styles.petCard}
            onPress={() =>
              router.push(
                `/pet_owner/screens/Pets/pet-details?petId=${item.id}`
              )
            }
          >
            {item.img_path ? (
              <Image
                source={{ uri: item.img_path }}
                style={styles.petImage}
                onError={() => console.log("Error loading image")}
              />
            ) : (
              <Image
                source={require("../../../../assets/pictures/paw-logo.png")}
                style={styles.petImage}
              />
            )}
            <View style={styles.petInfo}>
              <Text style={styles.petName}>
                {capitalizeFirstLetter(item.name)}
              </Text>
              <Text style={styles.petDetails}>
                {item.age} years • {item.sex}
              </Text>
              <Text style={styles.petType}>
                {capitalizeFirstLetter(item.type)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },

  logo_container: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingTop: 35,
    marginBottom: 10,
  },

  logo: {
    width: 100,
    height: 100,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 0,
    marginTop: 5,
  },

  petCard: {
    flexDirection: "row",
    backgroundColor: "#3C3C4C",
    marginHorizontal: 28,
    marginVertical: 8,
    padding: 10,
    borderRadius: 16,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  petInfo: {
    color: "white",
    flex: 1,
    marginLeft: 10,
    padding: 4,
  },
  petName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    // color: "#333",
  },
  petDetails: {
    color: "white",
    fontSize: 12,
    // fontWeight: "bold",
    // color: "#666",
    padding: 2,
  },
  petType: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    padding: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButton: {
    padding: 8,
    marginRight: 5,
    marginTop: 5,
    backgroundColor: "#FFF",
    borderRadius: 5,
    alignItems: "center",
    minWidth: 60,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: '#3C3C4C',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  btnText: {
    fontSize: 24,
    fontWeight: "bold",
  },

  body: {
    flex: 1, // Takes up remaining space, allowing space-between to work
    justifyContent: "space-between",
    alignItems: "center",
    // backgroundColor: 'red'
  },

  petList: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: 'orange',
    padding: 10,
    marginTop: 200,
  },

  petListText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },

  regbtns: {
    alignSelf: "flex-end", // Centers button
    width: "25%",
    marginBottom: 20, // Pushes it to the bottom
    marginRight: 20,
  },

  btn: {
    backgroundColor: "#F9FE62",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: "#1E1E1E",
    borderWidth: 0.5,
  },

  btn_sign_up: {
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default Patients;
