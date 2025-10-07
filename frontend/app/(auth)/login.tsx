import React, { useState, useEffect } from 'react';
import {
   View,
   TextInput,
   TouchableOpacity,
   ActivityIndicator,
   StyleSheet,
   Alert,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { useAuth } from '@/components/molecules/auth-context';
import { sendCode, loginWithCode, loginWithPassword } from '@/lib/api/auth';
import {
   saveLoginMethod,
   getLoginMethod,
   savePhone,
   getPhone,
   savePassword,
   getPassword,
   saveRememberMe,
   getRememberMe,
   clearSavedCredentials,
} from '@/lib/storage/token-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? 'light'];

   const { login } = useAuth();

   const [phone, setPhone] = useState('');
   const [code, setCode] = useState('');
   const [password, setPassword] = useState('');
   const [isCodeMode, setIsCodeMode] = useState(true);
   const [isLoading, setIsLoading] = useState(false);
   const [codeSent, setCodeSent] = useState(false);
   const [countdown, setCountdown] = useState(0);
   const [rememberMe, setRememberMe] = useState(false);

   // Load saved login method and credentials on mount
   useEffect(() => {
      const loadSavedData = async () => {
         // Load login method preference
         const savedMethod = await getLoginMethod();
         if (savedMethod !== null) {
            setIsCodeMode(savedMethod);
         }

         // Load remember me preference
         const remember = await getRememberMe();
         setRememberMe(remember);

         // Load saved credentials if remember me is enabled
         if (remember) {
            const savedPhone = await getPhone();
            if (savedPhone) {
               setPhone(savedPhone);
            }

            // Only load password on native platforms and in password mode
            if (!savedMethod) {
               const savedPassword = await getPassword();
               if (savedPassword) {
                  setPassword(savedPassword);
               }
            }
         }
      };
      loadSavedData();
   }, []);

   // Handle send verification code
   const handleSendCode = async () => {
      if (!phone || phone.length !== 11) {
         Alert.alert('错误', '请输入正确的手机号');
         return;
      }

      setIsLoading(true);
      try {
         await sendCode({ phone });
         setCodeSent(true);
         setCountdown(60);

         // Start countdown
         const timer = setInterval(() => {
            setCountdown((prev) => {
               if (prev <= 1) {
                  clearInterval(timer);
                  return 0;
               }
               return prev - 1;
            });
         }, 1000);

         Alert.alert('成功', '验证码已发送');
      } catch (error: any) {
         Alert.alert('错误', error.error || '发送验证码失败');
      } finally {
         setIsLoading(false);
      }
   };

   // Handle login with code
   const handleLoginWithCode = async () => {
      if (!phone || !code) {
         Alert.alert('错误', '请输入手机号和验证码');
         return;
      }

      setIsLoading(true);
      try {
         const response = await loginWithCode({ phone, code });
         await login(
            response.accessToken,
            response.refreshToken,
            response.user
         );

         // Save credentials if remember me is checked
         if (rememberMe) {
            await savePhone(phone);
            await saveRememberMe(true);
         } else {
            await clearSavedCredentials();
         }
      } catch (error: any) {
         Alert.alert('错误', error.error || '登录失败');
      } finally {
         setIsLoading(false);
      }
   };

   // Handle login with password
   const handleLoginWithPassword = async () => {
      if (!phone || !password) {
         Alert.alert('错误', '请输入手机号和密码');
         return;
      }

      setIsLoading(true);
      try {
         const response = await loginWithPassword({ phone, password });
         await login(
            response.accessToken,
            response.refreshToken,
            response.user
         );

         // Save credentials if remember me is checked
         if (rememberMe) {
            await savePhone(phone);
            await savePassword(password); // Only saves on native, not web
            await saveRememberMe(true);
         } else {
            await clearSavedCredentials();
         }
      } catch (error: any) {
         Alert.alert('错误', error.error || '登录失败');
      } finally {
         setIsLoading(false);
      }
   };

   // Handle remember me toggle
   const handleRememberMeToggle = async () => {
      const newValue = !rememberMe;
      setRememberMe(newValue);

      // Clear saved credentials when unchecking
      if (!newValue) {
         await clearSavedCredentials();
      }
   };

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
         <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedView style={styles.content}>
               <ThemedText style={styles.title}>欢迎登录</ThemedText>

               {/* Phone Input */}
               <View
                  style={[
                     styles.phoneInputWrapper,
                     { borderColor: colors.border },
                  ]}
               >
                  <TextInput
                     style={[styles.phoneInput, { color: colors.text }]}
                     placeholder="手机号"
                     placeholderTextColor={colors.tabIconDefault}
                     value={phone}
                     onChangeText={setPhone}
                     keyboardType="phone-pad"
                     maxLength={11}
                     editable={!isLoading}
                  />
                  {isCodeMode && (
                     <TouchableOpacity
                        style={[
                           styles.inlineSendCodeButton,
                           {
                              backgroundColor: colors.tint,
                              opacity: countdown > 0 || isLoading ? 0.5 : 1,
                           },
                        ]}
                        onPress={handleSendCode}
                        disabled={countdown > 0 || isLoading}
                     >
                        <ThemedText style={styles.inlineSendCodeButtonText}>
                           {countdown > 0
                              ? `${countdown}s`
                              : codeSent
                                ? '重发'
                                : '发送'}
                        </ThemedText>
                     </TouchableOpacity>
                  )}
               </View>

               {isCodeMode ? (
                  <>
                     {/* Verification Code Input */}
                     <View style={styles.inputContainer}>
                        <TextInput
                           style={[
                              styles.input,
                              {
                                 color: colors.text,
                                 borderColor: colors.border,
                              },
                           ]}
                           placeholder="验证码"
                           placeholderTextColor={colors.tabIconDefault}
                           value={code}
                           onChangeText={setCode}
                           keyboardType="number-pad"
                           maxLength={6}
                           editable={!isLoading}
                        />
                     </View>

                     {/* Login Button */}
                     <TouchableOpacity
                        style={[
                           styles.loginButton,
                           {
                              backgroundColor: colors.tint,
                              opacity: isLoading ? 0.5 : 1,
                           },
                        ]}
                        onPress={handleLoginWithCode}
                        disabled={isLoading}
                     >
                        {isLoading ? (
                           <ActivityIndicator color="#fff" />
                        ) : (
                           <ThemedText style={styles.loginButtonText}>
                              登录
                           </ThemedText>
                        )}
                     </TouchableOpacity>
                  </>
               ) : (
                  <>
                     {/* Password Input */}
                     <View style={styles.inputContainer}>
                        <TextInput
                           style={[
                              styles.input,
                              {
                                 color: colors.text,
                                 borderColor: colors.border,
                              },
                           ]}
                           placeholder="密码"
                           placeholderTextColor={colors.tabIconDefault}
                           value={password}
                           onChangeText={setPassword}
                           secureTextEntry
                           editable={!isLoading}
                        />
                     </View>

                     {/* Login Button */}
                     <TouchableOpacity
                        style={[
                           styles.loginButton,
                           {
                              backgroundColor: colors.tint,
                              opacity: isLoading ? 0.5 : 1,
                           },
                        ]}
                        onPress={handleLoginWithPassword}
                        disabled={isLoading}
                     >
                        {isLoading ? (
                           <ActivityIndicator color="#fff" />
                        ) : (
                           <ThemedText style={styles.loginButtonText}>
                              登录
                           </ThemedText>
                        )}
                     </TouchableOpacity>
                  </>
               )}

               {/* Remember Me Checkbox */}
               <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={handleRememberMeToggle}
                  disabled={isLoading}
               >
                  <View
                     style={[
                        styles.checkbox,
                        {
                           borderColor: colors.border,
                           backgroundColor: rememberMe
                              ? colors.tint
                              : 'transparent',
                        },
                     ]}
                  >
                     {rememberMe && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                     )}
                  </View>
                  <ThemedText style={styles.rememberMeText}>
                     记住{isCodeMode ? '手机号' : '账号密码'}
                  </ThemedText>
               </TouchableOpacity>

               {/* Switch Login Mode */}
               <TouchableOpacity
                  style={styles.switchModeButton}
                  onPress={() => {
                     const newMode = !isCodeMode;
                     setIsCodeMode(newMode);
                     setCode('');
                     setPassword('');
                     setCodeSent(false);
                     setCountdown(0);
                     // Save the new login method preference
                     saveLoginMethod(newMode);
                  }}
                  disabled={isLoading}
               >
                  <ThemedText
                     style={[styles.switchModeText, { color: colors.tint }]}
                  >
                     {isCodeMode ? '使用密码登录' : '使用验证码登录'}
                  </ThemedText>
               </TouchableOpacity>
            </ThemedView>
         </ScrollView>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   scrollContent: {
      flexGrow: 1,
   },
   content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
   },
   title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 40,
      textAlign: 'center',
   },
   inputContainer: {
      marginBottom: 16,
   },
   input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
   },
   phoneInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      paddingRight: 4,
   },
   phoneInput: {
      flex: 1,
      height: 50,
      paddingHorizontal: 16,
      fontSize: 16,
   },
   inlineSendCodeButton: {
      height: 42,
      marginLeft: 4,
      paddingHorizontal: 16,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
   },
   inlineSendCodeButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
   },
   loginButton: {
      height: 50,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
   },
   loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
   },
   switchModeButton: {
      marginTop: 24,
      alignItems: 'center',
      alignSelf: 'flex-end',
   },
   switchModeText: {
      fontSize: 14,
   },
   rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
   },
   checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: 4,
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
   },
   checkmark: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
   },
   rememberMeText: {
      fontSize: 14,
   },
});
