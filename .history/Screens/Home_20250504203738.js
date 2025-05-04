import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Import icons
import ListProfils from "./Home/ListProfils";
import Groups from "./Home/Groups";
import MyAccount from "./Home/MyAccount";

const Tab = createBottomTabNavigator();

export default function Home(props) {
  const currentUserid = props.route.params.currentUserid;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "ListProfils") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Groups") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "MyAccount") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6200EE", 
        tabBarInactiveTintColor: "#666", 
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="ListProfils" component={ListProfils} initialParams={{currentUserid}} />
      <Tab.Screen name="Groups" component={Groups} />
      <Tab.Screen name="MyAccount" component={MyAccount} initialParams={{currentUserid}} />
    </Tab.Navigator>
  );
}
