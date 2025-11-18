'use client'

import { useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Home() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [prompts, setPrompts] = useState<any>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: 输入, 2: 分析结果, 3: Prompt 展示

  const handleAnalyze = async () => {
    if (!title || !content) {
      setError('请填写标题和内容')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 第一步：分析小说
      const analyzeRes = await axios.post(`${API_URL}/api/novel/analyze`, {
        title,
        content,
      })

      setResult(analyzeRes.data.data)
      setStep(2)

      // 第二步：生成 Prompt
      const novelId = analyzeRes.data.data.novel.id
      const promptRes = await axios.post(`${API_URL}/api/prompt/generate`, {
        novelId,
      })

      setPrompts(promptRes.data.data)
      setStep(3)
    } catch (err: any) {
      console.error('错误:', err)
      setError(err.response?.data?.error || '处理失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板！')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          小说转动画工作流
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          AI 驱动的创作助手，帮你将文字变成画面
        </p>
      </div>

      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
              1
            </div>
            <span className="ml-2 font-medium">输入小说</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
              2
            </div>
            <span className="ml-2 font-medium">AI 分析</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 3 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
              3
            </div>
            <span className="ml-2 font-medium">生成 Prompt</span>
          </div>
        </div>
      </div>

      {/* 步骤 1: 输入表单 */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                小说标题
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                placeholder="例如：魔法学院的日常"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                小说内容
              </label>
              <textarea
                id="content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                placeholder="粘贴你的小说内容..."
              />
              <p className="mt-2 text-sm text-gray-500">
                字数：{content.length} | 建议 500-5000 字获得最佳效果
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? '处理中...' : '开始分析并生成 Prompt'}
            </button>
          </div>
        </div>
      )}

      {/* 步骤 2 & 3: 结果展示 */}
      {step >= 2 && result && (
        <div className="space-y-8">
          {/* 小说信息 */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {result.novel.title}
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-3xl font-bold text-blue-600">
                  {result.characters?.length || 0}
                </div>
                <div className="text-sm text-gray-600">角色</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-3xl font-bold text-green-600">
                  {result.scenes?.length || 0}
                </div>
                <div className="text-sm text-gray-600">场景</div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-3xl font-bold text-purple-600">
                  {result.novel.word_count || 0}
                </div>
                <div className="text-sm text-gray-600">字数</div>
              </div>
            </div>
          </div>

          {/* 角色列表 */}
          {result.characters && result.characters.length > 0 && (
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">提取的角色</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.characters.map((char: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-indigo-600">{char.name}</h4>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                        {char.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{char.description}</p>
                    <div className="text-sm">
                      <p className="text-gray-700"><strong>外貌：</strong>{char.appearance}</p>
                      <p className="text-gray-700"><strong>性格：</strong>{char.personality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 场景列表 */}
          {result.scenes && result.scenes.length > 0 && (
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">场景分析</h3>
              <div className="space-y-4">
                {result.scenes.map((scene: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-bold text-gray-900">
                      场景 {scene.scene_number}: {scene.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{scene.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>📍 {scene.location}</span>
                      <span>🕐 {scene.time_of_day}</span>
                      <span>🎭 {scene.atmosphere}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt 展示 */}
          {step === 3 && prompts && (
            <>
              {/* 角色 Prompt */}
              {prompts.characterPrompts && prompts.characterPrompts.length > 0 && (
                <div className="bg-white rounded-lg shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🎨 角色图像 Prompt
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    复制以下 Prompt 到 Midjourney、Stable Diffusion 等工具生成角色图像
                  </p>
                  <div className="space-y-4">
                    {prompts.characterPrompts.map((prompt: any, idx: number) => {
                      const character = result.characters.find(
                        (c: any) => c.id === prompt.reference_id
                      )
                      return (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-indigo-600">
                              {character?.name || `角色 ${idx + 1}`}
                            </h4>
                            <button
                              onClick={() => copyToClipboard(prompt.prompt)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                            >
                              📋 复制 Prompt
                            </button>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm font-mono text-gray-800">
                              {prompt.prompt}
                            </p>
                          </div>
                          {prompt.negative_prompt && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 mb-1">Negative Prompt:</p>
                              <div className="bg-red-50 p-2 rounded border border-red-200">
                                <p className="text-xs font-mono text-gray-700">
                                  {prompt.negative_prompt}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 场景 Prompt */}
              {prompts.scenePrompts && prompts.scenePrompts.length > 0 && (
                <div className="bg-white rounded-lg shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🏞️ 场景图像 Prompt
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    复制以下 Prompt 生成场景背景图
                  </p>
                  <div className="space-y-4">
                    {prompts.scenePrompts.map((prompt: any, idx: number) => {
                      const scene = result.scenes.find(
                        (s: any) => s.id === prompt.reference_id
                      )
                      return (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-green-600">
                              {scene?.title || `场景 ${idx + 1}`}
                            </h4>
                            <button
                              onClick={() => copyToClipboard(prompt.prompt)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              📋 复制 Prompt
                            </button>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm font-mono text-gray-800">
                              {prompt.prompt}
                            </p>
                          </div>
                          {prompt.negative_prompt && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 mb-1">Negative Prompt:</p>
                              <div className="bg-red-50 p-2 rounded border border-red-200">
                                <p className="text-xs font-mono text-gray-700">
                                  {prompt.negative_prompt}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 下一步提示 */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-indigo-900 mb-2">
                  ✨ 下一步
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-indigo-800">
                  <li>复制上面的 Prompt 到 Midjourney/Stable Diffusion 等工具</li>
                  <li>生成角色和场景图像</li>
                  <li>回到本系统上传生成的图像（即将支持）</li>
                  <li>系统将生成动画化 Prompt 供视频生成工具使用</li>
                </ol>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setStep(1)
                    setTitle('')
                    setContent('')
                    setResult(null)
                    setPrompts(null)
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  开始新项目
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
