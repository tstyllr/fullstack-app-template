import React, { useState } from 'react';
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
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/components/contexts/auth-context';
import { sendCode, loginWithCode, loginWithPassword } from '@/lib/api/auth';
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
      } catch (error: any) {
         Alert.alert('错误', error.error || '登录失败');
      } finally {
         setIsLoading(false);
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

               {/* Switch Login Mode */}
               <TouchableOpacity
                  style={styles.switchModeButton}
                  onPress={() => {
                     setIsCodeMode(!isCodeMode);
                     setCode('');
                     setPassword('');
                     setCodeSent(false);
                     setCountdown(0);
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
});
