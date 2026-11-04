import type { z } from 'zod'
import type { prioritySchema, statusSchema, todoFormSchema, todoSchema } from './schema'

export type Status = z.infer<typeof statusSchema>
export type Priority = z.infer<typeof prioritySchema>
export type TodoFormData = z.infer<typeof todoFormSchema>
export type Todo = z.infer<typeof todoSchema>
