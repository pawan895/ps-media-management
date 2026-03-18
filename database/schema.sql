-- PS Media Database Schema
-- Complete schema for business management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'client');

-- Client status enum  
CREATE TYPE client_status AS ENUM ('lead', 'prospect', 'active', 'inactive', 'churned');

-- Project status enum
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed', 'cancelled');

-- Invoice status enum
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Feature status enum
CREATE TYPE feature_status AS ENUM ('requested', 'planned', 'in-progress', 'completed', 'declined');

-- Lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost');

-- Task status enum
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'review', 'done');

-- Priority enum
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- CLIENTS & CONTACTS
-- ============================================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    status client_status NOT NULL DEFAULT 'lead',
    industry VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    gstin VARCHAR(50),
    pan VARCHAR(50),
    notes TEXT,
    tags TEXT[], -- Array of tags
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- Link to user account if client has portal access
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS & TASKS
-- ============================================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    spent DECIMAL(12, 2) DEFAULT 0,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority priority_level DEFAULT 'medium',
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority priority_level DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    estimated_hours DECIMAL(5, 2),
    actual_hours DECIMAL(5, 2),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INVOICES & RECEIPTS
-- ============================================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    status invoice_status NOT NULL DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00, -- GST rate
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    terms TEXT,
    bank_details TEXT,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(100),
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE src_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    client_id UUID REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'src', 'sow', 'proposal'
    version INT NOT NULL DEFAULT 1,
    content JSONB, -- Store structured content
    html_content TEXT, -- Rendered HTML
    status VARCHAR(50) DEFAULT 'draft',
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    file_url TEXT, -- Link to generated PDF
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    entity_type VARCHAR(50), -- 'client', 'project', 'invoice', etc.
    entity_id UUID NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- FEATURES & MEETINGS
-- ============================================================================

CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status feature_status NOT NULL DEFAULT 'requested',
    priority priority_level DEFAULT 'medium',
    votes INT NOT NULL DEFAULT 0,
    estimated_hours DECIMAL(5, 2),
    requested_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE feature_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(feature_id, user_id)
);

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date TIMESTAMPTZ NOT NULL,
    duration_minutes INT,
    location VARCHAR(255),
    meeting_url VARCHAR(255),
    notes TEXT,
    action_items JSONB, -- Array of action items with status
    attendees UUID[], -- Array of user IDs
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- OUTREACH & LEADS
-- ============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    status lead_status NOT NULL DEFAULT 'new',
    source VARCHAR(100), -- 'website', 'referral', 'linkedin', 'cold-outreach'
    industry VARCHAR(100),
    estimated_value DECIMAL(12, 2),
    notes TEXT,
    tags TEXT[],
    last_contact_date DATE,
    next_follow_up_date DATE,
    assigned_to UUID REFERENCES users(id),
    converted_to_client_id UUID REFERENCES clients(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    client_id UUID REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    content JSONB,
    value DECIMAL(12, 2),
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- COMMUNICATIONS & NOTIFICATIONS
-- ============================================================================

CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    type VARCHAR(50) NOT NULL, -- 'email', 'call', 'meeting', 'message'
    subject VARCHAR(255),
    message TEXT,
    direction VARCHAR(20), -- 'inbound', 'outbound'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50), -- 'invoice', 'project', 'task', 'meeting'
    entity_type VARCHAR(50),
    entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_features_client_id ON features(client_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Admin can see everything
CREATE POLICY admin_all ON users FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- Clients can only see their own data
CREATE POLICY client_own_data ON clients FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    id IN (
        SELECT client_id FROM contacts WHERE user_id = auth.uid()
    )
);

CREATE POLICY client_own_projects ON projects FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    client_id IN (
        SELECT client_id FROM contacts WHERE user_id = auth.uid()
    )
);

CREATE POLICY client_own_invoices ON invoices FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    client_id IN (
        SELECT client_id FROM contacts WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_num INT;
BEGIN
    year_prefix := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INT)), 0) + 1
    INTO next_num
    FROM invoices
    WHERE invoice_number LIKE year_prefix || '%';
    
    NEW.invoice_number := year_prefix || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_invoice_number BEFORE INSERT ON invoices
    FOR EACH ROW WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION generate_invoice_number();

-- Function to auto-generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_num INT;
BEGIN
    year_prefix := 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM '\d+$') AS INT)), 0) + 1
    INTO next_num
    FROM receipts
    WHERE receipt_number LIKE year_prefix || '%';
    
    NEW.receipt_number := year_prefix || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_receipt_number BEFORE INSERT ON receipts
    FOR EACH ROW WHEN (NEW.receipt_number IS NULL)
    EXECUTE FUNCTION generate_receipt_number();

-- ============================================================================
-- SAMPLE DATA (for development)
-- ============================================================================

-- Insert admin user (password will be set via auth system)
INSERT INTO users (id, email, name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@psmedia.com', 'PS Media Admin', 'admin');

COMMENT ON DATABASE postgres IS 'PS Media Business Management System';
