import { AnimatePresence, motion } from 'framer-motion'

interface SectionPanelProps {
  title: string
  isOpen: boolean
  onClose: () => void
}

export function SectionPanel({ title, isOpen, onClose }: SectionPanelProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="section-panel__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="section-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-panel-title"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="section-panel__close" onClick={onClose} aria-label="Close section">
              Close
            </button>
            <h2 id="section-panel-title">{title}</h2>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
