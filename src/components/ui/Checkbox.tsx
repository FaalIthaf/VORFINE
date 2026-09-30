import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { BorderRadius, Colors } from "../../constants/theme";

export interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string | React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  containerStyle,
  labelStyle,
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={() => !disabled && onToggle(!checked)}
      style={[styles.container, containerStyle, disabled && styles.disabled]}
      hitSlop={6}
    >
      <View
        style={[
          styles.box,
          checked ? styles.boxChecked : styles.boxUnchecked,
        ]}
      >
        {checked && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </View>
      {typeof label === "string" ? (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      ) : (
        <View style={styles.labelWrapper}>{label}</View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1.5,
  },
  boxUnchecked: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    color: "#334155",
    flexShrink: 1,
  },
  labelWrapper: {
    flex: 1,
  },
});

export default Checkbox;

