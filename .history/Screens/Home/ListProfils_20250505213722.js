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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../assets/styles/globalStyles";
import firebase from "../../Config";

const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");

export default function ListProfils(props) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const currentUserid = props.route.params.currentUserid;
  useEffect(() => {
    const userStatusRef = ref_listaccount.child(currentUserid).child("lastOnline");
  
    const updateOnline = () => {
      userStatusRef.set(Date.now());
    };
  
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        updateOnline();
      }
    };
  
    AppState.addEventListener("change", handleAppStateChange);
  
    // Initial call
    updateOnline();
  
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);
  useEffect(() => {
    ref_listaccount.on("value", (snapshot) => {
      let d = [];
      snapshot.forEach((one_account) => {
        if (one_account.val().id !== currentUserid) {
          d.push(one_account.val());
        }
      });
      setData(d);
      setFilteredData(d);
    });

    return () => {
      ref_listaccount.off("value");
    };
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.phone.includes(query)
    );
    setFilteredData(filtered);
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.widget}>
        <View style={globalStyles.titleContainer}>
          <Text style={globalStyles.widgetTitle}>Profil list</Text>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        )}
      </View>

      <FlatList
        data={filteredData}
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
                <Text
                  onPress={() =>
                    props.navigation.navigate("Chat", {
                      currentid: currentUserid,
                      secondid: item.id,
                    })
                  }
                >
                  {item.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
  <TouchableOpacity
    onPress={() => {
      const url =
        Platform.OS === "android"
          ? "tel:" + item.phone
          : "telprompt:" + item.phone;
      Linking.openURL(url);
    }}
  >
    <Ionicons name="call" size={20} color="green" />
  </TouchableOpacity>

  <Text style={{ marginLeft: 10, color: item.lastOnline && Date.now() - item.lastOnline < 2 * 60 * 1000 ? "green" : "gray" }}>
    {item.lastOnline && Date.now() - item.lastOnline < 2 * 60 * 1000 ? "Online" : "Offline"}
  </Text>
</View>

              </View>
            </View>
          );
        }}
        style={globalStyles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    marginTop: 10,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 16,
  },
});
