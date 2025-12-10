-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 09 Nov 2025 pada 10.50
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ticket-konser`
--

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default users
INSERT INTO `users` (`username`, `password`, `role`, `email`, `phone`) VALUES
('admin', '$2a$10$HsKvIrP7z/9jVQh3ZktCBOMbyS1dMf2D0MKKxVwBa.2bEZvjBExn6', 'admin', 'admin@ticket.id', '081234567890'),
('user', '$2a$10$HsKvIrP7z/9jVQh3ZktCBOMbyS1dMf2D0MKKxVwBa.2bEZvjBExn6', 'user', 'user@ticket.id', '081234567891');

-- ============================================
-- TABLE: events
-- ============================================
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `date` varchar(50) NOT NULL,
  `time` varchar(50) NOT NULL,
  `capacity` int(11) NOT NULL,
  `available_tickets` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` enum('music','sports','conference','workshop','entertainment','other') NOT NULL DEFAULT 'other',
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample events
INSERT INTO `events` (`title`, `description`, `location`, `date`, `time`, `capacity`, `available_tickets`, `price`, `category`, `image_url`) VALUES
('Jakarta Comedy Fest 2025', 'Festival komedi terbesar di Jakarta dengan berbagai komedian terkenal', 'JCC Senayan, Jakarta', '2025-12-15', '19:00', 1000, 1000, 250000.00, 'entertainment', 'event1.jpg'),
('Beyond Wonderland Festival', 'Festival musik elektronik dengan DJ internasional', 'Ancol Beach, Jakarta', '2025-12-20', '18:00', 5000, 5000, 500000.00, 'music', 'event2.jpg'),
('Marsatac Festival 2025', 'Festival musik indie dan rock terbesar', 'GBK Stadium, Jakarta', '2025-12-25', '16:00', 3000, 3000, 350000.00, 'music', 'event3.jpg'),
('We The Fest 2025', 'Festival musik internasional tahunan', 'JIExpo Kemayoran, Jakarta', '2026-01-10', '14:00', 10000, 10000, 750000.00, 'music', 'event4.jpg'),
('Tech Conference Indonesia', 'Konferensi teknologi dengan pembicara dari Silicon Valley', 'Hotel Mulia, Jakarta', '2025-12-18', '09:00', 500, 500, 1500000.00, 'conference', 'event1.jpg'),
('Digital Marketing Workshop', 'Workshop intensif digital marketing untuk pemula', 'Coworking Space Jakarta', '2025-12-22', '10:00', 100, 100, 500000.00, 'workshop', 'event2.jpg');

-- ============================================
-- TABLE: tickets
-- ============================================
CREATE TABLE `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_code` varchar(50) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','used','cancelled') DEFAULT 'pending',
  `purchase_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_code` (`ticket_code`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(100) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('credit_card','debit_card','bank_transfer','e_wallet') NOT NULL,
  `status` enum('pending','success','failed','refunded') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `related_id` int(11) DEFAULT NULL,
  `related_type` enum('ticket','event','payment') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE payments
ADD COLUMN customer_name VARCHAR(255) NULL AFTER payment_method,
ADD COLUMN customer_email VARCHAR(255) NULL AFTER customer_name,
ADD COLUMN customer_phone VARCHAR(255) NULL AFTER customer_email;

COMMIT;