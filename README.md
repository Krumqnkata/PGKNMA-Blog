-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 15, 2025 at 08:47 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test_pgknma`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 3, 'add_permission'),
(6, 'Can change permission', 3, 'change_permission'),
(7, 'Can delete permission', 3, 'delete_permission'),
(8, 'Can view permission', 3, 'view_permission'),
(9, 'Can add group', 2, 'add_group'),
(10, 'Can change group', 2, 'change_group'),
(11, 'Can delete group', 2, 'delete_group'),
(12, 'Can view group', 2, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add Категория', 8, 'add_category'),
(26, 'Can change Категория', 8, 'change_category'),
(27, 'Can delete Категория', 8, 'delete_category'),
(28, 'Can view Категория', 8, 'view_category'),
(29, 'Can add bell request', 7, 'add_bellrequest'),
(30, 'Can change bell request', 7, 'change_bellrequest'),
(31, 'Can delete bell request', 7, 'delete_bellrequest'),
(32, 'Can view bell request', 7, 'view_bellrequest'),
(33, 'Can add meme of week', 12, 'add_memeofweek'),
(34, 'Can change meme of week', 12, 'change_memeofweek'),
(35, 'Can delete meme of week', 12, 'delete_memeofweek'),
(36, 'Can view meme of week', 12, 'view_memeofweek'),
(37, 'Can add Публикация', 13, 'add_posts'),
(38, 'Can change Публикация', 13, 'change_posts'),
(39, 'Can delete Публикация', 13, 'delete_posts'),
(40, 'Can view Публикация', 13, 'view_posts'),
(41, 'View only users posts', 13, 'view_only_posts'),
(42, 'Can view all posts', 13, 'can_view_all_posts'),
(43, 'Can view all post if they not published', 13, 'can_view_all_pnp_posts'),
(44, 'Can allow posts', 13, 'can_allow_posts'),
(45, 'Can edit users posts', 13, 'can_edit_users_post'),
(46, 'Can add comments', 9, 'add_comments'),
(47, 'Can change comments', 9, 'change_comments'),
(48, 'Can delete comments', 9, 'delete_comments'),
(49, 'Can view comments', 9, 'view_comments'),
(50, 'Can add user profile', 14, 'add_userprofile'),
(51, 'Can change user profile', 14, 'change_userprofile'),
(52, 'Can delete user profile', 14, 'delete_userprofile'),
(53, 'Can view user profile', 14, 'view_userprofile'),
(54, 'Can add cookie', 11, 'add_cookie'),
(55, 'Can change cookie', 11, 'change_cookie'),
(56, 'Can delete cookie', 11, 'delete_cookie'),
(57, 'Can view cookie', 11, 'view_cookie'),
(58, 'Can add consent record', 10, 'add_consentrecord'),
(59, 'Can change consent record', 10, 'change_consentrecord'),
(60, 'Can delete consent record', 10, 'delete_consentrecord'),
(61, 'Can view consent record', 10, 'view_consentrecord');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$1200000$p4wFTga0AY9f0clKgCyPQv$wBORwCvOuGy9++OoeUXnxQJcwv28B0o6Tq3Rz2RovzE=', '2025-12-12 18:49:32.910475', 1, 'admin', '', '', 'admin@blog.pgknma.com', 1, 1, '2025-12-08 13:36:53.000000');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_bellrequest`
--

