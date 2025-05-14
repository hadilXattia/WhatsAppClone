import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CreateGroupModal from './CreateGroupModal';
import firebase from '../../Config';
import { useNavigation } from '@react-navigation/native';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [usernames, setUsernames] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch user names from ListAccounts
    const usersRef = firebase.database().ref('ListAccounts');
    usersRef.once('value').then(snapshot => {
      const data = snapshot.val() || {};
      const nameMap = {};

      Object.entries(data).forEach(([uid, user]) => {
        const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.trim();
        nameMap[uid] = fullName || uid;
      });

      setUsernames(nameMap);
    });
  }, []);

  useEffect(() => {
    const groupsRef = firebase.database().ref('Groups');

    const fetchGroupsWithLastMessage = async () => {
      groupsRef.on('value', async (snapshot) => {
        const data = snapshot.val() || {};
        const groupList = await Promise.all(
          Object.entries(data).map(async ([id, val]) => {
            // Get last message
            const messagesRef = firebase.database()
              .ref(`GroupMessages/${id}`)
              .orderByChild('timestamp')
              .limitToLast(1);

            let lastMessage = null;

            const msgSnap = await messagesRef.once('value');
            msgSnap.forEach(child => {
              const msgData = child.val();
              lastMessage = {
                ...msgData,
                senderName: usernames[msgData.sender] || msgData.sender,
              };
            });

            return {
              id,
              ...val,
              lastMessage,
            };
          })
        );
        setGroups(groupList);
      });
    };

    fetchGroupsWithLastMessage();

    return () => firebase.database().ref('Groups').off();
  }, [usernames]); // re-run when usernames are loaded

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Group List</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={30} color="#6200EE" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupChat', {
              groupId: item.id,
              groupName: item.name,
            })}
            style={styles.groupItem}
          >
            <Text style={styles.groupName}>{item.name}</Text>
            {item.lastMessage ? (
              <Text style={styles.lastMessage}>
                {item.lastMessage.senderName}: {item.lastMessage.text}
              </Text>
            ) : (
              <Text style={styles.lastMessageEmpty}>No messages yet</Text>
            )}
          </TouchableOpacity>
        )}
      />

      <CreateGroupModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2cdff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupItem: {
    padding: 15,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    borderRadius: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessage: {
    color: '#555',
    marginTop: 5,
    fontSize: 14,
  },
  lastMessageEmpty: {
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
    fontSize: 13,
  },
});
