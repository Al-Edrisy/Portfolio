"use client"

import { useState, useEffect } from "react"

interface TextTypeProps {
  text: string[]
  typingSpeed?: number
  pauseDuration?: number
  showCursor?: boolean
  cursorCharacter?: string
  className?: string
}

export default function TextType({
  text,
  typingSpeed = 75,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "|",
  className = "",
}: TextTypeProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showCursorBlink, setShowCursorBlink] = useState(true)

  useEffect(() => {
    const currentFullText = text[currentTextIndex]

    if (isTyping) {
      if (currentText.length < currentFullText.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentFullText.slice(0, currentText.length + 1))
        }, typingSpeed)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, pauseDuration)
        return () => clearTimeout(timeout)
      }
    } else {
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, typingSpeed / 2)
        return () => clearTimeout(timeout)
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % text.length)
        setIsTyping(true)
      }
    }
  }, [currentText, currentTextIndex, isTyping, text, typingSpeed, pauseDuration])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursorBlink((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={className}>
      {currentText}
      {showCursor && (
        <span className={`${showCursorBlink ? "opacity-100" : "opacity-0"} transition-opacity`}>{cursorCharacter}</span>
      )}
    </span>
  )
}