CREATE TABLE `blog_bellrequest` (
  `id` bigint NOT NULL,
  `likes` int NOT NULL,
  `yt_id` varchar(25) NOT NULL,
  `approved` tinyint(1) NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_category`
--

CREATE TABLE `blog_category` (
  `id` bigint NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `short_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `blog_category`
--

INSERT INTO `blog_category` (`id`, `full_name`, `short_name`) VALUES
(1, 'deeba', 'deb');

-- --------------------------------------------------------

--
-- Table structure for table `blog_comments`
--

CREATE TABLE `blog_comments` (
  `id` bigint NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  `post_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_consentrecord`
--

CREATE TABLE `blog_consentrecord` (
  `id` bigint NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `consent_status` varchar(10) NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `policy_version` varchar(10) NOT NULL,
  `analytical_accepted` tinyint(1) NOT NULL,
  `marketing_accepted` tinyint(1) NOT NULL,
  `user_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_cookie`
--

CREATE TABLE `blog_cookie` (
  `id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_memeofweek`
--

CREATE TABLE `blog_memeofweek` (
  `id` bigint NOT NULL,
  `location` longtext NOT NULL,
  `likes` int NOT NULL,
  `approved` tinyint(1) NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` bigint NOT NULL,
  `title` varchar(100) NOT NULL,
  `banner` longtext NOT NULL,
  `hook` longtext NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `published` tinyint(1) NOT NULL,
  `author_id` int NOT NULL,
  `category_id` bigint NOT NULL,
  `allowed` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `banner`, `hook`, `content`, `created_at`, `published`, `author_id`, `category_id`, `allowed`) VALUES
(1, 'UQWGFUYEWGFJESGFJKESHRFK', 'ZDR ETDAJKSFNSAJFASF', 'JHGVBSDJBVGSDJVGBAHFVBDSJGVBDVBGJGVB', 'HFSDFBGDBFGEDFVBJDSBGFVJHDBGVHJDSBGHJDSVBFHJDSFJHDSVFHDSGFHDSGFHGDSFGBEDHFGJHFGKJEHFCJHGVRHFVJEFVEHFVHGEWFHEWJFHEWFHJEF', '2025-12-09 08:43:33.376894', 1, 1, 1, 1),
(2, 'Тест', 'аскйнсакйф', 'аскйдфхксдйфц', 'асйфбдсйфгйеврфгевргцфуцгфбугцфъуйдгцфъхудргф', '2025-12-12 11:34:02.603430', 1, 1, 1, 1),
(3, 'сйкцфнве;кбфевйхфбевхйбв', 'йхдбфйхдфкйдфйдсгфсдйхф', 'хдхгфидсфхксдхфкйсдф', 'сифхдскхфдсхфдс', '2025-12-12 11:36:37.843405', 1, 1, 1, 1),
(4, 'йхдсйдйдасхд', 'асхдбасдбсхдбса', 'йабцкйсбцф', 'йасбцхйбдсф', '2025-12-12 11:36:51.511964', 1, 1, 1, 1),
(5, 'адхфдйдфасйфд', 'асйдасйбдйдф', 'схвдхаскбдадсбйд', 'хдцдсбфйхдфхф', '2025-12-12 11:37:06.648525', 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `blog_userprofile`
--

CREATE TABLE `blog_userprofile` (
  `id` bigint NOT NULL,
  `class_name` varchar(5) DEFAULT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL
) ;

--
-- Dumping data for table `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2025-12-09 08:43:01.690836', '1', 'deeba', 1, '[{\"added\": {}}]', 8, 1),
(2, '2025-12-09 08:43:33.378101', '1', 'UQWGFUYEWGFJESGFJKESHRFK', 1, '[{\"added\": {}}]', 13, 1),
(3, '2025-12-09 22:32:16.578093', '1', 'admin', 2, '[{\"changed\": {\"fields\": [\"Last login\"]}}]', 4, 1),
(4, '2025-12-12 11:34:02.629968', '2', 'Тест', 1, '[{\"added\": {}}]', 13, 1),
(5, '2025-12-12 11:36:37.844366', '3', 'сйкцфнве;кбфевйхфбевхйбв', 1, '[{\"added\": {}}]', 13, 1),
(6, '2025-12-12 11:36:51.512697', '4', 'йхдсйдйдасхд', 1, '[{\"added\": {}}]', 13, 1),
(7, '2025-12-12 11:37:06.649469', '5', 'адхфдйдфасйфд', 1, '[{\"added\": {}}]', 13, 1),
(8, '2025-12-12 11:37:22.709304', '5', 'адхфдйдфасйфд', 2, '[{\"changed\": {\"fields\": [\"Published\", \"Allowed\"]}}]', 13, 1),
(9, '2025-12-12 11:37:28.489216', '4', 'йхдсйдйдасхд', 2, '[{\"changed\": {\"fields\": [\"Published\", \"Allowed\"]}}]', 13, 1),
(10, '2025-12-12 11:37:34.294772', '3', 'сйкцфнве;кбфевйхфбевхйбв', 2, '[{\"changed\": {\"fields\": [\"Published\", \"Allowed\"]}}]', 13, 1),
(11, '2025-12-15 08:11:57.631197', '1', 'кйсфлксфкйсанфкйсанфкйа', 1, '[{\"added\": {}}]', 9, 1),
(12, '2025-12-15 08:13:32.073223', '1', 'кйсфлксфкйсанфкйсанфкйа', 3, '', 9, 1),
(13, '2025-12-15 08:16:12.836755', '2', 'Krumqnkata', 1, '[{\"added\": {}}]', 4, 1),
(14, '2025-12-15 08:17:24.046256', '2', 'Krumqnkata', 2, '[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Staff status\", \"Last login\"]}}]', 4, 1),
(15, '2025-12-15 08:18:59.845446', '2', 'Krumqnkata', 3, '', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(2, 'auth', 'group'),
(3, 'auth', 'permission'),
(4, 'auth', 'user'),
(7, 'blog', 'bellrequest'),
(8, 'blog', 'category'),
(9, 'blog', 'comments'),
(10, 'blog', 'consentrecord'),
(11, 'blog', 'cookie'),
(12, 'blog', 'memeofweek'),
(13, 'blog', 'posts'),
(14, 'blog', 'userprofile'),
(5, 'contenttypes', 'contenttype'),
(6, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-12-08 13:35:11.335407'),
(2, 'auth', '0001_initial', '2025-12-08 13:35:11.836835'),
(3, 'admin', '0001_initial', '2025-12-08 13:35:11.955942'),
(4, 'admin', '0002_logentry_remove_auto_add', '2025-12-08 13:35:11.964625'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-12-08 13:35:11.971127'),
(6, 'contenttypes', '0002_remove_content_type_name', '2025-12-08 13:35:12.052032'),
(7, 'auth', '0002_alter_permission_name_max_length', '2025-12-08 13:35:12.124544'),
(8, 'auth', '0003_alter_user_email_max_length', '2025-12-08 13:35:12.153694'),
(9, 'auth', '0004_alter_user_username_opts', '2025-12-08 13:35:12.171166'),
(10, 'auth', '0005_alter_user_last_login_null', '2025-12-08 13:35:12.238876'),
(11, 'auth', '0006_require_contenttypes_0002', '2025-12-08 13:35:12.243064'),
(12, 'auth', '0007_alter_validators_add_error_messages', '2025-12-08 13:35:12.249747'),
(13, 'auth', '0008_alter_user_username_max_length', '2025-12-08 13:35:12.317418'),
(14, 'auth', '0009_alter_user_last_name_max_length', '2025-12-08 13:35:12.388564'),
(15, 'auth', '0010_alter_group_name_max_length', '2025-12-08 13:35:12.412121'),
(16, 'auth', '0011_update_proxy_permissions', '2025-12-08 13:35:12.419855'),
(17, 'auth', '0012_alter_user_first_name_max_length', '2025-12-08 13:35:12.492191'),
(18, 'blog', '0001_initial', '2025-12-08 13:35:13.014614'),
(19, 'blog', '0002_alter_posts_options_alter_posts_category', '2025-12-08 13:35:13.124374'),
(20, 'blog', '0003_alter_category_options_alter_posts_options', '2025-12-08 13:35:13.134973'),
(21, 'blog', '0004_delete_permissions', '2025-12-08 13:35:13.152681'),
(22, 'blog', '0005_alter_posts_options_posts_allowed', '2025-12-08 13:35:13.213995'),
(23, 'blog', '0006_alter_posts_options', '2025-12-08 13:35:13.222040'),
(24, 'blog', '0007_userprofile', '2025-12-08 13:35:13.300997'),
(25, 'blog', '0008_cookie_consentrecord', '2025-12-08 13:35:13.402024'),
(26, 'blog', '0009_program', '2025-12-08 13:35:13.423743'),
(27, 'blog', '0010_remove_program_friday_remove_program_monday_and_more', '2025-12-08 13:35:13.491258'),
(28, 'blog', '0011_delete_program', '2025-12-08 13:35:13.508933'),
(29, 'sessions', '0001_initial', '2025-12-08 13:35:13.543080');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('fygpcz3424re1isds42r66ljlwjrjwb9', '.eJxVjDEOAiEQRe9CbQggjGBp7xnIwDCyaiBZdivj3XWTLbT9773_EhHXpcZ1lDlOJM5Ci8PvljA_StsA3bHdusy9LfOU5KbInQ557VSel939O6g46rdGTxo8sAXAwkdEr0A7FU6kGUmn4JkVJ52Nsx5UsOCMVUZ5dsQIJN4f4LA3pw:1vSbQK:eQgxHzPZFkWDLx5YYqJUKS62QAVdFvefwoXlR9Tjuss', '2025-12-22 13:37:08.108007'),
('xb6lkr4wxdg46kqq7kz8fh4tr9pez9ec', '.eJxVjDEOAiEQRe9CbQggjGBp7xnIwDCyaiBZdivj3XWTLbT9773_EhHXpcZ1lDlOJM5Ci8PvljA_StsA3bHdusy9LfOU5KbInQ557VSel939O6g46rdGTxo8sAXAwkdEr0A7FU6kGUmn4JkVJ52Nsx5UsOCMVUZ5dsQIJN4f4LA3pw:1vU8Cq:jfY16QLv6Kf2WUc2EagQMMe5DqnbFh-skeNahO1eyR8', '2025-12-26 18:49:32.913989');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indexes for table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Indexes for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `blog_bellrequest`
--
ALTER TABLE `blog_bellrequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_bellrequest_user_id_ced8a3ea_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `blog_category`
--
ALTER TABLE `blog_category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `short_name` (`short_name`);

--
-- Indexes for table `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_comments_user_id_f9e20a52_fk_auth_user_id` (`user_id`),
  ADD KEY `blog_comments_post_id_7457a902_fk_blog_posts_id` (`post_id`);

--
-- Indexes for table `blog_consentrecord`
--
ALTER TABLE `blog_consentrecord`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_consentrecord_user_id_aab13bd4_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `blog_cookie`
--
ALTER TABLE `blog_cookie`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blog_memeofweek`
--
ALTER TABLE `blog_memeofweek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_memeofweek_user_id_6d93ce20_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_posts_author_id_6f561d00_fk_auth_user_id` (`author_id`),
  ADD KEY `blog_posts_category_id_4316690d_fk_blog_category_id` (`category_id`);

--
-- Indexes for table `blog_userprofile`
--
ALTER TABLE `blog_userprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_bellrequest`
--
ALTER TABLE `blog_bellrequest`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_category`
--
ALTER TABLE `blog_category`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `blog_comments`
--
ALTER TABLE `blog_comments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `blog_consentrecord`
--
ALTER TABLE `blog_consentrecord`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_cookie`
--
ALTER TABLE `blog_cookie`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_memeofweek`
--
ALTER TABLE `blog_memeofweek`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `blog_userprofile`
--
ALTER TABLE `blog_userprofile`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `blog_bellrequest`
--
ALTER TABLE `blog_bellrequest`
  ADD CONSTRAINT `blog_bellrequest_user_id_ced8a3ea_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD CONSTRAINT `blog_comments_post_id_7457a902_fk_blog_posts_id` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`),
  ADD CONSTRAINT `blog_comments_user_id_f9e20a52_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `blog_consentrecord`
--
ALTER TABLE `blog_consentrecord`
  ADD CONSTRAINT `blog_consentrecord_user_id_aab13bd4_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `blog_memeofweek`
--
ALTER TABLE `blog_memeofweek`
  ADD CONSTRAINT `blog_memeofweek_user_id_6d93ce20_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_author_id_6f561d00_fk_auth_user_id` FOREIGN KEY (`author_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `blog_posts_category_id_4316690d_fk_blog_category_id` FOREIGN KEY (`category_id`) REFERENCES `blog_category` (`id`);

--
-- Constraints for table `blog_userprofile`
--
ALTER TABLE `blog_userprofile`
  ADD CONSTRAINT `blog_userprofile_user_id_dfc03473_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
