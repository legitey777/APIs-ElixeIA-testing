/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI, { ChatMessage, ChatResponse, Prompt } from '../src'
import {
    ChatModel,
    ChatModelProvider,
    ChatRoleEnum,
    EmbedModelProvider,
    ModelProvider,
    OpenAIChatModel,
    OpenAIEmbedModel
} from '../interface/Enum'
import { Readable } from 'stream'
import { readFileSync } from 'fs'
import path from 'path'

const { OPENAI_KEY, OPENAI_API } = process.env

const input: string = 'Introduce yourself briefly'
const input2: ChatMessage[] = [
    {
        role: ChatRoleEnum.USER,
        content: ['图片1描述了什么', '图片2描述了什么'],
        img: [
            'https://img2.baidu.com/it/u=2595743336,2138195985&fm=253&fmt=auto?w=801&h=800',
            'https://img0.baidu.com/it/u=3185399917,3849606089&fm=253&fmt=auto&app=138&f=JPEG?w=809&h=800'
        ]
    }
]

const input3: ChatMessage[] = [
    { role: ChatRoleEnum.SYSTEM, content: '你是一个翻译官！翻译中文为英文！' },
    { role: ChatRoleEnum.USER, content: '你好，你是谁？' },
    { role: ChatRoleEnum.ASSISTANT, content: 'Hello, who are you?' },
    { role: ChatRoleEnum.USER, content: ['你是一个聪明的模型', '其实你不是聪明的模型', '这两句话矛盾吗？'] }
]

const prompt: Prompt = new Prompt('机器人', '你是一个机器人，以下是关于你的基本信息', [
    new Prompt('基本信息', '- 姓名：小智\n- 年龄：18\n- 性别：男'),
    new Prompt('技能', '- 语言：中文、英文\n- 职业：程序员\n- 爱好：打游戏、看电影'),
    new Prompt('外观', '对你的外观进行描述', [
        new Prompt('外观描述', '- 身高：180cm\n- 体重：70kg\n- 头发颜色：黑色\n- 眼睛颜色：棕色'),
        new Prompt('服装', '- 上衣：黑色T恤\n- 裤子：蓝色牛仔裤\n- 鞋子：白色运动鞋')
    ])
])
const input4: ChatMessage[] = [
    { role: ChatRoleEnum.SYSTEM, content: prompt.toString() },
    { role: ChatRoleEnum.USER, content: '你是谁？简短介绍下你自己得特点' }
]

const audio = readFileSync(path.join(__dirname, 'test.wav')).toString('base64')
// for audio base64 input test
const input5: ChatMessage[] = [
    {
        role: ChatRoleEnum.USER,
        content: ['我一共给你发了几段语音？', '分别说了什么？', '有区别吗？'],
        audio: [audio, audio]
    }
]

let uni: UniAI

beforeAll(() => (uni = new UniAI({ OpenAI: { key: OPENAI_KEY.split(','), proxy: OPENAI_API } })))

