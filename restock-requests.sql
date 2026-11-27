-- Create back-in-stock notification table for TheToysVirago
CREATE TABLE IF NOT EXISTS public.restock_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL,
  product_title text,
  email text NOT NULL,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restock_requests_product_pending
  ON public.restock_requests (product_id, notified);

ALTER TABLE public.restock_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public restock subscribe" ON public.restock_requests;
CREATE POLICY "Allow public restock subscribe"
  ON public.restock_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow restock read" ON public.restock_requests;
CREATE POLICY "Allow restock read"
  ON public.restock_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow restock update" ON public.restock_requests;
CREATE POLICY "Allow restock update"
  ON public.restock_requests FOR UPDATE
  USING (true)
  WITH CHECK (true);
