import { Text } from 'react-native';
import { Snackbar, IconButton } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storeToken } from '../../Services/tokenService';

const Login = () => {

  const navigation = useNavigation();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [emailAndPhoneOtp, setEmailAndPhoneOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false); //for setting OTP Sent for Login OTP
  
  const sendLoginOtp = async () => {
    if (!emailOrPhone) {
      setSnackbarMessage('Please enter Email or Mobile Number.');
      setSnackbarVisible(true);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/; // Adjust as needed for country codes
  
    let payload = {};
  
    if (emailRegex.test(emailOrPhone)) {
      payload = { emailId: emailOrPhone };
    } else if (phoneRegex.test(emailOrPhone)) {
      payload = { phoneNumber: emailOrPhone };
    } else {
      setSnackbarMessage('Invalid Email or Phone Number.');
      setSnackbarVisible(true);
      return;
    }

    try {
      const response = await fetch('http://192.168.95.6:8082/api/auth/send-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbarMessage(data.message || 'OTP sent successfully!');
        setOtpSent(true);
      } else {
        setSnackbarMessage(`Failed to send OTP. ${data.error || data.message}`);
        setOtpSent(false);
      }
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Failed to connect to the server.');
      setSnackbarVisible(true);
      console.error('Error:', error);
      setOtpSent(false);
    }
  };
  
  const handleLogin = async () => {
    setSnackbarMessage('Login successful!');
    setSnackbarVisible(true);
    if (!emailOrPhone || !emailAndPhoneOtp) {
      setSnackbarMessage('Please enter Email/Phone and OTP.');
      setSnackbarVisible(true);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/; // Adjust as needed for country codes
  
    let payload = {};
  
    if (emailRegex.test(emailOrPhone)) {
      payload = { emailId: emailOrPhone, emailAndPhoneOtp: emailAndPhoneOtp };
    } else if (phoneRegex.test(emailOrPhone)) {
      payload = { phoneNumber: emailOrPhone, emailAndPhoneOtp: emailAndPhoneOtp };
    } else {
      setSnackbarMessage('Invalid Email or Phone Number.');
      setSnackbarVisible(true);
      return;
    }
      try {
        const response = await fetch('http://192.168.95.6:8082/api/auth/verify-login-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        if (response.ok && data.token) {
          setSnackbarMessage(data.message || `Logged in successfully!`);
          setSnackbarVisible(true);
          try {
            await storeToken(data.token, 3600);
            navigation.navigate('Profile', {
              authToken : data.token
            });
          }
          catch (error) {
            console.error('Error:', error);
          }
          
        } else if (response.ok && !data.token) {
          setSnackbarMessage(`Login successful but token is missing.`);
          setSnackbarVisible(true);
        } else {
          setSnackbarMessage(`Login failed. ${data.error || data.message}`);
          setSnackbarVisible(true);
        }
      } catch (error) {
        setSnackbarMessage('Failed to connect to the server.');
        setSnackbarVisible(true);
        console.error('Error:', error);
      }
  }
  const handleSignUp = () => {
    navigation.navigate('SignUp');
  }
  return (
    <View style={styles.container}>
      
      <Text style={styles.text}>Email / Mobile Number</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Enter Email / Mobile Number"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="default"
        />
        <IconButton 
          icon="send" 
          size={20} 
          iconColor="white" 
          style={styles.otpButton} 
          onPress={sendLoginOtp} 
        />
      </View>
      <Text style={styles.text}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={emailAndPhoneOtp}
        onChangeText={setEmailAndPhoneOtp}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={[styles.button, (!otpSent || !emailAndPhoneOtp) && styles.disabledButton]}
        onPress={handleLogin}
        disabled={!otpSent || !emailAndPhoneOtp} // Button is disabled until OTP is sent AND written
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.signUpText}>
        Don't have an account?{' '}
        <Text style={styles.signUpButton} onPress={handleSignUp}>Sign Up</Text>
      </Text>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginVertical: 5,
  },
  text: {
    width: '90%',
    color: 'grey',
  },
  input: {
    width: '90%',
    padding: 10,
    marginVertical: 5,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 3,
  },
  inputField: {
    flex: 1,
  },
  button: {
    width: '90%',
    borderRadius: 2,
    backgroundColor: '#424BB2',
    marginBottom: -10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    padding: 10,
  },
  signUpText: {
    marginTop: 10,
    color: 'grey',
  },
  signUpButton: {
    color: '#424BB2',
    fontWeight: 'bold',
  },
  disabledResendButton: {
    color: 'grey',
  },
  disabledButton: {
    backgroundColor: 'grey',
  },
  otpButton: {
    backgroundColor: '#424BB2',
    borderRadius: 50,
    marginVertical: -2,
  },
});

