# poppy
A tiny, fast, configurable popover in 1.6kb. 🍻

# Usage
```javascript
import Poppy from 'poppy'

const target = document.getElementById('target')

const pop = new Poppy({
  target: target,
  popover: `
    <div class='my-popover'>
      <h5 class='mv0'>I'm a popover!</h5>
    </div>
  `,
  position: 'left', // from tackjs
  transitionSpeed: 200, // for css transitions
  onChange: ({ pinned }) => {...} // boolean
})

target.addEventListener('mouseenter', pop.pin)
target.addEventListener('mouseleave', pop.unpin)
```

Required CSS:
```css
.poppy {
  position: absolute;
  z-index: 9999;
  top: 0; left: 0;
}
```

# The Name
Huge thanks to [swathysubhash](https://github.com/swathysubhash) for letting me
use the name! This library used to be called [micro-popover](https://github.com/estrattonbailey/micro-popover).

## License
MIT License (c) 2018 Eric Bailey