describe('OpenAI tests', () => {
    test('Test list OpenAI models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.OpenAI)[0]
        console.log(provider)
        expect(provider.models.length).toEqual(Object.values(OpenAIChatModel).length)
        expect(provider.provider).toEqual('OpenAI')
        expect(provider.value).toEqual(ModelProvider.OpenAI)
    })

    test('Test chat openai default, gpt-4.1', done => {
        uni.chat(input2, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT_4_1 })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai default, gpt-4.1-mini', done => {
        uni.chat(input2, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT_4_1_MINI })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai default, gpt-4.1-nano', done => {
        uni.chat(input4, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT_4_1_NANO })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai default, gpt-4o', done => {
        uni.chat(input2).then(console.log).catch(console.error).finally(done)
    }, 60000)

    test('Test chat openai default, gpt-4o-audio-preview', done => {
        uni.chat(input5, { stream: false, provider: ChatModelProvider.OpenAI, model: ChatModel.GPT_4O_AUDIO })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai gpt-3.5-turbo', done => {
        uni.chat(input, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT3 })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat openai gpt-4o-mini', done => {
        uni.chat(input2, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT_4O_MINI })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai chatgpt-4o-latest', done => {
        uni.chat(input2, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.CHAT_GPT_4O })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai gpt-4 stream', done => {
        uni.chat(input3, { stream: true, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT4 }).then(
            res => {
                expect(res).toBeInstanceOf(Readable)
                const stream = res as Readable
                let data = ''
                stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
                stream.on('end', () => console.log(data))
                stream.on('error', e => console.error(e))
                stream.on('close', () => done())
            }
        )
    })

    test('Test chat openai gpt-4 turbo with vision', done => {
        uni.chat(input2, { stream: true, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT4_TURBO }).then(
            res => {
                expect(res).toBeInstanceOf(Readable)
                const stream = res as Readable
                let data = ''
                stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
                stream.on('end', () => console.log(data))
                stream.on('error', e => console.error(e))
                stream.on('close', () => done())
            }
        )
    }, 60000)

    test('Test chat openai o1', done => {
        uni.chat(input, { stream: true, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.O1 }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    }, 60000)

    test('Test chat openai o1-pro', done => {
        uni.chat(input3, { stream: true, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.O1_PRO }).then(
            res => {
                expect(res).toBeInstanceOf(Readable)
                const stream = res as Readable
                let data = ''
                stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
                stream.on('end', () => console.log(data))
                stream.on('error', e => console.error(e))
                stream.on('close', () => done())
            }
        )
    }, 60000)

    test('Test chat openai o1-mini', done => {
        uni.chat(input, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.O1_MINI })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai o3-mini', done => {
        uni.chat(input2, { stream: false, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.O3_MINI })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai gpt-4o-mini with tools', done => {
        const tools = [
            {
                type: 'function',
                function: {
                    name: 'get_weather',
                    description: 'Get current temperature for a given location.',
                    parameters: {
                        type: 'object',
                        properties: {
                            location: {
                                type: 'string',
                                description: 'City and country e.g. Bogotá, Colombia, should in English'
                            }
                        },
                        required: ['location'],
                        additionalProperties: false
                    },
                    strict: true
                }
            }
        ]
        uni.chat('今天澳门天气如何？', {
            stream: false,
            provider: ChatModelProvider.OpenAI,
            model: OpenAIChatModel.GPT_4O_MINI,
            tools
        })
            .then(r => console.log((r as ChatResponse).tools))
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat openai gpt-5-nano stream', done => {
        uni.chat('给我做几个emoji表情，表现出你的愤怒', {
            stream: true,
            provider: ChatModelProvider.OpenAI,
            model: OpenAIChatModel.GPT_5_NANO
        }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    })

    test.only('Test chat openai gpt-5 stream', done => {
        uni.chat('给我做几个emoji表情，表现出你的愤怒', {
            stream: true,
            provider: ChatModelProvider.OpenAI,
            model: OpenAIChatModel.GPT_5
        }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    })

    test('Test OpenAI/text-embedding-ada2 embedding', done => {
        uni.embedding(input, { provider: EmbedModelProvider.OpenAI, model: OpenAIEmbedModel.ADA })
            .then(res => expect(res.embedding.length).toBe(1))
            .catch(console.error)
            .finally(done)
    })

    test('Test OpenAI/text-embedding-3-large embedding', done => {
        uni.embedding(input, { provider: EmbedModelProvider.OpenAI, model: OpenAIEmbedModel.LARGE })
            .then(res => expect(res.embedding.length).toBe(1))
            .catch(console.error)
            .finally(done)
    })

    test('Test OpenAI/text-embedding-3-small embedding', done => {
        uni.embedding(input, { provider: EmbedModelProvider.OpenAI, model: OpenAIEmbedModel.SMALL })
            .then(res => expect(res.embedding.length).toBe(1))
            .catch(console.error)
            .finally(done)
    })
})
