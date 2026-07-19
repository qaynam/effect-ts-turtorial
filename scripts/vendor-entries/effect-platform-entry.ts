/**
 * サンドボックス用 @effect/platform ファサード。
 * パッケージ全体(HttpApi / OpenApi 等を含む 5MB 超)は重すぎるため、
 * チュートリアルで扱う HTTP クライアント関連モジュールのみ再エクスポートする。
 */
export * as FetchHttpClient from "@effect/platform/FetchHttpClient"
export * as Headers from "@effect/platform/Headers"
export * as HttpBody from "@effect/platform/HttpBody"
export * as HttpClient from "@effect/platform/HttpClient"
export * as HttpClientError from "@effect/platform/HttpClientError"
export * as HttpClientRequest from "@effect/platform/HttpClientRequest"
export * as HttpClientResponse from "@effect/platform/HttpClientResponse"
export * as UrlParams from "@effect/platform/UrlParams"
