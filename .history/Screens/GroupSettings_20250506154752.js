import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, ScrollView } from 'react-native';
import firebase from '../Config';

export default function GroupSettings({ route }) {
  const { groupId, groupName, groupImage } = route.params;
  const [members, setMembers] = useState([]);
  const [mediaMessages, setMediaMessages] = useState([]);

  useEffect(() => {
    // Fetch group members
    firebase.database().ref(`Groups/${groupId}/members`).once('value').then(snapshot => {
      const memberIds = Object.keys(snapshot.val() || {});
      Promise.all(
        memberIds.map(uid =>
          firebase.database().ref(`ListAccounts/${uid}`).once('value').then(snap => ({
            uid,
            ...snap.val()
          }))
        )
      ).then(setMembers);
    });

    // Fetch media messages
    const refMessages = firebase.database().ref(`GroupMessages/${groupId}`);
    refMessages.on('value', snapshot => {
      const media = [];
      snapshot.forEach(child => {
        const msg = child.val();
        if (msg.image && msg.image.startsWith('data:image')) {
          media.push(msg.image);
        }
      });
      setMediaMessages(media);
    });

    return () => refMessages.off();
  }, [groupId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.groupHeader}>
        <Image
          source={groupImage ? { uri: groupImage } : require('../assets/icons/group.png')}
          style={styles.groupImage}
        />
        <Text style={styles.groupName}>{groupName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Members</Text>
        {members.map(member => (
          <View key={member.uid} style={styles.memberItem}>
            <Image
              source={member.image ? { uri: member.image } : require('../assets/icons/user.png')}
              style={styles.memberImage}
            />
            <Text style={styles.memberName}>{member.id.name} {member.LastName}</Text>
          </View>
        ))}
      </View>

      {mediaMessages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Media</Text>
          <FlatList
            horizontal
            data={mediaMessages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mediaImage} />
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  groupHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
  },
  mediaImage: {
    width: Dimensions.get('window').width / 3,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
});
