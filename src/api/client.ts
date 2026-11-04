import { z } from 'zod'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type HttpMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
	method: HttpMethods
	body?: unknown
	headers?: Record<string, string>
	abortSignal?: AbortSignal
	schema?: z.ZodType
}

async function request<TResponse>(endpoint: string, options: RequestOptions): Promise<TResponse> {
	const url = `${BASE_URL}${endpoint}`

	const config: RequestInit = {
		method: options?.method ?? 'GET',
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		signal: options?.abortSignal,
	}

	if (options.body) {
		config.body = JSON.stringify(options.body)
	}

	const response = await fetch(url, config)

	if (!response.ok) {
		const errData = (await response.json().catch(() => null)) as {
			message?: string
			error?: string
		} | null

		throw new Error(
			(errData as { message?: string }).message ?? `Ошибка запроса: ${response.status}`,
		)
	}

	if (response.status === 204) {
		return null as TResponse
	}

	const data: unknown = await response.json()

	if (options.schema) {
		const result = options.schema.safeParse(data)

		if (!result.success) {
			throw new Error(`Некорректный ответ сервера: ${z.prettifyError(result.error)}`)
		}

		return result.data as TResponse
	}

	return data as TResponse
}

export const api = {
	get: <T>(endpoint: string, abortSignal?: AbortSignal, schema?: z.ZodType<T>) =>
		request<T>(endpoint, { method: 'GET', abortSignal, schema }),
	post: <T>(endpoint: string, body: unknown, schema?: z.ZodType<T>) =>
		request<T>(endpoint, { method: 'POST', body, schema }),
	put: <T>(endpoint: string, body: unknown, schema?: z.ZodType<T>) =>
		request<T>(endpoint, { method: 'PUT', body, schema }),
	patch: <T>(endpoint: string, body: unknown, schema?: z.ZodType<T>) =>
		request<T>(endpoint, { method: 'PATCH', body, schema }),
	delete: (endpoint: string) => request<null>(endpoint, { method: 'DELETE' }),
}
