/**
 * Visual regression tests — Selenium + Applitools Eyes
 *
 * Each test has two layers:
 *   1. Selenium assertions  — verify the DOM structure is correct (run locally)
 *   2. Applitools snapshot  — visual diff against the approved baseline
 *
 * Prerequisites:
 *   - Next.js dev server running on http://localhost:3000  (pnpm dev)
 *   - Backend running on http://localhost:4200             (pnpm dev in /backend)
 *   - APPLITOOLS_API_KEY, SELENIUM_USERNAME, SELENIUM_PASSWORD set in .env
 *
 * Run: pnpm selenium
 */

import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver'
import Chrome from 'selenium-webdriver/chrome'
import {
    Eyes,
    Target,
    Configuration,
    BatchInfo,
    ClassicRunner,
} from '@applitools/eyes-selenium'
import * as http from 'http'

// ─── Config ───────────────────────────────────────────────────────────────────

const APP_URL   = process.env.APP_URL  ?? 'http://localhost:3000'
const API_URL   = process.env.API_URL  ?? 'http://localhost:4200'
const API_KEY   = process.env.APPLITOOLS_API_KEY ?? ''
const HEADLESS  = process.env.CI === 'true' || process.env.HEADLESS === 'true'
const TEST_USER = process.env.SELENIUM_USERNAME ?? ''
const TEST_PASS = process.env.SELENIUM_PASSWORD ?? ''

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loginApi(username: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ username, password })
        const req = http.request(
            `${API_URL}/api/v1/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                },
            },
            res => {
                let raw = ''
                res.on('data', chunk => { raw += chunk })
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`Login failed (HTTP ${res.statusCode}): ${raw}`))
                    } else {
                        resolve(raw.replace(/^"|"$/g, ''))
                    }
                })
            },
        )
        req.on('error', reject)
        req.write(payload)
        req.end()
    })
}

async function seedAuth(driver: WebDriver, token: string): Promise<void> {
    await driver.get(APP_URL)
    await driver.manage().addCookie({ name: 'token', value: token, path: '/' })
}

async function isDisplayed(el: WebElement): Promise<boolean> {
    return el.isDisplayed()
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Poemunity — Visual Regression', () => {
    let driver: WebDriver
    let runner: ClassicRunner
    let eyes: Eyes
    let eyesConfig: Configuration

    beforeAll(async () => {
        const options = new Chrome.Options()
        // 'eager' = driver.get() returns on DOMContentLoaded instead of waiting for every
        // network request to settle. Without this, slow APIs (ranking, poems) make get() hang.
        options.setPageLoadStrategy('eager')
        if (HEADLESS) {
            options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage')
        }

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build()

        runner = new ClassicRunner()

        eyesConfig = new Configuration()
        eyesConfig.setApiKey(API_KEY)
        eyesConfig.setAppName('Poemunity')
        eyesConfig.setBatch(new BatchInfo({ name: 'Poemunity Visual Regression' }))
    })

    beforeEach(() => {
        eyes = new Eyes(runner)
        eyes.setConfiguration(eyesConfig)
    })

    afterAll(async () => {
        await runner.getAllTestResults(false)
        await driver.quit()
    })

    afterEach(async () => {
        try { await eyes.abortAsync() } catch { /* ignore — eyes may never have been opened */ }
    })

    // ─── 1. Homepage ─────────────────────────────────────────────────────────

    test('homepage — dashboard, accordion and ranking sidebar', async () => {
        await driver.get(APP_URL)
        await driver.wait(until.elementLocated(By.css('[data-testid="dashboard-component"]')), 10_000)

        // Selenium assertions — SSR-present structure only.
        // Ranking sidebar loads async; visual state is verified by Applitools below.
        const dashboard  = await driver.findElement(By.css('[data-testid="dashboard-component"]'))
        const accordion  = await driver.findElement(By.css('.dashboard__accordion'))
        const poemList   = await driver.findElement(By.css('.dashboard__list'))

        expect(await isDisplayed(dashboard)).toBe(true)
        expect(await isDisplayed(accordion)).toBe(true)
        expect(await isDisplayed(poemList)).toBe(true)

        // Applitools visual snapshot
        await eyes.open(driver, 'Poemunity', 'Homepage', { width: 1280, height: 720 })
        await eyes.check('Homepage — full page', Target.window().fully())
        await eyes.closeAsync()
    })

    // ─── 2. Login page ───────────────────────────────────────────────────────

    test('login page — form fields and submit button', async () => {
        await driver.get(`${APP_URL}/login`)
        await driver.wait(until.elementLocated(By.css('form')), 10_000)

        // Selenium assertions
        const usernameInput = await driver.findElement(By.css('input[name="Username"]'))
        const passwordInput = await driver.findElement(By.css('input[name="Password"]'))
        const submitBtn     = await driver.findElement(By.css('[data-testid="login"] button'))

        expect(await isDisplayed(usernameInput)).toBe(true)
        expect(await isDisplayed(passwordInput)).toBe(true)
        expect(await isDisplayed(submitBtn)).toBe(true)
        expect(await usernameInput.getAttribute('placeholder')).toBe('Username')
        expect(await passwordInput.getAttribute('type')).toBe('password')
        expect(await submitBtn.getText()).toBe('Login')

        // Applitools visual snapshot
        await eyes.open(driver, 'Poemunity', 'Login page', { width: 1280, height: 720 })
        await eyes.check('Login — full page', Target.window().fully())
        await eyes.closeAsync()
    })

    // ─── 3. Register page ────────────────────────────────────────────────────

    test('register page — all required form fields present', async () => {
        await driver.get(`${APP_URL}/register`)
        await driver.wait(until.elementLocated(By.css('form')), 10_000)

        // Selenium assertions
        const usernameInput = await driver.findElement(By.css('input[name="Username"]'))
        const emailInput    = await driver.findElement(By.css('input[name="Email"]'))
        const passwordInput = await driver.findElement(By.css('input[name="Password"]'))
        const submitBtn     = await driver.findElement(By.css('.register button'))

        expect(await isDisplayed(usernameInput)).toBe(true)
        expect(await isDisplayed(emailInput)).toBe(true)
        expect(await isDisplayed(passwordInput)).toBe(true)
        expect(await isDisplayed(submitBtn)).toBe(true)
        expect(await emailInput.getAttribute('placeholder')).toBe('Email')
        expect(await submitBtn.getText()).toBe('Register')

        // Applitools visual snapshot
        await eyes.open(driver, 'Poemunity', 'Register page', { width: 1280, height: 720 })
        await eyes.check('Register — full page', Target.window().fully())
        await eyes.closeAsync()
    })

    // ─── 4. Genre-filtered page (/love) ──────────────────────────────────────

    test('love genre page — filtered list and active category link', async () => {
        await driver.get(`${APP_URL}/love`)
        await driver.wait(until.elementLocated(By.css('[data-testid="dashboard-component"]')), 10_000)

        // Selenium assertions — SSR-present structure only.
        const dashboard = await driver.findElement(By.css('[data-testid="dashboard-component"]'))
        const poemList  = await driver.findElement(By.css('.dashboard__list'))

        expect(await isDisplayed(dashboard)).toBe(true)
        expect(await isDisplayed(poemList)).toBe(true)

        // The page URL should contain the genre slug
        const url = await driver.getCurrentUrl()
        expect(url).toContain('/love')

        // Applitools visual snapshot
        await eyes.open(driver, 'Poemunity', 'Love genre page', { width: 1280, height: 720 })
        await eyes.check('Love genre — full page', Target.window().fully())
        await eyes.closeAsync()
    })

    // ─── 5. Authenticated profile page ───────────────────────────────────────

    test('profile page — poem creation form visible when authenticated', async () => {
        if (!TEST_USER || !TEST_PASS) {
            throw new Error('Set SELENIUM_USERNAME and SELENIUM_PASSWORD in .env')
        }

        const token = await loginApi(TEST_USER, TEST_PASS)
        expect(token.length).toBeGreaterThan(0)

        await seedAuth(driver, token)
        await driver.get(`${APP_URL}/profile`)
        await driver.wait(until.elementLocated(By.css('input[name="title"]')), 10_000)

        // Selenium assertions
        const titleInput    = await driver.findElement(By.css('input[name="title"]'))
        const categorySelect = await driver.findElement(By.css('select[name="category"]'))
        const poemTextarea  = await driver.findElement(By.css('textarea[name="poem"]'))
        const sendBtn       = await driver.findElement(By.css('button[type="submit"]'))

        expect(await isDisplayed(titleInput)).toBe(true)
        expect(await isDisplayed(categorySelect)).toBe(true)
        expect(await isDisplayed(poemTextarea)).toBe(true)
        expect(await isDisplayed(sendBtn)).toBe(true)

        // Applitools visual snapshot
        await eyes.open(driver, 'Poemunity', 'Profile — authenticated', { width: 1280, height: 720 })
        await eyes.check('Profile — full page', Target.window().fully())
        await eyes.closeAsync()
    })
})
