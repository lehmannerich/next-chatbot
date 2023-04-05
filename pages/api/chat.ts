import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream';
import init from '../../utils/messages-init';
import { MODEL, Message } from '../../utils/types';

export const config = {
  runtime: 'edge',
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  // Quick fix: @TODO improve this
  const messages: Message[] = init
  messages.push(...body?.messages)

  console.log("Calling:");
  console.log(messages);


  const payload: OpenAIStreamPayload = {
    model: MODEL,
    messages: messages,
    temperature: 0,
    max_tokens: 150,
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
