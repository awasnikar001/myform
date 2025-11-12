import type { FC } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Signature_pad from 'signature_pad'

import { useTranslation } from '../utils'
import { helper } from '@heyform-inc/utils'

import { IComponentProps } from '../typings'
import { Button } from './Button'

interface SignaturePadProps extends Omit<IComponentProps, 'onChange'> {
  value?: string
  penColor?: string
  onChange?: (value: string) => void
}

export const SignaturePad: FC<SignaturePadProps> = ({ value, penColor, onChange }) => {
  const { t } = useTranslation()
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const lastValueRef = useRef<string | undefined>()
  const signaturePad = useMemo(() => {
    if (canvasRef) {
      return new Signature_pad(canvasRef, { penColor })
    }
  }, [canvasRef])

  function handleClear() {
    signaturePad?.clear()
    onChange?.('') // Clear the form value when user clicks clear
    lastValueRef.current = ''
  }

  function handleEndStroke() {
    const dataURL = signaturePad!.toDataURL('image/png')
    onChange?.(dataURL)
    lastValueRef.current = dataURL
  }

  useEffect(() => {
    if (canvasRef) {
      // see https://github.com/szimek/signature_pad#handling-high-dpi-screens
      const ratio = Math.max(window.devicePixelRatio || 1, 1)

      canvasRef.width = canvasRef.offsetWidth * ratio
      canvasRef.height = canvasRef.offsetHeight * ratio
      canvasRef.getContext('2d')?.scale(ratio, ratio)
    }
  }, [canvasRef])

  useEffect(() => {
    if (signaturePad && canvasRef) {
      // Only reload if value has actually changed
      if (lastValueRef.current !== value) {
        // Clear first
        signaturePad.clear()

        // Load signature from value if it exists
        if (helper.isValid(value) && value) {
          try {
            // Use fromDataURL to load the signature image
            signaturePad.fromDataURL(value)
          } catch (err) {
            console.error('Failed to load signature:', err)
          }
        }

        lastValueRef.current = value
      }

      signaturePad.addEventListener('endStroke', handleEndStroke)
    }

    return () => {
      signaturePad?.removeEventListener('endStroke', handleEndStroke)
      signaturePad?.off()
    }
  }, [signaturePad, value, canvasRef])

  return (
    <div className="heyform-signature-pad">
      <div className="heyform-signature-wrapper">
        <canvas ref={setCanvasRef} />
      </div>
      <div className="heyform-signature-bottom">
        <span>{t('Draw your signature above')}</span>
        <Button.Link onClick={handleClear}>{t('Clear')}</Button.Link>
      </div>
    </div>
  )
}
