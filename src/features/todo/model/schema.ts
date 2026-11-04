import { z } from 'zod'

export const STATUS_VALUES = ['waiting', 'pending', 'ready'] as const
export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const

export const statusSchema = z.enum(STATUS_VALUES)
export const prioritySchema = z.enum(PRIORITY_VALUES)

type SelectValues = readonly [string, ...string[]]

function requiredSelect<T extends SelectValues>(values: T, message: string) {
	return z
		.enum(values)
		.nullable()
		.transform((value, ctx) => {
			if (value === null) {
				ctx.addIssue({ code: 'custom', message })
				return z.NEVER
			}

			return value
		})
}

export const todoFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'Введите название')
		.max(100, 'Название не должно быть длиннее 100 символов'),
	description: z.string().trim().max(500, 'Описание не должно быть длиннее 500 символов'),
	status: requiredSelect(STATUS_VALUES, 'Выберите статус'),
	priority: requiredSelect(PRIORITY_VALUES, 'Выберите приоритет'),
})

export const todoSchema = todoFormSchema.extend({
	id: z.string(),
	createdAt: z.iso.datetime(),
})
