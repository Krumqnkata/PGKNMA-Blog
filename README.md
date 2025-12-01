Hello куче

Ето ти dummy data for dummies! ;)

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 01, 2025 at 10:11 PM
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
-- Database: `pgknma_blog`
--

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(48) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `class` enum('TEACHER','8','9','10','11','12') DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `name`, `last_name`, `class`, `profile_picture`, `created_at`) VALUES
(1, 'admin', '$2y$10$UtTK3I6F4HVQSGiFm6bv5OyLhA7oIUfjgJiOuwL.CkphOiH4hvkIC', 'admin@blog.pgknma.com', 'Admin', 'Admin', 'TEACHER', NULL, '2025-12-01 20:21:01'),
(5, 'user1', '$2y$10$7VZcOPXbyYQyi/45nJmIjeAQNID/jVelWbsOYoWm2B9.y/pqNyC0O', 'user1@example.com', 'Ivan', 'Ivanov', '', NULL, '2025-12-01 20:57:57'),
(6, 'user2', '$2y$10$hnrg1MZj.kktLXBGivUBle3V1CJ7WPbt/7szop/o9VqGFMYy8oyom', 'user2@example.com', 'Maria', 'Stoyanov', '', NULL, '2025-12-01 20:57:57'),
(7, 'user3', '$2y$10$BwfuR..6KtB8AAYvToevluVGxTxIxCo8V45o3VHHdT48dyBQV3NWy', 'user3@example.com', 'Viktoria', 'Nikolov', '', NULL, '2025-12-01 20:57:58'),
(8, 'user4', '$2y$10$XHe1jUvkkRzxWuc097Q6wehb4FePc7XVvZXh1yFZ/TWK3IFNasHja', 'user4@example.com', 'Dimitar', 'Ivanov', NULL, NULL, '2025-12-01 20:57:58'),
(9, 'user5', '$2y$10$gZYU7nSg/OdS8Gx2SGyKNODpyNdHP8pRPEG7zka6Ql9SyDHCgez7q', 'user5@example.com', 'Maria', 'Stoyanov', '', NULL, '2025-12-01 20:57:58'),
(10, 'user6', '$2y$10$QiH3YkA59eQ3xB9z2wvX9O5VygwK1HOVzAhsnIFq1WoP1WeodT3sW', 'user6@example.com', 'Dimitar', 'Ivanov', NULL, NULL, '2025-12-01 20:57:58'),
(11, 'user7', '$2y$10$PYDNgKLCuyRKhSMsNWZTfusFgdnDgD3ognZBbW7gH5Ji0/viQVgoK', 'user7@example.com', 'Viktoria', 'Ivanov', '', NULL, '2025-12-01 20:57:58'),
(12, 'user8', '$2y$10$oKsQgTjb2BdvrTfJ37/nX.DSikMDMgYi6jQlgex0rI46NELjBs/ha', 'user8@example.com', 'Nikola', 'Stoyanov', '', NULL, '2025-12-01 20:57:58'),
(13, 'user9', '$2y$10$y6VXvx4DuKD8f5qeNmG2CuXbBqsD7E7Pj0w1ibazgqCEw9uESyeKy', 'user9@example.com', 'Elena', 'Dimitrov', '', NULL, '2025-12-01 20:57:58'),
(14, 'user10', '$2y$10$7/LGm5aSiTr1BofqA17TLuYTKcgUAv4/QholJJnn7nyuWU1UI966W', 'user10@example.com', 'Viktoria', 'Ivanov', '', NULL, '2025-12-01 20:57:58'),
(15, 'user11', '$2y$10$VuYkHob5zXDoeyc8vJ9wPeGLnTG6G21VLle9MXuDfsGzlLluTFlG6', 'user11@example.com', 'Dimitar', 'Popova', NULL, NULL, '2025-12-01 20:57:58'),
(16, 'user12', '$2y$10$vgOB9jp7axYWfPxjZfBtEOQRijhKFoBsKh/sErBaAq46/G24UdezO', 'user12@example.com', 'Sofia', 'Georgieva', '', NULL, '2025-12-01 20:57:58'),
(17, 'user13', '$2y$10$eGT4xIL21ziOzZhhQKC1u.3lS2HsDGUPLixxupX3re39Niys8rqYe', 'user13@example.com', 'Petar', 'Georgieva', '', NULL, '2025-12-01 20:57:58'),
(18, 'user14', '$2y$10$kFhXJqWqwd1LyphFmTeOAeH3YcUSbuA5XfFEAWweth1E9.gWAHnvq', 'user14@example.com', 'Maria', 'Popova', '', NULL, '2025-12-01 20:57:58'),
(19, 'user15', '$2y$10$osgyDifJ.h66lbSLb9ytaeZFN7P0IwgCTTUERt6EGtqJtKbCWtFF6', 'user15@example.com', 'Nikola', 'Popova', '', NULL, '2025-12-01 20:57:58'),
(20, 'user16', '$2y$10$SuPlqHDMe53Blne9ZF0breKlxlpv0cDbWtXDEbsb8pOumrtbtPVTm', 'user16@example.com', 'Viktoria', 'Georgieva', '', NULL, '2025-12-01 20:57:58'),
(21, 'user17', '$2y$10$MG1L8OtEiChkeNJaj4G8JuXL/BJRN0tql2DET.4mSFkYuuxN.KEeC', 'user17@example.com', 'Ivan', 'Petrova', '', NULL, '2025-12-01 20:57:58'),
(22, 'user18', '$2y$10$jNmjyqHpXXFhQlnN1vZNsuCaR0vkVj88SYBKgcGWGh1ICcPx7Oie2', 'user18@example.com', 'Nikola', 'Georgieva', '', NULL, '2025-12-01 20:57:59'),
(23, 'user19', '$2y$10$Lhxe3uA1nyuWqUernaGcleIUac9V2xciv/QteFLAazG2Fmk3CoStu', 'user19@example.com', 'Dimitar', 'Ivanov', '', NULL, '2025-12-01 20:57:59'),
(24, 'user20', '$2y$10$7B8JclGpVtY9PwDZz1uoCeL/dvoaeYXQAfGU6AkMcGVBFkll7ulQ2', 'user20@example.com', 'Elena', 'Ivanov', '', NULL, '2025-12-01 20:57:59'),
(25, 'user21', '$2y$10$cpEdRKEd9s27HbqYrpiGnuAxPDpSYTMnDbsG4xIzsmt2wzz/GrM.e', 'user21@example.com', 'Maria', 'Kolev', '', NULL, '2025-12-01 20:57:59'),
(26, 'user22', '$2y$10$ZU1UZY8XqK5thWGuh.MMeeXXNn5ZthH9DCDZHKqOvQqilAUtQBptO', 'user22@example.com', 'Elena', 'Petrova', '', NULL, '2025-12-01 20:57:59'),
(27, 'user23', '$2y$10$zR9In2AdvSiRRjPw2XzRuuY1JVa2be3JL/tnOlbC0qGLqHsKmm/vK', 'user23@example.com', 'Viktoria', 'Petrova', '', NULL, '2025-12-01 20:57:59'),
(28, 'user24', '$2y$10$1Rn8Nhn97a6Ok98HyUHBzetzvnNPIEAHBDnZcjEB6zAZPouAzY/b.', 'user24@example.com', 'Georgi', 'Nikolov', '', NULL, '2025-12-01 20:57:59'),
(29, 'user25', '$2y$10$/dKxx9vB9AOaznXqfA9Xp.af80eZ7A2PTmdSexyTNyGfKU2prI14K', 'user25@example.com', 'Sofia', 'Petrov', '', NULL, '2025-12-01 20:57:59'),
(30, 'user26', '$2y$10$2/0quxYyItDuwjruNSQZKOJvlxhjsiROIzmGjkl.H9LrUx/TDVXr.', 'user26@example.com', 'Sofia', 'Petrova', '', NULL, '2025-12-01 20:57:59'),
(31, 'user27', '$2y$10$kPBDt8D5SXYDBOpibrlPruBJyyC7CO0sm6bBiMn7AyQRaquR3kRGK', 'user27@example.com', 'Dimitar', 'Georgieva', NULL, NULL, '2025-12-01 20:57:59'),
(32, 'user28', '$2y$10$jPArVZehlR0G5o12aEUpdOLad559BHBQd/o8Q7MKy3l5.W6ReJaG.', 'user28@example.com', 'Petar', 'Ivanov', '', NULL, '2025-12-01 20:57:59'),
(33, 'user29', '$2y$10$7i9L1juuk9e9aXjitbzDP.A6bMTM3BTPmuQUmoEv9m.0uZrGUqcu2', 'user29@example.com', 'Viktoria', 'Georgieva', '', NULL, '2025-12-01 20:57:59'),
(34, 'user30', '$2y$10$f6KLH/TpgUfPdNASPUeBk.YTpK6wdoETSEq8xjvcbSiPBJabVmb2i', 'user30@example.com', 'Elena', 'Marinova', '', NULL, '2025-12-01 20:57:59'),
(35, 'user31', '$2y$10$OhEoeZVItlEfHYkSYdLIr.Y9fNDmQH./Jyju2z92FW.VfCBZzgRIe', 'user31@example.com', 'Dimitar', 'Ivanov', NULL, NULL, '2025-12-01 20:57:59'),
(36, 'user32', '$2y$10$.eHd0aClR0T1XFWP.uPyOu72kzCQtTd8HJOpN4x9I.lRPuXVkgBii', 'user32@example.com', 'Maria', 'Petrova', '', NULL, '2025-12-01 20:57:59'),
(37, 'user33', '$2y$10$irjBtDzqMtaEadzWb2WIiuAYdFKGvcNPwgx/v9Fv58mX.19.xluBi', 'user33@example.com', 'Dimitar', 'Georgieva', '', NULL, '2025-12-01 20:58:00'),
(38, 'user34', '$2y$10$UDoiRJ6wJ2l.zYBNXM9N8eRmDhk/9bBqlslAgOYAr.U6KeeH6yfSO', 'user34@example.com', 'Ivan', 'Stoyanov', '', NULL, '2025-12-01 20:58:00'),
(39, 'user35', '$2y$10$3I3vP9I6.LC6wleduBVaz.201ykN5XGeRH248r/CaiB70lYSXCYAO', 'user35@example.com', 'Anna', 'Ivanov', '', NULL, '2025-12-01 20:58:00'),
(40, 'user36', '$2y$10$VHzmZiK2MEspGhpmXmH35ucOhIbLLShM0YwjEps4UHrdxlWwE21Yy', 'user36@example.com', 'Sofia', 'Marinova', '', NULL, '2025-12-01 20:58:00'),
(41, 'user37', '$2y$10$D50qD8WSSTTU9oXSkPkl0.GYhK8e6Wrez0m2BUBrREyeYTC7Cmayy', 'user37@example.com', 'Dimitar', 'Nikolov', '', NULL, '2025-12-01 20:58:00'),
(42, 'user38', '$2y$10$X0uBxVE442BfakDEAr5lQuKGX1PdtcCQByR8HBP6b3r74Gzy4JzUC', 'user38@example.com', 'Viktoria', 'Nikolov', '', NULL, '2025-12-01 20:58:00'),
(43, 'user39', '$2y$10$exoEAot0W0uVunLE0J15xu18zcpI8ctCqff4brwXM8kV8/XCthj2S', 'user39@example.com', 'Viktoria', 'Stoyanov', '', NULL, '2025-12-01 20:58:00'),
(44, 'user40', '$2y$10$WCuwJ5.8Fdorl9rW4cCeuObRIURyCwCbXy6ozyyM5PHC7DgmNz0Mq', 'user40@example.com', 'Viktoria', 'Dimitrov', '', NULL, '2025-12-01 20:58:00'),
(45, 'user41', '$2y$10$DNpkgakhlpFVZoSishn6TOBhzWeZqY44E5G4gR64474g46f4dZ8g2', 'user41@example.com', 'Elena', 'Dimitrov', '', NULL, '2025-12-01 20:58:00'),
(46, 'user42', '$2y$10$A/FcJ.CMxsoB1ID48P0lueAG.tBCQb8xQZ8wJiklW6XLT4lp66lZu', 'user42@example.com', 'Ivan', 'Petrova', '', NULL, '2025-12-01 20:58:00'),
(47, 'user43', '$2y$10$gQ6mMuMXWE4yeajYd17SWurXLgyk9Kq7cKUPBiOUKfKMt0f97Pl8K', 'user43@example.com', 'Petar', 'Stoyanov', '', NULL, '2025-12-01 20:58:00'),
(48, 'user44', '$2y$10$GngRRgBNtwNmi/FQxwZWdu4yY.bUBXplmpm0QACbF6BfNfp8JMTHS', 'user44@example.com', 'Georgi', 'Petrova', NULL, NULL, '2025-12-01 20:58:00'),
(49, 'user45', '$2y$10$PsUBYTJYc/K2PvCbDG2nu.K3AgONplvOjDvGvSVmH04xWkAr3.5ly', 'user45@example.com', 'Anna', 'Nikolov', '', NULL, '2025-12-01 20:58:00'),
(50, 'user46', '$2y$10$UlFvYvYTzjkVjGyLXatdX.XBKgYlBXwe5en655iOCSjTYctXIl4uC', 'user46@example.com', 'Petar', 'Nikolov', '', NULL, '2025-12-01 20:58:00'),
(51, 'user47', '$2y$10$MhffLSvMVKVwaIwFvnGpE..OHMFgEh35Wf6xpwmub/frjBTWJpWva', 'user47@example.com', 'Viktoria', 'Petrova', '', NULL, '2025-12-01 20:58:00'),
(52, 'user48', '$2y$10$X5mMoapxWLUyyYW9LX5zFOm1n.J71u33rNnr3r1yTfBhXsZFTuMwq', 'user48@example.com', 'Sofia', 'Ivanov', '', NULL, '2025-12-01 20:58:01'),
(53, 'user49', '$2y$10$WpQffJjNgyvBCs1fskLEh.S7zAOFCZuLppzQO8iNezuJGLdBZLld6', 'user49@example.com', 'Dimitar', 'Nikolov', '', NULL, '2025-12-01 20:58:01'),
(54, 'user50', '$2y$10$QuEGtTaiO4dqIO3R4Dhb8OS8szM12fHatiaOG/GcJ0/H5EU8nYZOW', 'user50@example.com', 'Nikola', 'Petrova', '', NULL, '2025-12-01 20:58:01'),
(55, 'user51', '$2y$10$JEx82d/nXgs.3Bj16CBopupw8rL6glk7SFQtQyGxeVnX3mO/8Hy8S', 'user51@example.com', 'Georgi', 'Ivanov', '', NULL, '2025-12-01 20:58:01'),
(56, 'user52', '$2y$10$fFi1C6fFSC7xaRCjcdx8TOBBUan/1zHcOdj7gux9MFNehPkaSUfLS', 'user52@example.com', 'Anna', 'Nikolov', '', NULL, '2025-12-01 20:58:01'),
(57, 'user53', '$2y$10$i4fq1uLwZDbwS92AboSA1eUfxamoRkYW1oCIbKNxaeSlJgkT6eDtC', 'user53@example.com', 'Dimitar', 'Stoyanov', NULL, NULL, '2025-12-01 20:58:01'),
(58, 'user54', '$2y$10$5VB9x6JtOC6V9wU/VhXloO2oZrD9rmm9lUPLOzIm5wpR5iengkr2a', 'user54@example.com', 'Nikola', 'Marinova', '', NULL, '2025-12-01 20:58:01'),
(59, 'user55', '$2y$10$m.qSnM80UOzYfy4qeZ8DgeARyZpNiXlJeWAw8rSYtbdG.MflL1IZu', 'user55@example.com', 'Elena', 'Marinova', NULL, NULL, '2025-12-01 20:58:01'),
(60, 'user56', '$2y$10$60lgDO1u.kLNDk0Z6X0oFuXAFwugsfyCL74Q/mrJOoXbOmwdF6iNu', 'user56@example.com', 'Petar', 'Kolev', '', NULL, '2025-12-01 20:58:01'),
(61, 'user57', '$2y$10$hBMFL/cngvE/o9rlSRNBK.M5Cp/v6KOc9rV5hgiBhjNMr4nca5Rhi', 'user57@example.com', 'Elena', 'Marinova', '', NULL, '2025-12-01 20:58:01'),
(62, 'user58', '$2y$10$scxqppLx4Eth6O.if.L1V.sJfB.AqxAHbvI2Jq/M8LVI0.8pqBvGy', 'user58@example.com', 'Sofia', 'Dimitrov', '', NULL, '2025-12-01 20:58:01'),
(64, 'user60', '$2y$10$ZSySue92Xe3s4v8UfFiW/.ITa72pj8Roj7kxFK2NWocZXmFpCmwCu', 'user60@example.com', 'Dimitar', 'Petrova', '', NULL, '2025-12-01 20:58:01'),
(65, 'user61', '$2y$10$jKnYMPGelsrHOx0r3HEXXe.O.9mpxbjOMo/wA9LV.gvEliry1LodS', 'user61@example.com', 'Viktoria', 'Petrova', '', NULL, '2025-12-01 20:58:01'),
(66, 'user62', '$2y$10$uE3Yyvzpo/BxPv/ibiIt/OI/CeEjbbwUMk5ceKw9GhZl/5tsOQYLe', 'user62@example.com', 'Viktoria', 'Marinova', '', NULL, '2025-12-01 20:58:01'),
(67, 'user63', '$2y$10$DhB1Fg2WPA5pZGXUCa2YZeijueEp2GwQqg.uILVd9qYFo7LN/ahR.', 'user63@example.com', 'Anna', 'Ivanov', '', NULL, '2025-12-01 20:58:02'),
(68, 'user64', '$2y$10$uQWCLB9SX.83MmOFtaTlJ.ELBj9iKGGJJOV8MexRffINadc7uW2py', 'user64@example.com', 'Maria', 'Marinova', '', NULL, '2025-12-01 20:58:02'),
(69, 'user65', '$2y$10$jpQFg6PGXPv95ZiWEOrEMOB1T0AfdY/qA4yXxSbKchWc7vpOnJkbC', 'user65@example.com', 'Anna', 'Ivanov', '', NULL, '2025-12-01 20:58:02'),
(70, 'user66', '$2y$10$D6buOLEjc/Ta6bE0c5faueZDbBTHRUnSbrdfIZ9C5Cn/bHWEeOzAS', 'user66@example.com', 'Anna', 'Petrova', '', NULL, '2025-12-01 20:58:02'),
(71, 'user67', '$2y$10$BO3zzMLV8p/Ty.ozb.drtu4xovI2rHn3AKhf1KEGd8OxBSV4H.P26', 'user67@example.com', 'Georgi', 'Popova', '', NULL, '2025-12-01 20:58:02'),
(72, 'user68', '$2y$10$WDmom9Rfq1G9WAzUCkB6dOxt4NVInWkmanxwGdGLHUstxSvg5wOTy', 'user68@example.com', 'Nikola', 'Nikolov', '', NULL, '2025-12-01 20:58:02'),
(73, 'user69', '$2y$10$wc3s5irPYsOihId/O2EWaelT8LpzHwfg1wPp.1w5QSss081P1z8sW', 'user69@example.com', 'Ivan', 'Petrov', '', NULL, '2025-12-01 20:58:02'),
(74, 'user70', '$2y$10$McTRR/kDoot8kGkkrRP8juNt06IBNCFU9U94zaaRwbZ7K/m7bo13.', 'user70@example.com', 'Sofia', 'Popova', '', NULL, '2025-12-01 20:58:02'),
(75, 'user71', '$2y$10$payvL7nYG/dQLBRJWlpL7eRNu86UTx3ZnNg.TYS40bb6ejPYtKffi', 'user71@example.com', 'Anna', 'Marinova', '', NULL, '2025-12-01 20:58:02'),
(76, 'user72', '$2y$10$POE57uuiBrAHy.cYkcwoDOWgHtcc5/1.dnbYfvKvpszDJanQKM6PG', 'user72@example.com', 'Ivan', 'Stoyanov', NULL, NULL, '2025-12-01 20:58:02'),
(77, 'user73', '$2y$10$OrLOB8CBIrywdK3YovHc3OFdwSNTZNxlZcVpUd48bmkzEI7m36aga', 'user73@example.com', 'Sofia', 'Nikolov', '', NULL, '2025-12-01 20:58:02'),
(78, 'user74', '$2y$10$670y5J5c0dyjZL87XKJ2UOGLuKifyKlfsqzlOrVEPMwJiRedbC54.', 'user74@example.com', 'Viktoria', 'Dimitrov', '', NULL, '2025-12-01 20:58:02'),
(79, 'user75', '$2y$10$eMNRzQJ/QPd.yrpImiY5J.rVWX3jdalCsgTyXOqG5.4FLUV6PGlla', 'user75@example.com', 'Viktoria', 'Stoyanov', NULL, NULL, '2025-12-01 20:58:02'),
(80, 'user76', '$2y$10$wVUx/mfgNDUSJpD6kd8obOX8cI80NzIIDnHA39X6YbWcWqI/7OM2C', 'user76@example.com', 'Maria', 'Popova', '', NULL, '2025-12-01 20:58:02'),
(81, 'user77', '$2y$10$okVEoytGdH0Cr1yn.5aVn.HbsFym9i571sKhupZIgIeEcPRCH2ndG', 'user77@example.com', 'Elena', 'Popova', NULL, NULL, '2025-12-01 20:58:02'),
(82, 'user78', '$2y$10$H5JQYKgMbW/ugcl/ULxwrOC9Tn1EPxaXDfd5eRh28O6IpOW/2P6P2', 'user78@example.com', 'Viktoria', 'Nikolov', '', NULL, '2025-12-01 20:58:03'),
(83, 'user79', '$2y$10$PwSBs9qtyc8/IeuH2egVpeBtNV4Spk.9yMKJoPtGpU2faihiUH/Wm', 'user79@example.com', 'Petar', 'Marinova', '', NULL, '2025-12-01 20:58:03'),
(84, 'user80', '$2y$10$X0evJ4Ep41wJay9a07Oq8uWlhgrsFa8XELVlQ3T0iTQRlEsy.FYK6', 'user80@example.com', 'Viktoria', 'Ivanov', NULL, NULL, '2025-12-01 20:58:03'),
(85, 'user81', '$2y$10$4prZpr4GKZpM/mrRO4hna.8bf3QxRztU2cJBSgfp61627KM7MSqzm', 'user81@example.com', 'Georgi', 'Kolev', '', NULL, '2025-12-01 20:58:03'),
(86, 'user82', '$2y$10$G73qMkXTAWlvcqV.UGa9mu1ZZUYoG5sxrCCPfHCFTH4FzUciDfRoS', 'user82@example.com', 'Dimitar', 'Stoyanov', '', NULL, '2025-12-01 20:58:03'),
(87, 'user83', '$2y$10$F5uypi8z.vHKHqgp4EGwc.XrL0n3fofBTkcM1r35VGfF7GmPYMs92', 'user83@example.com', 'Anna', 'Dimitrov', '', NULL, '2025-12-01 20:58:03'),
(88, 'user84', '$2y$10$eniGys4SKvDY3.MJNO7bPe553Z08.oaIeO/GG0j4mjX.bPNoS8r3i', 'user84@example.com', 'Viktoria', 'Nikolov', '', NULL, '2025-12-01 20:58:03'),
(89, 'user85', '$2y$10$OdFsbnW4Es6TfpOBXYnHxexIvxcxELDFRh6rASqSoCx.sOLVkdFne', 'user85@example.com', 'Viktoria', 'Petrova', '', NULL, '2025-12-01 20:58:03'),
(90, 'user86', '$2y$10$7KHUmxoSfylx5cyXKv5cjuspNipHScYIx3y9U9EudC67CWugRF0gS', 'user86@example.com', 'Dimitar', 'Popova', '', NULL, '2025-12-01 20:58:03'),
(91, 'user87', '$2y$10$gZlQk7MOAQGVM1ICH7lbs.2pWpUuIDElBrhUY7y4NGplqbUmSYaEC', 'user87@example.com', 'Ivan', 'Dimitrov', NULL, NULL, '2025-12-01 20:58:03'),
(92, 'user88', '$2y$10$FbA/EgylKNqTUdGZHWS4kujCOwZXa6CgwRDnA727foxkPrErj/3pa', 'user88@example.com', 'Georgi', 'Petrov', NULL, NULL, '2025-12-01 20:58:03'),
(93, 'user89', '$2y$10$we2Yg0meqm69Kj6vXne5DOmMUzchMSdR74tjE5Kxx7qdkyYWM0UYm', 'user89@example.com', 'Nikola', 'Nikolov', NULL, NULL, '2025-12-01 20:58:03'),
(94, 'user90', '$2y$10$TUAJNid6LPVa3PTTpk/XfODj2bz3WAlYYvE2V99btWXNimhje7ehS', 'user90@example.com', 'Nikola', 'Popova', NULL, NULL, '2025-12-01 20:58:03'),
(95, 'user91', '$2y$10$ENZVG8Q17H7fFZ4Bash3IeABJiY6xAAH/IPMRXmfgbW58vqYVAivy', 'user91@example.com', 'Viktoria', 'Stoyanov', '', NULL, '2025-12-01 20:58:03'),
(96, 'user92', '$2y$10$Z2LejcOsYGpn3KRMcJoOD.7ep1RTeRgWqht7eJYqFqgt3SCkVnmMS', 'user92@example.com', 'Petar', 'Dimitrov', '', NULL, '2025-12-01 20:58:03'),
(97, 'user93', '$2y$10$tvtFbHqoMBNVZbzornkoveVZUjUpsAOrid46lT0U5IzXTmUsZjMmy', 'user93@example.com', 'Maria', 'Petrov', '', NULL, '2025-12-01 20:58:04'),
(98, 'user94', '$2y$10$6ldLL/qBRU4HuA.Wr2biNehY9fjJP8LBhVmQr8pjSW5vIm3i17DLK', 'user94@example.com', 'Maria', 'Popova', '', NULL, '2025-12-01 20:58:04'),
(99, 'user95', '$2y$10$GgQro/M8vbO5WIsLe65use4rgsBQsYTcaWDGWCM0ZOgmST.wsmsza', 'user95@example.com', 'Nikola', 'Georgieva', '', NULL, '2025-12-01 20:58:04'),
(100, 'user96', '$2y$10$bJhFGSG1DEUzbuPJOzSYvOnCYhYRtIivggSXlM/PVpQi0jcfqTR7i', 'user96@example.com', 'Sofia', 'Stoyanov', '', NULL, '2025-12-01 20:58:04'),
(101, 'user97', '$2y$10$suArnbVW1PI86HnRzQ2uXe3w448yIioIzW5N5vMAMDLfKXw.IO.W6', 'user97@example.com', 'Petar', 'Marinova', '', NULL, '2025-12-01 20:58:04'),
(102, 'user98', '$2y$10$yqWJ/cTGAwltogY5.HTew.jzPvjYsMKuGDYMwLmnZHBpPvqc2y5Sm', 'user98@example.com', 'Dimitar', 'Stoyanov', '', NULL, '2025-12-01 20:58:04'),
(103, 'user99', '$2y$10$zZzMGVT24ENz7/M.KKy.sO8mvGp/wWGiAMvzusoIqwp7Vq9OeH1wm', 'user99@example.com', 'Anna', 'Georgieva', '', NULL, '2025-12-01 20:58:04'),
(104, 'user100', '$2y$10$TjtXL/ijnm8aQmHpvu1/OOYqK6g5mjeOO5vi26oTN1R.vaxOebYnW', 'user100@example.com', 'Viktoria', 'Ivanov', '', NULL, '2025-12-01 20:58:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

