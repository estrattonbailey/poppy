import { tack } from 'tackjs'
import { tarry, queue } from 'tarry.js'

export default class Popover {
  constructor ({
    target,
    popover = null,
    position = 'bottom',
    transitionSpeed = 0,
    onChange = null
  }) {
    this.target = target
    this.popover = this.createPopover(popover)
    this.position = position
    this.transitionSpeed = transitionSpeed
    this.onChange = onChange

    this.state = {
      pinned: false,
      busy: false,
      requestClose: false
    }

    this.pin = this.pin.bind(this)
    this.unpin = this.unpin.bind(this)
    this.block = this.block.bind(this)
    this.unblock = this.unblock.bind(this)
    this.isExternalClick = this.isExternalClick.bind(this)
    this.handleKeyup = this.handleKeyup.bind(this)

    this.focusNode = null
  }

  setState (state, cb) {
    this.state = Object.assign(
      this.state,
      state
    )

    cb && tarry(cb, 0)()
  }

  block () {
    this.setState({
      busy: true
    })
  }

  unblock () {
    this.setState({
      busy: false
    }, () => {
      this.state.requestClose && this.unpin()
    })
  }

  toggle () {
    this.state.pinned ? this.unpin() : this.pin()
  }

  pin () {
    if (this.state.busy || this.state.pinned) return

    this.setState({
      busy: true
    })

    this.focusNode = document.activeElement

    const render = tarry(() => document.body.appendChild(this.popover))
    const pin = tarry(() => tack(this.popover, this.target, this.position))
    const show = tarry(() => {
      this.popover.classList.add('is-visible')
      this.popover.setAttribute('tabindex', '0')
      this.popover.setAttribute('aria-hidden', 'false')
    })
    const focus = tarry(() => this.popover.focus())
    const done = tarry(() => this.setState({
      busy: false,
      pinned: true
    }))

    queue(render, pin, show(0), focus(0), done)()

    this.popover.addEventListener('mouseenter', this.block)
    this.popover.addEventListener('mouseleave', this.unblock)
    window.addEventListener('click', this.isExternalClick)
    window.addEventListener('touchstart', this.isExternalClick)
    window.addEventListener('keyup', this.handleKeyup)
    window.addEventListener('resize', this.unpin)

    this.onChange && this.onChange({
      pinned: true
    })
  }

  unpin (force) {
    this.setState({
      requestClose: true
    })

    if (!force && (this.state.busy || !this.state.pinned)) return

    tarry(() => {
      this.setState({
        busy: true
      })

      this.popover.removeEventListener('mouseenter', this.block)
      this.popover.removeEventListener('mouseleave', this.unblock)
      window.removeEventListener('click', this.isExternalClick)
      window.removeEventListener('touchstart', this.isExternalClick)
      window.removeEventListener('keyup', this.handleKeyup)
      window.removeEventListener('resize', this.unpin)

      const hide = tarry(() => this.popover.classList.add('is-hiding'))
      const remove = tarry(() => document.body.removeChild(this.popover))
      const blur = tarry(() => this.focusNode.focus())
      const done = tarry(() => {
        this.popover.classList.remove('is-hiding')
        this.popover.classList.remove('is-visible')
        this.setState({
          busy: false,
          pinned: false,
          requestClose: false
        })
      })

      queue(hide, remove(this.transitionSpeed), blur, done)()

      this.onChange && this.onChange({
        pinned: false
      })
    }, 0)()
  }

  handleKeyup (e) {
    e.keyCode === 27 && this.unpin()
  }

  isExternalClick (e) {
    if (
      (e.target !== this.popover && !this.popover.contains(e.target)) &&
      (e.target !== this.target && !this.target.contains(e.target))
    ) {
      this.unpin()
    }
  }

  createPopover (pop) {
    const popover = document.createElement('div')
    popover.className = 'poppy'

    popover.role = 'dialog'
    popover.setAttribute('aria-label', 'Share Dialog')
    popover.setAttribute('aria-hidden', 'true')

    typeof pop === 'string' ? popover.innerHTML = pop : popover.appendChild(pop)

    return popover
  }
}
