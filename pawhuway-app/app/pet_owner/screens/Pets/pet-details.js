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
  StatusBar,
  Touchable,
} from "react-native";
import { Stack } from "expo-router";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../../src/lib/supabase";
import QRCodeGenerator from "./generate-qr";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FlatList } from "react-native";
import { set } from "lodash";

const PetDetails = () => {
  const [image, setImage] = useState(null);
  const router = useRouter();
  const { petId } = useLocalSearchParams();
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
  const stats = [
    { label: "Age", value: petData.age },
    { label: "Sex", value: petData.sex },
    { label: "Type", value: petData.type },
    { label: "Height", value: petData.height },
    { label: "Weight", value: petData.weight },
  ];

  const [qrVisible, setQrVisible] = useState(false);
  const [qrValue, setQrValue] = useState("");

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
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />

      {qrVisible && (
        <QRCodeGenerator value={JSON.stringify(petData)} onClose={() => setQrVisible(false)}/>
      )}

      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.backbtn}
          onPress={() => router.push("/pet_owner/dashboard-v2")}
        >
          <View style={{ position: "absolute" }}>
            <AntDesign
              name="left"
              size={15}
              color="white"
              backgroundColor="#3C3C4C"
              style={{ padding: 10, borderRadius: 20 }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: "absolute", right: 30, top: 30, zIndex: 10 }}
          onPress={() =>
            router.push(`/pet_owner/screens/Pets/edit-pet?petId=${petData.id}`)
          }
        >
          <View>
            <Ionicons name="create-outline" size={30} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: "absolute", right: 30, top: 100, zIndex: 10 }}
          onPress={() => deletePet(petData.id)}
        >
          <View>
            <Ionicons name="trash-outline" size={30} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: "absolute", right: 30, top: 170, zIndex: 10 }}
          onPress={() => setQrVisible(true)}
        >
          <View>
            <Ionicons name="qr-code-outline" size={30} />
          </View>
        </TouchableOpacity>
        <Image
          source={
            image
              ? { uri: image }
              : require("../../../../assets/pictures/16.png")
          }
          style={styles.image}
        />
      </View>
      <View style={styles.detailsContainer}>
        <View
          style={{
            // backgroundColor: "red",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 50,
          }}
        >
          <Text style={styles.petName}>{petData.name}</Text>
        </View>

        <View style={{ marginTop: 40 }}>
          <FlatList
            data={stats}
            horizontal
            keyExtractor={(item, index) => item.label + index}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <View style={styles.statItem}>
                <Text style={styles.statText}>{item.label}</Text>
                {item.value !== undefined && (
                  <Text
                    style={{
                      fontFamily: "Kanit Medium",
                      fontSize: 36,
                      textAlign: "center",
                      marginTop: 5,
                    }}
                  >
                    {item.value}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <View>
              <Text style={styles.buttonText}>Medical History</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push(
                `/pet_owner/screens/Pets/pet-tasks?petId=${petData.id}`
              )
            }
          >
            <View>
              <Text style={styles.buttonText}>Tasks</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backbtn: {
    // margin: 30,
    position: "absolute",
    top: 30,
    left: 30,
    zIndex: 2,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
    // backgroundColor: "red",
  },
  image: {
    width: "100%",
    height: 400,
  },
  detailsContainer: {
    marginTop: -100,
    height: "100%",
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    // borderCurve: 50,
    backgroundColor: "#B3EBF2",
  },
  petName: {
    fontFamily: "Kanit Medium",
    fontSize: 30,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 40,
    justifyContent: "center",
    marginTop: 40,
    flexWrap: "wrap",
  },
  statItem: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
    width: 160,
    height: 220,
  },
  statText: {
    fontFamily: "Poppins Light",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  buttonContainer: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    gap: 20,
    // paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#3C3C4C",
    paddingHorizontal: 100,
    paddingVertical: 15,
    borderRadius: 10,
    // width: 150,
    // height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins Light",
    fontSize: 16,
  },
});
export default PetDetails;
