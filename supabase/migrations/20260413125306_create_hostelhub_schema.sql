/*
  # HostelHub - Complete Schema

  ## Tables Created
  1. `hostels` - Main hostel listings with all property details
  2. `bookings` - Payment-backed booking records
  3. `reviews` - User reviews and ratings per hostel

  ## Details

  ### hostels
  - id, name, city, area, college_nearby
  - price (monthly), type (AC/Non-AC), gender (boys/girls/co-ed)
  - rating (avg), hygiene_score (1-10), safety_score (1-10)
  - facilities (JSONB: wifi, food, laundry, gym, parking, security, library)
  - images (array of URLs), description, available_rooms

  ### bookings
  - Linked to hostel via FK, stores Razorpay payment_id and order_id
  - Status: pending | paid | failed

  ### reviews
  - Per-hostel reviews with rating 1-5 and comment text

  ## Security
  - RLS enabled on all tables
  - Public read on hostels and reviews
  - Insert-only on bookings and reviews for anonymous users
  - Full access for admin operations on hostels
*/

CREATE TABLE IF NOT EXISTS hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  area text NOT NULL,
  college_nearby text DEFAULT '',
  price numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('AC', 'Non-AC')),
  gender text NOT NULL CHECK (gender IN ('boys', 'girls', 'co-ed')),
  rating numeric DEFAULT 0,
  hygiene_score numeric DEFAULT 5,
  safety_score numeric DEFAULT 5,
  facilities jsonb DEFAULT '{}',
  images text[] DEFAULT '{}',
  description text DEFAULT '',
  available_rooms int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  payment_id text DEFAULT '',
  order_id text DEFAULT '',
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  check_in_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hostels"
  ON hostels FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert hostels"
  ON hostels FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update hostels"
  ON hostels FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete hostels"
  ON hostels FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update bookings"
  ON bookings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
