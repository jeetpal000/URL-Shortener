import 'dotenv/config'
import {z, ZodError} from 'zod'

const portSchema = z.coerce.number().min(1).max(65535).default(3001);

export const PORT = portSchema.parse(process.env.PORT)