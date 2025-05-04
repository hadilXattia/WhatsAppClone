import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../assets/styles/globalStyles";
import firebase from "../../Config";
import { ref } from "firebase/database";
const [secondUserName, setSecondUserName] = useState('');

const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");

export default function ListProfils(props) {
  const [data, setdata] = useState([]);
  const currentUserid = props.route.params.currentUserid;

  useEffect(() => {
    ref_listaccount.on("value", (snapshot) => {
      let d = [];
      snapshot.forEach((one_account) => {
        if (one_account.val().id !== currentUserid) {
          d.push(one_account.val());
        }
      });
      setdata(d);
    });
    return () => {
      ref_listaccount.off("value");
    };
  }, []);

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.widget}>
        <View style={globalStyles.titleContainer}>
          <Text style={globalStyles.widgetTitle}>Profil list</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => {
    const isValidBase64 =
      item.image && item.image.startsWith("data:image");

    const profileImage = isValidBase64
      ? { uri: item.image }
      : require("../../assets/icons/user.png");

    return (
      <View style={globalStyles.widgetAccounts}>
        <Image
          source={profileImage}
          style={globalStyles.profileImage}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text>{item.name}</Text>
          <Text
            onPress={() =>
              props.navigation.navigate("Chat", {
                currentid: currentUserid,
                secondid: item.id,
              })
            }
          >
            {item.age}
          </Text>
          <Text
            onPress={() => {
              const url =
                Platform.OS === "android"
                  ? "tel:" + item.phone
                  : "telprompt:" + item.phone;
              Linking.openURL(url);
            }}
          >
            {item.phone}
          </Text>
        </View>
      </View>
    );
  }}
  style={globalStyles.list}
/>

    </View>
  );
}
