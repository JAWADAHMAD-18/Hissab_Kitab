/** Deletes all Cache Storage entries so no data from one account lingers on a shared device. */
export async function clearAllCaches(): Promise<void> {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}
