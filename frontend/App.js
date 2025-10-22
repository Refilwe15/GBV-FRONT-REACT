import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import Greet from "./components/Greet";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ReportIncident from "./components/ReportIncident"; // ✅ Import the new Report screen
import Reports from "./components/Reports";
import ReportDetails from "./components/ReportDetails";
import ReportsMap from "./components/ReportsMap";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Greet">
        <Stack.Screen
          name="Greet"
          component={Greet}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ title: "Register" }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: "Dashboard", headerLeft: () => null }}
        />

        {/*  Add ReportIncident route */}
        <Stack.Screen
          name="Report"
          component={ReportIncident}
          options={{ title: "Report Incident" }}
        />
        <Stack.Screen
          name="Reports"
          component={Reports}
          options={{ title: "My Reports" }}
        />
        <Stack.Screen
          name="ReportsMap"
          component={ReportsMap}
          options={{ title: "ReportMap" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
