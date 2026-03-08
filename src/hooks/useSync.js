import { useState, useCallback, useRef } from "react";

export function useSync(token) {
  const [syncStatus, setSyncStatus] = useState("idle"); // "idle"|"syncing"|"ok"|"error"|"offline"
  const [shareCode,  setShareCode]  = useState(null);
  const debounceRef = useRef(null);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Sube los datos de un bebé al servidor
  const push = useCallback(async (babyId, babyData) => {
    if (!token) return;
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/sync/push", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ babyId, babyData }),
      });
      if (!res.ok) { setSyncStatus("error"); return; }
      const json = await res.json();
      if (json.shareCode) setShareCode(json.shareCode);
      setSyncStatus("ok");
    } catch {
      setSyncStatus("offline");
    }
  }, [token, authHeaders]);

  // Descarga los datos de un bebé del servidor
  const pull = useCallback(async (babyId) => {
    if (!token) return null;
    try {
      const res = await fetch(`/api/sync/pull/${babyId}`, { headers: authHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.shareCode) setShareCode(json.shareCode);
      return json.data;
    } catch {
      return null;
    }
  }, [token, authHeaders]);

  // Unirse a un bebé compartido con código
  const joinByCode = useCallback(async (shareCode) => {
    if (!token) return null;
    try {
      const res = await fetch("/api/sync/join", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ shareCode }),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.error };
      return { babyId: json.babyId, data: json.data };
    } catch {
      return { error: "Error de conexión." };
    }
  }, [token, authHeaders]);

  // Push con debounce (para llamar en cada cambio de datos)
  const debouncedPush = useCallback((babyId, babyData, delay = 2000) => {
    if (!token) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(babyId, babyData), delay);
  }, [token, push]);

  return { syncStatus, shareCode, push, pull, joinByCode, debouncedPush };
}
