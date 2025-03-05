
-- Create notifications table if it doesn't exist yet
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'notifications') THEN
        CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id),
            message TEXT NOT NULL,
            type TEXT,
            related_item UUID REFERENCES public.items(id),
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

        -- Add policies for notifications
        CREATE POLICY "Users can view their own notifications"
            ON public.notifications FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own notifications"
            ON public.notifications FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create trigger for low stock notifications
CREATE OR REPLACE FUNCTION public.create_low_stock_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- If quantity drops below threshold, create notification
  IF NEW.quantity < NEW.low_stock_threshold THEN
    INSERT INTO public.notifications (
      user_id,
      message,
      type,
      related_item
    )
    SELECT
      auth.uid(),
      'Item "' || NEW.name || '" has low stock: ' || NEW.quantity || ' units left (threshold: ' || NEW.low_stock_threshold || ')',
      'low_stock',
      NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'low_stock_notification_trigger'
  ) THEN
    CREATE TRIGGER low_stock_notification_trigger
    AFTER UPDATE OF quantity ON public.items
    FOR EACH ROW
    WHEN (NEW.quantity < NEW.low_stock_threshold)
    EXECUTE FUNCTION public.create_low_stock_notification();
  END IF;
END
$$;

-- Enable RLS on notification table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
