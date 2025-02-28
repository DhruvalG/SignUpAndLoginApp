import AsyncStorage from '@react-native-async-storage/async-storage';
//Yet to fix Storage issue
// Store Token with Expiry Time
export const storeToken = async (token, expiresInSeconds) => {
  try {
    const expiryTime = new Date().getTime() + expiresInSeconds * 1000; // Convert to milliseconds
    const tokenData = { token, expiryTime };
    await AsyncStorage.setItem('token', JSON.stringify(tokenData));
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get Valid Token or Null if Expired
export const getToken = async () => {
  try {
    const tokenData = await AsyncStorage.getItem('token');
    if (!tokenData) return null;
    const { token, expiryTime } = JSON.parse(tokenData);
    const currentTime = new Date().getTime();
    if (currentTime > expiryTime) {
      await removeToken(); // Token expired
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove Token (on Logout or Expiry)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};
