# Compose Slider

Takes range inputs (sliders) and adds the features you wish they had.

[![Build Status](http://img.shields.io/travis/compose-ui/slider.svg?style=flat-square)](https://travis-ci.org/compose-ui/slider)

### Features:

- Custom values - More than numbers, creates and binds a hidden input to custom values
- Custom labels - Display labels adjacent to the slider, or update values anywhere on the page.
- Label prefixes/suffixes - Easily set units for labels.
- Line labels - Label increments with whatever values you want.
- Line marks - Add emphasis to any point(s) in your slider track.

Some things to note:

- All `input type="range"` elements will be converted into sliders.

## Usage

All properties are set using `data-` attributes and are impmenented with unobtrusive
javascript.

| Attribute | Description | Example |
|:--------|:------------|:--------|
| `name`                | Name attribute for hidden input (values set by slider)      | `name="rating"` |
| `data-values`         | Set custom values for a hidden input                        | `1,4,8,15,16,23,42` |
| `data-label`          | Label array for displaying labels. Defaults to value or data-value. To disable: `data-label='false'`. | `data-label="Poor,Fair,Good,…"` |
| `data-label-[custom]` | Add multiple labels. | `data-label-price="10,20,…"`, `data-label-plan="Bronze,Silver,…"`.|
| `data-external-label-[custom]` | An array of labels for displaying external to the slider. | `data-external-label-price` updates `data-slider-label='price'` |
| `data-before-label`   | Set a label prefix                                          | `$` |
| `data-after-label`    | Set a label suffix                                          | `.00` |
| `data-before-label-[custom]`   | Set a label prefix for a custom label              | `data-before-label-price='$'` `data-before-label-plan='Plan: '` |
| `data-after-label-[custom]`    | Set a label suffix for a custom label              | `data-after-price-='.00 /month'` |
| `data-mark`           | Add a marker to highlight a slider segment (1 based index)  | `1,5,10` |
| `data-line-labels`    | Add labels inline on slider (1 based index)                 | `data-line-labels="Bronze,Silver,Gold"`, `data-line-labels="1:Bronze,2:Silver,3:Gold"` |
| `data-position-label` | Add a classname to control position ('left' => '.align-left'), default: 'right'  | `left` or `right` |


### Examples:

#### Simple: Add a label and suffix to a standard 0-100 range input

Use `data-after-label='%'` to add a suffix to the slider label.

```html
<input type="range" min="0" max="100" data-after-label="%">
```

#### Custom value

Set custom values for an input. 

```html
<input type="range" data-input='rating' data-values="poor,fair,good,great">
```

This will:

- Create a new `hidden` input with `name='rating'`.
- Set the slider's attributes `min="0"` and `max="3"`, so only four choices can be selected.
- Update the value on the hidden input to the corresponding value when the slider is changed.
- Display the custom value in the slider's label.

#### External labels only

To prevent a slider from having a label set `data-label='false'`. Then to display labels somewhere else on the page, use an external label. Here's an example.

```html
<input type='range' name='rating'
  data-label='false'
  data-external-label-rating='poor,fair,good,great'>

<span data-slider-label='rating'></span>
```

This will:

- Update an input with `name='rating'` with values from `0-3`.
- Update elements matching `data-slider-label='rating'` with `poor,fair,good, or great`

#### Use slider labels and external labels

Here's an example of a slider which ties units to price, displaying units on the slider and price elsewhere on the page.

```html
<input type='range' name='units'
  data-values='1,3,5,7'
  data-before-label='scale: '
  data-external-label-price='$10,$30,$50,$70'
  data-after-label-price='/month'>

<span data-slider-label='price'></span>
```

This will:

- Display a label on the slider: `scale: 1`.
- Create a hidden input with `name='scale'` and set its value to `1`.
- Find elements matching `data-slider-label='price'` and set its contents to: `$10/month`.

