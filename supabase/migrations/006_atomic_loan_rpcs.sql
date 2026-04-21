-- Atomic checkout: locks the book row, verifies availability, decrements
-- available_copies, and inserts the loan — all in one transaction.
CREATE OR REPLACE FUNCTION checkout_book(
  p_institution_id UUID,
  p_book_id        UUID,
  p_member_id      UUID,
  p_checked_out_by UUID,
  p_due_date       DATE
) RETURNS SETOF loans
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_copies SMALLINT;
  v_loan   loans;
BEGIN
  SELECT available_copies INTO v_copies
  FROM books
  WHERE id = p_book_id AND institution_id = p_institution_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'book_not_found';
  END IF;

  IF v_copies < 1 THEN
    RAISE EXCEPTION 'no_copies_available';
  END IF;

  UPDATE books
  SET available_copies = available_copies - 1
  WHERE id = p_book_id;

  INSERT INTO loans (institution_id, book_id, member_id, checked_out_by, due_date, status)
  VALUES (p_institution_id, p_book_id, p_member_id, p_checked_out_by, p_due_date, 'active')
  RETURNING * INTO v_loan;

  RETURN NEXT v_loan;
END;
$$;

GRANT EXECUTE ON FUNCTION checkout_book(UUID, UUID, UUID, UUID, DATE) TO authenticated;

-- Atomic return: locks the loan row, updates its status, and restores
-- available_copies (unless lost) — all in one transaction.
CREATE OR REPLACE FUNCTION return_book(
  p_loan_id       UUID,
  p_checked_in_by UUID,
  p_condition     TEXT DEFAULT 'good'
) RETURNS SETOF loans
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_loan    loans;
  v_is_lost BOOLEAN;
BEGIN
  v_is_lost := p_condition = 'lost';

  UPDATE loans
  SET
    status              = CASE WHEN v_is_lost THEN 'lost' ELSE 'returned' END,
    returned_at         = NOW(),
    checked_in_by       = p_checked_in_by,
    condition_on_return = p_condition
  WHERE id = p_loan_id
    AND status IN ('active', 'overdue')
  RETURNING * INTO v_loan;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'active_loan_not_found';
  END IF;

  IF NOT v_is_lost THEN
    UPDATE books
    SET available_copies = available_copies + 1
    WHERE id = v_loan.book_id;
  END IF;

  RETURN NEXT v_loan;
END;
$$;

GRANT EXECUTE ON FUNCTION return_book(UUID, UUID, TEXT) TO authenticated;
