-- Core Tables
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE TABLE permission_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(name)
);

CREATE TABLE permission_prefixes (
    id UUID PRIMARY KEY,
    prefix VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(prefix)
);

CREATE TABLE system_permissions (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES permission_categories(id),
    prefix_id UUID NOT NULL REFERENCES permission_prefixes(id),
    resource VARCHAR(255) NOT NULL,
    permission_key VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_base_permission BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    updated_by_id UUID,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(permission_key),
    UNIQUE(prefix_id, resource)
);

CREATE TABLE organization_licensed_permissions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    system_permission_id UUID NOT NULL REFERENCES system_permissions(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    updated_by_id UUID,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(organization_id, system_permission_id)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    is_system_role BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    updated_by_id UUID,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(organization_id, name)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    system_permission_id UUID NOT NULL REFERENCES system_permissions(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(role_id, system_permission_id),
    CONSTRAINT valid_org_permission FOREIGN KEY (organization_id, system_permission_id) 
        REFERENCES organization_licensed_permissions(organization_id, system_permission_id)
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(user_id, role_id)
);

CREATE TABLE user_direct_permissions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    system_permission_id UUID NOT NULL REFERENCES system_permissions(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    is_override BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    updated_by_id UUID,
    version INT NOT NULL DEFAULT 0,
    UNIQUE(user_id, system_permission_id),
    CONSTRAINT valid_org_permission FOREIGN KEY (organization_id, system_permission_id) 
        REFERENCES organization_licensed_permissions(organization_id, system_permission_id)
);

CREATE TABLE effective_user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    permission_id UUID NOT NULL REFERENCES system_permissions(id),
    origin VARCHAR(20) CHECK (origin IN ('ROLE', 'DIRECT', 'OVERRIDE')),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, permission_id)
);

CREATE TABLE permission_changes_log (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    system_permission_id UUID REFERENCES system_permissions(id),
    change_type VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL
);

-- Indexes for Optimized Access Patterns
CREATE UNIQUE INDEX idx_user_permissions ON effective_user_permissions(user_id, permission_id);
CREATE INDEX idx_roles_org ON roles(organization_id, name);
CREATE INDEX idx_user_roles_user ON user_roles(user_id, organization_id);
CREATE INDEX idx_permission_log_entity ON permission_changes_log(entity_type, entity_id, organization_id);
CREATE INDEX idx_permission_log_time ON permission_changes_log(organization_id, created_at);
CREATE INDEX idx_olf_active_permission ON organization_licensed_permissions (organization_id, system_permission_id, is_active);
CREATE INDEX idx_user_direct_permissions ON user_direct_permissions (user_id, organization_id, system_permission_id);
CREATE INDEX idx_effective_user_permissions ON effective_user_permissions (user_id, organization_id);
