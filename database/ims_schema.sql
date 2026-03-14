-- ============================================
-- Inventory Management System (IMS) - MySQL Schema
-- For Odoo Hackathon - Import via phpMyAdmin
-- ============================================

CREATE DATABASE IF NOT EXISTS ims_odoo;
USE ims_odoo;

-- Users / Authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('inventory_manager', 'warehouse_staff') DEFAULT 'warehouse_staff',
    theme_preference ENUM('light', 'dark', 'system') DEFAULT 'system',
    otp_code VARCHAR(6) NULL,
    otp_expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Warehouses
CREATE TABLE warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Locations (shelves, racks, production floor, etc.)
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    location_type ENUM('internal', 'supplier', 'customer', 'inventory') DEFAULT 'internal',
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_warehouse_location (warehouse_id, code),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Categories
CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT NULL,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Units of Measure
CREATE TABLE uom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INT NULL,
    uom_id INT NOT NULL,
    description TEXT,
    min_stock_qty DECIMAL(15, 4) DEFAULT 0 COMMENT 'Reorder / low stock threshold',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (uom_id) REFERENCES uom(id)
);

-- Stock by location (on-hand quantities)
CREATE TABLE stock_quant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(15, 4) DEFAULT 0,
    UNIQUE KEY unique_product_location (product_id, location_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Document types: receipt, delivery, internal, adjustment
CREATE TABLE stock_picking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    picking_type ENUM('receipt', 'delivery', 'internal', 'adjustment') NOT NULL,
    state ENUM('draft', 'waiting', 'ready', 'done', 'canceled') DEFAULT 'draft',
    warehouse_id INT NOT NULL,
    location_id INT NULL COMMENT 'Source location',
    location_dest_id INT NULL COMMENT 'Destination location',
    partner_id INT NULL COMMENT 'Supplier or customer (optional, for receipt/delivery)',
    partner_name VARCHAR(255) NULL,
    scheduled_date DATETIME NULL,
    done_date DATETIME NULL,
    user_id INT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (location_dest_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Move lines (individual product movements)
CREATE TABLE stock_move (
    id INT AUTO_INCREMENT PRIMARY KEY,
    picking_id INT NOT NULL,
    product_id INT NOT NULL,
    product_uom_id INT NOT NULL,
    location_id INT NOT NULL,
    location_dest_id INT NOT NULL,
    quantity_demand DECIMAL(15, 4) NOT NULL,
    quantity_done DECIMAL(15, 4) DEFAULT 0,
    state ENUM('draft', 'waiting', 'assigned', 'done', 'canceled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (picking_id) REFERENCES stock_picking(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (product_uom_id) REFERENCES uom(id),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (location_dest_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Stock Ledger (audit log of all movements)
CREATE TABLE stock_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    move_id INT NULL,
    picking_id INT NULL,
    quantity_before DECIMAL(15, 4) NOT NULL,
    quantity_after DECIMAL(15, 4) NOT NULL,
    quantity_change DECIMAL(15, 4) NOT NULL COMMENT 'Positive = in, Negative = out',
    reference VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (move_id) REFERENCES stock_move(id) ON DELETE SET NULL,
    FOREIGN KEY (picking_id) REFERENCES stock_picking(id) ON DELETE SET NULL
);

-- Reordering rules (optional)
CREATE TABLE reorder_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    min_qty DECIMAL(15, 4) NOT NULL,
    max_qty DECIMAL(15, 4) NULL,
    lead_days INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

-- ============================================
-- Seed data
-- ============================================

INSERT INTO uom (name, code) VALUES
('Units', 'U'),
('Kilograms', 'kg'),
('Litres', 'L'),
('Metres', 'm'),
('Boxes', 'Box');

INSERT INTO warehouses (name, code, address) VALUES
('Main Warehouse', 'WH-MAIN', '123 Industrial Ave'),
('Production Floor', 'WH-PROD', 'Building B');

INSERT INTO locations (warehouse_id, name, code, location_type) VALUES
(1, 'Main Store', 'STOCK', 'internal'),
(1, 'Receipt Zone', 'IN', 'internal'),
(1, 'Ship Zone', 'OUT', 'internal'),
(2, 'Production Rack A', 'RACK-A', 'internal'),
(2, 'Production Rack B', 'RACK-B', 'internal');

INSERT INTO product_categories (name, parent_id) VALUES
('Raw Materials', NULL),
('Finished Goods', NULL),
('Consumables', NULL);
