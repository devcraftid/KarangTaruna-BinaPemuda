-- Pemasukan & Pengeluaran Role enum
CREATE TYPE user_role AS ENUM ('admin', 'bendahara');
CREATE TYPE sponsor_status AS ENUM ('Belum Dikunjungi', 'Menunggu Konfirmasi', 'Sudah Memberi Sponsor');
CREATE TYPE participant_status AS ENUM ('Menunggu Verifikasi', 'Terverifikasi', 'Dibatalkan');

-- 1. Profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'bendahara',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Incomes
CREATE TABLE incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    source TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, verified
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Incomes are viewable by everyone" ON incomes FOR SELECT USING (true);
CREATE POLICY "Admins and Bendahara can insert incomes" ON incomes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update all incomes" ON incomes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
-- Bendahara can only update pending incomes
CREATE POLICY "Bendahara can update pending incomes" ON incomes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'bendahara') AND status = 'pending'
);


-- 3. Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    receipt_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, verified
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expenses are viewable by everyone" ON expenses FOR SELECT USING (true);
CREATE POLICY "Admins and Bendahara can insert expenses" ON expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update all expenses" ON expenses FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Bendahara can update pending expenses" ON expenses FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'bendahara') AND status = 'pending'
);


-- 4. Revision Requests
CREATE TABLE revision_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB NOT NULL,
    new_data JSONB NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    requested_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE revision_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and Bendahara can view revisions" ON revision_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Bendahara can insert revisions" ON revision_requests FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'bendahara')
);
CREATE POLICY "Admins can update revisions" ON revision_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- 5. Sponsors
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pic_name TEXT,
    phone TEXT,
    amount NUMERIC,
    status sponsor_status NOT NULL DEFAULT 'Belum Dikunjungi',
    logo_url TEXT,
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors are viewable by everyone" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Admins and Bendahara can insert sponsors" ON sponsors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins and Bendahara can update sponsors" ON sponsors FOR UPDATE USING (auth.role() = 'authenticated');


-- 6. Competitions
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    quota INTEGER NOT NULL DEFAULT 0,
    event_date DATE,
    event_time TIME,
    location TEXT,
    prize TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, ongoing, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competitions are viewable by everyone" ON competitions FOR SELECT USING (true);
CREATE POLICY "Admins and Bendahara can manage competitions" ON competitions FOR ALL USING (auth.role() = 'authenticated');


-- 7. Participants
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    participant_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    status participant_status NOT NULL DEFAULT 'Menunggu Verifikasi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants are viewable by everyone" ON participants FOR SELECT USING (true);
CREATE POLICY "Public can insert participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and Bendahara can update participants" ON participants FOR UPDATE USING (auth.role() = 'authenticated');


-- 8. Winners
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    first_place TEXT,
    second_place TEXT,
    third_place TEXT,
    photo_url TEXT,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published winners are viewable by everyone" ON winners FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admins and Bendahara can manage winners" ON winners FOR ALL USING (auth.role() = 'authenticated');


-- 9. Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published announcements viewable by everyone" ON announcements FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admins and Bendahara can manage announcements" ON announcements FOR ALL USING (auth.role() = 'authenticated');


-- 10. Galleries
CREATE TABLE galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    type TEXT NOT NULL, -- image, video
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Galleries are viewable by everyone" ON galleries FOR SELECT USING (true);
CREATE POLICY "Admins and Bendahara can manage galleries" ON galleries FOR ALL USING (auth.role() = 'authenticated');


-- 11. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
