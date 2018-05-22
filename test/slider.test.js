var u = require('./_utils.js')

describe('Browser slider testing', () => {
  beforeAll(async () => {
    await page.goto("http://localhost:8081/sliders.html")
  })

  it('matches the initial state', async () => {
    await expect(page).toMatchElement('#slider1 [data-slider-state="initial"]')
  })

  it('has an after-label', async () => {
    await u.matchText('#slider1 span.after-label', '%')
  })

  it('can move a slider with the keyboard', async () => {
    await u.valueIs('#slider1 input', '50')
    await page.focus('#slider1 input')

    await page.keyboard.press('ArrowRight')
    await u.valueIs('#slider1 input', '51')

    await page.keyboard.press('ArrowLeft')
    await u.valueIs('#slider1 input', '50')
  })

  it('can set a value', async () => {
    await u.setValue('#slider1 input', '10')
    await u.valueIs('#slider1 input', '10')
  })

})
