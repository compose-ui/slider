# Compose Slider

Takes range inputs (sliders) and adds the features you wish they had.

[![Build Status](http://img.shields.io/travis/compose-ui/slider.svg?style=flat-square)](https://travis-ci.org/compose-ui/slider)

### Features:

- Custom values - More than numbers, creates and binds a hidden input to custom values
- Custom labels - Display labels adjacent to the slider, or update values anywhere on the page.
- Label prefixes/suffixes - Easily set units for labels.
- Line labels - Label increments with whatever values you want.
- Line marks - Add emphasis to any point(s) in your slider track.

## Usage

All properties are set using `data-` attributes and are impmenented with unobtrusive
javascript.

| `data-` | Description | Example Value |
|:--------|:------------|:--------|
| `values`        | Set custom values for a hidden input               | `1,4,8,15,16,23,42` |
| `input`         | Name attribute for hidden input                    | `price` |
| `label`         | Custom label (if ommited, defaults to data-values) | `One, Four,Eight,…` |
| `before-label`  | Set a label prefix                                 | `$` |
| `after-label`   | Set a label suffix                                 | `.00` |
| `mark`          | Add a marker to highlight a slider segment (1 based index) | `1,5,10` |
| `line-labels`   | Add labels inline on slider (1 based index)        | options: `Bronze,Silver,Gold`, `1:Bronze,2:Silver,3:Gold` |
| `label-[custom]`, `label-[custom]` | Use `data-label-whatever` to set multiple labels at once | `data-label-price="10,20,…"`, `data-label-plan="Bronze,Silver,…"` |
| `before-label-[custom]`   | Use `data-before-label-whatever` to set custom prefixes for a specific label  | `data-before-label-price='$'` `data-before-label-plan='Plan: '` |
| `after-label-[custom]`    | Use `data-after-label-whatever` to set custom suffixes for a specific label  | `data-after-price-='.00 /month'` |
| `external-label-[custom]` | Update contents of any element on the page with `data-slider-label="custom"` | `data-external-label-price` updates `data-slider-label='price'` |


Some things to note:

- All `input type="range"` elements will be converted into sliders.
- If no custom label is specified, the value will be displayed as the label.
- 

### Examples:

#### Add a label and suffix to a standard range input

Use `data-after-label='%'` to add a suffix to the slider label.

```html
<input type="range" min="0" max="100" data-after-label="%">
```

#### Custom value

Use `data-input` and `data-values` to set custom values for an input. 

```html
<input type="range" data-input='rating' data-values="poor,fair,good,great">
```

This will:

- Create a new `hidden` input with `name='rating'`.
- Set the slider's `min="0"` and `max="3"`, so only four choices can be selected.
- Update the value on the hidden input when the slider is changed.
- Display the custom values in the label for the slider.


