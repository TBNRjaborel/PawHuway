import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from '../../../../src/lib/supabase';
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { FlatList } from "react-native";

const PatientDetails = () => {
  const router = useRouter();
  const { petId, vetId } = useLocalSearchParams();
  const [image, setImage] = useState(null);

  const [petData, setPetData] = useState({
    name: '',
    age: '',
    birthDate: '',
    sex: '',
    type: '',
    height: '',
    weight: '',
    owner_email: '',
    img_path: '',
    file_path: '',
    owner_id: '',
  });

  const stats = [
    { label: "Age", value: petData.age },
    { label: "Sex", value: petData.sex },
    { label: "Type", value: petData.type },
    { label: "Height", value: petData.height },
    { label: "Weight", value: petData.weight },
  ];

  const [medHistoryVisible, setMedHistoryVisible] = useState(false);
  const [medHistoryImages, setMedHistoryImages] = useState([]);
  const [medHistoryLoading, setMedHistoryLoading] = useState(false);

  useEffect(() => {
    async function fetchPetDetails() {
      console.log("Fetching pet details for ID:", petId);
      const { data, error } = await supabase
        .from("pets")
        .select(
          "id, name, age, birthDate, sex, type, height, weight, img_path, file_path"
        )
        .eq("id", petId)
        .single();

      if (error) {
        console.error("Error fetching pet details:", error);
        Alert.alert("Error", "Failed to fetch pet details.");
        return;
      }

      console.log("Pet details from Supabase:", data);

      const { data: files } = await supabase
        .storage
        .from("pet-images")
        .list("");

      if (error || !files || files.length === 0) {
        console.warn("No files found or error:", error);
        setImage(null);
        return;
      }

      console.log("Files in bucket:", files);

      const prefix = `${petData.id}-${petData.name}-`;
      const img = files.find(
        file =>
          file.name.startsWith(prefix)
      );

      if (!img) {
        setImage(null);
        return;
      }

      console.log("Getting public URL for file:", img.name);

      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from("pet-images")
        .getPublicUrl(img.name);

      console.log("Result of getPublicUrl:", publicUrlData, publicUrlError);

      const publicUrl = publicUrlData?.publicUrl;

      console.log("Public URL for medical history PDF:", publicUrl);

      setImage(publicUrl || null);

      console.log("Pet image public URL:", publicUrl);

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

  const deletePatient = async (petId, vetId) => {
    console.log(petId, vetId)
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove this patient?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('vet_pet_relation')
                .delete()
                .match({ vet_id: vetId, pet_id: petId });

              if (error) {
                console.error('Error deleting relation:', error.message);
                alert('Failed to remove patient.');
              } else {
                alert('Patient removed successfully!');
                router.push("/vet/vet-dashboard")
              }
            } catch (err) {
              console.error('Unexpected error:', err.message);
              alert('An error occurred.');
            }
          }
        }
      ]
    );
  };

  const handleShowMedicalHistory = async () => {
    setMedHistoryLoading(true);
    setMedHistoryVisible(true);
    try {
      console.log("Listing files in pet-medical-history bucket...");
      const { data: files, error } = await supabase
        .storage
        .from("pet-medical-history")
        .list("");

      console.log("Supabase list() response:", { files, error });

      if (error || !files || files.length === 0) {
        console.warn("No files found or error:", error);
        setMedHistoryImages([]);
        setMedHistoryLoading(false);
        Alert.alert("No Medical History", "No medical history file found for this pet.");
        return;
      }

      console.log("Files in bucket:", files);

      const prefix = `${petData.id}-${petData.name}-`;
      const pdfFile = files.find(
        file =>
          file.name.startsWith(prefix) &&
          file.name.endsWith('.pdf')
      );

      console.log("Matching PDF file:", pdfFile);

      if (!pdfFile) {
        console.warn("No matching PDF file found for prefix:", prefix);
        setMedHistoryImages([]);
        setMedHistoryLoading(false);
        Alert.alert("No PDF", "No PDF medical history file found for this pet.");
        return;
      }

      console.log("Getting public URL for file:", pdfFile.name);

      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from("pet-medical-history")
        .getPublicUrl(pdfFile.name);

      console.log("Result of getPublicUrl:", publicUrlData, publicUrlError);

      const publicUrl = publicUrlData?.publicUrl;

      console.log("Public URL for medical history PDF:", publicUrl);

      setMedHistoryImages([{ url: publicUrl }]);
    } catch (e) {
      console.error("Error loading medical history:", e);
      Alert.alert("Error", "Failed to load medical history.");
      setMedHistoryImages([]);
    }
    setMedHistoryLoading(false);
    handleOpenPdf();
  };

  const handleOpenPdf = () => {
    console.log("Opening medical history PDF:", medHistoryImages);
    if (medHistoryImages.length > 0) {
      Linking.openURL(medHistoryImages[0].url);
    } else {
      Alert.alert("No PDF", "No medical history PDF found.");
    }
  };

  async function fetchOwnerInfo(email) {
    if (!email) return null;
    const { data: userData, error } = await supabase
      .from('user_accounts')
      .select('first_name, last_name, address')
      .eq('email_add', email)
      .single();
    if (error) {
      Alert.alert('Error', 'Failed to fetch owner info.');
      return null;
    }
    return userData;
  }

  useEffect(() => {
    async function fetchPetDetails() {
      const { data, error } = await supabase
        .from('pets')
        .select(`
                    id, name, age, birthDate, sex, type, height, weight, img_path, file_path,
                    owner_id,
                    pet_owner:owner_id (
                        id,
                        email
                    )
                `)
        .eq('id', petId)
        .single();

      if (error) {
        console.log('Error fetching pet details:', error.message);
        Alert.alert('Error', 'Failed to fetch pet details.');
        return;
      }

      const { publicUrl } = supabase.storage.from('pet-images').getPublicUrl(`${petId}.jpg`);
      const email = data?.pet_owner?.email;
      const ownerInfo = await fetchOwnerInfo(email);

      setPetData({
        ...data,
        birthDate: data.birthDate || '',
        imageUrl: publicUrl || null,
        ownerInfo: ownerInfo,
      });
    }
    fetchPetDetails();
  }, []);

  if (!petData.name) {
    return;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={true} />

      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.backbtn}
          onPress={() => router.back()}
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
        {/* <TouchableOpacity
          style={{ position: "absolute", right: 30, top: 30, zIndex: 10 }}
          onPress={() =>
            router.push(`/pet_owner/screens/Pets/edit-pet?petId=${petData.id}`)
          }
        >
          <View>
            <Ionicons name="create-outline" size={30} />
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={{ backgroundColor: 'white', borderRadius: 60, padding: 4, position: "absolute", right: 30, top: 30, zIndex: 10 }}
          onPress={() => deletePatient(petId, vetId)}
        >
          <View>
            <Ionicons name="trash-outline" size={30} />
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
          <TouchableOpacity style={styles.button} onPress={handleShowMedicalHistory}>
            <View>
              <Text style={styles.buttonText}>Medical History</Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
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

export default PatientDetails;
