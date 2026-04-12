-- ============================================
-- Comprehensive Dummy Data for IMS Dashboard
-- ============================================

USE ims_odoo;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM stock_ledger;
DELETE FROM stock_move;
DELETE FROM stock_picking;
DELETE FROM stock_quant;
DELETE FROM products;
DELETE FROM users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
(1, 'manager@ims.com', '$2a$10$PNtelb83Ru2SOoFe/VLxy.gbhNRLJiIYsfE.zCIk5vDhgHYORt7FS', 'System Manager', 'inventory_manager'),
(2, 'staff@ims.com', '$2a$10$PNtelb83Ru2SOoFe/VLxy.gbhNRLJiIYsfE.zCIk5vDhgHYORt7FS', 'Warehouse Staff', 'warehouse_staff');

-- 2. Insert Products (30 Items minimum)
INSERT INTO products (id, name, sku, category_id, uom_id, description, min_stock_qty) VALUES
-- Low Stock targets (5 to 6)
(1, 'Steel Sheet', 'RAW-STL-001', 1, 2, 'Low Stock', 50.0000),
(2, 'Copper Wire', 'RAW-COP-001', 1, 4, 'Low Stock', 100.0000),
(3, 'Aluminum Pipe', 'RAW-ALU-001', 1, 2, 'Low Stock', 20.0000),
(4, 'Oak Wood Panel', 'RAW-WOD-001', 1, 1, 'Low Stock', 10.0000),
(5, 'Pine Wood Beam', 'RAW-WOD-002', 1, 1, 'Low Stock', 15.0000),
(6, 'Carbon Panel', 'RAW-CFP-002', 1, 1, 'Low Stock', 5.0000),

-- Out of Stock targets (5 to 6)
(7, 'Iron Rod', 'RAW-IRN-001', 1, 2, 'Out of Stock', 500.0000),
(8, 'Carbon Fiber Sheet', 'RAW-CRB-001', 1, 2, 'Out of Stock', 5.0000),
(9, 'Zinc Plate', 'RAW-ZNC-001', 1, 2, 'Out of Stock', 20.0000),
(10, 'Titanium Alloy Block', 'RAW-TIT-001', 1, 2, 'Out of Stock', 2.0000),
(11, 'Machine Oil', 'CON-OIL-001', 3, 3, 'Out of Stock', 50.0000),

-- Healthy Stock targets
(12, 'Heavy Duty Glue', 'CON-GLU-001', 3, 3, 'Normal Stock', 10.0000),
(13, 'Steel Bolts M8', 'CON-BLT-001', 3, 5, 'Normal Stock', 20.0000),
(14, 'Steel Nuts M8', 'CON-NUT-001', 3, 5, 'Normal Stock', 20.0000),
(15, 'Washers M8', 'CON-WSH-001', 3, 5, 'Normal Stock', 15.0000),
(16, 'Welding Rods', 'CON-WLD-001', 3, 5, 'Normal Stock', 10.0000),
(17, 'Safety Gloves', 'CON-GLV-001', 3, 5, 'Normal Stock', 5.0000),
(18, 'Masking Tape', 'CON-TAP-001', 3, 1, 'Normal Stock', 30.0000),
(19, 'Paint Primer', 'CON-PNT-001', 3, 3, 'Normal Stock', 15.0000),
(20, 'Cleaning Solvent', 'CON-CLN-001', 3, 3, 'Normal Stock', 25.0000),
(21, 'Steel Bracket Assembly', 'FIN-BRK-001', 2, 1, 'Normal Stock', 100.0000),
(22, 'Copper Coil Module', 'FIN-COP-001', 2, 1, 'Normal Stock', 50.0000),
(23, 'Aluminum Frame', 'FIN-ALU-001', 2, 1, 'Normal Stock', 20.0000),
(24, 'Wooden Desk Shell', 'FIN-DSK-001', 2, 1, 'Normal Stock', 10.0000),
(25, 'Industrial Engine Mount', 'FIN-ENG-001', 2, 1, 'Normal Stock', 15.0000),
(26, 'Carbon Fiber Panel', 'FIN-CFP-001', 2, 1, 'Normal Stock', 5.0000),
(27, 'Brass Valve Assembly', 'FIN-VLV-001', 2, 1, 'Normal Stock', 25.0000),
(28, 'Tool Kit Bundle', 'FIN-KIT-001', 2, 1, 'Normal Stock', 30.0000),
(29, 'Painted Steel Support', 'FIN-SUP-001', 2, 1, 'Normal Stock', 40.0000),
(30, 'Custom Titanium Gear', 'FIN-GER-001', 2, 1, 'Normal Stock', 5.0000);

-- 3. Stock Quantities (On-hand stock)
INSERT INTO stock_quant (product_id, location_id, quantity) VALUES
-- Out of Stock (0 qty globally): Products 7 through 11
(7, 1, 0.0000),
(8, 1, 0.0000),
(9, 1, 0.0000),
(10, 1, 0.0000),
(11, 1, 0.0000),

-- Low Stock (Below Minimum): Products 1 through 6
(1, 1, 20.0000),
(2, 1, 50.0000),
(3, 1, 10.0000),
(4, 1, 5.0000),
(5, 1, 5.0000),
(6, 1, 2.0000),

-- Normal Stock: Products 12 through 30
(12, 1, 500.0000), (13, 1, 150.0000), (14, 1, 200.0000),
(15, 1, 1500.0000), (16, 1, 1200.0000), (17, 1, 400.0000),
(18, 1, 80.0000), (19, 1, 150.0000), (20, 1, 150.0000),
(21, 1, 800.0000), (22, 1, 40.0000), (23, 1, 200.0000),
(24, 1, 120.0000), (25, 1, 80.0000), (26, 1, 90.0000),
(27, 1, 450.0000), (28, 1, 320.0000), (29, 1, 85.0000),
(30, 1, 115.0000);

-- 4. Active & Processed Operations

-- A) Pending Receipts (Vendor -> Main Store) [7 to 8 items requested: waiting, ready]
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_dest_id, partner_name, user_id) VALUES
(100, 'RCPT-100', 'receipt', 'ready', 1, 1, 'Global Steel Corp', 1),
(101, 'RCPT-101', 'receipt', 'ready', 1, 1, 'Aerospace Metals', 1),
(102, 'RCPT-102', 'receipt', 'waiting', 1, 1, 'WoodWorks Inc', 2),
(103, 'RCPT-103', 'receipt', 'waiting', 1, 1, 'Tools Ltd', 2),
(104, 'RCPT-104', 'receipt', 'ready', 1, 1, 'Chemical Bros', 1),
(105, 'RCPT-105', 'receipt', 'waiting', 1, 1, 'Steel Corp', 1),
(106, 'RCPT-106', 'receipt', 'ready', 1, 1, 'Wire Co.', 1);

INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(100, 100, 1, 2, 2, 1, 1000.0000, 'assigned'),
(101, 101, 7, 2, 2, 1, 50.0000, 'waiting'),
(102, 102, 8, 1, 2, 1, 20.0000, 'waiting'),
(103, 103, 9, 2, 2, 1, 100.0000, 'waiting'),
(104, 104, 10, 2, 2, 1, 5.0000, 'assigned'),
(105, 105, 11, 2, 2, 1, 50.0000, 'waiting'),
(106, 106, 12, 1, 2, 1, 200.0000, 'assigned');

-- B) Cancelled Receipts [2 to 3 requested]
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_dest_id, partner_name, user_id) VALUES
(200, 'RCPT-200', 'receipt', 'canceled', 1, 1, 'Fake Vendor', 1),
(201, 'RCPT-201', 'receipt', 'canceled', 1, 1, 'Global Steel Corp', 1);

INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(200, 200, 13, 2, 2, 1, 500.0000, 'canceled'),
(201, 201, 14, 2, 2, 1, 200.0000, 'canceled');

-- C) Draft and Completed Receipts [4 to 5 draft/done requested]
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_dest_id, partner_name, user_id) VALUES
(300, 'RCPT-300', 'receipt', 'draft', 1, 1, 'Pending Vendor', 1),
(301, 'RCPT-301', 'receipt', 'draft', 1, 1, 'Draft Co.', 2),
(302, 'RCPT-302', 'receipt', 'draft', 1, 1, 'WoodWorks Inc', 2),
(303, 'RCPT-303', 'receipt', 'done', 1, 1, 'Historic Vendor A', 1),
(304, 'RCPT-304', 'receipt', 'done', 1, 1, 'Historic Vendor B', 1);

INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(300, 300, 15, 2, 2, 1, 100.0000, 'draft'),
(301, 301, 16, 2, 2, 1, 50.0000, 'draft'),
(302, 302, 17, 1, 2, 1, 20.0000, 'draft'),
(303, 303, 18, 2, 2, 1, 100.0000, 'done'),
(304, 304, 19, 2, 2, 1, 50.0000, 'done');

-- D) Other Operations (Deliveries and Transfers for good measure)
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_id, location_dest_id, user_id) VALUES
(400, 'DEL-400', 'delivery', 'ready', 1, 1, 3, 1),
(401, 'DEL-401', 'delivery', 'waiting', 1, 1, 3, 2),
(500, 'INT-500', 'internal', 'ready', 1, 1, 4, 1);

INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(400, 400, 21, 1, 1, 3, 100.0000, 'assigned'),
(401, 401, 22, 1, 1, 3, 50.0000, 'waiting'),
(500, 500, 23, 1, 1, 4, 25.0000, 'assigned');
