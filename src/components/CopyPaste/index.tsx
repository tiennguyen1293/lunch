import cls from 'classnames'

import styles from './CopyPaste.module.scss'
import { useState } from 'react'

interface ICopyPaste {
  children: React.ReactNode
  className?: string
  value: string
}

const CopyPaste: React.FC<ICopyPaste> = ({ children, className, value }) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyPass = async () => {
    if (!navigator?.clipboard) {
      console.error('Failed to copy')

      return
    }

    try {
      await navigator.clipboard.writeText(value)

      setIsCopied(true)

      const timeout = setTimeout(() => {
        setIsCopied(false)
        clearTimeout(timeout)
      }, 1000)
    } catch (error) {
      console.error('Failed to copy: ', error)
    }
  }

  return (
    <div className={cls(styles.copy, className)}>
      <div className={styles.child}>{children}</div>
      {isCopied ? (
        <span className={cls('material-symbols-outlined', styles.icon)}>
          check
        </span>
      ) : (
        <span
          className={cls('material-symbols-outlined', styles.icon)}
          onClick={copyPass}
        >
          content_copy
        </span>
      )}
    </div>
  )
}

export default CopyPaste
