'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NovelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const novelId = params.id

  const [novel, setNovel] = useState<any>(null)
  const [characters, setCharacters] = useState<any[]>([])
  const [scenes, setScenes] = useState<any[]>([])
  const [imagePrompts, setImagePrompts] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [animationPrompts, setAnimationPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState('prompts') // prompts | images | animations

  useEffect(() => {
    loadNovelData()
  }, [novelId])

  const loadNovelData = async () => {
    try {
      // 加载小说详情
      const novelRes = await axios.get(`${API_URL}/api/novel/${novelId}`)
      const data = novelRes.data.data
      setNovel(data.novel)
      setCharacters(data.characters)
      setScenes(data.scenes)

      // 加载图像 Prompt
      const promptRes = await axios.get(`${API_URL}/api/prompt/${novelId}`)
      setImagePrompts(promptRes.data.data)

      // 加载上传的图片
      const imagesRes = await axios.get(`${API_URL}/api/images/${novelId}`)
      setImages(imagesRes.data.data || [])

      // 加载动画 Prompt
      const animRes = await axios.get(`${API_URL}/api/animation/${novelId}`)
      setAnimationPrompts(animRes.data.data || [])
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, promptId: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('novelId', novelId as string)
    formData.append('promptId', promptId.toString())

    try {
      await axios.post(`${API_URL}/api/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('图片上传成功！')
      loadNovelData() // 重新加载数据
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const generateAnimationPrompt = async (imageId: number) => {
    try {
      const res = await axios.post(`${API_URL}/api/animation/generate`, {
        imageId,
        targetPlatform: 'runway' // 可选：runway, pika, animatediff
      })
      alert('动画 Prompt 生成成功！')
      loadNovelData()
    } catch (error) {
      console.error('生成失败:', error)
      alert('生成失败，请重试')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板！')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 头部 */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/novels')}
          className="text-indigo-600 hover:text-indigo-800 mb-4"
        >
          ← 返回项目列表
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{novel?.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{novel?.word_count} 字</p>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('prompts')}
            className={`${
              tab === 'prompts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            图像 Prompt
          </button>
          <button
            onClick={() => setTab('images')}
            className={`${
              tab === 'images'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            上传的图片 ({images.length})
          </button>
          <button
            onClick={() => setTab('animations')}
            className={`${
              tab === 'animations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            视频 Prompt ({animationPrompts.length})
          </button>
        </nav>
      </div>

      {/* 图像 Prompt 标签页 */}
      {tab === 'prompts' && (
        <div className="space-y-6">
          {/* 角色 Prompt */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">角色 Prompt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagePrompts
                .filter((p) => p.type === 'character')
                .map((prompt) => {
                  const character = characters.find((c) => c.id === prompt.reference_id)
                  return (
                    <div key={prompt.id} className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-indigo-600">
                          {character?.name || `角色 ${prompt.id}`}
                        </h3>
                        <button
                          onClick={() => copyToClipboard(prompt.prompt)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          复制
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-800 mb-3">
                        {prompt.prompt}
                      </div>

                      {/* 上传图片按钮 */}
                      <div className="mt-3">
                        <label className="block">
                          <span className="sr-only">上传生成的图片</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, prompt.id)}
                            disabled={uploading}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded file:border-0
                              file:text-sm file:font-semibold
                              file:bg-indigo-50 file:text-indigo-700
                              hover:file:bg-indigo-100
                              disabled:opacity-50"
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* 场景 Prompt */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">场景 Prompt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagePrompts
                .filter((p) => p.type === 'scene')
                .map((prompt) => {
                  const scene = scenes.find((s) => s.id === prompt.reference_id)
                  return (
                    <div key={prompt.id} className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-green-600">
                          {scene?.title || `场景 ${prompt.id}`}
                        </h3>
                        <button
                          onClick={() => copyToClipboard(prompt.prompt)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          复制
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-800 mb-3">
                        {prompt.prompt}
                      </div>

                      {/* 上传图片按钮 */}
                      <div className="mt-3">
                        <label className="block">
                          <span className="sr-only">上传生成的图片</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, prompt.id)}
                            disabled={uploading}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded file:border-0
                              file:text-sm file:font-semibold
                              file:bg-green-50 file:text-green-700
                              hover:file:bg-green-100
                              disabled:opacity-50"
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* 上传的图片标签页 */}
      {tab === 'images' && (
        <div className="space-y-6">
          {images.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">还没有上传图片</p>
              <p className="text-sm text-gray-400 mt-2">
                请在"图像 Prompt"标签页上传生成的图片
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="bg-white border rounded-lg p-4">
                  <img
                    src={`${API_URL}/uploads/${image.file_name}`}
                    alt={image.file_name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                  <p className="text-sm text-gray-600 mb-3">{image.file_name}</p>
                  <button
                    onClick={() => generateAnimationPrompt(image.id)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    生成视频 Prompt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 视频 Prompt 标签页 */}
      {tab === 'animations' && (
        <div className="space-y-6">
          {animationPrompts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">还没有生成视频 Prompt</p>
              <p className="text-sm text-gray-400 mt-2">
                请先上传图片，然后点击"生成视频 Prompt"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {animationPrompts.map((anim) => {
                const image = images.find((img) => img.id === anim.uploaded_image_id)
                return (
                  <div key={anim.id} className="bg-white border rounded-lg p-6">
                    <div className="flex gap-6">
                      {image && (
                        <img
                          src={`${API_URL}/uploads/${image.file_name}`}
                          alt=""
                          className="w-48 h-48 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-purple-600 text-lg">
                              视频 Prompt
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              平台：{anim.target_platform} | 运镜：{anim.camera_movement}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(anim.prompt)}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            复制 Prompt
                          </button>
                        </div>
                        <div className="bg-purple-50 p-4 rounded border border-purple-200">
                          <p className="text-sm font-mono text-gray-800">
                            {anim.prompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
