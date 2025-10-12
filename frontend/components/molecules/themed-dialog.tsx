import React, { ReactNode } from 'react';
import {
   Modal,
   View,
   StyleSheet,
   Pressable,
   Platform,
   type ModalProps,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedButton } from '@/components/atoms/themed-button';
import { BorderRadius, Spacing, Layout } from '@/constants/theme';

export type ThemedDialogProps = Omit<ModalProps, 'transparent'> & {
   /**
    * 控制对话框的显示/隐藏
    */
   visible: boolean;
   /**
    * 关闭对话框的回调函数
    */
   onClose: () => void;
   /**
    * 对话框标题
    */
   title?: string;
   /**
    * 对话框描述文本
    */
   description?: string;
   /**
    * 自定义内容
    */
   children?: ReactNode;
   /**
    * 主要按钮配置
    */
   primaryButton?: {
      text: string;
      onPress: () => void;
      loading?: boolean;
   };
   /**
    * 次要按钮配置
    */
   secondaryButton?: {
      text: string;
      onPress: () => void;
   };
   /**
    * 点击遮罩层时是否关闭对话框，默认为 true
    */
   closeOnOverlayPress?: boolean;
   /**
    * 自定义遮罩层颜色
    */
   lightOverlayColor?: string;
   darkOverlayColor?: string;
   /**
    * 自定义对话框背景色
    */
   lightBackgroundColor?: string;
   darkBackgroundColor?: string;
};

export function ThemedDialog({
   visible,
   onClose,
   title,
   description,
   children,
   primaryButton,
   secondaryButton,
   closeOnOverlayPress = true,
   animationType = 'fade',
   lightOverlayColor,
   darkOverlayColor,
   lightBackgroundColor,
   darkBackgroundColor,
   ...modalProps
}: ThemedDialogProps) {
   const overlayColor = useThemeColor(
      { light: lightOverlayColor, dark: darkOverlayColor },
      'overlay'
   );

   const backgroundColor = useThemeColor(
      { light: lightBackgroundColor, dark: darkBackgroundColor },
      'card'
   );

   const borderColor = useThemeColor({}, 'border');

   const handleOverlayPress = () => {
      if (closeOnOverlayPress) {
         onClose();
      }
   };

   const handleContentPress = () => {
      // 阻止事件冒泡到遮罩层
   };

   return (
      <Modal
         visible={visible}
         transparent
         animationType={animationType}
         onRequestClose={onClose}
         statusBarTranslucent
         {...modalProps}
      >
         <Pressable style={styles.overlay} onPress={handleOverlayPress}>
            <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
               <Pressable
                  style={[
                     styles.dialogContainer,
                     { backgroundColor, borderColor },
                  ]}
                  onPress={handleContentPress}
               >
                  {/* 标题 */}
                  {title && (
                     <View style={styles.titleContainer}>
                        <ThemedText type="subtitle">{title}</ThemedText>
                     </View>
                  )}

                  {/* 描述 */}
                  {description && (
                     <View style={styles.descriptionContainer}>
                        <ThemedText lightColor="#687076" darkColor="#9BA1A6">
                           {description}
                        </ThemedText>
                     </View>
                  )}

                  {/* 自定义内容 */}
                  {children && (
                     <View style={styles.contentContainer}>{children}</View>
                  )}

                  {/* 按钮区域 */}
                  {(primaryButton || secondaryButton) && (
                     <View style={styles.buttonContainer}>
                        {secondaryButton && (
                           <ThemedButton
                              title={secondaryButton.text}
                              onPress={secondaryButton.onPress}
                              variant="outline"
                              style={styles.button}
                           />
                        )}
                        {primaryButton && (
                           <ThemedButton
                              title={primaryButton.text}
                              onPress={primaryButton.onPress}
                              loading={primaryButton.loading}
                              style={styles.button}
                           />
                        )}
                     </View>
                  )}
               </Pressable>
            </View>
         </Pressable>
      </Modal>
   );
}

const styles = StyleSheet.create({
   overlay: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
   },
   dialogContainer: {
      width: '80%',
      maxWidth: Layout.maxWidth.sm,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: Platform.OS === 'web' ? 1 : 0,
      ...Platform.select({
         ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
         },
         android: {
            elevation: 8,
         },
         web: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
         },
      }),
   },
   titleContainer: {
      marginBottom: Spacing.md,
   },
   descriptionContainer: {
      marginBottom: Spacing.md,
   },
   contentContainer: {
      marginBottom: Spacing.md,
   },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: Spacing.sm,
      marginTop: Spacing.sm,
   },
   button: {
      flex: 1,
      marginVertical: 0,
   },
});
