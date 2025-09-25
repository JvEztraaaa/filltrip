import React from "react";
import { View, Text, TextInput, Image, Pressable, ScrollView, Dimensions, Platform } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginPageLayout() {
    // Responsive dimensions
    const isSmallScreen = screenWidth < 380;
    const isMediumScreen = screenWidth >= 380 && screenWidth < 768;
    const isLargeScreen = screenWidth >= 768;

    // Dynamic padding based on screen size
    const getHorizontalPadding = () => {
        if (isSmallScreen) return 16;
        if (isMediumScreen) return 24;
        return Math.min(64, screenWidth * 0.1);
    };

    // Dynamic max width for form
    const getFormMaxWidth = () => {
        if (isSmallScreen) return screenWidth - 32;
        if (isMediumScreen) return Math.min(400, screenWidth - 48);
        return 448; // max-w-md equivalent
    };

    return (
        <ScrollView 
            className="flex-1 bg-gray-900"
            contentContainerStyle={{ 
                minHeight: screenHeight,
                flexGrow: 1 
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-1 bg-gray-900">
                {/* Login Form Section with gradient */}
                <LinearGradient
                    colors={[
                        "rgba(22,138,138,0.6)",
                        "rgba(22,150,138,0.5)",
                        "rgba(22,1,133,0.2)",
                        "rgba(22,11,120,0.1)",
                        "transparent"
                    ]}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: getHorizontalPadding(),
                        paddingVertical: isSmallScreen ? 24 : 48,
                        minHeight: screenHeight
                    }}
                >
                    <View 
                        style={{ 
                            width: '100%',
                            maxWidth: getFormMaxWidth(),
                        }}
                        className="space-y-8"
                    >
                        {/* Logo and Title Section */}
                        <View className="flex flex-col items-center">
                            <Image
                                source={require("../assets/logo/logo.png")}
                                style={{
                                    height: isSmallScreen ? 48 : 56,
                                    width: isSmallScreen ? 48 : 56,
                                    marginBottom: 16
                                }}
                                resizeMode="contain"
                            />
                            <Text 
                                style={{
                                    fontSize: isSmallScreen ? 24 : 30,
                                    lineHeight: isSmallScreen ? 32 : 36
                                }}
                                className="font-bold text-white text-center"
                            >
                                Log in to your account
                            </Text>
                            <Text 
                                style={{
                                    fontSize: isSmallScreen ? 14 : 16,
                                    marginTop: 8,
                                    paddingHorizontal: isSmallScreen ? 8 : 0
                                }}
                                className="text-center text-gray-400"
                            >
                                New to FillTrip?{" "}
                                <Link href="/signup" asChild>
                                    <Pressable>
                                        <Text 
                                            style={{ fontSize: isSmallScreen ? 14 : 15 }}
                                            className="font-semibold text-teal-400"
                                        >
                                            Create an account.
                                        </Text>
                                    </Pressable>
                                </Link>
                            </Text>
                        </View>

                        {/* Login Form */}
                        <View 
                            style={{
                                marginTop: isSmallScreen ? 32 : 48
                            }}
                            className="space-y-5"
                        >
                            {/* Email Input */}
                            <View>
                                <Text 
                                    style={{ fontSize: isSmallScreen ? 16 : 18 }}
                                    className="font-medium text-gray-100"
                                >
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
                                        marginTop: 8,
                                        paddingHorizontal: 12
                                    }}
                                    className="w-full rounded-md bg-white/5 py-2 text-white border border-transparent"
                                />
                            </View>

                            {/* Password Input */}
                            <View>
                                <View 
                                    style={{
                                        flexDirection: isSmallScreen ? 'column' : 'row',
                                        alignItems: isSmallScreen ? 'flex-start' : 'center',
                                        justifyContent: 'space-between',
                                        marginTop: isSmallScreen ? 20 : 32
                                    }}
                                >
                                    <Text 
                                        style={{ fontSize: isSmallScreen ? 16 : 18 }}
                                        className="font-medium text-gray-100"
                                    >
                                        Password
                                    </Text>
                                    <Pressable 
                                        style={{ 
                                            marginTop: isSmallScreen ? 4 : 0 
                                        }}
                                    >
                                        <Text 
                                            style={{ fontSize: isSmallScreen ? 13 : 14 }}
                                            className="font-semibold text-teal-400"
                                        >
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
                                        marginTop: 8,
                                        paddingHorizontal: 12
                                    }}
                                    className="w-full rounded-md bg-white/5 py-2 text-white border border-transparent"
                                />
                            </View>

                            {/* Remember Me */}
                            <View className="flex-row items-center">
                                <Pressable 
                                    style={{
                                        height: 20,
                                        width: 20,
                                        marginRight: 8,
                                        marginTop: 20,
                                        borderRadius: 4
                                    }}
                                    className="bg-gray-700"
                                />
                                <Text 
                                    style={{
                                        fontSize: isSmallScreen ? 13 : 14,
                                        marginTop: 20
                                    }}
                                    className="text-gray-300"
                                >
                                    Remember me
                                </Text>
                            </View>

                            {/* Login Button */}
                            <Pressable 
                                style={{
                                    marginTop: isSmallScreen ? 24 : 32,
                                    borderRadius: 6,
                                    overflow: 'hidden'
                                }}
                                className="w-full shadow-md"
                            >
                                <LinearGradient
                                    colors={["#0f766e", "#111827"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        paddingVertical: isSmallScreen ? 16 : 20,
                                        paddingHorizontal: 16
                                    }}
                                >
                                    <Text 
                                        style={{ fontSize: isSmallScreen ? 15 : 16 }}
                                        className="font-semibold text-white text-center"
                                    >
                                        Log in
                                    </Text>
                                </LinearGradient>
                            </Pressable>

                            {/* Divider */}
                            <View 
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginVertical: isSmallScreen ? 20 : 24
                                }}
                            >
                                <View className="flex-1 h-px bg-gray-700" />
                                <Text 
                                    style={{
                                        fontSize: isSmallScreen ? 13 : 14,
                                        marginHorizontal: 16
                                    }}
                                    className="text-gray-400"
                                >
                                    Or continue with
                                </Text>
                                <View className="flex-1 h-px bg-gray-700" />
                            </View>

                            {/* Social Login */}
                            <View 
                                style={{
                                    flexDirection: isSmallScreen ? 'column' : 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: isSmallScreen ? 12 : 16
                                }}
                            >
                                {/* Google Button */}
                                <Pressable
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        borderRadius: 6,
                                        paddingHorizontal: 16,
                                        paddingVertical: isSmallScreen ? 12 : 14,
                                        minWidth: isSmallScreen ? '100%' : 120,
                                        maxWidth: isSmallScreen ? '100%' : 160
                                    }}
                                    className="bg-gray-800"
                                >
                                    <Image
                                        source={require("../assets/icons/google.png")}
                                        style={{
                                            width: isSmallScreen ? 20 : 24,
                                            height: isSmallScreen ? 20 : 24
                                        }}
                                        resizeMode="contain"
                                    />
                                    <Text 
                                        style={{ fontSize: isSmallScreen ? 13 : 14 }}
                                        className="font-semibold text-white"
                                    >
                                        Google
                                    </Text>
                                </Pressable>

                                {/* Facebook Button */}
                                <Pressable
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        borderRadius: 6,
                                        paddingHorizontal: 16,
                                        paddingVertical: isSmallScreen ? 12 : 14,
                                        minWidth: isSmallScreen ? '100%' : 120,
                                        maxWidth: isSmallScreen ? '100%' : 160
                                    }}
                                    className="bg-gray-800"
                                >
                                    <Image
                                        source={require("../assets/icons/facebook.png")}
                                        style={{
                                            width: isSmallScreen ? 20 : 24,
                                            height: isSmallScreen ? 20 : 24
                                        }}
                                        resizeMode="contain"
                                    />
                                    <Text 
                                        style={{ fontSize: isSmallScreen ? 13 : 14 }}
                                        className="font-semibold text-white"
                                    >
                                        Facebook
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </ScrollView>
    );
}