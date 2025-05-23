import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../../src/lib/supabase";
import QRCodeGenerator from "./generate-qr";
import { Ionicons } from "@expo/vector-icons";

const PetDetails = () => {
  const router = useRouter();
  const { petId } = useLocalSearchParams(); // Get petId from URL params
  const [qrVisible, setQrVisible] = useState(false);
  const [qrValue, setQrValue] = useState("");

  const [petData, setPetData] = useState({
    name: "",
    age: "",
    birthDate: "",
    sex: "",
    type: "",
    height: "",
    weight: "",
    owner_email: "",
    img_path: "",
    file_path: "",
  });

  // const [loading, setLoading] = useState(true);

  const deletePet = async (petId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this pet?",
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
              const deleteFiles = async (bucket) => {
                const { data, error } = await supabase.storage
                  .from(bucket)
                  .list();
                if (error) {
                  console.error(`Error fetching files from ${bucket}:`, error);
                  return;
                }

                const filesToDelete = data
                  .filter((file) => file.name.startsWith(`${petId}`))
                  .map((file) => file.name);

                if (filesToDelete.length) {
                  const { error: deleteError } = await supabase.storage
                    .from(bucket)
                    .remove(filesToDelete);
                  if (deleteError)
                    console.error(
                      `Error deleting from ${bucket}:`,
                      deleteError
                    );
                }
              };

              await Promise.all([
                deleteFiles("pet-images"),
                deleteFiles("pet-medical-history"),
              ]);

              const { error } = await supabase
                .from("pets")
                .delete()
                .eq("id", petId);
              if (error) console.error("Error deleting pet:", error);
              // else setPets((prevPets) => prevPets.filter((pet) => pet.id !== petId));

              Alert.alert("Success", "Pet deleted successfully!");
              router.push("pet_owner/dashboard");
            } catch (err) {
              console.error("Unexpected error deleting pet:", err);
            }
          },
        },
      ]
    );
  };

  const handleGenerateQR = (pet) => {
    setQrValue(JSON.stringify(pet)); // Encode pet data in QR code
    setQrVisible(true);
  };

  useEffect(() => {
    async function fetchPetDetails() {
      const { data, error } = await supabase
        .from("pets")
        .select(
          "id, name, age, birthDate, sex, type, height, weight, img_path, file_path"
        )
        .eq("id", petId)
        .single();

      if (error) {
        Alert.alert("Error", "Failed to fetch pet details.");
        return;
      }

      const { publicUrl } = supabase.storage
        .from("pet-images")
        .getPublicUrl(`${petId}.jpg`);

      setPetData({
        ...data,
        birthDate: data.birthDate || "",
        imageUrl: publicUrl || null,
      });

      setDob(data.birthDate ? new Date(data.birthDate) : null);
      setLoading(false);
    }

    fetchPetDetails();
  }, []);

  if (!petData.name) {
    return;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/pet_owner/dashboard")}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Details</Text>
        <TouchableOpacity onPress={() => handleGenerateQR(petData)}>
          <Ionicons name="qr-code" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{
            uri: petData.img_path || "../../../assets/pictures/paw-logo.png",
          }}
          style={styles.petImage}
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>
            Name: <Text style={styles.value}>{petData.name}</Text>
          </Text>
          <Text style={styles.label}>
            Age: <Text style={styles.value}>{petData.age} years</Text>
          </Text>
          <Text style={styles.label}>
            Birthdate:{" "}
            <Text style={styles.value}>{petData.birthDate || "N/A"}</Text>
          </Text>
          <Text style={styles.label}>
            Sex: <Text style={styles.value}>{petData.sex}</Text>
          </Text>
          <Text style={styles.label}>
            Type: <Text style={styles.value}>{petData.type}</Text>
          </Text>
          <Text style={styles.label}>
            Height: <Text style={styles.value}>{petData.height} cm</Text>
          </Text>
          <Text style={styles.label}>
            Weight: <Text style={styles.value}>{petData.weight} kg</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.buttonText}>Medical History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push(`/pet_owner/screens/Pets/pet-tasks?petId=${petData.id}`)
          }
        >
          <Text style={styles.buttonText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push(`/pet_owner/screens/Pets/edit-pet?petId=${petData.id}`)
          }
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePet(petData.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </ScrollView>

      <QRCodeGenerator
        value={qrValue}
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    paddingVertical: 10,
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  detailsContainer: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    // marginLeft: 32, // Remove this to avoid horizontal overflow
    backgroundColor: "#fff",
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 12,
    marginTop: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  value: {
    fontWeight: "normal",
  },
  editButton: {
    width: "100%",
    backgroundColor: "#3C3C4C",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButton: {
    width: "100%",
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrButton: {
    backgroundColor: "#FFD166",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 40,
  },
});

export default PetDetails;
