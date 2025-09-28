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
(1, 1, 'SM City Dasmariñas, Cavite', 'Tagaytay City, Cavite', 32.50, 45.00, 0.72, 58.00, 41.76, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-01-12 10:30:00'),
(2, 1, 'Dasmariñas, Cavite', 'Mall of Asia, Pasay', 38.20, 50.00, 0.76, 56.50, 42.94, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-01-25 14:00:00'),
(3, 1, 'Dasmariñas, Cavite', 'Taguig, BGC', 45.00, 52.00, 0.87, 57.25, 49.79, 'PHP', 'Diesel', 'Mitsubishi Montero', '2025-02-05 09:00:00'),
(4, 1, 'Dasmariñas, Cavite', 'Enchanted Kingdom, Sta. Rosa', 28.40, 48.00, 0.59, 55.75, 32.90, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-02-22 11:15:00'),
(5, 1, 'Dasmariñas, Cavite', 'Subic Bay, Zambales', 120.00, 51.00, 2.35, 58.25, 137.84, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-03-10 07:00:00'),
(6, 1, 'Dasmariñas, Cavite', 'Nuvali, Sta. Rosa, Laguna', 30.20, 49.00, 0.62, 55.90, 34.66, 'PHP', 'Diesel', 'Mitsubishi Montero', '2025-03-21 13:00:00'),
(7, 1, 'Dasmariñas, Cavite', 'Batangas City Port', 65.50, 50.00, 1.31, 56.50, 74.12, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-04-08 08:30:00'),
(8, 1, 'Dasmariñas, Cavite', 'SM North EDSA, Quezon City', 60.00, 46.00, 1.30, 58.00, 75.40, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-04-25 15:30:00'),
(9, 1, 'Dasmariñas, Cavite', 'Clark, Pampanga', 95.20, 48.00, 1.98, 57.25, 113.40, 'PHP', 'Diesel', 'Mitsubishi Montero', '2025-05-14 06:45:00'),
(10, 1, 'Dasmariñas, Cavite', 'Intramuros, Manila', 45.30, 50.00, 0.91, 55.75, 50.75, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-05-27 09:30:00'),
(11, 1, 'Dasmariñas, Cavite', 'La Union, San Fernando', 270.00, 52.00, 5.19, 58.00, 300.90, 'PHP', 'Premium Gasoline (97)', 'Toyota Vios 2021', '2025-06-09 04:00:00'),
(12, 1, 'Dasmariñas, Cavite', 'Tagaytay Picnic Grove', 28.80, 47.00, 0.61, 56.50, 34.47, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-06-25 16:00:00'),
(13, 1, 'Dasmariñas, Cavite', 'Baguio City', 250.00, 50.00, 5.00, 57.00, 285.00, 'PHP', 'Diesel', 'Mitsubishi Montero', '2025-07-05 02:00:00'),
(14, 1, 'Dasmariñas, Cavite', 'Ayala Malls Manila Bay', 40.50, 51.00, 0.79, 55.90, 44.16, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-07-19 18:15:00'),
(15, 1, 'Dasmariñas, Cavite', 'Pico de Loro, Batangas', 65.00, 49.00, 1.33, 56.25, 74.81, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-08-03 06:30:00'),
(16, 1, 'Dasmariñas, Cavite', 'Alabang Town Center, Muntinlupa', 35.20, 50.00, 0.70, 58.00, 40.60, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-08-18 14:30:00'),
(17, 1, 'Dasmariñas, Cavite', 'Mall of Asia, Pasay', 38.00, 52.00, 0.73, 57.00, 41.61, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-08-30 12:00:00'),
(18, 1, 'Dasmariñas, Cavite', 'Tagaytay Highlands', 33.40, 49.00, 0.68, 56.25, 38.25, 'PHP', 'Diesel', 'Mitsubishi Montero', '2025-09-07 08:30:00'),
(19, 1, 'Dasmariñas, Cavite', 'Subic Bay Freeport Zone', 120.00, 50.00, 2.40, 58.00, 139.20, 'PHP', 'Premium Gasoline (97)', 'Toyota Vios 2021', '2025-09-15 05:00:00'),
(20, 1, 'Dasmariñas, Cavite', 'Enchanted Kingdom, Sta. Rosa', 28.40, 48.00, 0.59, 55.75, 32.90, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-09-20 11:30:00'),
(21, 1, 'Dasmariñas, Cavite', 'Nuvali, Sta. Rosa', 30.50, 47.00, 0.65, 57.25, 37.21, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-09-22 15:00:00'),
(22, 1, 'Dasmariñas, Cavite', 'SM North EDSA, Quezon City', 60.10, 50.00, 1.20, 56.50, 67.80, 'PHP', 'Premium Gasoline (95)', 'Toyota Vios 2021', '2025-09-23 09:45:00'),
(23, 1, 'Dasmariñas, Cavite', 'Clark International Airport', 98.00, 52.00, 1.88, 57.00, 107.16, 'PHP', 'Diesel', 'Mitsubishi Montero', '2025-09-25 07:15:00'),
(24, 1, 'Dasmariñas, Cavite', 'Tagaytay City, Cavite', 32.20, 45.00, 0.72, 58.00, 41.76, 'PHP', 'Unleaded Gasoline', '2020 Honda Click 125i (Moto)', '2025-09-26 17:31:22');

-- Insert Fuel History (Sample data for Test User)

INSERT INTO `fuel_history`
(id, user_id, date, vehicle_name, odometer_km, distance_unit, liters, fuel_unit, price_per_liter, total_cost, fuel_type, station, currency)
VALUES
(1, 1, '2025-01-15 08:30:00', 'Toyota Vios 2021', 1500, 'km', 35.00, 'liters', 57.00, 1995.00, 'Premium Gasoline (95)', 'Shell', 'PHP'),
(2, 1, '2025-02-12 09:45:00', 'Mitsubishi Montero', 3200, 'km', 45.00, 'liters', 56.25, 2531.25, 'Diesel', 'Petron', 'PHP'),
(3, 1, '2025-03-18 10:15:00', 'Honda Click 125i', 5200, 'km', 8.00, 'liters', 55.75, 446.00, 'Unleaded Gasoline', 'Caltex', 'PHP'),
(4, 1, '2025-04-20 14:00:00', 'Toyota Vios 2021', 6800, 'km', 40.00, 'liters', 57.00, 2280.00, 'Premium Gasoline (95)', 'Shell', 'PHP'),
(5, 1, '2025-05-22 15:30:00', 'Mitsubishi Montero', 8900, 'km', 50.00, 'liters', 56.50, 2825.00, 'Diesel', 'Petron', 'PHP'),
(6, 1, '2025-06-11 21:30:00', 'Toyota Fortuner', 5000.0, 'km', 10.00, 'liters', 55.00, 550.00, 'Premium Gasoline (95 / 97 / 98)', 'Shell', 'PHP'),
(7, 1, '2025-07-14 09:20:00', 'Honda Click 125i', 11000, 'km', 9.00, 'liters', 56.25, 506.25, 'Unleaded Gasoline', 'Seaoil', 'PHP'),
(8, 1, '2025-08-16 07:40:00', 'Toyota Vios 2021', 12500, 'km', 36.00, 'liters', 57.25, 2061.00, 'Premium Gasoline (95)', 'Caltex', 'PHP'),
(9, 1, '2025-09-05 12:00:00', 'Mitsubishi Montero', 14500, 'km', 42.00, 'liters', 56.75, 2383.50, 'Diesel', 'Shell', 'PHP'),
(10, 1, '2025-09-12 18:00:00', 'Honda Click 125i', 14850, 'km', 7.00, 'liters', 55.50, 388.50, 'Unleaded Gasoline', 'Petron', 'PHP'),
(11, 1, '2025-09-20 08:15:00', 'Toyota Vios 2021', 15000, 'km', 38.00, 'liters', 57.00, 2166.00, 'Premium Gasoline (95)', 'Shell', 'PHP'),
(12, 1, '2025-09-27 19:45:00', 'Mitsubishi Montero', 15500, 'km', 46.00, 'liters', 56.25, 2587.50, 'Diesel', 'Caltex', 'PHP');


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
