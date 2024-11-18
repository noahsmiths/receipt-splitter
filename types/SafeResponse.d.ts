/** A safe response that will either be `{ res: T }` or `{ error: string }` */
type SafeResponse<T> = {
  error: string,
  res?: never
} | {
  error?: never,
  res: T
}
// type SafeResponse<T> = T | { error: string }