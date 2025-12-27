import fs from 'fs'
import path from 'path'

describe('index.html asset path validation', () => {
    let htmlContent: string

    beforeAll(() => {
        const htmlPath = path.join(__dirname, '../public/index.html')
        htmlContent = fs.readFileSync(htmlPath, 'utf-8')
    })

    describe('Asset loading bug prevention', () => {
        test('script tag should use absolute path (not relative)', () => {
            // Match script tags and extract src attribute
            const scriptTagRegex = /<script\s+src=["']([^"']+)["']/gi
            const matches = htmlContent.matchAll(scriptTagRegex)

            const scriptPaths: string[] = []
            for (const match of matches) {
                scriptPaths.push(match[1])
            }

            expect(scriptPaths.length).toBeGreaterThan(0)

            // Verify all script paths are absolute (start with /)
            scriptPaths.forEach(scriptPath => {
                expect(scriptPath.startsWith('/')).toBe(true)
                expect(scriptPath).toMatch(/^\//)
            })

            // Specifically check for index.js
            const hasIndexJs = scriptPaths.some(p => p === '/index.js')
            expect(hasIndexJs).toBe(true)
        })

        test('stylesheet link should use absolute path (not relative)', () => {
            // Match link tags with rel="stylesheet" and extract href attribute
            const linkTagRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi
            const matches = htmlContent.matchAll(linkTagRegex)

            const stylesheetPaths: string[] = []
            for (const match of matches) {
                stylesheetPaths.push(match[1])
            }

            // Also check for href before rel attribute
            const linkTagRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi
            const matches2 = htmlContent.matchAll(linkTagRegex2)
            for (const match of matches2) {
                stylesheetPaths.push(match[1])
            }

            expect(stylesheetPaths.length).toBeGreaterThan(0)

            // Verify all stylesheet paths are absolute (start with /)
            stylesheetPaths.forEach(stylesheetPath => {
                expect(stylesheetPath.startsWith('/')).toBe(true)
                expect(stylesheetPath).toMatch(/^\//)
            })

            // Specifically check for index.css
            const hasIndexCss = stylesheetPaths.some(p => p === '/index.css')
            expect(hasIndexCss).toBe(true)
        })

        test('index.js should NOT use relative path', () => {
            // This would cause the bug when navigating to /detail/:id
            expect(htmlContent).not.toContain('src="index.js"')
            expect(htmlContent).not.toContain("src='index.js'")
        })

        test('index.css should NOT use relative path', () => {
            // This would cause the bug when navigating to /detail/:id
            expect(htmlContent).not.toContain('href="index.css"')
            expect(htmlContent).not.toContain("href='index.css'")
        })

        test('verifies the exact bug scenario: relative paths break on nested routes', () => {
            // When at /detail/123, a relative path "index.js" would resolve to /detail/index.js
            // An absolute path "/index.js" correctly resolves to /index.js from any route

            // Check that we're using absolute paths that work from any route depth
            expect(htmlContent).toContain('src="/index.js"')
            expect(htmlContent).toContain('href="/index.css"')

            // Ensure no relative paths that would break on nested routes
            const relativeScriptPattern = /<script[^>]+src=["'](?!\/|https?:\/\/)([^"']+)["']/i
            const relativeLinkPattern =
                /<link[^>]+href=["'](?!\/|https?:\/\/|%)([^"']+)["'][^>]+rel=["']stylesheet["']/i

            expect(htmlContent).not.toMatch(relativeScriptPattern)
            // Allow %PUBLIC_URL% as it gets replaced during build
            const linksWithoutPublicUrl = htmlContent.replace(/%PUBLIC_URL%/g, '')
            expect(linksWithoutPublicUrl).not.toMatch(relativeLinkPattern)
        })
    })

    describe('HTML structure validation', () => {
        test('should have root div element', () => {
            expect(htmlContent).toContain('id="root"')
        })

        test('should have proper DOCTYPE', () => {
            expect(htmlContent.trim()).toMatch(/^<!DOCTYPE html>/i)
        })

        test('should have charset meta tag', () => {
            expect(htmlContent).toContain('charset="UTF-8"')
        })

        test('should have viewport meta tag for responsive design', () => {
            expect(htmlContent).toContain('name="viewport"')
        })

        test('should have title tag', () => {
            expect(htmlContent).toContain('<title>')
            expect(htmlContent).toContain('</title>')
        })
    })
})
