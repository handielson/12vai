-- Migration: Create Support Tickets System
-- Description: Creates tables for support ticket management with messages and status tracking
-- Author: System
-- Date: 2026-01-20

-- ============================================================================
-- 1. Create support_tickets table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- ============================================================================
-- 2. Create ticket_messages table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT message_not_empty CHECK (LENGTH(TRIM(message)) > 0)
);

-- ============================================================================
-- 3. Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);

-- ============================================================================
-- 4. Create function to generate ticket number
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    new_number := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get count of tickets created today
    SELECT COUNT(*) INTO counter
    FROM public.support_tickets
    WHERE ticket_number LIKE new_number || '%';
    
    -- Increment counter
    counter := counter + 1;
    
    -- Format: YYYYMMDD-NNNN (e.g., 20260120-0001)
    new_number := new_number || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Create trigger to auto-generate ticket number
-- ============================================================================
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- ============================================================================
-- 6. Create trigger to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_ticket_timestamp
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_ticket_timestamp();

-- ============================================================================
-- 7. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view own tickets"
    ON public.support_tickets
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Users can create tickets
CREATE POLICY "Users can create tickets"
    ON public.support_tickets
    FOR INSERT
    WITH CHECK (true);

-- Policy: Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
    ON public.support_tickets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Policy: Admins can update tickets
CREATE POLICY "Admins can update tickets"
    ON public.support_tickets
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Policy: Users can view messages from their tickets
CREATE POLICY "Users can view own ticket messages"
    ON public.ticket_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_messages.ticket_id
            AND (
                user_id = auth.uid()
                OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );

-- Policy: Users can add messages to their tickets
CREATE POLICY "Users can add messages to own tickets"
    ON public.ticket_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_messages.ticket_id
            AND (
                user_id = auth.uid()
                OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );

-- Policy: Admins can view all messages
CREATE POLICY "Admins can view all messages"
    ON public.ticket_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Policy: Admins can add messages to any ticket
CREATE POLICY "Admins can add messages to any ticket"
    ON public.ticket_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================================================
-- 8. Grant permissions
-- ============================================================================
GRANT SELECT, INSERT ON public.support_tickets TO authenticated;
GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
GRANT ALL ON public.ticket_messages TO service_role;

-- ============================================================================
-- 9. Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.support_tickets IS 'Stores support tickets submitted by users';
COMMENT ON TABLE public.ticket_messages IS 'Stores messages/replies within support tickets';
COMMENT ON COLUMN public.support_tickets.ticket_number IS 'Auto-generated unique ticket identifier (format: YYYYMMDD-NNNN)';
COMMENT ON COLUMN public.support_tickets.status IS 'Ticket status: open, in_progress, resolved, closed';
COMMENT ON COLUMN public.support_tickets.priority IS 'Ticket priority: low, normal, high, urgent';
COMMENT ON COLUMN public.ticket_messages.is_admin IS 'True if message is from admin/support staff';
COMMENT ON COLUMN public.ticket_messages.is_internal IS 'True if message is internal note (not visible to customer)';
