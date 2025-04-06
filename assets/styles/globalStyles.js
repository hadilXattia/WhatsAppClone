import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
    //list profils styles
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f2cdff",
        paddingTop: 50,
        paddingHorizontal: 20, 
      },
      list: {
        width: "100%", 
        alignSelf: "center", 
      },
      profileImage: {
        width: 50,
        height: 50,
        borderRadius: 45,
        marginBottom: 10,
      },
      widgetAccounts: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start", 
        width: "100%", 
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      widget: {
        width: "100%", 
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      widgetTitle: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#000",
      },
//my account style
containerAccount: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f2cdff",
    paddingTop: 50,
 
  },
widgetAccount: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
   
  },
  widgetTitleAccount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
  },
infoText: {
  fontSize: 16,
  color: "#333",
  borderBottomWidth: 2,

  paddingVertical: 1, 
  paddingHorizontal: 10,
      
  marginBottom: 8,   
  width: "75%",       
  borderRadius: 5,    

  shadowColor: "#ddd", 
  shadowOffset: { width: 0, height: 1 }, // Shadow effect
  shadowOpacity: 0.3,  
  shadowRadius: 2,    
},

label: {
  fontSize: 16,
  color: "#444", 
  marginBottom: 5, 
  fontWeight: "600", 
  textTransform: "capitalize",
},

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
    marginTop: 5,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#555",
    paddingVertical: 8,
  },
  info: {
    flexDirection: "row",
    alignItems: "flex-start", 
 justifyContent: "space-between",
  width: "100%",  
  padding: 10,  
},
});

export default globalStyles;
