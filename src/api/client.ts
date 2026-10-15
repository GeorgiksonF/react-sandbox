const BASE_URL = "http://localhost:3000"

type HttpMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
    method: HttpMethods
    body?: unknown
    headers?: Record<string, string>
    abortSignal?: AbortSignal
}

async function request<TResponse>(endpoint: string, options: RequestOptions): Promise<TResponse> {
    const url = `${BASE_URL}${endpoint}`

    const config: RequestInit = {
        method: options?.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        signal: options?.abortSignal
    }

    if (options.body) {
        config.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
        const errData = response.json().catch(() => ({}))
        throw new Error(
            (errData as { message?: string }).message ??
                `Ошибка запроса: ${response.status}`
        )
    }

    if (response.status === 204) {
        return null as TResponse
    }

    return (await response.json()) as TResponse
}

export const api = {
    get: <T>(endpoint: string, abortSignal?: AbortSignal) =>
        request<T>(endpoint, { method: 'GET', abortSignal }),
    post: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'POST', body }),
    put: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PUT', body }),
    patch: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PATCH', body }),
    delete: (endpoint: string) =>
        request<null>(endpoint, { method: 'DELETE' }),
}