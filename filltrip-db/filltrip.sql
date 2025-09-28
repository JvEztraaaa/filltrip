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
  `id` bigint(20) UNSIGNED NOT NULL,
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
  `currency` char(3) NOT NULL DEFAULT 'PHP'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `saved_places`
CREATE TABLE `saved_places` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `place_name` varchar(255) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `user_trips`
CREATE TABLE `user_trips` (
  `id` bigint(20) UNSIGNED NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `user`
CREATE TABLE `user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(60) DEFAULT NULL,
  `last_name` varchar(60) DEFAULT NULL,
  `full_name` varchar(120) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------------

-- Insert Test User (password = "password")
INSERT INTO `user`
(id, first_name, last_name, full_name, username, email, password_hash, user_icon, created_at)
VALUES
(
  1,
  'Test',
  'User',
  'Test User',
  'testuser',
  'test@gmail.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for "password"
  NULL,
  NOW()
);

-- Insert User Trips (Sample data for Test User)

INSERT INTO `user_trips`
(id, user_id, start_location, end_location, distance_km, efficiency_kpl, liters_needed, price_per_liter, fuel_cost, currency, fuel_type, vehicle_label, created_at)
VALUES
(1, 1, 'Dasmariñas, Cavite', 'Tagaytay City, Cavite', 32.5, 51.0, 0.64, 58.00, 37.12, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i', '2025-01-12 10:30:00'),
(2, 1, 'Dasmariñas, Cavite', 'Mall of Asia, Pasay', 38.2, 14.0, 2.73, 57.00, 155.61, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-01-25 14:00:00'),
(3, 1, 'Dasmariñas, Cavite', 'Subic Bay Freeport Zone', 120.0, 14.0, 8.57, 57.00, 488.49, 'PHP', 'Premium Gasoline (97)', 'Toyota Vios 2021', '2025-03-10 07:00:00'),
(4, 1, 'Dasmariñas, Cavite', 'Baguio City', 250.0, 9.5, 26.32, 55.00, 1447.60, 'PHP', 'Diesel', 'Toyota Fortuner (diesel)', '2025-03-25 05:30:00'),
(5, 1, 'Dasmariñas, Cavite', 'Batangas Pier', 65.0, 18.0, 3.61, 58.00, 209.38, 'PHP', 'Unleaded Gasoline', 'Toyota Wigo 2022', '2025-04-05 08:00:00'),
(6, 1, 'Tagaytay City, Cavite', 'Enchanted Kingdom, Sta. Rosa', 27.0, 19.5, 1.38, 57.50, 79.35, 'PHP', 'Premium Gasoline (95)', 'Mitsubishi Mirage 2021', '2025-04-20 15:00:00'),
(7, 1, 'Dasmariñas, Cavite', 'Clark Pampanga', 105.0, 14.0, 7.50, 57.00, 427.50, 'PHP', 'Premium Gasoline (97)', 'Toyota Vios 2021', '2025-05-02 06:00:00'),
(8, 1, 'Dasmariñas, Cavite', 'NAIA Terminal 3, Pasay', 45.0, 38.0, 1.18, 58.00, 68.44, 'PHP', 'Unleaded Gasoline', 'Yamaha Aerox 155', '2025-05-18 09:00:00'),
(9, 1, 'Dasmariñas, Cavite', 'La Union Surfing Area', 270.0, 9.5, 28.42, 55.00, 1563.10, 'PHP', 'Diesel', 'Toyota Fortuner (diesel)', '2025-06-08 03:30:00'),
(10, 1, 'Dasmariñas, Cavite', 'Taguig BGC', 50.0, 19.5, 2.56, 57.50, 147.20, 'PHP', 'Premium Gasoline (95)', 'Mitsubishi Mirage 2021', '2025-07-02 13:00:00'),
(11, 1, 'Dasmariñas, Cavite', 'Ilocos Norte (Laoag)', 430.0, 14.0, 30.71, 57.00, 1750.47, 'PHP', 'Premium Gasoline (97)', 'Toyota Vios 2021', '2025-08-14 01:00:00'),
(12, 1, 'Dasmariñas, Cavite', 'Nueva Ecija (Cabanatuan)', 140.0, 18.0, 7.78, 58.00, 451.24, 'PHP', 'Unleaded Gasoline', 'Toyota Wigo 2022', '2025-09-15 11:00:00');

-- Insert Fuel History (Sample data for Test User)

INSERT INTO `fuel_history`
(id, user_id, date, vehicle_name, odometer_km, distance_unit, liters, fuel_unit, price_per_liter, total_cost, fuel_type, station, currency)
VALUES
(1, 1, '2025-01-15 08:30:00', 'Toyota Vios 2021', 1500, 'km', 38.0, 'liters', 57.00, 2166.00, 'Premium Gasoline (95)', 'Shell', 'PHP'),
(2, 1, '2025-01-28 09:00:00', 'Honda Click 125i', 5200, 'km', 5.5, 'liters', 58.00, 319.00, 'Unleaded Gasoline', 'Caltex', 'PHP'),
(3, 1, '2025-03-12 10:15:00', 'Toyota Vios 2021', 2000, 'km', 35.0, 'liters', 57.00, 1995.00, 'Premium Gasoline (97)', 'Petron', 'PHP'),
(4, 1, '2025-03-28 07:45:00', 'Toyota Fortuner (diesel)', 8000, 'km', 50.0, 'liters', 55.00, 2750.00, 'Diesel', 'Shell', 'PHP'),
(5, 1, '2025-04-08 12:30:00', 'Toyota Wigo 2022', 3100, 'km', 25.0, 'liters', 58.00, 1450.00, 'Unleaded Gasoline', 'Caltex', 'PHP'),
(6, 1, '2025-04-22 16:10:00', 'Mitsubishi Mirage 2021', 4200, 'km', 22.0, 'liters', 57.50, 1265.00, 'Premium Gasoline (95)', 'Petron', 'PHP'),
(7, 1, '2025-05-05 14:00:00', 'Toyota Vios 2021', 2600, 'km', 30.0, 'liters', 57.00, 1710.00, 'Premium Gasoline (97)', 'Shell', 'PHP'),
(8, 1, '2025-05-20 10:20:00', 'Yamaha Aerox 155', 2500, 'km', 6.0, 'liters', 58.00, 348.00, 'Unleaded Gasoline', 'Caltex', 'PHP'),
(9, 1, '2025-06-10 08:15:00', 'Toyota Fortuner (diesel)', 8700, 'km', 55.0, 'liters', 55.00, 3025.00, 'Diesel', 'Petron', 'PHP'),
(10, 1, '2025-07-05 09:30:00', 'Mitsubishi Mirage 2021', 5000, 'km', 24.0, 'liters', 57.50, 1380.00, 'Premium Gasoline (95)', 'Shell', 'PHP'),
(11, 1, '2025-08-16 07:00:00', 'Toyota Vios 2021', 3100, 'km', 40.0, 'liters', 57.00, 2280.00, 'Premium Gasoline (97)', 'Caltex', 'PHP'),
(12, 1, '2025-09-18 11:45:00', 'Toyota Wigo 2022', 3800, 'km', 28.0, 'liters', 58.00, 1624.00, 'Unleaded Gasoline', 'Petron', 'PHP');


-- ------------------------------------------------------------------

-- Indexes for table `fuel_history`
ALTER TABLE `fuel_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_time` (`user_id`,`date`);

-- Indexes for table `saved_places`
ALTER TABLE `saved_places`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_name` (`user_id`,`place_name`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`);

-- Indexes for table `user_trips`
ALTER TABLE `user_trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`);

-- Indexes for table `user`
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_username` (`username`),
  ADD UNIQUE KEY `unique_email` (`email`);

-- AUTO_INCREMENT for table `fuel_history`
ALTER TABLE `fuel_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- AUTO_INCREMENT for table `saved_places`
ALTER TABLE `saved_places`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- AUTO_INCREMENT for table `user_trips`
ALTER TABLE `user_trips`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- AUTO_INCREMENT for table `user`
ALTER TABLE `user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- Constraints for table `fuel_history`
ALTER TABLE `fuel_history`
  ADD CONSTRAINT `fk_fuel_history_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `saved_places`
  ADD CONSTRAINT `fk_saved_places_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

-- Constraints for table `user_trips`
ALTER TABLE `user_trips`
  ADD CONSTRAINT `fk_user_trips_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

COMMIT;
