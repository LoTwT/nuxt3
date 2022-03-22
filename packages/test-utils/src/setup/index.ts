import { createTestContext, setTestContext, teardownContext } from '../context'
import { loadFixture, buildFixture } from '../nuxt'
import { startServer } from '../server'
import { createBrowser } from '../browser'
import type { TestHooks, TestOptions } from '../types'
import setupJest from './jest'
import setupVitest from './vitest'

export const setupMaps = {
  jest: setupJest,
  vitest: setupVitest
}

export function createTest (options: Partial<TestOptions>): TestHooks {
  const ctx = createTestContext(options)

  const beforeEach = () => {
    setTestContext(ctx)
  }

  const afterEach = () => {
    setTestContext(undefined)
  }

  const afterAll = async () => {
    await teardownContext(ctx)
  }

  const setup = async () => {
    if (ctx.options.fixture) {
      await loadFixture()
    }

    if (ctx.options.build) {
      await buildFixture()
    }

    if (ctx.options.server) {
      await startServer()
    }

    if (ctx.options.waitFor) {
      await (new Promise(resolve => setTimeout(resolve, ctx.options.waitFor)))
    }

    if (ctx.options.browser) {
      await createBrowser()
    }
  }

  return {
    beforeEach,
    afterEach,
    afterAll,
    setup,
    ctx
  }
}

export async function setup (options: Partial<TestOptions>) {
  const setupFn = setupMaps[options.runner || 'vitest']

  await setupFn(() => createTest(options))
}
