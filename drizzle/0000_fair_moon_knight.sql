CREATE TABLE `product_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_type` varchar(50) NOT NULL,
	`price_per_sqm` decimal(10,2) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_prices_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_prices_product_type_unique` UNIQUE(`product_type`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotation_number` varchar(50) NOT NULL,
	`customer_name` varchar(255) NOT NULL,
	`customer_email` varchar(320),
	`customer_phone` varchar(50),
	`customer_address` text,
	`product_type` varchar(50) NOT NULL,
	`width` decimal(10,2) NOT NULL,
	`height` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	`area` decimal(10,2) NOT NULL,
	`price_per_sqm` decimal(10,2) NOT NULL,
	`net_price` decimal(10,2) NOT NULL,
	`vat_percentage` decimal(5,2) NOT NULL,
	`vat_amount` decimal(10,2) NOT NULL,
	`gross_price` decimal(10,2) NOT NULL,
	`discount_type` enum('none','percentage','fixed') NOT NULL DEFAULT 'none',
	`discount_value` decimal(10,2) NOT NULL DEFAULT '0',
	`discount_amount` decimal(10,2) NOT NULL DEFAULT '0',
	`additional_costs` json,
	`additional_costs_total` decimal(10,2) NOT NULL DEFAULT '0',
	`final_total` decimal(10,2) NOT NULL,
	`notes` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotations_quotation_number_unique` UNIQUE(`quotation_number`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;