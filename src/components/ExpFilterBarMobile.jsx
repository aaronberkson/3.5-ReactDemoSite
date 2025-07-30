import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ExpFilterIcon from './ExpFilterIcon'
import { ALL_TAGS } from '../data/experienceLogos'
import './ExpFilterBarMobile.css'

export default function ExpFilterBarMobile({
  selectedTag,
  setSelectedTag
}) {
  const [open, setOpen]           = useState(false)
  const [maxHeight, setMaxHeight] = useState(null)
  const [isSmall, setIsSmall]     = useState(
    typeof window !== 'undefined' && window.innerWidth < 360
  )
  const wrapperRef = useRef()
  const toggleRef  = useRef()

  // Close on outside click
  useEffect(() => {
    const onBodyClick = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onBodyClick)
    return () => document.removeEventListener('click', onBodyClick)
  }, [])

  // Track viewport < 360px
  useEffect(() => {
    const mq = window.matchMedia('(max-width:359px)')
    const onChange = e => setIsSmall(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Measure available height below toggle on open
  useEffect(() => {
    if (!open) return
    const rect   = toggleRef.current.getBoundingClientRect()
    const gutter = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--filter-dropdown-menu-offset-y')
    ) || 0
    const avail  = window.innerHeight - rect.bottom - gutter
    setMaxHeight(avail)
  }, [open])

  const toggle = () => setOpen(v => !v)
  const choose = tag => {
    setSelectedTag(tag)
    setOpen(false)
  }

  // Decide what the toggle shows
  const displayToggle =
    isSmall && selectedTag === 'Artificial Intelligence'
      ? 'AI'
      : selectedTag

  return (
    <div className="experience-inner">
      <div className="filter-bar">
        <div className="filter-label-group">
          <ExpFilterIcon width={38} height={38} />
          <span className="filter-label">Filter By</span>
        </div>

        <div
          ref={wrapperRef}
          className={`filter-dropdown-wrapper${open ? ' show' : ''}`}
        >
          <button
            ref={toggleRef}
            type="button"
            className="filter-dropdown-toggle"
            onClick={toggle}
          >
            <span className="filter-dropdown-toggle-text">
              {displayToggle}
            </span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.ul
                className="filter-dropdown-menu"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  maxHeight: maxHeight ? `${maxHeight}px` : 'auto'
                }}
              >
                {ALL_TAGS.map(tag => {
                  // decide what the item shows
                  const label =
                    isSmall && tag === 'Artificial Intelligence'
                      ? 'AI'
                      : tag

                  return (
                    <li key={tag}>
                      <button
                        type="button"
                        className={
                          'filter-dropdown-item' +
                          (tag === selectedTag ? ' active' : '')
                        }
                        onClick={() => choose(tag)}
                      >
                        <span className="filter-dropdown-item-text">
                          {label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
