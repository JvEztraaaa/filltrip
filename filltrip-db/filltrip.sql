-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 23, 2025 at 10:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `filltrip`
--

-- --------------------------------------------------------

--
-- Table structure for table `refuel_history`
--

CREATE TABLE `refuel_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
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

-- --------------------------------------------------------

--
-- Table structure for table `saved_places`
--

CREATE TABLE `saved_places` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `place_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `start_location_name` varchar(255) NOT NULL,
  `end_location_name` varchar(255) NOT NULL,
  `distance_km` decimal(10,2) NOT NULL,
  `efficiency_km_per_l` decimal(10,2) DEFAULT NULL,
  `liters_needed` decimal(10,2) NOT NULL,
  `price_per_liter` decimal(10,2) DEFAULT NULL,
  `fuel_cost` decimal(10,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `fuel_type` varchar(120) DEFAULT NULL,
  `vehicle_label` varchar(160) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`id`, `user_id`, `start_location_name`, `end_location_name`, `distance_km`, `efficiency_km_per_l`, `liters_needed`, `price_per_liter`, `fuel_cost`, `currency`, `fuel_type`, `vehicle_label`, `created_at`) VALUES
(3, 6, 'Dropped pin (16.5801,121.1397)', 'Dropped pin (15.4902,121.1241)', 183.65, NULL, 24.01, NULL, 1296.35, 'PHP', 'Gasoline / Unleaded (91)', '1995 Cadillac DeVille/Concourse (Global)', '2025-09-22 01:39:01'),
(4, 6, '7-11, Vista Verde Avenue, Kaybiga, Zone 15, Caybiga, District 1, Caloocan, Northern Manila District, Metro Manila, 1420, Philippines', 'SM City Dasmariñas, Governor\'s Drive, Sampaloc 1, Sampaloc, Dasmariñas, Cavite, Calabarzon, 4114, Philippines', 66.97, NULL, 4.96, NULL, 267.88, 'PHP', 'Gasoline / Unleaded (91)', '2016 Honda Civic', '2025-09-22 01:39:50'),
(5, 6, 'Dropped pin (16.5950,120.9688)', 'Dropped pin (15.9537,120.9843)', 149.77, 46.95, 3.19, 53.94, 172.08, 'PHP', 'Premium Gasoline (95 / 97 / 98)', '2020 Honda Click 125i (Moto)', '2025-09-22 01:46:04'),
(6, 6, 'Dropped pin (16.5175,121.1614)', 'Dropped pin (16.4132,121.8605)', 120.12, 13.50, 8.90, 55.99, 498.28, 'PHP', 'Gasoline / Unleaded (91)', '2016 Honda BR-V', '2025-09-22 01:46:56'),
(7, 8, 'Dropped pin (17.3072,121.5224)', 'Dropped pin (16.8182,121.2971)', 161.64, 13.99, 11.55, 77.97, 900.57, 'PHP', 'Gasoline / Unleaded (91)', '2010 Toyota Vios', '2025-09-23 01:14:11'),
(8, 8, 'Dropped pin (16.0159,121.1380)', 'Dropped pin (15.2984,121.0914)', 131.10, 14.01, 9.36, 89.04, 833.42, 'PHP', 'Gasoline / Unleaded (91)', '2010 Toyota Vios', '2025-09-23 01:20:19'),
(9, 8, 'Dropped pin (16.8330,120.9377)', 'Dropped pin (16.2821,121.3261)', 172.83, 13.99, 12.35, 53.98, 666.63, 'PHP', 'Gasoline / Unleaded (91)', '2010 Toyota Vios', '2025-09-23 01:25:25'),
(10, 6, 'Dropped pin (17.0626,120.6615)', 'Dropped pin (17.0262,120.9067)', 56.19, 14.01, 4.01, 75.07, 301.02, 'PHP', 'Gasoline / Unleaded (91)', '2010 Toyota Vios', '2025-09-23 03:30:12'),
(11, 8, 'Dropped pin (17.3230,122.2426)', 'Dropped pin (16.5354,121.6057)', 193.62, 5.53, 35.01, 45.00, 1575.57, 'PHP', 'Gasoline / Unleaded (91)', '1994 Chevrolet Suburban 1500 4WD (Global)', '2025-09-23 05:55:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `password_hash`, `created_at`) VALUES
(6, 'Dian Mendoza', 'dianmendoza', 'dian.mendozaaa@gmail.com', '$2y$10$ipsBB6Gd6Jt0RQjU98wbeepETJ6Wh/dHKHSOzqKKBv82hVrqP5Cdi', '2025-09-21 11:28:32'),
(7, 'Dian Mendoza', 'mamamo', 'mamamo@gmail.com', '$2y$10$p.9iUMnn26I/M0C7h9xkE.UaT4R9xguJdI.lpLHyNKRcY3TxbXAlC', '2025-09-21 11:47:47'),
(8, 'angela reyes', 'gelafaith', 'angela@gmail.com', '$2y$10$CfZI.alpNLWQIoacY.97Euz37qxIL/SNVizd2lo/OkZ4DPQ6acqhO', '2025-09-21 12:02:14'),
(9, 'itlog ka', 'itlog', 'itlog@gmail.com', '$2y$10$dS0MRuuC/JB9u6djgB3jO.HunNDOie2YcU.8WPWjVdrjVw8F.DgVO', '2025-09-23 07:56:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `refuel_history`
--
ALTER TABLE `refuel_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_time` (`user_id`,`created_at`);

--
-- Indexes for table `saved_places`
--
ALTER TABLE `saved_places`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_name` (`user_id`,`place_name`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_username` (`username`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `refuel_history`
--
ALTER TABLE `refuel_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saved_places`
--
ALTER TABLE `saved_places`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

-- Add user_icon column if it does not exist (for migrations when applying this SQL)
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `user_icon` varchar(255) DEFAULT NULL AFTER `password_hash`;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `refuel_history`
--
ALTER TABLE `refuel_history`
  ADD CONSTRAINT `fk_refuel_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `saved_places`
--
ALTER TABLE `saved_places`
  ADD CONSTRAINT `fk_saved_places_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `fk_trips_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
