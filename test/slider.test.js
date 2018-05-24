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
    // Default is 50 so 49 should be a decreased state
    await u.setValue('#slider-1 input', '49')
    expect(await u.data('#slider-1 div', 'sliderState')).toBe('decreased')

    // Default is 50 so 51 should be an increased state
    await u.setValue('#slider-1 input', '51')
    expect(await u.data('#slider-1 div', 'sliderState')).toBe('increased')

    // Default is 50 so 50 should be the initial state
    await u.setValue('#slider-1 input', '50')
    expect(await u.data('#slider-1 div', 'sliderState')).toBe('initial')
  })

  it('has a before and after label', async () => {
    await u.matchText('#slider-1', 'Disk: 50MB')
  })

  it('fills slider track', async () => {
    // Set the slider to 50
    await u.setValue('#slider-1 input', '50')

    // Ensure that there are 50 filled slider-track elements
    await u.countIs('#slider-1 .slider-fill.filled', 50)

    // Slider fill segment 50 should be filled, but not 51
    await u.findElement('#slider-1 .slider-fill.filled[data-index="50"]')
    await u.findElement('#slider-1 .slider-fill:not(.filled)[data-index="51"]')

    await u.setValue('#slider-1 input', '51')
    // Slider fill segment 51 should be filled, but not 52
    await u.findElement('#slider-1 .slider-fill.filled[data-index="51"]')
    await u.findElement('#slider-1 .slider-fill:not(.filled)[data-index="52"]')
  })

  it('assigns data-values to a hidden input and labels', async () => {
    // Check that value and label match
    await u.matchText('#slider-2', 'poor')
    await u.valueIs('#slider-2 input[type="hidden"]', 'poor')

    // Move the slider
    await u.setValue('#slider-2 input', '1')

    // Check that value and label update and match
    await u.matchText('#slider-2', 'fair')
    await u.valueIs('#slider-2 input[type="hidden"]', 'fair')
  })

  it('adds marks', async () => {
    // There should only be three slider marks
    await u.countIs('#slider-3 .slider-segment-mark', 3)

    // Marked elements should occupy the right place in the DOM and have the right data-index
    await u.findElement(`#slider-3 .slider-segment:first-child [data-index='1']`)
    await u.findElement(`#slider-3 .slider-segment:nth-child(6) [data-index='6']`)
    await u.findElement(`#slider-3 .slider-segment:last-child [data-index='11']`)
  })

  it('sets max and min from attributes', async () => {
    await u.countIs('#slider-4 .slider-segment', 4)
  })

  it('disables the label', async () => {
    // data-label='false' should prevent the label from showing
    await u.matchText('#slider-5', '')
  })

  it('adds line labels', async () => {
    // There should only be three slider line labels
    await u.countIs('#slider-6 .slider-line-label', 3)

    // Line labels should occupy the right place in the DOM and have the right text
    await u.matchText(`#slider-6 .slider-segment:first-child .slider-line-label`, '10,000')
    await u.matchText(`#slider-6 .slider-segment:nth-child(6) .slider-line-label`, '20,000')
    await u.matchText(`#slider-6 .slider-segment:last-child .slider-line-label`, '30,000')
  })

  it('only updates external labels when data-label="false"', async () => {
    // Make sure external label is in place
    console.log(await u.html('#slider-7-container'))
    await u.setValue('#slider-7-container #slider-7 input', '1')
    await u.matchText(`#slider-7-container [data-slider-label="disk"]`, '2GB')

    // Make sure external label is updated when changing slider value
    await u.setValue('#slider-7-container #slider-7 input', '2')
    await u.matchText(`#slider-7-container [data-slider-label="disk"]`, '3GB')
    
    // Only external labels should be updated when data-label='false'
    await u.isNull(`#slider-7-container .internal-label`)
  })

  it('can update external labels with slider-state tracking', async () => {
    // Make sure external label is in place

    await u.setValue('#slider-7 input', '4')
    expect(await u.data(`#slider-7-container [data-track-slider-state="#disk"]`, 'sliderState')).toBe('increased')

    await u.setValue('#slider-7 input', '2')
    expect(await u.data(`#slider-7-container [data-track-slider-state="#disk"]`, 'sliderState')).toBe('decreased')

    await u.setValue('#slider-7 input', '3')
    expect(await u.data(`#slider-7-container [data-track-slider-state="#disk"]`, 'sliderState')).toBe('initial')

  })

})
