import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// 在每個測試後清理
afterEach(() => {
    cleanup()
})