-- Insert permission categories
INSERT INTO permission_categories (id, name, description, displayOrder)
VALUES 
    ('a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f', 'User Management', 'Permissions related to user operations', 1),
    ('b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a', 'Content Management', 'Permissions for managing content', 2),
    ('c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b', 'System Settings', 'System configuration permissions', 3),
    ('d4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c', 'Reports', 'Report viewing and generation permissions', 4);

-- Insert permission prefixes
INSERT INTO permission_prefixes (id, prefix, description)
VALUES 
    ('e5f6a7b8-c9d0-8765-9876-5e6f7a8b9c0d', 'READ', 'Read access to resources'),
    ('f6a7b8c9-d0e1-9876-0987-6f7a8b9c0d1e', 'WRITE', 'Write access to resources'),
    ('a7b8c9d0-e1f2-0987-1098-7a8b9c0d1e2f', 'DELETE', 'Delete access to resources'),
    ('b8c9d0e1-f2a3-1098-2109-8b9c0d1e2f3a', 'ADMIN', 'Administrative access');

-- Insert system permissions
INSERT INTO system_permissions (id, categoryId, prefixId, resource, permissionKey, displayName, description, isBasePermission, createdById)
VALUES 
    -- User Management Permissions
    ('c9d0e1f2-a3b4-2109-3210-9c0d1e2f3a4b', 'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f', 'e5f6a7b8-c9d0-8765-9876-5e6f7a8b9c0d', 'users', 'READ_USERS', 'View Users', 'Permission to view user list', true, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('d0e1f2a3-b4c5-3210-4321-0d1e2f3a4b5c', 'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f', 'f6a7b8c9-d0e1-9876-0987-6f7a8b9c0d1e', 'users', 'WRITE_USERS', 'Modify Users', 'Permission to modify user details', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('e1f2a3b4-c5d6-4321-5432-1e2f3a4b5c6d', 'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f', 'a7b8c9d0-e1f2-0987-1098-7a8b9c0d1e2f', 'users', 'DELETE_USERS', 'Delete Users', 'Permission to delete users', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('f2a3b4c5-d6e7-5432-6543-2f3a4b5c6d7e', 'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f', 'b8c9d0e1-f2a3-1098-2109-8b9c0d1e2f3a', 'users', 'ADMIN_USERS', 'Administer Users', 'Full administrative access to users', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    
    -- Content Management Permissions
    ('aa11bb22-cc33-4444-5555-666677778888', 'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a', 'e5f6a7b8-c9d0-8765-9876-5e6f7a8b9c0d', 'content', 'READ_CONTENT', 'View Content', 'Permission to view content', true, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('bb22cc33-dd44-5555-6666-777788889999', 'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a', 'f6a7b8c9-d0e1-9876-0987-6f7a8b9c0d1e', 'content', 'WRITE_CONTENT', 'Modify Content', 'Permission to modify content', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('cc33dd44-ee55-6666-7777-888899990000', 'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a', 'a7b8c9d0-e1f2-0987-1098-7a8b9c0d1e2f', 'content', 'DELETE_CONTENT', 'Delete Content', 'Permission to delete content', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('dd44ee55-ff66-7777-8888-999900001111', 'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a', 'b8c9d0e1-f2a3-1098-2109-8b9c0d1e2f3a', 'content', 'ADMIN_CONTENT', 'Administer Content', 'Full administrative access to content', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    
    -- System Settings Permissions
    ('ee55ff66-0077-8888-9999-000011112222', 'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b', 'e5f6a7b8-c9d0-8765-9876-5e6f7a8b9c0d', 'settings', 'READ_SETTINGS', 'View Settings', 'Permission to view system settings', true, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('ff66007-1188-9999-0000-1111222233332', 'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b', 'f6a7b8c9-d0e1-9876-0987-6f7a8b9c0d1e', 'settings', 'WRITE_SETTINGS', 'Modify Settings', 'Permission to modify system settings', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('007788991-2233-0000-1111-22223333444', 'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b', 'b8c9d0e1-f2a3-1098-2109-8b9c0d1e2f3a', 'settings', 'ADMIN_SETTINGS', 'Administer Settings', 'Full administrative access to system settings', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    
    -- Report Permissions
    ('11223344-5566-7788-9900-112233445566', 'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c', 'e5f6a7b8-c9d0-8765-9876-5e6f7a8b9c0d', 'reports', 'READ_REPORTS', 'View Reports', 'Permission to view reports', true, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('22334455-6677-8899-0011-223344556677', 'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c', 'f6a7b8c9-d0e1-9876-0987-6f7a8b9c0d1e', 'reports', 'WRITE_REPORTS', 'Create Reports', 'Permission to create and modify reports', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('33445566-7788-9900-1122-334455667788', 'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c', 'a7b8c9d0-e1f2-0987-1098-7a8b9c0d1e2f', 'reports', 'DELETE_REPORTS', 'Delete Reports', 'Permission to delete reports', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('44556677-8899-0011-2233-445566778899', 'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c', 'b8c9d0e1-f2a3-1098-2109-8b9c0d1e2f3a', 'reports', 'ADMIN_REPORTS', 'Administer Reports', 'Full administrative access to reports', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730');

-- Insert organization licensed permissions
INSERT INTO organization_licensed_permissions (id, organizationId, systemPermissionId, isActive, validFrom, createdById)
VALUES 
    -- User Management Licensed Permissions
    ('a3b4c5d6-e7f8-6543-7654-3a4b5c6d7e8f', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'c9d0e1f2-a3b4-2109-3210-9c0d1e2f3a4b', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('b4c5d6e7-f8a9-7654-8765-4b5c6d7e8f9a', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'd0e1f2a3-b4c5-3210-4321-0d1e2f3a4b5c', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('c5d6e7f8-a9b0-8765-9876-5c6d7e8f9a0b', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'e1f2a3b4-c5d6-4321-5432-1e2f3a4b5c6d', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('d6e7f8a9-b0c1-9876-0987-6d7e8f9a0b1c', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'f2a3b4c5-d6e7-5432-6543-2f3a4b5c6d7e', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    
    -- Content Management Licensed Permissions
    ('aabbccdd-eeff-0011-2233-445566778899', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'aa11bb22-cc33-4444-5555-666677778888', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('bbccddee-ff00-1122-3344-556677889900', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'bb22cc33-dd44-5555-6666-777788889999', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('ccddeeff-0011-2233-4455-667788990011', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'cc33dd44-ee55-6666-7777-888899990000', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('ddeeff00-1122-3344-5566-778899001122', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'dd44ee55-ff66-7777-8888-999900001111', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    
    -- System Settings Licensed Permissions
    ('eeff0011-2233-4455-6677-8899001122aa', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ee55ff66-0077-8888-9999-000011112222', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('ff001122-3344-5566-7788-9900112233bb', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ff66007-1188-9999-0000-1111222233332', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('00112233-4455-6677-8899-0011223344cc', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '007788991-2233-0000-1111-22223333444', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    
    -- Report Licensed Permissions
    ('11223344-5566-7788-9900-1122334455dd', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '11223344-5566-7788-9900-112233445566', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('22334455-6677-8899-0011-2233445566ee', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '22334455-6677-8899-0011-223344556677', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('33445566-7788-9900-1122-3344556677ff', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '33445566-7788-9900-1122-334455667788', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('44556677-8899-0011-2233-445566778800', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '44556677-8899-0011-2233-445566778899', true, CURRENT_TIMESTAMP, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730');

-- Insert roles
INSERT INTO role (id, name, description, organizationId, isSystemRole, createdBy)
VALUES 
    ('e7f8a9b0-c1d2-0987-1098-7e8f9a0b1c2d', 'Admin', 'Administrator role', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', true, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('f8a9b0c1-d2e3-1098-2109-8f9a0b1c2d3e', 'User', 'Standard user role', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', true, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730');


-- Insert role permissions
INSERT INTO role_permission (id, roleId, systemPermissionId, organizationId, createdBy)
VALUES 
    ('a9b0c1d2-e3f4-2109-3210-9a0b1c2d3e4f', 'e7f8a9b0-c1d2-0987-1098-7e8f9a0b1c2d', 'c9d0e1f2-a3b4-2109-3210-9c0d1e2f3a4b', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730'),
    ('b0c1d2e3-f4a5-3210-4321-0b1c2d3e4f5a', 'e7f8a9b0-c1d2-0987-1098-7e8f9a0b1c2d', 'd0e1f2a3-b4c5-3210-4321-0d1e2f3a4b5c', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730');


-- Insert user roles
INSERT INTO user_role (id, userId, roleId, organizationId)
VALUES 
    ('c1d2e3f4-a5b6-4321-5432-1c2d3e4f5a6b', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', 'e7f8a9b0-c1d2-0987-1098-7e8f9a0b1c2d', '17175c8e-20f3-4bb2-97e1-e400abfb73bf');


-- Insert user direct permissions
INSERT INTO user_direct_permissions (id, userId, systemPermissionId, organizationId, isOverride, createdBy, version)
VALUES 
    ('d2e3f4a5-b6c7-5432-6543-2d3e4f5a6b7c', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', 'e1f2a3b4-c5d6-4321-5432-1e2f3a4b5c6d', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', false, '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', 1);
