import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../Config";
import { ref } from "firebase/database";
const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");
import globalStyles from "../../assets/styles/globalStyles";
import * as ImagePicker from "expo-image-picker";

export default function MyAccount(props) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState();
  const [LastName, setLastName] = useState();
  const [phone, setPhone] = useState();
  const [age, setAge] = useState();
  const [address, setAddress] = useState();
  const [email, setEmail] = useState();
  const [password] = useState();
  const [isDefultImage, setisDefultImage] = useState(true);
  const auth =firebase.auth()

  const [localUriImage, setlocalUriImage] = useState(null);
  const currentUserid = props.route.params.currentUserid;

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
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

  return (
    <View style={globalStyles.containerAccount}>
      <View style={globalStyles.widgetAccount}>
        <TouchableOpacity
          onPress={() => {
            pickImage();
          }}
        >
          <Image
            source={isDefultImage ? require("../../assets/icons/user.png") : { uri: localUriImage }}
            style={globalStyles.profileImage}
          />
        </TouchableOpacity>
        <View style={{ fontWeight: 600 }}>
          {" "}
          <View style={globalStyles.info}>
            <Text style={globalStyles.label}> Name :</Text>

            <TextInput
              style={globalStyles.infoText}
              onChangeText={(ch) => {
                setName(ch);
              }}
              value={name}
            />
          </View>
          <View style={globalStyles.info}>
            <Text style={globalStyles.label}> Last Name :</Text>

            <TextInput
              style={globalStyles.infoText}
              onChangeText={(ch) => {
                setLastName(ch);
              }}
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
            onChangeText={(ch) => {
              setPhone(ch);
            }}
            value={phone}
          />
        </View>
        <View style={globalStyles.info}>
          <Text style={globalStyles.label}> 🎂 Age:</Text>

          <TextInput
            style={globalStyles.infoText}
            onChangeText={(ch) => {
              setAge(ch);
            }}
            keyboardType="numeric"
            value={age}
          />
        </View>
        <View style={globalStyles.info}>
          <Text style={globalStyles.label}> 📍 Address: </Text>

          <TextInput
            style={globalStyles.infoText}
            onChangeText={(ch) => {
              setAddress(ch);
            }}
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
            onChangeText={(ch) => {
              setEmail(ch);
            }}
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
      <View style={{ flexDirection: "row", gap: 15 }}>
        <Button
          title="Desconnect"
          color={"red"}
          onPress={() => {
            auth.signOut().then(() => {
              props.navigation.replace("Auth");
            });
          }}
        ></Button>
        <Button
          color={"green"}
          onPress={() => {
            const key = ref_listaccount.push().key;
            const ref_account = ref_listaccount.child(currentUserid);
            ref_account.set({ id: currentUserid,name, LastName,phone, age, address, email });
          }}
          title="Save"
        ></Button>
      </View>
    </View>
  );
}
// ajouter et design de chaque profile dans la liste
// le image profile de chaque profile doit naviguer vers l 'info de chaque profile
// '
