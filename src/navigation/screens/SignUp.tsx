import { Text } from '@react-navigation/elements';
import { Snackbar } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  SignUp: undefined;
  Login: { emailId: string; phoneNumber: string };
};
export function SignUp() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [emailId, setEmailId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSignUp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    let payload = {};
  
    if (emailRegex.test(emailId) && phoneRegex.test(phoneNumber)) {
      payload = { emailId: emailId, phoneNumber: phoneNumber };
    } else {
      setSnackbarMessage('Invalid Email or Phone Number.');
      setSnackbarVisible(true);
      return;
    }
    if (emailId && phoneNumber) {
      try {
        const response = await fetch('http://192.168.95.6:8082/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setIsRegistered(true); // Hide Sign Up button
          setSnackbarMessage(data.message || 'Registration successful!');
          setSnackbarVisible(true);
          sendOtp(); // Proceed to send OTP after successful registration
        } else {
          setSnackbarMessage(`Registration failed. ${data.message || data.error}`);
          setSnackbarVisible(true);
        }
      } catch (error) {
        setSnackbarMessage('Failed to connect to the server.');
        setSnackbarVisible(true);
        console.error('Error:', error);
      }
    } else {
      setSnackbarMessage('Please enter both email and phone number.');
      setSnackbarVisible(true);
    }
  };

  const sendOtp = async () => {
    if (emailId && phoneNumber) {
      try {
        const response = await fetch('http://192.168.95.6:8082/api/auth/sendOtp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId: emailId,
            phoneNumber: phoneNumber,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setIsOtpSent(true);
          setCooldown(30); // Start cooldown timer
          setSnackbarMessage(`OTP Sent! Email OTP: 444444, Phone OTP: 555555`);
          setSnackbarVisible(true);
        } else {
          setSnackbarMessage(`Failed to send OTP. ${data.message || data.error}`);
          setSnackbarVisible(true);
        }
      } catch (error) {
        setSnackbarMessage('Failed to connect to the server.');
        setSnackbarVisible(true);
        console.error('Error:', error);
      }
    } else {
      setSnackbarMessage('Please enter both email and phone number.');
      setSnackbarVisible(true);
    }
  };
  
  const confirmOtp = async () => {
    if (emailOtp && phoneOtp) {
      try {
        const response = await fetch('http://192.168.95.6:8082/api/auth/verifyOtp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailOtp: emailOtp,
            phoneOtp: phoneOtp,
            emailId: emailId,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setSnackbarMessage(data.message || 'OTP verified successfully!');
          setSnackbarVisible(true);
          setTimeout(() => {
            navigation.navigate('Login', { emailId, phoneNumber });
          }, 1500);
        } else {
          setSnackbarMessage(`OTP verification failed. ${data.message || data.error}`);
          setSnackbarVisible(true);
        }
      } catch (error) {
        setSnackbarMessage('Failed to connect to the server.');
        setSnackbarVisible(true);
        console.error('Error:', error);
      }
    } else {
      setSnackbarMessage('Please enter both Email OTP and Phone OTP.');
      setSnackbarVisible(true);
    }
  };
  
  const resendOtp = () => {
    if (cooldown === 0) {
      sendOtp();
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={emailId}
        onChangeText={setEmailId}
        keyboardType="email-address"
        />
      <Text style={styles.text}>Mobile Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Mobile Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        />
      <TouchableOpacity
        style={[styles.button, isRegistered && { backgroundColor: 'grey' }]}
        onPress={handleSignUp}
        disabled={isRegistered}
        >
        <Text style={styles.buttonText}>{isRegistered ? 'Registered' : 'Sign Up'}</Text>
      </TouchableOpacity>
      {isOtpSent && (
        <>
          <Text style={styles.otptext}>Email OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email OTP"
            value={emailOtp}
            onChangeText={setEmailOtp}
            keyboardType="number-pad"
            />
          <Text style={styles.text}>Mobile Number OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number OTP"
            value={phoneOtp}
            onChangeText={setPhoneOtp}
            keyboardType="number-pad"
            />
          <TouchableOpacity 
            style={[
              styles.button,
              (!emailOtp || !phoneOtp) && { backgroundColor: 'grey' }, // Disabled style
            ]}
            onPress={confirmOtp}
            disabled={!emailOtp || !phoneOtp} // Disable if either OTP is empty
            >
            <Text style={styles.buttonText}>
              {(!emailOtp || !phoneOtp) ? 'Enter OTP' : 'Confirm OTP'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.resendText}>
            Didn't receive code?{' '}
            {cooldown > 0 ? (
              <>
                <Text style={styles.disabledResendButton}>Resend</Text>
                <Text style={styles.disabledResendText}> in {cooldown}s</Text>
              </>
            ) : (
              <Text style={styles.resendButton} onPress={resendOtp}>
                Resend
              </Text>
            )}
          </Text>
        </>
      )}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    width: '90%',
    padding: 10,
    marginVertical: 5,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 3,
  },
  text: {
    width: '90%',
    color: 'grey',
    marginBottom: -10,
  },
  otptext: {
    width: '90%',
    color: 'grey',
    marginTop: 60,
    marginBottom: -10,
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
  disabledButton: {
    backgroundColor: 'grey',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resendText: {
    marginTop: 10,
    color: 'grey',
  },
  disabledResendText: {
    color: 'grey',
  },
  resendButton: {
    color: '#424BB2',
    fontWeight: 'bold',
  },
  disabledResendButton: {
    color: 'grey',
    fontWeight: 'bold',
  },
});

export default SignUp;

// const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
// const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
// setGeneratedEmailOtp(emailOtp);
// setGeneratedPhoneOtp(phoneOtp);
// setIsOtpSent(true);
// setCooldown(30);
// Alert.alert('OTP Sent', `Your email OTP code is ${emailOtp} and phone OTP code is ${phoneOtp}`);
// if (emailOtp === generatedEmailOtp && phoneOtp === generatedPhoneOtp) {
  //   Alert.alert('Success', 'Email and phone number verified successfully!');
  // } else {
    //   Alert.alert('Error', 'Invalid OTP. Please try again.');
    // }