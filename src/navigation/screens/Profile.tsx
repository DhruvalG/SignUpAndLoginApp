import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { removeToken, getToken } from '../../Services/tokenService';

type ProfileRouteParams = {
  authToken: string;
};

type RootStackParamList = {
  Profile: ProfileRouteParams;
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute<ProfileScreenRouteProp>();
  const { authToken } = route.params || {};
  const [userData, setUserData] = useState<{
    emailId: string;
    phoneNumber: string;
    id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let token = authToken;
        if (!token) {
          token = await getToken();
          if (!token) {
            console.error('No authToken found.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
            return;
          }
        }
        const response = await fetch('http://192.168.95.6:8082/api/user/me', {
          method: 'GET',
          headers: {
            'Authorization': `${token}`, // Send token in header
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (response.ok) {
          setUserData(data); // Assuming the API returns emailId, phoneNumber, and user_id
        } else {
          console.error('Error fetching user data:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authToken]);

  const handleLogout = async () => {
    await removeToken();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container2}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
            style={styles.profileImage} 
          />
          <View>
            <Text style={styles.title}>ID</Text> 
            <Text style={styles.info}>{userData?.id}</Text>
            <Text style={styles.title}>Email</Text>
            <Text style={styles.info}>{userData?.emailId}</Text>
            <Text style={styles.title}>Mobile Number</Text>
            <Text style={styles.info}>{userData?.phoneNumber}</Text>  
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: '100%',
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
  },
  container2: { 
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    padding: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginBottom: 20,
    marginRight: 25,
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    padding: 15,
    marginBottom: 30,
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  info: { 
    fontSize: 14,  
    fontWeight: 'bold',
    paddingTop: 5,
    marginBottom: 12,
    color: '#555',
  },
  logoutButton: { 
    backgroundColor: '#424BB2', 
    padding: 15, 
    borderRadius: 3, 
    width: '95%', 
    alignItems: 'center',
  },
  logoutText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
});
