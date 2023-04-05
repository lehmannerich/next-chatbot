import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream'
import init from '../../utils/messages-init'
// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const MODEL = 'gpt-4'
// const MODEL = 'gpt-3.5-turbo'

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  // Quick fix: @TODO improve this
  const messages: any = init
  messages.push(...body?.messages)

  const payload: OpenAIStreamPayload = {
    model: MODEL,
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}
export default handler
