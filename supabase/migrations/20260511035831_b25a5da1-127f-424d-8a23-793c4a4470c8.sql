
CREATE OR REPLACE FUNCTION public.validate_script_client_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.clients
      WHERE id = NEW.client_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'client_id does not belong to user_id (cross-tenant write blocked)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_script_client_ownership ON public.generated_scripts;
CREATE TRIGGER trg_validate_script_client_ownership
BEFORE INSERT OR UPDATE ON public.generated_scripts
FOR EACH ROW EXECUTE FUNCTION public.validate_script_client_ownership();
