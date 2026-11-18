-- ==============================================================================
-- WorkPay AI - Database Schema & Initial Data
-- Database: workpay_ai
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `workpay_ai`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `workpay_ai`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'worker', 'admin') NOT NULL DEFAULT 'customer',
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. WORKER CATEGORIES TABLE
DROP TABLE IF EXISTS `worker_categories`;
CREATE TABLE `worker_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `icon` VARCHAR(50) DEFAULT 'Wrench',
  `min_hourly_rate` DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  `max_hourly_rate` DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  `base_daily_rate` DECIMAL(10,2) NOT NULL DEFAULT 800.00,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. WORKER PROFILES TABLE
DROP TABLE IF EXISTS `worker_profiles`;
CREATE TABLE `worker_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `bio` TEXT,
  `address` VARCHAR(255) DEFAULT NULL,
  `preferred_location` VARCHAR(150) DEFAULT NULL,
  `experience_years` DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  `education` VARCHAR(150) DEFAULT NULL,
  `languages` VARCHAR(255) DEFAULT 'English, Hindi, Kannada',
  `expected_salary` DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  `payment_preference` ENUM('per_job', 'daily', 'weekly', 'monthly', 'hourly') NOT NULL DEFAULT 'daily',
  `availability_status` ENUM('available', 'busy', 'unavailable') NOT NULL DEFAULT 'available',
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `rating_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_completed_jobs` INT UNSIGNED NOT NULL DEFAULT 0,
  `profile_completion` INT UNSIGNED NOT NULL DEFAULT 40,
  `verification_status` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  `verification_notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_worker_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_worker_category` FOREIGN KEY (`category_id`) REFERENCES `worker_categories` (`id`) ON DELETE SET NULL,
  INDEX `idx_worker_category` (`category_id`),
  INDEX `idx_worker_location` (`preferred_location`),
  INDEX `idx_worker_experience` (`experience_years`),
  INDEX `idx_worker_salary` (`expected_salary`),
  INDEX `idx_worker_rating` (`rating_avg`),
  INDEX `idx_worker_avail` (`availability_status`),
  INDEX `idx_worker_verification` (`verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CUSTOMER PROFILES TABLE
DROP TABLE IF EXISTS `customer_profiles`;
CREATE TABLE `customer_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `address` VARCHAR(255) DEFAULT NULL,
  `preferred_location` VARCHAR(150) DEFAULT NULL,
  `total_jobs_posted` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_hired` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_customer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_customer_location` (`preferred_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SKILLS TABLE
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_category_skill` (`category_id`, `name`),
  CONSTRAINT `fk_skills_category` FOREIGN KEY (`category_id`) REFERENCES `worker_categories` (`id`) ON DELETE CASCADE,
  INDEX `idx_skills_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. WORKER SKILLS (JUNCTION)
DROP TABLE IF EXISTS `worker_skills`;
CREATE TABLE `worker_skills` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `worker_id` INT UNSIGNED NOT NULL,
  `skill_id` INT UNSIGNED NOT NULL,
  `years_experience` DECIMAL(4,1) DEFAULT 1.0,
  `proficiency_level` ENUM('beginner', 'intermediate', 'expert') DEFAULT 'intermediate',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_worker_skill` (`worker_id`, `skill_id`),
  CONSTRAINT `fk_ws_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ws_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. WORKER CERTIFICATES TABLE
DROP TABLE IF EXISTS `worker_certificates`;
CREATE TABLE `worker_certificates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `worker_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `issuing_org` VARCHAR(150) DEFAULT NULL,
  `issue_date` DATE DEFAULT NULL,
  `certificate_url` VARCHAR(255) DEFAULT NULL,
  `verification_status` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cert_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`) ON DELETE CASCADE,
  INDEX `idx_cert_status` (`verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. JOBS TABLE
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `required_skills` VARCHAR(255) DEFAULT NULL,
  `required_experience` DECIMAL(4,1) DEFAULT 1.0,
  `location` VARCHAR(150) NOT NULL,
  `budget` DECIMAL(10,2) NOT NULL,
  `payment_type` ENUM('per_job', 'daily', 'weekly', 'monthly', 'hourly') NOT NULL DEFAULT 'per_job',
  `start_date` DATE DEFAULT NULL,
  `expected_duration` VARCHAR(50) DEFAULT '1 Day',
  `working_hours` VARCHAR(50) DEFAULT '8 Hours/Day',
  `status` ENUM('open', 'applications_received', 'hiring_pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed') NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_jobs_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jobs_category` FOREIGN KEY (`category_id`) REFERENCES `worker_categories` (`id`),
  INDEX `idx_jobs_status` (`status`),
  INDEX `idx_jobs_location` (`location`),
  INDEX `idx_jobs_category` (`category_id`),
  INDEX `idx_jobs_budget` (`budget`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. JOB SKILLS TABLE
DROP TABLE IF EXISTS `job_skills`;
CREATE TABLE `job_skills` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT UNSIGNED NOT NULL,
  `skill_id` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_job_skill` (`job_id`, `skill_id`),
  CONSTRAINT `fk_js_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_js_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. JOB APPLICATIONS TABLE
DROP TABLE IF EXISTS `job_applications`;
CREATE TABLE `job_applications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT UNSIGNED NOT NULL,
  `worker_id` INT UNSIGNED NOT NULL,
  `proposed_rate` DECIMAL(10,2) NOT NULL,
  `proposal_text` TEXT,
  `status` ENUM('pending', 'shortlisted', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_job_worker_application` (`job_id`, `worker_id`),
  CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`) ON DELETE CASCADE,
  INDEX `idx_app_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. HIRING REQUESTS TABLE
DROP TABLE IF EXISTS `hiring_requests`;
CREATE TABLE `hiring_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `worker_id` INT UNSIGNED NOT NULL,
  `job_id` INT UNSIGNED DEFAULT NULL,
  `offered_rate` DECIMAL(10,2) NOT NULL,
  `payment_type` ENUM('per_job', 'daily', 'weekly', 'monthly', 'hourly') NOT NULL DEFAULT 'per_job',
  `message` TEXT,
  `status` ENUM('pending', 'accepted', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hr_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hr_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hr_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  INDEX `idx_hr_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. JOB ASSIGNMENTS TABLE
DROP TABLE IF EXISTS `job_assignments`;
CREATE TABLE `job_assignments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT UNSIGNED DEFAULT NULL,
  `worker_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `agreed_rate` DECIMAL(10,2) NOT NULL,
  `payment_type` ENUM('per_job', 'daily', 'weekly', 'monthly', 'hourly') NOT NULL DEFAULT 'per_job',
  `start_date` DATE DEFAULT NULL,
  `completion_date` DATE DEFAULT NULL,
  `worker_confirmed_completion` BOOLEAN NOT NULL DEFAULT FALSE,
  `customer_confirmed_completion` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('active', 'worker_completed', 'fully_completed', 'disputed', 'cancelled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_assign_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assign_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assign_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`) ON DELETE CASCADE,
  INDEX `idx_assign_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. JOB REVIEWS TABLE
DROP TABLE IF EXISTS `job_reviews`;
CREATE TABLE `job_reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT UNSIGNED DEFAULT NULL,
  `reviewer_id` INT UNSIGNED NOT NULL,
  `reviewee_id` INT UNSIGNED NOT NULL,
  `rating` DECIMAL(2,1) NOT NULL,
  `review_text` TEXT,
  `sentiment` ENUM('positive', 'neutral', 'negative') DEFAULT 'positive',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rev_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_review_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. WALLETS TABLE
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `available_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `pending_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_lifetime_earnings` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. TRANSACTIONS TABLE
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `transaction_reference` VARCHAR(64) NOT NULL UNIQUE,
  `job_id` INT UNSIGNED DEFAULT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `worker_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `platform_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `net_amount` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'razorpay_upi',
  `payment_gateway` VARCHAR(50) DEFAULT 'razorpay_sandbox',
  `gateway_order_id` VARCHAR(100) DEFAULT NULL,
  `gateway_payment_id` VARCHAR(100) DEFAULT NULL,
  `gateway_signature` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `idempotency_key` VARCHAR(100) DEFAULT NULL UNIQUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tx_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tx_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`),
  CONSTRAINT `fk_tx_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`),
  INDEX `idx_tx_ref` (`transaction_reference`),
  INDEX `idx_tx_status` (`status`),
  INDEX `idx_tx_gateway_order` (`gateway_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. WALLET LEDGER TABLE
DROP TABLE IF EXISTS `wallet_ledger`;
CREATE TABLE `wallet_ledger` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `wallet_id` INT UNSIGNED NOT NULL,
  `transaction_id` INT UNSIGNED DEFAULT NULL,
  `entry_type` ENUM('credit', 'debit') NOT NULL,
  `category` ENUM('job_payment', 'payout', 'platform_fee', 'refund', 'expense') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `balance_after` DECIMAL(12,2) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ledger_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ledger_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  INDEX `idx_ledger_type` (`entry_type`),
  INDEX `idx_ledger_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. PAYOUT REQUESTS TABLE
DROP TABLE IF EXISTS `payout_requests`;
CREATE TABLE `payout_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `worker_id` INT UNSIGNED NOT NULL,
  `wallet_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM('bank_transfer', 'upi') NOT NULL DEFAULT 'upi',
  `account_details` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'processing', 'completed', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT,
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `requested_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_payout_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payout_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE,
  INDEX `idx_payout_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. INVOICES TABLE
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `transaction_id` INT UNSIGNED NOT NULL UNIQUE,
  `job_id` INT UNSIGNED DEFAULT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `worker_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `pdf_url` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('issued', 'paid', 'void') NOT NULL DEFAULT 'paid',
  `issued_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_inv_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_inv_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`),
  CONSTRAINT `fk_inv_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. DISPUTES TABLE
DROP TABLE IF EXISTS `disputes`;
CREATE TABLE `disputes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT UNSIGNED NOT NULL,
  `transaction_id` INT UNSIGNED DEFAULT NULL,
  `raised_by_user_id` INT UNSIGNED NOT NULL,
  `against_user_id` INT UNSIGNED NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `details` TEXT NOT NULL,
  `status` ENUM('open', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  `resolution_notes` TEXT,
  `refund_amount` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_disp_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_disp_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_disp_raiser` FOREIGN KEY (`raised_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_disp_against` FOREIGN KEY (`against_user_id`) REFERENCES `users` (`id`),
  INDEX `idx_disp_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. REFUNDS TABLE
DROP TABLE IF EXISTS `refunds`;
CREATE TABLE `refunds` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `dispute_id` INT UNSIGNED DEFAULT NULL,
  `transaction_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `gateway_refund_id` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('initiated', 'successful', 'failed') NOT NULL DEFAULT 'initiated',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ref_disp` FOREIGN KEY (`dispute_id`) REFERENCES `disputes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ref_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`),
  CONSTRAINT `fk_ref_cust` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. WORKER EXPENSES TABLE
DROP TABLE IF EXISTS `worker_expenses`;
CREATE TABLE `worker_expenses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `worker_id` INT UNSIGNED NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `notes` TEXT,
  `receipt_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_exp_worker` FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles` (`id`) ON DELETE CASCADE,
  INDEX `idx_exp_date` (`expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. NOTIFICATIONS TABLE
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'success', 'warning', 'job', 'payment') NOT NULL DEFAULT 'info',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `reference_id` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notif_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. CHATBOT CONVERSATIONS TABLE
DROP TABLE IF EXISTS `chatbot_conversations`;
CREATE TABLE `chatbot_conversations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `session_id` VARCHAR(64) NOT NULL,
  `language` ENUM('en', 'kn', 'hi') NOT NULL DEFAULT 'en',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_chat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_chat_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. CHATBOT MESSAGES TABLE
DROP TABLE IF EXISTS `chatbot_messages`;
CREATE TABLE `chatbot_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT UNSIGNED NOT NULL,
  `sender` ENUM('user', 'bot') NOT NULL,
  `message` TEXT NOT NULL,
  `intent` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_chat_msg` FOREIGN KEY (`conversation_id`) REFERENCES `chatbot_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. FRAUD ALERTS TABLE
DROP TABLE IF EXISTS `fraud_alerts`;
CREATE TABLE `fraud_alerts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `related_entity_type` VARCHAR(50) DEFAULT 'transaction',
  `related_entity_id` VARCHAR(100) DEFAULT NULL,
  `risk_score` INT UNSIGNED NOT NULL DEFAULT 50,
  `alert_type` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  `status` ENUM('new', 'under_review', 'dismissed', 'action_taken') NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_fraud_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_fraud_status` (`status`),
  INDEX `idx_fraud_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. ADMIN LOGS TABLE
DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE `admin_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(50) DEFAULT NULL,
  `details` TEXT,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_admin_log_user` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_admin_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. USER AVAILABILITY TABLE
DROP TABLE IF EXISTS `user_availability`;
CREATE TABLE `user_availability` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `start_time` TIME NOT NULL DEFAULT '08:00:00',
  `end_time` TIME NOT NULL DEFAULT '18:00:00',
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_day` (`user_id`, `day_of_week`),
  CONSTRAINT `fk_avail_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- INITIAL SEED DATA
-- Default password for demo accounts is "Password123!"
-- Hash: $2a$10$3euPcmQj2qV70V1n4gPZZO6B8hTkgKzF6L6Kx5eHqyTfomBfS0Xg.
-- ==============================================================================

-- 1. SEED WORKER CATEGORIES
INSERT INTO `worker_categories` (`id`, `name`, `slug`, `description`, `icon`, `min_hourly_rate`, `max_hourly_rate`, `base_daily_rate`) VALUES
(1, 'Electrician', 'electrician', 'Wiring, appliance installations, circuit repairs, and power diagnostics.', 'Zap', 200.00, 800.00, 900.00),
(2, 'Plumber', 'plumber', 'Pipe repairs, fixture fitting, drainage solutions, and water heater setup.', 'Wrench', 180.00, 750.00, 850.00),
(3, 'Carpenter', 'carpenter', 'Custom furniture, woodwork, door/window frame fitting, and cabinet repairs.', 'Hammer', 220.00, 900.00, 1000.00),
(4, 'Painter', 'painter', 'Interior/exterior wall painting, waterproofing, texture coatings, and polish.', 'Palette', 150.00, 600.00, 750.00),
(5, 'Construction Worker & Mason', 'construction-mason', 'Bricklaying, concrete masonry, plastering, tiling, and structural repairs.', 'Building', 200.00, 700.00, 850.00),
(6, 'Driver', 'driver', 'Personal chauffeur, commercial delivery, cab services, and heavy vehicle driving.', 'Car', 150.00, 500.00, 700.00),
(7, 'Cook & Chef', 'cook-chef', 'Home culinary, party catering, dietary meal prep, and regional dishes.', 'Utensils', 180.00, 850.00, 800.00),
(8, 'House Cleaner', 'house-cleaner', 'Deep home cleaning, sanitation, floor buffing, sofa and window cleaning.', 'Sparkles', 120.00, 450.00, 600.00),
(9, 'Gardener', 'gardener', 'Lawn mowing, landscaping, plant pest control, tree trimming, and soil care.', 'Flower2', 140.00, 500.00, 650.00),
(10, 'Babysitter', 'babysitter', 'Child care, early learning supervision, meal handling, and night care.', 'HeartHandshake', 160.00, 650.00, 750.00),
(11, 'Security Guard', 'security-guard', 'Residential gate watch, event security, CCTV surveillance, and access control.', 'ShieldCheck', 130.00, 450.00, 600.00),
(12, 'Teacher & Tutor', 'teacher-tutor', 'K-12 academics, STEM coaching, language training, and competitive exam prep.', 'GraduationCap', 250.00, 1200.00, 1200.00),
(13, 'Mechanic', 'mechanic', 'Two-wheeler and four-wheeler repairs, oil changes, engine tuning, and breakdown aid.', 'Cog', 200.00, 800.00, 900.00),
(14, 'Delivery Worker', 'delivery-worker', 'Package courier, parcel dispatch, grocery transport, and intra-city errands.', 'Package', 120.00, 400.00, 550.00);

-- 2. SEED SKILLS
INSERT INTO `skills` (`id`, `category_id`, `name`, `slug`, `description`) VALUES
(1, 1, 'House Wiring & Rewiring', 'house-wiring', 'Full domestic conduit & distribution board wiring'),
(2, 1, 'MCB & Inverter Setup', 'mcb-inverter', 'Circuit breaker installation and power backup configuration'),
(3, 1, 'Appliance Repair', 'appliance-repair', 'Fans, mixers, washing machines, and geysers'),
(4, 2, 'Leakage Detection', 'leakage-detection', 'Under-floor and concealed pipe leakage troubleshooting'),
(5, 2, 'Sanitary Fixtures Fitting', 'sanitary-fixtures', 'Taps, basins, commodes, and shower panels'),
(6, 2, 'Drain Unclogging', 'drain-unclogging', 'High-pressure jet cleaning and chemical clearing'),
(7, 3, 'Modular Kitchen Fitting', 'modular-kitchen', 'Precision cabinetry, soft-close hinges, and countertops'),
(8, 3, 'Wood Furniture Polish', 'wood-polish', 'PU and Melamine polishing for teak and rosewood'),
(9, 4, 'Exterior Weather-Proofing', 'exterior-painting', 'Apex and silicone water-resistant wall coatings'),
(10, 4, 'Interior Texture Art', 'texture-art', 'Royal luxury stencil and roll-texture designs'),
(11, 5, 'Tile Laying & Grouting', 'tile-laying', 'Vitrified and ceramic tile leveling with epoxy grout'),
(12, 6, 'Manual & Auto Driving', 'city-driving', 'Navigating heavy city traffic with defensive driving'),
(13, 7, 'South Indian Meals', 'south-indian-food', 'Traditional breakfast, thalis, and sambar varieties'),
(14, 7, 'North Indian Curries', 'north-indian-food', 'Paneer, rotis, dals, and aromatic gravies'),
(15, 8, 'Deep Kitchen Sanitization', 'deep-kitchen-cleaning', 'Degreasing chimneys, slabs, and cabinets'),
(16, 9, 'Organic Vegetable Gardening', 'organic-gardening', 'Composting, terrace garden maintenance, drip setup'),
(17, 12, 'High School Mathematics', 'high-school-math', 'Algebra, Calculus, Trigonometry for Class 8-12'),
(18, 13, 'Brake & Suspension Overhaul', 'brake-suspension', 'Hydraulic disc brakes, suspension realignment');

-- 3. SEED USERS (Password: Password123!)
-- Hash generated using bcrypt 10 salt rounds: $2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `full_name`, `phone`, `avatar_url`, `is_verified`, `is_active`) VALUES
(1, 'admin@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'admin', 'System Administrator', '+91 98765 00001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', TRUE, TRUE),
(2, 'customer.demo@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'customer', 'Rajesh Sharma', '+91 98765 11111', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', TRUE, TRUE),
(3, 'priya.customer@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'customer', 'Priya Venkatesh', '+91 98765 22222', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', TRUE, TRUE),
(4, 'ramesh.electrician@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'worker', 'Ramesh Kumar', '+91 98765 33333', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', TRUE, TRUE),
(5, 'suresh.plumber@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'worker', 'Suresh Gowda', '+91 98765 44444', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', TRUE, TRUE),
(6, 'anita.cook@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'worker', 'Anita Devi', '+91 98765 55555', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', TRUE, TRUE),
(7, 'vijay.carpenter@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'worker', 'Vijay Acharya', '+91 98765 66666', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', TRUE, TRUE),
(8, 'deepa.tutor@workpay.ai', '$2a$10$/7Y0lD0XeTxLGRFvNPds5OuXjiNVTRsFW180qlCIm25J8L6aJmoSa', 'worker', 'Deepa Hegde', '+91 98765 77777', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', TRUE, TRUE);

-- 4. SEED CUSTOMER PROFILES
INSERT INTO `customer_profiles` (`id`, `user_id`, `address`, `preferred_location`, `total_jobs_posted`, `total_hired`) VALUES
(1, 2, 'Flat 402, Green Glen Layout, Bellandur', 'Bengaluru South', 3, 2),
(2, 3, 'House 12, 4th Main, Malleshwaram', 'Bengaluru North', 2, 1);

-- 5. SEED WORKER PROFILES
INSERT INTO `worker_profiles` (`id`, `user_id`, `category_id`, `bio`, `address`, `preferred_location`, `experience_years`, `education`, `languages`, `expected_salary`, `payment_preference`, `availability_status`, `rating_avg`, `rating_count`, `total_completed_jobs`, `profile_completion`, `verification_status`) VALUES
(1, 4, 1, 'Licensed ITI Certified Electrician with 7+ years handling residential wiring, MCB distribution, solar inverters, and emergency electrical troubleshooting.', 'BTM Layout 2nd Stage, Bengaluru', 'Bengaluru South', 7.5, 'ITI Electrician Diploma', 'Kannada, Hindi, English', 650.00, 'daily', 'available', 4.92, 28, 34, 100, 'verified'),
(2, 5, 2, 'Experienced Master Plumber specializing in high-rise leak detection, bathroom fittings, concealed PVC piping, and water pressure boosters.', 'Rajajinagar 3rd Block, Bengaluru', 'Bengaluru North', 6.0, 'Technical Apprenticeship', 'Kannada, Hindi', 600.00, 'daily', 'available', 4.85, 22, 26, 95, 'verified'),
(3, 6, 7, 'Professional home chef and dietary nutritionist expert. Specialized in authentic South Indian, North Indian sattvic, and continental wholesome meals.', 'Indiranagar 100ft Road, Bengaluru', 'Bengaluru East', 5.0, 'Culinary Certificate', 'Hindi, Kannada, English', 800.00, 'daily', 'available', 4.95, 36, 42, 90, 'verified'),
(4, 7, 3, 'Specialist carpenter in customized modular kitchens, hardwood beds, TV consoles, lock repairs, and polish restoration.', 'HSR Layout Sector 3, Bengaluru', 'Bengaluru South', 9.0, 'Senior Craftsman Training', 'Kannada, Telugu, Hindi', 850.00, 'daily', 'available', 4.78, 19, 21, 88, 'verified'),
(5, 8, 12, 'M.Sc. Mathematics Gold Medalist offering tutoring for Grade 8-12 and competitive entrance examinations. Engaging and result-oriented mentoring.', 'JP Nagar Phase 6, Bengaluru', 'Bengaluru South', 4.5, 'M.Sc Mathematics', 'English, Kannada, Hindi', 450.00, 'hourly', 'available', 5.00, 15, 18, 95, 'verified');

-- 6. SEED WORKER SKILLS
INSERT INTO `worker_skills` (`worker_id`, `skill_id`, `years_experience`, `proficiency_level`) VALUES
(1, 1, 7.5, 'expert'),
(1, 2, 6.0, 'expert'),
(1, 3, 5.0, 'intermediate'),
(2, 4, 6.0, 'expert'),
(2, 5, 5.5, 'expert'),
(2, 6, 4.0, 'intermediate'),
(3, 13, 5.0, 'expert'),
(3, 14, 4.5, 'expert'),
(4, 7, 9.0, 'expert'),
(4, 8, 8.0, 'expert'),
(5, 17, 4.5, 'expert');

-- 7. SEED WORKER CERTIFICATES
INSERT INTO `worker_certificates` (`worker_id`, `title`, `issuing_org`, `issue_date`, `certificate_url`, `verification_status`) VALUES
(1, 'National Trade Certificate - Electrician', 'National Council for Vocational Training', '2018-06-15', 'https://workpay.ai/certs/ramesh_iti.pdf', 'verified'),
(2, 'Certified Master Plumber Badge', 'Indian Plumbing Association', '2019-09-20', 'https://workpay.ai/certs/suresh_ipa.pdf', 'verified'),
(3, 'Food Safety and Hygiene Certificate (FSSAI)', 'Food Safety and Standards Authority of India', '2021-03-10', 'https://workpay.ai/certs/anita_fssai.pdf', 'verified');

-- 8. SEED WALLETS
INSERT INTO `wallets` (`id`, `user_id`, `available_balance`, `pending_balance`, `total_lifetime_earnings`, `currency`) VALUES
(1, 4, 4850.00, 1200.00, 42600.00, 'INR'),
(2, 5, 3200.00, 0.00, 31800.00, 'INR'),
(3, 6, 7500.00, 2400.00, 54200.00, 'INR'),
(4, 7, 2100.00, 0.00, 28900.00, 'INR'),
(5, 8, 6200.00, 900.00, 22500.00, 'INR'),
(6, 2, 0.00, 0.00, 0.00, 'INR'),
(7, 3, 0.00, 0.00, 0.00, 'INR');

-- 9. SEED JOBS
INSERT INTO `jobs` (`id`, `customer_id`, `category_id`, `title`, `description`, `required_skills`, `required_experience`, `location`, `budget`, `payment_type`, `start_date`, `expected_duration`, `working_hours`, `status`) VALUES
(1, 1, 1, 'Complete 3BHK Electrical Concealed Rewiring & Inverter Setup', 'Need a licensed electrician to inspect our new 3BHK flat in Bellandur, rewire living room circuit boards, and connect a 1500VA luminous inverter with battery safely.', 'House Wiring & Rewiring, MCB & Inverter Setup', 4.0, 'Bellandur, Bengaluru South', 3200.00, 'per_job', '2026-11-15', '2 Days', '8 Hours/Day', 'open'),
(2, 1, 2, 'Bathroom Concealed Pipe Leakage Troubleshooting & Valve Replacement', 'Master bathroom ceiling shows dampness from adjacent wall. Requires acoustic or pressure leakage test, wall chiseling, PPR pipe replacement and retiling.', 'Leakage Detection, Sanitary Fixtures Fitting', 5.0, 'Green Glen Layout, Bengaluru South', 1800.00, 'per_job', '2026-11-12', '1 Day', '6 Hours', 'completed'),
(3, 2, 7, 'Weekend Family Gathering Cook for 15 Guests', 'Looking for an experienced chef to prepare authentic South Indian traditional banana leaf lunch including 3 curries, payasam, and evening snacks.', 'South Indian Meals', 3.0, 'Malleshwaram, Bengaluru North', 2500.00, 'per_job', '2026-11-14', '1 Day', '5 Hours', 'open'),
(4, 2, 3, 'Custom Teakwood Bookshelf & Study Table Repair', 'Need solid wood restoration for an heirloom bookshelf, hinge realignment, and new shelf additions.', 'Wood Furniture Polish', 4.0, 'Malleshwaram, Bengaluru North', 1500.00, 'per_job', '2026-11-18', '1 Day', '4 Hours', 'open');

-- 10. SEED JOB APPLICATIONS
INSERT INTO `job_applications` (`job_id`, `worker_id`, `proposed_rate`, `proposal_text`, `status`) VALUES
(1, 1, 3000.00, 'Hello Rajesh, I have 7+ years of experience with 3BHK wiring and inverter installations. I carry digital multimeters and provide 6 months workmanship warranty.', 'shortlisted'),
(3, 3, 2400.00, 'Namaskara Priya! I specialize in traditional festive feasts and have catered gatherings up to 50 members with hygienic standards.', 'pending');

-- 11. SEED JOB ASSIGNMENTS
INSERT INTO `job_assignments` (`id`, `job_id`, `worker_id`, `customer_id`, `agreed_rate`, `payment_type`, `start_date`, `completion_date`, `worker_confirmed_completion`, `customer_confirmed_completion`, `status`) VALUES
(1, 2, 2, 1, 1800.00, 'per_job', '2026-11-05', '2026-11-05', TRUE, TRUE, 'fully_completed');

-- 12. SEED TRANSACTIONS
INSERT INTO `transactions` (`id`, `transaction_reference`, `job_id`, `customer_id`, `worker_id`, `amount`, `platform_fee`, `net_amount`, `payment_method`, `payment_gateway`, `gateway_order_id`, `gateway_payment_id`, `gateway_signature`, `status`, `idempotency_key`) VALUES
(1, 'TXN_WP_20261105_00192', 2, 1, 2, 1800.00, 90.00, 1710.00, 'UPI - Google Pay', 'razorpay_sandbox', 'order_N8s99XbL01', 'pay_N8t12YcM99', 'sig_89f0a8c43912dfa87123bf01', 'completed', 'idemp_txn_20261105_001');

-- 13. SEED WALLET LEDGER
INSERT INTO `wallet_ledger` (`wallet_id`, `transaction_id`, `entry_type`, `category`, `amount`, `balance_after`, `description`) VALUES
(2, 1, 'credit', 'job_payment', 1710.00, 3200.00, 'Payout for Job #2: Bathroom Leakage Troubleshooting (Net after 5% fee)');

-- 14. SEED INVOICES
INSERT INTO `invoices` (`id`, `invoice_number`, `transaction_id`, `job_id`, `customer_id`, `worker_id`, `amount`, `tax_amount`, `total_amount`, `status`, `issued_date`) VALUES
(1, 'INV-2026-11-0001', 1, 2, 1, 2, 1800.00, 0.00, 1800.00, 'paid', '2026-11-05');

-- 15. SEED REVIEWS
INSERT INTO `job_reviews` (`job_id`, `reviewer_id`, `reviewee_id`, `rating`, `review_text`, `sentiment`) VALUES
(2, 2, 5, 5.0, 'Suresh did an impeccable job diagnosing the hidden pipe leakage without damaging excess tiles. Prompt, neat and polite!', 'positive'),
(2, 5, 2, 5.0, 'Rajesh Sir is very courteous and made prompt payment immediately after inspecting the repair.', 'positive');

-- 16. SEED FRAUD ALERTS
INSERT INTO `fraud_alerts` (`user_id`, `related_entity_type`, `related_entity_id`, `risk_score`, `alert_type`, `description`, `severity`, `status`) VALUES
(4, 'transaction', 'TXN_TEST_991', 15, 'Rapid Booking Spike', 'Worker received 4 requests within 10 minutes from same IP network. System verified normal seasonal demand.', 'low', 'dismissed');

-- 17. SEED USER AVAILABILITY (Ramesh Kumar - Worker 1)
INSERT INTO `user_availability` (`user_id`, `day_of_week`, `start_time`, `end_time`, `is_available`) VALUES
(4, 'Monday', '08:30:00', '18:30:00', TRUE),
(4, 'Tuesday', '08:30:00', '18:30:00', TRUE),
(4, 'Wednesday', '08:30:00', '18:30:00', TRUE),
(4, 'Thursday', '08:30:00', '18:30:00', TRUE),
(4, 'Friday', '08:30:00', '18:30:00', TRUE),
(4, 'Saturday', '09:00:00', '17:00:00', TRUE),
(4, 'Sunday', '10:00:00', '14:00:00', FALSE);

