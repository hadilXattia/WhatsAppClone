import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import firebase from '../Config';
import globalStyles from "../assets/styles/globalStyles";

const UserProfile = ({ route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);

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
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
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
    textAlign:left,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
});
