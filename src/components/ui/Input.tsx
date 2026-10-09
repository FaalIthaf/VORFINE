import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../../constants/theme";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  rightBadge?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isPassword = false,
      containerStyle,
      inputStyle,
      rightBadge,
      secureTextEntry,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const internalInputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => internalInputRef.current as TextInput);

    const isSecure = isPassword ? !showPassword : secureTextEntry;

    const handleFocusInput = () => {
      internalInputRef.current?.focus();
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {(label || rightBadge) && (
          <View style={styles.labelRow}>
            {label && (
              <Pressable onPress={handleFocusInput}>
                <Text style={styles.label}>{label}</Text>
              </Pressable>
            )}
            {rightBadge && <View style={styles.badgeWrapper}>{rightBadge}</View>}
          </View>
        )}

        <Pressable
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
            !!error && styles.inputWrapperError,
          ]}
          onPress={handleFocusInput}
        >
          {leftIcon && (
            <View style={styles.leftIconWrapper} pointerEvents="none">
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={internalInputRef}
            style={[styles.input, inputStyle]}
            placeholderTextColor="#94A3B8"
            secureTextEntry={isSecure}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />

          {isPassword ? (
            <Pressable
              hitSlop={10}
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.rightIconWrapper}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#64748B"
              />
            </Pressable>
          ) : (
            rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>
          )}
        </Pressable>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#1E293B",
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: "#FFFFFF",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
  },
  leftIconWrapper: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIconWrapper: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 0,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
