-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
-- Host: 127.0.0.1
-- Generation Time: Sep 23, 2025 at 10:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

CREATE DATABASE IF NOT EXISTS `filltrip` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `filltrip`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Table structure for table `fuel_history`
CREATE TABLE `fuel_history` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `vehicle_name` varchar(120) NOT NULL,
  `odometer_km` decimal(10,1) NOT NULL,
  `distance_unit` enum('km','miles','meters') NOT NULL DEFAULT 'km',
  `liters` decimal(10,2) NOT NULL,
  `fuel_unit` enum('liters','gallons') NOT NULL DEFAULT 'liters',
  `price_per_liter` decimal(10,2) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `fuel_type` varchar(60) NOT NULL,
  `station` varchar(255) DEFAULT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `saved_places`
CREATE TABLE `saved_places` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `place_name` varchar(255) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_name` (`user_id`,`place_name`),
  KEY `idx_user_created` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `user_trips`
CREATE TABLE `user_trips` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `start_location` varchar(255) NOT NULL,
  `end_location` varchar(255) NOT NULL,
  `distance_km` decimal(10,2) NOT NULL,
  `efficiency_kpl` decimal(10,2) DEFAULT NULL,
  `liters_needed` decimal(10,2) NOT NULL,
  `price_per_liter` decimal(10,2) DEFAULT NULL,
  `fuel_cost` decimal(10,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `fuel_type` varchar(120) DEFAULT NULL,
  `vehicle_label` varchar(160) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_created` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `user`
CREATE TABLE `user` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` varchar(60) DEFAULT NULL,
  `last_name` varchar(60) DEFAULT NULL,
  `full_name` varchar(120) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_icon` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------------

