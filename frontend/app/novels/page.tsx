'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NovelsPage() {
  const router = useRouter()
  const [novels, setNovels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNovels()
  }, [])

  const loadNovels = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/novel`)
      setNovels(res.data.data)
    } catch (error) {
      console.error('加载项目失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">我的项目</h1>
        <p className="mt-2 text-sm text-gray-600">
          查看所有已创建的小说项目和生成的 Prompt
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : novels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">还没有创建任何项目</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            创建新项目
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map((novel) => (
            <div
              key={novel.id}
              onClick={() => router.push(`/novels/${novel.id}`)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition cursor-pointer border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                  {novel.title}
                </h3>
                {novel.analyzed ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    已分析
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    未分析
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {novel.content}
              </p>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{novel.word_count} 字</span>
                <span>{formatDate(novel.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          创建新项目
        </button>
      </div>
    </div>
  )
}
