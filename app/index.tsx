import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Image,
} from "react-native";
import { Link } from "expo-router"; 

const sections = [
  {
    id: 1,
    title: "Mission",
    description:
      "To make travel smarter, cheaper, and more sustainable by helping drivers understand and manage their fuel expenses.",
  },
  {
    id: 2,
    title: "Vision",
    description:
      "A future where every trip is planned with ease, fuel is used efficiently, and drivers save both money and the environment.",
  },
  {
    id: 3,
    title: "What is FillTrip?",
    description:
      "Filltrip is your all-in-one fuel calculator. Choose your start and end points, pick your vehicle, and instantly know how much fuel and money your trip will take.",
  },
  {
    id: 4,
    title: "Why Use FillTrip?",
    description:
      "No more guessing. With real-time fuel prices, vehicle efficiency data, and accurate distances, Filltrip helps you budget smarter and drive with confidence.",
  },
  {
    id: 5,
    title: "Track & Save",
    description:
      "Record your trips and fuel history to see where your money goes. Get insights, spot trends, and take control of your driving expenses.",
  },
  {
    id: 6,
    title: "Practical Value",
    description:
      "Filltrip gives you the tools to plan better trips, cut down on costs, and get the most out of every liter.",
  },
];

const people = [
  {
    name: "Jan Vincent Estrada",
    role: "Frontend Developer",
    imageUrl: require("../assets/images/estrada.png"),
  },
  {
    name: "Dian Mendoza",
    role: "Backend Developer",
    imageUrl: require("../assets/images/mendoza.png"),
  },
  {
    name: "Gabriel Rola",
    role: "Frontend Developer",
    imageUrl: require("../assets/images/rola.png"),
  },
  {
    name: "Gervhee Velez",
    role: "Frontend Developer",
    imageUrl: require("../assets/images/velez.png"),
  },
  {
    name: "Mark Gabrielle Dela Cruz",
    role: "Backend Developer",
    imageUrl: require("../assets/images/delaCruz.png"),
  },
  {
    name: "Pauline Manaois",
    role: "UI/UX Designer",
    imageUrl: require("../assets/images/manaois.png"),
  },
];

// Main menu router
const menuItems = [
  { name: "Home", path: "/home" },
  { name: "About", path: "/" },
  { name: "Contact Us", path: "/contact" },
  { name: "Login", path: "/login" },
];

const logo = { logoImg: require("../assets/logo/logo.png") };

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { width, height } = useWindowDimensions();

  // Responsive text sizes
  const titleSize = width > 400 ? "text-4xl" : "text-3xl";
  const sectionTitleSize = width > 400 ? "text-lg" : "text-base";
  const sectionDescSize = width > 500 ? "text-base" : "text-sm";
  const teamsize = height > 400 ? "mb-12" : "mb-5";
  const logoSize = width > 400 ? 45 : 40;

  return (
    <ScrollView
      className="bg-gray-900 min-h-screen"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mt-12 p-4">
        <View className="flex-row items-center gap-2">
          <Image
            source={logo.logoImg}
            style={{ width: logoSize, height: logoSize }}
            resizeMode="cover"
          />
          <Text className="text-2xl font-bold text-white">FillTrip</Text>
        </View>
        <Pressable onPress={() => setMenuOpen(!menuOpen)}>
          <Text className="text-white text-2xl">{menuOpen ? "✕" : "☰"}</Text>
        </Pressable>
      </View>

      {/* Mobile Menu */}
      {menuOpen && (
        <View className="bg-gray-800 p-4">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.path as any} asChild>
              <Pressable
                onPress={() => setMenuOpen(false)}
                className="py-2"
              >
                <Text className="text-white text-lg">{item.name}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      {/* Page Title */}
      <View className="mb-8 items-center px-4">
        <Text className={`${titleSize} font-semibold text-white text-center`}>
          About <Text className="font-extrabold text-blue-400">FillTrip</Text>
        </Text>
        <Text className="mt-2 text-gray-400 text-center text-[17px] px-10">
          Learn more about our mission, vision, and the team behind FillTrip.
        </Text>
      </View>

      {/* Sections */}
      <View className="self-center mt-6 w-full px-5 gap-3">
        {sections.map((s) => (
          <View
            key={s.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-5"
          >
            <Text
              className={`text-white font-bold mb-1 ${sectionTitleSize}`}
            >
              {s.title}
            </Text>
            <Text className={`text-gray-200 ${sectionDescSize}`}>
              {s.description}
            </Text>
          </View>
        ))}
      </View>

      {/* Team Section */}
      <View className={`mt-12 mb-12 px-4 ${teamsize}`}>
        <Text className="text-3xl font-semibold text-white mb-4">
          Meet our Developers
        </Text>
        <Text className="text-gray-400 mb-6">
          We’re a small team of students who built Filltrip to make fuel
          tracking and trip planning easier.
        </Text>

        {people.map((person) => (
          <View
            key={person.name}
            className="flex-row items-center mb-4 p-3 rounded-lg bg-gray-800"
          >
            <Image
              source={person.imageUrl}
              className="rounded-full"
              style={{ width: 60, height: 60, marginRight: 16 }}
              resizeMode="cover"
            />
            <View>
              <Text className="text-white text-[18px] font-semibold">
                {person.name}
              </Text>
              <Text className="text-indigo-500">{person.role}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
