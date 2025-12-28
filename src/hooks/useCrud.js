import { useState, useCallback } from 'react'

/**
 * CRUD 작업을 위한 커스텀 훅
 */
export function useCrud({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  onSuccess,
  onError,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 목록 불러오기
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchFn()
      if (response.success) {
        setItems(response.items || response.data || [])
        return response
      }
    } catch (err) {
      const errorMessage = err.message || '데이터를 불러오는데 실패했습니다.'
      setError(errorMessage)
      if (onError) onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFn, onError])

  // 생성
  const create = useCallback(async (data) => {
    try {
      setLoading(true)
      setError('')
      const response = await createFn(data)
      if (response.success) {
        await load()
        if (onSuccess) onSuccess('생성되었습니다.')
        return response
      }
    } catch (err) {
      const errorMessage = err.message || '생성에 실패했습니다.'
      setError(errorMessage)
      if (onError) onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [createFn, load, onSuccess, onError])

  // 수정
  const update = useCallback(async (id, data) => {
    try {
      setLoading(true)
      setError('')
      const response = await updateFn(id, data)
      if (response.success) {
        await load()
        if (onSuccess) onSuccess('수정되었습니다.')
        return response
      }
    } catch (err) {
      const errorMessage = err.message || '수정에 실패했습니다.'
      setError(errorMessage)
      if (onError) onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [updateFn, load, onSuccess, onError])

  // 삭제
  const remove = useCallback(async (id) => {
    try {
      setLoading(true)
      setError('')
      const response = await deleteFn(id)
      if (response.success) {
        await load()
        if (onSuccess) onSuccess('삭제되었습니다.')
        return response
      }
    } catch (err) {
      const errorMessage = err.message || '삭제에 실패했습니다.'
      setError(errorMessage)
      if (onError) onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deleteFn, load, onSuccess, onError])

  return {
    items,
    loading,
    error,
    load,
    create,
    update,
    remove,
    setItems,
    setError,
  }
}

