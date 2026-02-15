import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { MainTabParamList } from '../types';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import MaintenanceScreen from '../screens/Maintenance/MaintenanceScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ASG_BLUE = '#003d82';
const ASG_LIGHT_BLUE = '#4a90c2';
const GRAY = '#8e8e93';

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'sunny' : 'sunny-outline';
              break;
            case 'History':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Maintenance':
              iconName = focused ? 'build' : 'build-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: ASG_BLUE,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e7',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: ASG_BLUE,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Solar Dashboard',
          headerTitle: 'Your Solar System',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: 'Performance',
          headerTitle: 'Generation History',
        }}
      />
      <Tab.Screen 
        name="Maintenance" 
        component={MaintenanceScreen}
        options={{
          title: 'Service',
          headerTitle: 'Maintenance & Support',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Account Settings',
        }}
      />
    </Tab.Navigator>
  );
}