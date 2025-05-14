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
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../assets/styles/globalStyles";
import firebase from "../../Config";

const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");
const ref_chats = ref_database.child("Chats");

export default function ListProfils(props) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [lastMessages, setLastMessages] = useState({});

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

  const subscription = AppState.addEventListener("change", handleAppStateChange);
  updateOnline();

  return () => {
    subscription.remove();
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

  useEffect(() => {
    const ref_listDisscussion = firebase.database().ref('ListDisscussion');
  
    const updateLastMessages = () => {
      ref_listDisscussion.once('value', (snapshot) => {
        const newLastMessages = {};
  
        snapshot.forEach((discussionSnap) => {
          const discussionId = discussionSnap.key;
          const messagesObj = discussionSnap.child('messages').val();
          if (!messagesObj) return;
  
          const messagesArray = Object.values(messagesObj);
          messagesArray.sort((a, b) => {
            return new Date(b.time) - new Date(a.time);
          });
  
          const lastMsg = messagesArray[0];
          if (
            lastMsg &&
            (lastMsg.senderId === currentUserid || lastMsg.recieverId === currentUserid)
          ) {
            const secondUserId =
              lastMsg.senderId === currentUserid ? lastMsg.recieverId : lastMsg.senderId;
            newLastMessages[secondUserId] = lastMsg.body;
          }
        });
  
        setLastMessages(newLastMessages);
      });
    };
  
    updateLastMessages();
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
          const isValidBase64 = item.image && item.image.startsWith("data:image");
          const profileImage = isValidBase64
            ? { uri: item.image }
            : require("../../assets/icons/user.png");

          const isOnline =
            item.lastOnline && Date.now() - item.lastOnline < 2 * 60 * 1000;

          const lastMessage = lastMessages[item.id] || "No messages yet";

          return (
            <View style={styles.profileContainer}>
              <View style={styles.imageContainer}>
                <Image source={profileImage} style={styles.profileImage} />
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isOnline ? "green" : "red",
                    },
                  ]}
                />
              </View>

              <View style={styles.textContainer}>
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate("Chat", {
                      currentid: currentUserid,
                      secondid: item.id,
                    })
                  }
                >
                  <Text style={styles.profileName}>{item.name}</Text>
                </TouchableOpacity>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {lastMessage}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  const url =
                    Platform.OS === "android"
                      ? "tel:" + item.phone
                      : "telprompt:" + item.phone;
                  Linking.openURL(url);
                }}
                style={styles.callIcon}
              >
                <Ionicons name="call" size={24} color="green" />
              </TouchableOpacity>
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  callIcon: {
    paddingHorizontal: 8,
  },
});
