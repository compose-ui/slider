
module.exports = u = {
  setValue: async (selector, value) => {
    await page.evaluate(`document.querySelector('${selector}').value = '${value}'`)
    await page.evaluate(`var input = document.querySelector('${selector}'); Event.fire(input, 'input')`)
  },

  select: async (selector, option) => {
    await expect(page).toSelect(selector, option)
    await u.validate()
  },

  findElement: async (selector, options) => {
    await expect(page).toMatchElement(`${selector}`, options)
  },

  find: async (text) => {
    await expect(page).toMatch(text)
  },

  click: async (selector, options) => {
    await expect(page).toClick(selector, options)
  },

  html: async (selector) => {
    return await page.$eval(selector, e => e.outerHTML);
  },

  data: async (selector, object) => {
    return await page.$eval(selector, (e, object) => e.dataset[object], object);
  },

  value: async (selector) => {
    return await page.$eval(selector, e => e.value);
  },

  valueIs: async (selector, expected) => {
    return expect( await u.value(selector)).toBe(expected)
  },

  countIs: async (selector, expected) => {
    return expect( await page.$$eval(selector, e => e.length)).toBe(expected)
  },  

  matchText: async (selector, text) => {
    return expect( (await u.text(selector)).trim() ).toBe(text)
  },

  text: async (selector) => {
    return await page.$eval(selector, e => e.textContent);
  }
}
