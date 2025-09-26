import React from "react";
import { View, Text, TextInput, Image, Pressable, ScrollView, Dimensions, Platform, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function LoginPageLayout() {
    const navigation = useNavigation();

    const isSmallScreen = screenWidth < 380;
    const isMediumScreen = screenWidth >= 380 && screenWidth < 768;

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

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: "#111827" }}
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
                {/* Back Button */}
                <View style={{ position: "absolute", top: 85, left: 16, zIndex: 10 }}>
                    <Pressable
                        onPress={() => navigation.navigate("AboutPageScreen")}
                        style={{ flexDirection: "row", alignItems: "center", padding: 8 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                        <Text style={{ color: "#fff", marginLeft: 4, fontSize: 17, marginTop: 0 }}>Back</Text>
                    </Pressable>
                </View>

                <View style={{ width: "100%", maxWidth: getFormMaxWidth() }}>
                    {/* Logo and Title */}
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <Image
                            source={require("../assets/logo/logo.png")}
                            style={{
                                height: isSmallScreen ? 48 : 56,
                                width: isSmallScreen ? 48 : 56,
                                marginBottom: 16,
                            }}
                            resizeMode="contain"
                        />
                        <Text
                            style={{
                                fontSize: isSmallScreen ? 24 : 30,
                                fontWeight: "700",
                                color: "#fff",
                                textAlign: "center",
                            }}
                        >
                            Log in to your account
                        </Text>
                        <Text
                            style={{
                                fontSize: isSmallScreen ? 14 : 16,
                                color: "#9CA3AF",
                                marginTop: 8,
                                textAlign: "center",
                            }}
                        >
                            New to FillTrip?{" "}
                            <Text
                                onPress={() => navigation.navigate("SignupScreen")}
                                style={{ fontWeight: "600", color: "#14B8A6" }}
                            >
                                Create an account.
                            </Text>
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={{ marginTop: isSmallScreen ? 32 : 48 }}>
                        {/* Email */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: isSmallScreen ? 16 : 18, color: "#F3F4F6", marginBottom: 8 }}>
                                Email address
                            </Text>
                            <TextInput
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={{
                                    height: isSmallScreen ? 48 : 50,
                                    fontSize: isSmallScreen ? 15 : 16,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    color: "#fff",
                                    borderWidth: 1,
                                    borderColor: "transparent",
                                }}
                            />
                        </View>

                        {/* Password */}
                        <View style={{ marginBottom: 20 }}>
                            <View
                                style={{
                                    flexDirection: isSmallScreen ? "column" : "row",
                                    justifyContent: "space-between",
                                    alignItems: isSmallScreen ? "flex-start" : "center",
                                    marginBottom: 8,
                                }}
                            >
                                <Text style={{ fontSize: isSmallScreen ? 16 : 18, color: "#F3F4F6" }}>Password</Text>
                                <Pressable>
                                    <Text style={{ fontSize: isSmallScreen ? 13 : 14, color: "#14B8A6", fontWeight: "600", marginTop: isSmallScreen ? 4 : 0 }}>
                                        Forgot password?
                                    </Text>
                                </Pressable>
                            </View>
                            <TextInput
                                placeholder="Enter your password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={{
                                    height: isSmallScreen ? 48 : 50,
                                    fontSize: isSmallScreen ? 15 : 16,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    color: "#fff",
                                    borderWidth: 1,
                                    borderColor: "transparent",
                                }}
                            />
                        </View>

                        {/* Remember Me */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
                            <Pressable
                                style={{
                                    height: 20,
                                    width: 20,
                                    marginRight: 8,
                                    borderRadius: 4,
                                    backgroundColor: "#374151",
                                }}
                            />
                            <Text style={{ fontSize: isSmallScreen ? 13 : 14, color: "#D1D5DB" }}>Remember me</Text>
                        </View>

                        {/* Login Button */}
                        <Pressable style={{ marginBottom: 24, borderRadius: 6, overflow: "hidden" }}>
                            <LinearGradient
                                colors={["#0f766e", "#111827"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ paddingVertical: isSmallScreen ? 16 : 20, alignItems: "center", borderRadius: 6 }}
                            >
                                <Text style={{ fontSize: isSmallScreen ? 15 : 16, fontWeight: "600", color: "#fff" }}>Log in</Text>
                            </LinearGradient>
                        </Pressable>

                        {/* Divider */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: isSmallScreen ? 20 : 24 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: "#374151" }} />
                            <Text style={{ marginHorizontal: 16, fontSize: isSmallScreen ? 13 : 14, color: "#9CA3AF" }}>Or continue with</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: "#374151" }} />
                        </View>

                        {/* Social Login Buttons */}
                        <View
                            style={{
                                flexDirection: isSmallScreen ? "column" : "row",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: isSmallScreen ? 12 : 16,
                            }}
                        >
                            {/* Google */}
                            <Pressable
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 6,
                                    paddingHorizontal: 16,
                                    paddingVertical: isSmallScreen ? 12 : 14,
                                    backgroundColor: "#1F2937",
                                    marginBottom: isSmallScreen ? 12 : 0,
                                    minWidth: isSmallScreen ? "100%" : 120,
                                    maxWidth: isSmallScreen ? "100%" : 160,
                                }}
                            >
                                <Image
                                    source={require("../assets/icons/google.png")}
                                    style={{ width: isSmallScreen ? 20 : 24, height: isSmallScreen ? 20 : 24, marginRight: 8 }}
                                    resizeMode="contain"
                                />
                                <Text style={{ fontSize: isSmallScreen ? 13 : 14, fontWeight: "600", color: "#fff" }}>Google</Text>
                            </Pressable>

                            {/* Facebook */}
                            <Pressable
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 6,
                                    paddingHorizontal: 16,
                                    paddingVertical: isSmallScreen ? 12 : 14,
                                    backgroundColor: "#1F2937",
                                    minWidth: isSmallScreen ? "100%" : 120,
                                    maxWidth: isSmallScreen ? "100%" : 160,
                                }}
                            >
                                <Image
                                    source={require("../assets/icons/facebook.png")}
                                    style={{ width: isSmallScreen ? 20 : 24, height: isSmallScreen ? 20 : 24, marginRight: 8 }}
                                    resizeMode="contain"
                                />
                                <Text style={{ fontSize: isSmallScreen ? 13 : 14, fontWeight: "600", color: "#fff" }}>Facebook</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </ScrollView>
    );
}
