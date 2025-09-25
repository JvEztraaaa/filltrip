import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Dimensions,
} from "react-native";

// Static imports for social icons
import googleIcon from "../assets/icons/google.png";
import facebookIcon from "../assets/icons/facebook.png";



type Form = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SignupScreen() {
  // ...existing code...
  const [form, setForm] = useState<Form>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  // Responsive dimensions
  const isSmallScreen = screenWidth < 380;
  const isMediumScreen = screenWidth >= 380 && screenWidth < 768;
  const isLargeScreen = screenWidth >= 768;

  const getHorizontalPadding = () => {
    if (isSmallScreen) return 16;
    if (isMediumScreen) return 24;
    return Math.min(64, screenWidth * 0.1);
  };

  const getFormMaxWidth = () => {
    if (isSmallScreen) return screenWidth - 32;
    if (isMediumScreen) return Math.min(400, screenWidth - 48);
    return 448;
  };

  const socialIcons: Record<string, any> = {
    google: googleIcon,
    facebook: facebookIcon,
  };

  const onChange = (k: keyof Form, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 3)
      e.username = "Username must be at least 3 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Please enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem("users");
      const users = raw ? JSON.parse(raw) : [];

      if (users.some((u: any) => u.email.toLowerCase() === form.email.toLowerCase())) {
        Alert.alert("Error", "Email already registered");
        setIsLoading(false);
        return;
      }

      if (users.some((u: any) => u.username.toLowerCase() === form.username.toLowerCase())) {
        Alert.alert("Error", "Username already taken");
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: Math.random().toString(36).slice(2),
        ...form,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("users", JSON.stringify([...users, newUser]));
      Alert.alert("Success", "Account created successfully! Please log in.", [
        { text: "OK", onPress: () => navigation.navigate("Login" as never) },
      ]);
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Back Button */}
      <View style={{ position: "absolute", top: 40, left: 16, zIndex: 10 }}>
        <Pressable onPress={() => navigation.navigate("AboutPageScreen" as never)} style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 4, fontSize: 16 }}>Back</Text>
        </Pressable>
      </View>
      {/* Main Content */}
      <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ minHeight: screenHeight, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[
          "rgba(22,138,138,0.6)",
          "rgba(22,150,138,0.5)",
          "rgba(22,1,133,0.2)",
          "rgba(22,11,120,0.1)",
          "transparent",
        ]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: getHorizontalPadding(),
          paddingVertical: isSmallScreen ? 24 : 48,
          minHeight: screenHeight,
        }}
      >
        <View style={{ width: "100%", maxWidth: getFormMaxWidth() }} className="space-y-8">
          {/* Logo & Title */}
          <View className="flex flex-col items-center">
            <Image
              source={require("../assets/logo/logo.png")}
              style={{
                width: isSmallScreen ? 48 : 56,
                height: isSmallScreen ? 48 : 56,
                marginBottom: 16,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: isSmallScreen ? 24 : 36,
                lineHeight: isSmallScreen ? 32 : 36,
              }}
              className="text-white font-bold text-center justify-center"
            >
              Create your account
            </Text>
            <Text
              style={{
                fontSize: isSmallScreen ? 14 : 16,
                marginTop: 8,
                paddingHorizontal: isSmallScreen ? 8 : 0,
              }}
              className="text-gray-400 text-center mb-7 justify-center"
            >
              Already have an account?{" "}
              <Link href="/login" asChild>
                <Pressable>
                  <Text
                    style={{ fontSize: isSmallScreen ? 18 : 17 }}
                    className="font-semibold text-teal-400 ">
                    Log in
                  </Text>
                </Pressable>
              </Link>
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            {/** Full Name */}
            <View>
              <Text
                style={{ fontSize: isSmallScreen ? 16 : 18 }}
                className="font-medium text-gray-100" 
              >
                Full Name
              </Text>
              <TextInput
                value={form.fullName}
                onChangeText={(t) => onChange("fullName", t)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
                style={{
                  height: isSmallScreen ? 48 : 50,
                  fontSize: isSmallScreen ? 15 : 16,
                  marginTop: 8,
                  paddingHorizontal: 12,
                }}
                className={`w-full rounded-md bg-white/5 py-2 text-white border ${
                  errors.fullName ? "border-red-500" : "border-transparent"
                }`}
              />
            </View>

            {/** Username */}
            <View>
              <Text
                style={{ fontSize: isSmallScreen ? 16 : 18 }}
                className="font-medium text-gray-100 mt-5"
              >
                Username
              </Text>
              <TextInput
                value={form.username}
                onChangeText={(t) => onChange("username", t)}
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  height: isSmallScreen ? 48 : 50,
                  fontSize: isSmallScreen ? 15 : 16,
                  marginTop: 8,
                  paddingHorizontal: 12,
                }}
                className={`w-full rounded-md bg-white/5 py-2 text-white border ${
                  errors.username ? "border-red-500" : "border-transparent"
                }`}
              />
            </View>

            {/** Email */}
            <View>
              <Text
                style={{ fontSize: isSmallScreen ? 16 : 18 }}
                className="font-medium text-gray-100 mt-5"
              >
                Email
              </Text>
              <TextInput
                value={form.email}
                onChangeText={(t) => onChange("email", t)}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  height: isSmallScreen ? 48 : 50,
                  fontSize: isSmallScreen ? 15 : 16,
                  marginTop: 8,
                  paddingHorizontal: 12,
                }}
                className={`w-full rounded-md bg-white/5 py-2 text-white border ${
                  errors.email ? "border-red-500" : "border-transparent"
                }`}
              />
            </View>

            {/** Password */}
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: isSmallScreen ? 20 : 23,
                }}
              >
                <Text
                  style={{ fontSize: isSmallScreen ? 16 : 18 }}
                  className="font-medium text-gray-100"
                >
                  Password
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: isSmallScreen ? 48 : 50,
                  marginTop: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                <TextInput
                  value={form.password}
                  onChangeText={(t) => onChange("password", t)}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    fontSize: isSmallScreen ? 15 : 16,
                    color: "#fff",
                  }}
                />
                <Pressable onPress={() => setShowPw((s) => !s)} className="p-2">
                  <Ionicons
                    name={showPw ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            </View>

            {/** Confirm Password */}
            <View>
              <Text
                style={{ fontSize: isSmallScreen ? 16 : 18, marginTop: 16 }}
                className="font-medium text-gray-100"
              >
                Confirm Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: isSmallScreen ? 48 : 50,
                  marginTop: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                <TextInput
                  value={form.confirmPassword}
                  onChangeText={(t) => onChange("confirmPassword", t)}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPw2}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    fontSize: isSmallScreen ? 15 : 16,
                    color: "#fff",
                  }}
                />
                <Pressable onPress={() => setShowPw2((s) => !s)} className="p-2">
                  <Ionicons
                    name={showPw2 ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            </View>

            {/* Sign Up Button */}
            <Pressable onPress={handleSubmit} className="w-full mt-6">
              <LinearGradient
                colors={["#0F766E", "#111827"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: isSmallScreen ? 16 : 20, borderRadius: 6 }}
              >
                <Text className="text-center text-white font-semibold">
                  {isLoading ? "Signing up..." : "Sign up"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: isSmallScreen ? 20 : 24,
              }}
            >
              <View className="flex-1 h-px bg-gray-700" />
              <Text
                style={{
                  fontSize: isSmallScreen ? 13 : 14,
                  marginHorizontal: 16,
                  color: "#9CA3AF",
                }}
              >
                Or continue with
              </Text>
              <View className="flex-1 h-px bg-gray-700" />
            </View>

            {/* Social Login */}
            <View
              style={{
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: "center",
                alignItems: "center",
                gap: isSmallScreen ? 12 : 16,
              }}
            >
              {["google", "facebook"].map((provider) => (
                <Pressable
                  key={provider}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 6,
                    paddingHorizontal: 16,
                    paddingVertical: isSmallScreen ? 12 : 14,
                    minWidth: isSmallScreen ? "100%" : 120,
                    maxWidth: isSmallScreen ? "100%" : 160,
                    backgroundColor: "#1F2A37",
                  }}
                >
                  <Image
                    source={socialIcons[provider]}
                    style={{
                      width: isSmallScreen ? 20 : 24,
                      height: isSmallScreen ? 20 : 24,
                    }}
                    resizeMode="contain"
                  />
                  <Text className="text-white font-semibold">
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
      </ScrollView>
    </View>
  );
}
