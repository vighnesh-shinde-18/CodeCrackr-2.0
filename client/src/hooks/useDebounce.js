import { useEffect, useState } from "react";

export function useDebounce(value, delay = 400) {
  // 1. State to store the delayed value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 2. Set a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 3. CLEANUP: If the user types again *before* the delay ends,
    // this clears the old timer. This is the logic that prevents the spam.
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}