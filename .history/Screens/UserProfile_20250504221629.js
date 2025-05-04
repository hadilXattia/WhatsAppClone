import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import firebase from '../Config';
import globalStyles from "../assets/styles/globalStyles";
import { Ionicons } from '@expo/vector-icons';

const UserProfile = ({ route, navigation }) => {
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
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.innerContent}>
        {/* Back arrow */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

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
      </View>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  innerContent: {
    width: '90%',
    maxWidth: 400,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginBottom: 10,
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
});
