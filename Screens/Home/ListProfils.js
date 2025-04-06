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
import { ref, set } from "firebase/database";
const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");

export default function ListProfils(props) {
  const [data, setdata] = useState([]);
  const currentUserid = props.route.params.currentUserid;

  //recupriration des donnes de firebase

  useEffect(() => {
    ref_listaccount.on("value", (snapshot) => {
      var d = [];
      snapshot.forEach((one_account) => {
        if (one_account.val().id != currentUserid) {
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
        renderItem={({ item }) => {
          return (
            <View style={globalStyles.widgetAccounts}>
              <Image
            
                source={require("../../assets/icons/user.png")}
                style={globalStyles.profileImage}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  // onPress={() =>
                  //   props.navigation.navigate("Chat", {
                  //     currentid: currentUserid,
                  //     secondid: item.id,
                  //   })
                  // }
                >
                  {item.name}
                </Text>
                <Text     onPress={() =>
                    props.navigation.navigate("Chat", {
                      currentid: currentUserid,
                      secondid: item.id,
                    })
                  }>{item.age}</Text>
                <Text
                  onPress={() => {
                    if (Platform.OS == "android") {
                      Linking.openURL("tel:" + item.phone);
                    } else {
                      Linking.openURL("telprompt:" + item.phone);
                    }
                  }}
                >
                  {item.phone}
                </Text>
              </View>
            </View>
          );
        }}
        style={globalStyles.list}
      ></FlatList>
    </View>
  );
}
