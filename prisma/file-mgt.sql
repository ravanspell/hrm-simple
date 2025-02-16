-- Root level folders (departments)
INSERT INTO folder (id, name, parentId, path, organizationId, createdBy, updatedBy, createdAt, updatedAt) VALUES
('d1000000-0000-4000-a000-000000000001', 'Finance', NULL, '/finance', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('d2000000-0000-4000-a000-000000000002', 'HR', NULL, '/hr', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('d3000000-0000-4000-a000-000000000003', 'Marketing', NULL, '/marketing', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('d4000000-0000-4000-a000-000000000004', 'Engineering', NULL, '/engineering', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('d5000000-0000-4000-a000-000000000005', 'Legal', NULL, '/legal', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW());

-- Finance subfolders
INSERT INTO folder (id, name, parentId, path, organizationId, createdBy, updatedBy, createdAt, updatedAt) VALUES
('f1100000-0000-4000-a000-000000000001', '2024', 'd1000000-0000-4000-a000-000000000001', '/finance/2024', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('f1110000-0000-4000-a000-000000000002', 'Q1', 'f1100000-0000-4000-a000-000000000001', '/finance/2024/q1', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('f1120000-0000-4000-a000-000000000003', 'Q2', 'f1100000-0000-4000-a000-000000000001', '/finance/2024/q2', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW());

-- HR subfolders
INSERT INTO folder (id, name, parentId, path, organizationId, createdBy, updatedBy, createdAt, updatedAt) VALUES
('f2100000-0000-4000-a000-000000000004', 'Policies', 'd2000000-0000-4000-a000-000000000002', '/hr/policies', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('f2200000-0000-4000-a000-000000000005', 'Training', 'd2000000-0000-4000-a000-000000000002', '/hr/training', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW()),
('f2300000-0000-4000-a000-000000000006', 'Benefits', 'd2000000-0000-4000-a000-000000000002', '/hr/benefits', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW());

-- Files in FileMgt table
INSERT INTO file_mgt (id, s3ObjectKey, fileName, fileSize, folderId, organizationId, fileStatus, createdBy, updatedBy, uploadedAt, updatedAt, deletionTime) VALUES
-- Finance files
('ff100000-0000-4000-a000-000000000001', 'finance/2024/q1/budget.xlsx', 'budget.xlsx', 524288, 'f1110000-0000-4000-a000-000000000002', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ACTIVE', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NULL),
('ff100000-0000-4000-a000-000000000002', 'finance/2024/q1/expenses.pdf', 'expenses.pdf', 1048576, 'f1110000-0000-4000-a000-000000000002', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ACTIVE', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NULL),
('ff100000-0000-4000-a000-000000000003', 'finance/2024/q2/forecast.xlsx', 'forecast.xlsx', 655360, 'f1120000-0000-4000-a000-000000000003', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ACTIVE', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NULL),

('ff200000-0000-4000-a000-000000000004', 'hr/policies/employee-handbook.pdf', 'employee-handbook.pdf', 2097152, 'f2100000-0000-4000-a000-000000000004', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ACTIVE', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NULL),
('ff200000-0000-4000-a000-000000000005', 'hr/policies/code-of-conduct.pdf', 'code-of-conduct.pdf', 1572864, 'f2100000-0000-4000-a000-000000000004', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ACTIVE', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NULL),
('ff200000-0000-4000-a000-000000000006', 'hr/training/onboarding.pptx', 'onboarding.pptx', 3145728, 'f2200000-0000-4000-a000-000000000005', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ACTIVE', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NULL),
('ff200000-0000-4000-a000-000000000007', 'hr/benefits/health-insurance.pdf', 'health-insurance.pdf', 1048576, 'f2300000-0000-4000-a000-000000000006', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'ACTIVE', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NULL),
('ff200000-0000-4000-a000-000000000008', 'hr/benefits/401k-plan.pdf', '401k-plan.pdf', 983040, 'f2300000-0000-4000-a000-000000000006', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'DELETED', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NOW()),

-- Deleted files with varied deletion times
('ff900000-0000-4000-a000-000000000020', 'hr/archived/old-policy.pdf', 'old-policy.pdf', 524288, 'f2100000-0000-4000-a000-000000000004', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'DELETED', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NOW()),
('ff900000-0000-4000-a000-000000000021', 'finance/archived/2023-review.xlsx', '2023-review.xlsx', 1048576, 'f1100000-0000-4000-a000-000000000001', '17175c8e-20f3-4bb2-97e1-e400abfb73bf', 'DELETED', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', NOW(), NOW(), NOW());