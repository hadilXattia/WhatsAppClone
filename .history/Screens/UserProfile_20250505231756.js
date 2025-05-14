import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import firebase from '../Config';
import globalStyles from "../assets/styles/globalStyles";
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Dimensions } from 'react-native';

const UserProfile = ({ route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [mediaMessages, setMediaMessages] = useState([]);

  useEffect(() => {
    const discussionId =
      firebase.auth().currentUser?.uid > userId
        ? firebase.auth().currentUser?.uid + userId
        : userId + firebase.auth().currentUser?.uid;
  
    const refMessages = firebase.database().ref(`ListDisscussion/${discussionId}/messages`);
  
    refMessages.on('value', (snapshot) => {
      const media = [];
      snapshot.forEach((msgSnap) => {
        const msg = msgSnap.val();
        if (msg.body?.startsWith('data:image')) {
          media.push(msg.body);
        }
      });
      setMediaMessages(media);
    });
  
    return () => refMessages.off();
  }, [userId]);
  
  useEffect(() => {
    const userRef = firebase.database().ref(`ListAccounts/${userId}`);
    userRef.on('value', (snapshot) => {
      setUser(snapshot.val());
    });

    return () => userRef.off();
  }, [userId]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const {
    name = 'N/A',
    LastName = 'N/A',
    phone = 'N/A',
    age = 'N/A',
    address = 'N/A',
    email = 'N/A',
    image,
  } = user;

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
    
      <View style={styles.profileHeader}>
        <Image
          source={
            image
              ? { uri: image }
              : require('../assets/icons/user.png')
          }
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{name} {LastName}</Text>
      </View>

      <View style={globalStyles.widgetAccount}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <Text style={styles.infoText}>📞 Phone: {phone}</Text>
        <Text style={styles.infoText}>🎂 Age: {age}</Text>
        <Text style={styles.infoText}>📍 Address: {address}</Text>
      </View>

      <View style={globalStyles.widgetAccount}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <Text style={styles.infoText}>📧 Email: {email}</Text>
      </View>
      {mediaMessages.length > 0 && (
  <View style={globalStyles.widgetAccount}>
    <Text style={styles.sectionTitle}>Media Shared</Text>
    <FlatList
      data={mediaMessages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <Image
          source={{ uri: item }}
          style={styles.mediaImage}
        />
      )}
      numColumns={5}
     // disables internal scroll since outer ScrollView handles it
    />
  </View>
)}

    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
    mediaImage: {
  width: Dimensions.get('window').width / 3 - 20,
  height: 100,
  borderRadius: 10,
  margin: 5,
},

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingTop:30,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign:'left',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  widgetAccount: {
  padding: 15,
  borderRadius: 10,
  backgroundColor: '#f2f2f2',
  marginBottom: 20,
},
});
