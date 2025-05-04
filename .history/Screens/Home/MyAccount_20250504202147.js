import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../Config";
import { ref } from "firebase/database";
import globalStyles from "../../assets/styles/globalStyles";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");

export default function MyAccount(props) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [LastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [isDefultImage, setisDefultImage] = useState(true);
  const [localUriImage, setlocalUriImage] = useState(null);

  const auth = firebase.auth();
  const currentUserid = props?.route?.params?.currentUserid;

  useEffect(() => {
    if (!currentUserid) {
      console.error("Missing currentUserid in route params.");
      Alert.alert("Error", "No user ID provided.");
      return;
    }
    const ref_account = ref_listaccount.child(currentUserid);

    ref_account
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || "");
          setLastName(data.LastName || "");
          setPhone(data.phone || "");
          setAge(data.age || "");
          setAddress(data.address || "");
          setEmail(data.email || "");

          if (data.image) {
            setisDefultImage(false);
            setlocalUriImage(data.image); // Can be a base64 string
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setisDefultImage(false);
      setlocalUriImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !LastName || !phone || !age || !address || !email) {
      Alert.alert("Error", "Please fill all the fields.");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Email must be valid (contain '@').");
      return;
    }

    if (!/^\d{8}$/.test(phone)) {
      Alert.alert("Error", "Phone number must be exactly 8 digits.");
      return;
    }

    if (parseInt(age) < 18) {
      Alert.alert("Error", "You must be at least 18 years old.");
      return;
    }

    let imageBase64 = null;
    if (localUriImage && !localUriImage.startsWith("data:image")) {
      const base64 = await FileSystem.readAsStringAsync(localUriImage, {
        encoding: FileSystem.EncodingType.Base64,
      });
      imageBase64 = `data:image/jpeg;base64,${base64}`;
    } else {
      imageBase64 = localUriImage; 
    }

    const ref_account = ref_listaccount.child(currentUserid);
    ref_account.set({
      id: currentUserid,
      name,
      LastName,
      phone,
      age,
      address,
      email,
      image: imageBase64,
    });

    Alert.alert("Success", "Profile saved successfully!");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={globalStyles.containerAccount}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.widgetAccount}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                isDefultImage
                  ? require("../../assets/icons/user.png")
                  : { uri: localUriImage }
              }
              style={globalStyles.profileImage}
            />
          </TouchableOpacity>

          <View style={{ fontWeight: 600 }}>
            <View style={globalStyles.info}>
              <Text style={globalStyles.label}> Name :</Text>
              <TextInput
                style={globalStyles.infoText}
                onChangeText={setName}
                value={name}
              />
            </View>
            <View style={globalStyles.info}>
              <Text style={globalStyles.label}> Last Name :</Text>
              <TextInput
                style={globalStyles.infoText}
                onChangeText={setLastName}
                value={LastName}
              />
            </View>
          </View>
        </View>

        <View style={globalStyles.widgetAccount}>
          <Text style={globalStyles.widgetTitleAccount}>Personal Info</Text>

          <View style={globalStyles.info}>
            <Text style={globalStyles.label}> 📞 Phone:</Text>
            <TextInput
              style={globalStyles.infoText}
              onChangeText={setPhone}
              value={phone}
              keyboardType="numeric"
            />
          </View>
          <View style={globalStyles.info}>
            <Text style={globalStyles.label}> 🎂 Age:</Text>
            <TextInput
              style={globalStyles.infoText}
              onChangeText={setAge}
              keyboardType="numeric"
              value={age}
            />
          </View>
          <View style={globalStyles.info}>
            <Text style={globalStyles.label}> 📍 Address: </Text>
            <TextInput
              style={globalStyles.infoText}
              onChangeText={setAddress}
              value={address}
            />
          </View>
        </View>

        <View style={globalStyles.widgetAccount}>
          <Text style={globalStyles.widgetTitleAccount}>Account Info</Text>

          <View style={globalStyles.info}>
            <Text style={globalStyles.label}> 📧 Email: </Text>
            <TextInput
              style={globalStyles.infoText}
              onChangeText={setEmail}
              keyboardType="email-address"
              value={email}
            />
          </View>
          <View style={globalStyles.passwordContainer}>
            <TextInput
              style={globalStyles.passwordInput}
              secureTextEntry={!passwordVisible}
              value="mysecretpassword"
              editable={false}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye" : "eye-off"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 15, marginBottom: 20 }}>
          <Button
            title="Desconnect"
            color={"red"}
            onPress={() => {
              auth
  .signOut()
  .then(() => {
    props.navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  })
  .catch((error) => {
    Alert.alert("Error", error.message);
  });

}}


          />
          <Button title="Save" color={"green"} onPress={handleSave} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
