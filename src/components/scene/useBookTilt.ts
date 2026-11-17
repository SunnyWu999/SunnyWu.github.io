import { useCallback, useRef, type PointerEvent } from 'react'

/* The open book leans a few degrees toward the mouse. Sets CSS variables directly so nothing re-renders. */
export function useBookTilt(enabled: boolean) {
  const frame = useRef(0)

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== 'mouse') return
      const element = event.currentTarget
      const rect = element.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        element.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`)
        element.style.setProperty('--tilt-x', `${(-y * 3.5).toFixed(2)}deg`)
      })
    },
    [enabled],
  )

  const onPointerLeave = useCallback((event: PointerEvent<HTMLElement>) => {
    cancelAnimationFrame(frame.current)
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
  }, [])

  return { onPointerMove, onPointerLeave }
}
