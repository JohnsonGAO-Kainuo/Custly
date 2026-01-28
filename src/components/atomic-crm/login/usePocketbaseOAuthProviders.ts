import { useEffect, useState } from "react";
import { fetchOAuthProviders } from "../providers/pocketbase/client";

export const usePocketbaseOAuthProviders = (
  enabled: boolean,
  redirectUrl?: string,
) => {
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);
    fetchOAuthProviders(redirectUrl)
      .then((items) => {
        if (!active) return;
        setProviders(items.map((item) => item.name));
      })
      .catch(() => {
        if (!active) return;
        setProviders([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled, redirectUrl]);

  return { providers, loading };
};
