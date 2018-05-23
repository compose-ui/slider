var u = require('./_utils.js')

beforeAll(async () => {
  await page.goto("http://localhost:8081/sliders.html")
})
describe('Browser slider testing', () => {

  it('matches the initial state', async () => {
    await expect(page).toMatchElement('#slider-1 [data-slider-state="initial"]')
  })

  it('can move a slider with the keyboard', async () => {
    await u.valueIs('#slider-1 input', '50')
    await page.focus('#slider-1 input')

    await page.keyboard.press('ArrowRight')
    await u.valueIs('#slider-1 input', '51')

    await page.keyboard.press('ArrowLeft')
    await u.valueIs('#slider-1 input', '50')
  })

  it('can set a value', async () => {
    await u.setValue('#slider-1 input', '10')
    await u.valueIs('#slider-1 input', '10')
  })

  it('can track input changes with sliderState', async () => {
    await u.setValue('#slider-1 input', '49')
    expect(await u.data('#slider-1 div', 'sliderState')).toBe('decreased')
    
    await u.setValue('#slider-1 input', '51')
    expect(await u.data('#slider-1 div', 'sliderState')).toBe('increased')

    await u.setValue('#slider-1 input', '50')
    expect(await u.data('#slider-1 div', 'sliderState')).toBe('initial')
  })

  it('has a before and after label', async () => {
    await u.matchText('#slider-1', 'Disk: 50MB')
  })

  it('assigns data-values to a hidden input and labels', async () => {
    await u.matchText('#slider-2', 'poor')
    await u.valueIs('#slider-2 input[type="hidden"]', 'poor')
    
    await u.setValue('#slider-2 input', '1')
    await u.matchText('#slider-2', 'fair')
    await u.valueIs('#slider-2 input[type="hidden"]', 'fair')

  })

  it('adds marks', async () => {
    await u.countIs('#slider-3 .slider-segment-mark', 3)
    
    await u.findElement(`#slider-3 .slider-segment:first-child [data-index='1']`)
    await u.findElement(`#slider-3 .slider-segment:nth-child(6) [data-index='6']`)
    await u.findElement(`#slider-3 .slider-segment:last-child [data-index='11']`)
  })

  it('sets max and min from attributes', async () => {
    await u.countIs('#slider-4 .slider-segment', 4)
  })
})