INSERT INTO `user` (id, first_name, last_name, full_name, username, email, password_hash, user_icon, role, created_at) VALUES
(1, 'Admin', 'Test', 'Admin Test', 'admin', 'admin@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'admin', '2025-01-10 09:00:00'),
(2, 'Test', 'User', 'Test User', 'testuser', 'test@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'user', '2025-01-05 09:00:00'),
(3, 'Liam', 'Santos', 'Liam Santos', 'testuser2', 'test2@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'user', '2025-02-14 08:45:00'),
(4, 'Ella', 'Reyes', 'Ella Reyes', 'testuser3', 'test3@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'user', '2025-04-03 12:30:00'),
(5, 'Noah', 'Garcia', 'Noah Garcia', 'testuser4', 'test4@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'user', '2025-06-22 15:15:00'),
(6, 'Ava', 'Cruz', 'Ava Cruz', 'testuser5', 'test5@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'user', '2025-08-10 10:50:00');


-- ------------------------------------------------------------------

-- User Trip Inserts for Test Users
INSERT INTO `user_trips` (id, user_id, start_location, end_location, distance_km, efficiency_kpl, liters_needed, price_per_liter, fuel_cost, currency, fuel_type, vehicle_label, created_at)
VALUES
(1, 2, 'Dasmariñas, Cavite', 'Tagaytay City, Cavite', 32.5, 51.0, 0.64, 58.00, 37.12, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i', '2025-01-12 10:30:00'),
(2, 2, 'Dasmariñas, Cavite', 'Mall of Asia, Pasay', 38.2, 14.0, 2.73, 57.00, 155.61, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-01-25 14:00:00'),
(3, 2, 'Dasmariñas, Cavite', 'Subic Bay Freeport Zone', 120.0, 14.0, 8.57, 57.00, 488.49, 'PHP', 'Premium Gasoline (97)', 'Toyota Vios 2021', '2025-03-10 07:00:00'),
(4, 2, 'Dasmariñas, Cavite', 'Baguio City', 250.0, 9.5, 26.32, 55.00, 1447.60, 'PHP', 'Diesel', 'Toyota Fortuner (diesel)', '2025-03-25 05:30:00'),
(5, 2, 'Dasmariñas, Cavite', 'Batangas Pier', 65.0, 18.0, 3.61, 58.00, 209.38, 'PHP', 'Unleaded Gasoline', 'Toyota Wigo 2022', '2025-04-05 08:00:00'),
(6, 2, 'Tagaytay City, Cavite', 'Enchanted Kingdom, Sta. Rosa', 27.0, 19.5, 1.38, 57.50, 79.35, 'PHP', 'Premium Gasoline (95)', 'Mitsubishi Mirage 2021', '2025-04-20 15:00:00'),
(7, 2, 'Dasmariñas, Cavite', 'Clark Pampanga', 105.0, 14.0, 7.50, 57.00, 427.50, 'PHP', 'Premium Gasoline (97)', 'Toyota Vios 2021', '2025-05-02 06:00:00'),
(8, 2, 'Dasmariñas, Cavite', 'NAIA Terminal 3, Pasay', 45.0, 38.0, 1.18, 58.00, 68.44, 'PHP', 'Unleaded Gasoline', 'Yamaha Aerox 155', '2025-05-18 09:00:00'),
(9, 2, 'Dasmariñas, Cavite', 'La Union Surfing Area', 270.0, 9.5, 28.42, 55.00, 1563.10, 'PHP', 'Diesel', 'Toyota Fortuner (diesel)', '2025-06-08 03:30:00'),
(10, 2, 'Dasmariñas, Cavite', 'Taguig BGC', 50.0, 19.5, 2.56, 57.50, 147.20, 'PHP', 'Premium Gasoline (95)', 'Mitsubishi Mirage 2021', '2025-07-02 13:00:00'),
(11, 3, 'Dasmariñas, Cavite', 'Tagaytay City', 23.4, 11.8, 1.98, 65.40, 129.57, 'PHP', 'Gasoline', 'Toyota Vios 1.3L', '2025-09-18 08:15:00'),
(12, 3, 'Bacoor, Cavite', 'Makati City', 32.7, 10.5, 3.11, 65.40, 203.83, 'PHP', 'Gasoline', 'Toyota Vios 1.3L', '2025-09-19 10:42:00'),
(13, 3, 'Dasmariñas, Cavite', 'SM Molino', 14.5, 11.8, 1.23, 65.40, 80.44, 'PHP', 'Gasoline', 'Toyota Vios 1.3L', '2025-09-21 11:25:00'),
(14, 3, 'Dasmariñas, Cavite', 'Nuvali, Sta. Rosa', 28.2, 11.8, 2.39, 65.40, 156.01, 'PHP', 'Gasoline', 'Toyota Vios 1.3L', '2025-09-23 17:10:00'),
(15, 3, 'Dasmariñas, Cavite', 'Alabang, Muntinlupa', 35.1, 11.8, 2.98, 65.40, 195.19, 'PHP', 'Gasoline', 'Toyota Vios 1.3L', '2025-09-24 09:35:00'),
(16, 4, 'Imus, Cavite', 'Pasay City', 27.8, 12.2, 2.28, 62.80, 143.18, 'PHP', 'Diesel', 'Mitsubishi Mirage G4', '2025-09-20 07:00:00'),
(17, 4, 'General Trias', 'Dasmariñas', 11.6, 12.2, 0.95, 62.80, 59.66, 'PHP', 'Diesel', 'Mitsubishi Mirage G4', '2025-09-22 12:30:00'),
(18, 4, 'Kawit, Cavite', 'SM Bacoor', 9.8, 12.2, 0.80, 62.80, 50.24, 'PHP', 'Diesel', 'Mitsubishi Mirage G4', '2025-09-23 14:10:00'),
(19, 4, 'Imus, Cavite', 'Taguig City', 30.5, 12.2, 2.50, 62.80, 157.00, 'PHP', 'Diesel', 'Mitsubishi Mirage G4', '2025-09-25 18:25:00'),
(20, 4, 'Imus, Cavite', 'Las Piñas', 19.4, 12.2, 1.59, 62.80, 99.85, 'PHP', 'Diesel', 'Mitsubishi Mirage G4', '2025-09-27 09:40:00'),
(21, 5, 'Tanza, Cavite', 'SM Bacoor', 17.3, 13.0, 1.33, 65.00, 86.45, 'PHP', 'Gasoline', 'Honda City 1.5L', '2025-09-23 09:25:00'),
(22, 5, 'Tanza, Cavite', 'Tagaytay City', 41.5, 13.0, 3.19, 65.00, 207.35, 'PHP', 'Gasoline', 'Honda City 1.5L', '2025-09-24 14:10:00'),
(23, 5, 'General Trias', 'Imus', 12.4, 13.0, 0.95, 65.00, 61.75, 'PHP', 'Gasoline', 'Honda City 1.5L', '2025-09-25 16:50:00'),
(24, 5, 'Tanza, Cavite', 'Dasmariñas', 22.0, 13.0, 1.69, 65.00, 109.85, 'PHP', 'Gasoline', 'Honda City 1.5L', '2025-09-27 11:05:00'),
(25, 5, 'Tanza, Cavite', 'SM Rosario', 8.3, 13.0, 0.64, 65.00, 41.60, 'PHP', 'Gasoline', 'Honda City 1.5L', '2025-09-29 13:45:00'),
(26, 6, 'Dasmariñas, Cavite', 'Alabang, Muntinlupa', 35.6, 14.5, 2.45, 66.20, 162.19, 'PHP', 'Diesel', 'Toyota Innova 2.8L', '2025-09-25 16:00:00'),
(27, 6, 'Dasmariñas, Cavite', 'Batangas City', 83.2, 14.5, 5.74, 66.20, 379.10, 'PHP', 'Diesel', 'Toyota Innova 2.8L', '2025-09-27 10:15:00'),
(28, 6, 'Dasmariñas, Cavite', 'Tagaytay City', 24.0, 14.5, 1.66, 66.20, 109.89, 'PHP', 'Diesel', 'Toyota Innova 2.8L', '2025-09-29 09:20:00'),
(29, 6, 'Dasmariñas, Cavite', 'Carmona, Cavite', 17.5, 14.5, 1.21, 66.20, 80.10, 'PHP', 'Diesel', 'Toyota Innova 2.8L', '2025-09-30 13:55:00'),
(30, 6, 'Dasmariñas, Cavite', 'Nuvali, Sta. Rosa', 29.8, 14.5, 2.06, 66.20, 136.67, 'PHP', 'Diesel', 'Toyota Innova 2.8L', '2025-10-01 18:30:00');


-- ------------------------------------------------------------------

-- Fuel History Records Inserts for Test Users
INSERT INTO `fuel_history` (user_id, date, vehicle_name, odometer_km, distance_unit, liters, fuel_unit, price_per_liter, total_cost, fuel_type, station, currency)
VALUES
(2, '2025-01-15 08:30:00', 'Toyota Vios 2021', 1500.0, 'km', 38.0, 'liters', 57.00, 2166.00, 'Premium Gasoline (95)', 'Shell', 'PHP'),
(2, '2025-02-10 09:45:00', 'Toyota Fortuner (diesel)', 3200.0, 'km', 55.0, 'liters', 55.00, 3025.00, 'Diesel', 'Petron', 'PHP'),
(2, '2025-03-15 07:20:00', 'Honda Click 125i', 5400.0, 'km', 4.2, 'liters', 58.00, 243.60, 'Unleaded Gasoline', 'Caltex', 'PHP'),
(2, '2025-04-01 10:15:00', 'Toyota Wigo 2022', 6200.0, 'km', 32.5, 'liters', 58.00, 1885.00, 'Unleaded Gasoline', 'Shell', 'PHP'),
(2, '2025-04-25 09:00:00', 'Mitsubishi Mirage 2021', 7850.0, 'km', 30.0, 'liters', 57.50, 1725.00, 'Premium Gasoline (95)', 'Total', 'PHP'),
(3, '2025-09-17 07:10:00', 'Toyota Vios 1.3L', 9800.0, 'km', 35.0, 'liters', 65.40, 2289.00, 'Gasoline', 'Shell', 'PHP'),
(3, '2025-09-20 09:35:00', 'Toyota Vios 1.3L', 10050.0, 'km', 36.0, 'liters', 65.40, 2354.40, 'Gasoline', 'Caltex', 'PHP'),
(3, '2025-09-23 18:00:00', 'Toyota Vios 1.3L', 10200.0, 'km', 37.5, 'liters', 65.40, 2452.50, 'Gasoline', 'Petron', 'PHP'),
(3, '2025-09-26 08:20:00', 'Toyota Vios 1.3L', 10425.0, 'km', 35.8, 'liters', 65.40, 2341.32, 'Gasoline', 'Shell', 'PHP'),
(3, '2025-09-29 10:45:00', 'Toyota Vios 1.3L', 10610.0, 'km', 36.3, 'liters', 65.40, 2374.02, 'Gasoline', 'Seaoil', 'PHP'),
(4, '2025-09-20 07:45:00', 'Mitsubishi Mirage G4', 8450.0, 'km', 30.0, 'liters', 62.80, 1884.00, 'Diesel', 'Petron', 'PHP'),
(4, '2025-09-22 13:10:00', 'Mitsubishi Mirage G4', 8580.0, 'km', 28.5, 'liters', 62.80, 1789.80, 'Diesel', 'Shell', 'PHP'),
(4, '2025-09-24 10:00:00', 'Mitsubishi Mirage G4', 8700.0, 'km', 32.0, 'liters', 62.80, 2009.60, 'Diesel', 'Caltex', 'PHP'),
(4, '2025-09-26 08:30:00', 'Mitsubishi Mirage G4', 8850.0, 'km', 31.2, 'liters', 62.80, 1959.36, 'Diesel', 'Unioil', 'PHP'),
(4, '2025-09-29 09:45:00', 'Mitsubishi Mirage G4', 9000.0, 'km', 30.8, 'liters', 62.80, 1933.84, 'Diesel', 'Shell', 'PHP'),
(5, '2025-09-21 08:30:00', 'Honda City 1.5L', 12300.0, 'km', 33.0, 'liters', 65.00, 2145.00, 'Gasoline', 'Shell', 'PHP'),
(5, '2025-09-23 09:10:00', 'Honda City 1.5L', 12460.0, 'km', 32.5, 'liters', 65.00, 2112.50, 'Gasoline', 'Petron', 'PHP'),
(5, '2025-09-25 14:00:00', 'Honda City 1.5L', 12600.0, 'km', 34.0, 'liters', 65.00, 2210.00, 'Gasoline', 'Caltex', 'PHP'),
(5, '2025-09-27 10:25:00', 'Honda City 1.5L', 12780.0, 'km', 31.8, 'liters', 65.00, 2067.00, 'Gasoline', 'Unioil', 'PHP'),
(5, '2025-09-30 08:45:00', 'Honda City 1.5L', 12920.0, 'km', 33.6, 'liters', 65.00, 2184.00, 'Gasoline', 'Shell', 'PHP'),
(6, '2025-09-25 16:15:00', 'Toyota Innova 2.8L', 14200.0, 'km', 45.0, 'liters', 66.20, 2979.00, 'Diesel', 'Petron', 'PHP'),
(6, '2025-09-27 10:45:00', 'Toyota Innova 2.8L', 14450.0, 'km', 46.2, 'liters', 66.20, 3052.44, 'Diesel', 'Shell', 'PHP'),
(6, '2025-09-29 09:30:00', 'Toyota Innova 2.8L', 14620.0, 'km', 47.8, 'liters', 66.20, 3168.36, 'Diesel', 'Caltex', 'PHP'),
(6, '2025-09-30 13:50:00', 'Toyota Innova 2.8L', 14800.0, 'km', 44.5, 'liters', 66.20, 2945.90, 'Diesel', 'Shell', 'PHP'),
(6, '2025-10-01 18:40:00', 'Toyota Innova 2.8L', 14960.0, 'km', 45.8, 'liters', 66.20, 3039.00, 'Diesel', 'Petron', 'PHP');


-- ------------------------------------------------------------------

-- Foreign Key Constraints
ALTER TABLE `fuel_history`
  ADD CONSTRAINT `fk_fuel_history_user`
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `saved_places`
  ADD CONSTRAINT `fk_saved_places_user`
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `user_trips`
  ADD CONSTRAINT `fk_user_trips_user`
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMIT;