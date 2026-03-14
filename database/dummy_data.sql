-- ============================================
-- Comprehensive Dummy Data for IMS Dashboard (30 Products)
-- Designed for Hackathon Presentation
-- ============================================

USE ims_odoo;

-- --------------------------------------------
-- Clean up existing data
-- --------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM stock_ledger;
DELETE FROM stock_move;
DELETE FROM stock_picking;
DELETE FROM stock_quant;
DELETE FROM products;
DELETE FROM users;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------
-- 1. Insert Users (Password: password123)
-- --------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
(1, 'manager@ims.com', '$2a$10$PNtelb83Ru2SOoFe/VLxy.gbhNRLJiIYsfE.zCIk5vDhgHYORt7FS', 'System Manager', 'inventory_manager'),
(2, 'staff@ims.com', '$2a$10$PNtelb83Ru2SOoFe/VLxy.gbhNRLJiIYsfE.zCIk5vDhgHYORt7FS', 'Warehouse Staff', 'warehouse_staff');

-- --------------------------------------------
-- 2. Insert Products (30 Items)
-- Categories: 1=Raw Materials, 2=Finished Goods, 3=Consumables
-- UoMs: 1=Units, 2=Kilograms, 3=Litres, 4=Metres, 5=Boxes
-- --------------------------------------------
INSERT INTO products (id, name, sku, category_id, uom_id, description, min_stock_qty) VALUES
-- Raw Materials (Metals & Woods)
(1, 'Steel Sheet', 'RAW-STL-001', 1, 2, 'High-grade steel sheet 5mm', 50.0000),
(2, 'Copper Wire', 'RAW-COP-001', 1, 4, '10mm pure copper wire roll', 100.0000),
(3, 'Aluminum Pipe', 'RAW-ALU-001', 1, 2, 'Hollow aluminum pipe 20ft', 20.0000),
(4, 'Oak Wood Panel', 'RAW-WOD-001', 1, 1, 'Solid oak panel 4x8', 10.0000),
(5, 'Pine Wood Beam', 'RAW-WOD-002', 1, 1, 'Structural pine beam', 15.0000),
(6, 'Brass Fitting', 'RAW-BRS-001', 1, 1, 'Small brass connector', 200.0000),
(7, 'Iron Rod', 'RAW-IRN-001', 1, 2, 'Reinforcement iron rod', 500.0000),
(8, 'Carbon Fiber Sheet', 'RAW-CRB-001', 1, 2, 'Lightweight carbon sheet', 5.0000),
(9, 'Zinc Plate', 'RAW-ZNC-001', 1, 2, 'Anti-corrosion zinc plate', 20.0000),
(10, 'Titanium Alloy Block', 'RAW-TIT-001', 1, 2, 'Aerospace grade titanium', 2.0000),

-- Consumables (Chemicals, Fasteners, Tools)
(11, 'Machine Oil', 'CON-OIL-001', 3, 3, 'Industrial lubricant', 50.0000),
(12, 'Heavy Duty Glue', 'CON-GLU-001', 3, 3, 'Industrial adhesive litre', 10.0000),
(13, 'Steel Bolts M8', 'CON-BLT-001', 3, 5, 'Box of 100 M8 bolts', 20.0000),
(14, 'Steel Nuts M8', 'CON-NUT-001', 3, 5, 'Box of 100 M8 nuts', 20.0000),
(15, 'Washers M8', 'CON-WSH-001', 3, 5, 'Box of 500 washers', 15.0000),
(16, 'Welding Rods', 'CON-WLD-001', 3, 5, 'Box of arc welding rods', 10.0000),
(17, 'Safety Gloves', 'CON-GLV-001', 3, 5, 'Box of 50 safety gloves', 5.0000),
(18, 'Masking Tape', 'CON-TAP-001', 3, 1, 'Industrial masking tape', 30.0000),
(19, 'Paint Primer', 'CON-PNT-001', 3, 3, 'Grey rust-proof primer', 15.0000),
(20, 'Cleaning Solvent', 'CON-CLN-001', 3, 3, 'Degreasing solvent', 25.0000),

-- Finished Goods
(21, 'Steel Bracket Assembly', 'FIN-BRK-001', 2, 1, 'Completed structural bracket', 100.0000),
(22, 'Copper Coil Module', 'FIN-COP-001', 2, 1, 'Wound copper electrical module', 50.0000),
(23, 'Aluminum Frame', 'FIN-ALU-001', 2, 1, 'Standard extruded frame', 20.0000),
(24, 'Wooden Desk Shell', 'FIN-DSK-001', 2, 1, 'Assembled oak/pine shell', 10.0000),
(25, 'Industrial Engine Mount', 'FIN-ENG-001', 2, 1, 'Heavy duty steel/iron mount', 15.0000),
(26, 'Carbon Fiber Panel', 'FIN-CFP-001', 2, 1, 'Treated carbon exterior panel', 5.0000),
(27, 'Brass Valve Assembly', 'FIN-VLV-001', 2, 1, 'Tested pressure valve', 25.0000),
(28, 'Tool Kit Bundle', 'FIN-KIT-001', 2, 1, 'Pre-packaged maintenance kit', 30.0000),
(29, 'Painted Steel Support', 'FIN-SUP-001', 2, 1, 'Primed and welded support', 40.0000),
(30, 'Custom Titanium Gear', 'FIN-GER-001', 2, 1, 'Precision milled gear', 5.0000);


-- --------------------------------------------
-- 3. Stock Quantities (On-hand stock)
-- We will scatter these across locations:
-- 1=Main Store, 4=Production Rack A, 5=Production Rack B
-- This sets up the dashboard counts!
-- --------------------------------------------
INSERT INTO stock_quant (product_id, location_id, quantity) VALUES
-- Out of Stock (0 qty globally): Products 8 (Carbon Fiber), 10 (Titanium), 26 (CF Panel), 30 (Titanium Gear)
-- (We just don't insert quant records, or insert 0)
(8, 1, 0.0000),
(10, 1, 0.0000),
(26, 1, 0.0000),

-- Low Stock (Below Minimum):
(1, 1, 20.0000),  -- Steel Sheet (Min 50) => LOW
(4, 1, 5.0000),   -- Oak Panel (Min 10) => LOW
(11, 4, 15.0000), -- Machine Oil (Min 50) => LOW
(22, 1, 10.0000), -- Copper Module (Min 50) => LOW
(24, 1, 2.0000),  -- Desk Shell (Min 10) => LOW

-- Normal Stock:
(2, 1, 500.0000),     (3, 1, 150.0000),     (5, 1, 200.0000),
(6, 4, 1500.0000),    (7, 1, 1200.0000),    (9, 1, 400.0000),
(12, 5, 80.0000),     (13, 1, 150.0000),    (14, 1, 150.0000),
(15, 1, 800.0000),    (16, 4, 40.0000),     (17, 1, 200.0000),
(18, 5, 120.0000),    (19, 5, 80.0000),     (20, 1, 90.0000),
(21, 1, 450.0000),    (23, 1, 320.0000),    (25, 1, 85.0000),
(27, 1, 115.0000),    (28, 1, 95.0000),     (29, 1, 210.0000);


-- --------------------------------------------
-- 4. Active Operations (Pending Receipts, Deliveries, Transfers)
-- --------------------------------------------

-- A) Pending Receipts (Vendor -> Main Store)
-- 1. Receiving Steel Sheets to fix low stock
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_dest_id, partner_name, user_id, notes) VALUES
(10, 'RCPT-0010', 'receipt', 'ready', 1, 1, 'Global Steel Corp', 1, 'Urgent steel replenishment');
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(10, 10, 1, 2, 2, 1, 1000.0000, 'assigned');

-- 2. Receiving missing Titanium
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_dest_id, partner_name, user_id, notes) VALUES
(11, 'RCPT-0011', 'receipt', 'waiting', 1, 1, 'Aerospace Metals', 1, 'Backordered titanium blocks');
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(11, 11, 10, 2, 2, 1, 50.0000, 'waiting');

-- 3. Receiving office desks
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_dest_id, partner_name, user_id, notes) VALUES
(12, 'RCPT-0012', 'receipt', 'draft', 1, 1, 'WoodWorks Inc', 2, 'Monthly desk delivery');
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(12, 12, 24, 1, 2, 1, 20.0000, 'draft');


-- B) Pending Deliveries (Main Store -> Ship Zone)
-- 1. Delivering 100 brackets
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_id, location_dest_id, partner_name, user_id) VALUES
(20, 'DEL-0020', 'delivery', 'ready', 1, 1, 3, 'MegaBuild Construction', 1);
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(20, 20, 21, 1, 1, 3, 100.0000, 'assigned');

-- 2. Delivering tool kits
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_id, location_dest_id, partner_name, user_id) VALUES
(21, 'DEL-0021', 'delivery', 'assigned', 1, 1, 3, 'City Maintenance Dept', 2);
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(21, 21, 28, 1, 1, 3, 25.0000, 'assigned');


-- C) Pending Internal Transfers (Main Store <-> Production)
-- 1. Move bolts to Production A
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_id, location_dest_id, user_id) VALUES
(30, 'INT-0030', 'internal', 'ready', 1, 1, 4, 2);
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(30, 30, 13, 5, 1, 4, 10.0000, 'assigned'),
(31, 30, 14, 5, 1, 4, 10.0000, 'assigned');

-- 2. Move primer to Production B
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_id, location_dest_id, user_id) VALUES
(32, 'INT-0031', 'internal', 'draft', 1, 1, 5, 2);
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, state) VALUES
(32, 32, 19, 3, 1, 5, 5.0000, 'draft');


-- --------------------------------------------
-- 5. Historical Operations (For Charts & Ledgers)
-- Let's add ~10 completed movements over the last week
-- --------------------------------------------
INSERT INTO stock_picking (id, name, picking_type, state, warehouse_id, location_dest_id, partner_name, done_date, user_id) VALUES
(40, 'RCPT-0001', 'receipt', 'done', 1, 1, 'Global Steel Corp', NOW() - INTERVAL 5 DAY, 1),
(41, 'RCPT-0002', 'receipt', 'done', 1, 1, 'Wire Co.', NOW() - INTERVAL 4 DAY, 1),
(42, 'RCPT-0003', 'receipt', 'done', 1, 1, 'Fasteners Ltd', NOW() - INTERVAL 3 DAY, 2),
(43, 'DEL-0001', 'delivery', 'done', 1, 3, 'Client A', NOW() - INTERVAL 2 DAY, 1),
(44, 'DEL-0002', 'delivery', 'done', 1, 3, 'Client B', NOW() - INTERVAL 1 DAY, 2);

-- Historical Moves
INSERT INTO stock_move (id, picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, quantity_done, state) VALUES
(40, 40, 1, 2, 2, 1, 500.0000, 500.0000, 'done'),
(41, 41, 2, 4, 2, 1, 1000.0000, 1000.0000, 'done'),
(42, 42, 13, 5, 2, 1, 200.0000, 200.0000, 'done'),
(43, 43, 21, 1, 1, 3, 50.0000, 50.0000, 'done'),
(44, 44, 23, 1, 1, 3, 30.0000, 30.0000, 'done');

-- Historical Ledgers
INSERT INTO stock_ledger (product_id, location_id, move_id, picking_id, quantity_before, quantity_after, quantity_change, reference, created_at) VALUES
(1, 1, 40, 40, 0, 500, 500, 'Bulk steel receipt', NOW() - INTERVAL 5 DAY),
(2, 1, 41, 41, 0, 1000, 1000, 'Copper wire delivery', NOW() - INTERVAL 4 DAY),
(13, 1, 42, 42, 0, 200, 200, 'Bolts inventory restock', NOW() - INTERVAL 3 DAY),
(21, 1, 43, 43, 500, 450, -50, 'Shipped brackets to Client A', NOW() - INTERVAL 2 DAY),
(23, 1, 44, 44, 350, 320, -30, 'Shipped frames to Client B', NOW() - INTERVAL 1 DAY);
