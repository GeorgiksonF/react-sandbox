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

export class ApiError extends Error {
	readonly status: number
	readonly body: unknown
	readonly url: string

	constructor(message: string, options: { status: number; body: unknown; url: string }) {
		super(message)
		this.name = 'ApiError'
		this.status = options.status
		this.body = options.body
		this.url = options.url
	}
}

export class ResponseValidationError extends Error {
	readonly url: string
	readonly issues: z.ZodError

	constructor(url: string, issues: z.ZodError) {
		super(`Некорректный ответ сервера: ${z.prettifyError(issues)}`, { cause: issues })
		this.name = 'ResponseValidationError'
		this.url = url
		this.issues = issues
	}
}

async function request<TResponse>(endpoint: string, options: RequestOptions): Promise<TResponse> {
	const url = `${BASE_URL}${endpoint}`
	const hasBody = options.body !== undefined

	const config: RequestInit = {
		method: options.method,
		headers: {
			...(hasBody ? { 'Content-Type': 'application/json' } : {}),
			...options.headers,
		},
		signal: options.abortSignal,
	}

	if (hasBody) {
		config.body = JSON.stringify(options.body)
	}

	const response = await fetch(url, config)

	if (!response.ok) {
		const errData = (await response.json().catch(() => null)) as {
			message?: string
			error?: string
		} | null

		throw new ApiError(
			errData?.message ?? errData?.error ?? `Ошибка запроса: ${response.status}`,
			{
				status: response.status,
				body: errData,
				url,
			},
		)
	}

	if (response.status === 204) {
		return null as TResponse
	}

	const data: unknown = await response.json()

	if (options.schema) {
		const result = options.schema.safeParse(data)

		if (!result.success) {
			throw new ResponseValidationError(url, result.error)
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
