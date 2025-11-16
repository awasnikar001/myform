import { pickObject } from '@heyform-inc/utils'

import { GOOGLE_RECAPTCHA_KEY } from '@/consts/env'

export function initGeeTest(): Promise<Any> {
  return new Promise(resolve => {
    window.initGeetest4(
      {
        captchaId: window.heyform.geetestCaptchaId,
        product: 'bind',
        mask: {
          outside: false,
          bgColor: '#00000000'
        },
        hideBar: ['close']
      },
      (instance: Any) => {
        instance.onReady(() => {
          resolve(instance)
        })
      }
    )
  })
}

export function recaptchaToken(instance: Any): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if instance exists, if not, try to get it from window
    const grecaptcha = instance || window.grecaptcha

    if (!grecaptcha) {
      reject(new Error('Google reCAPTCHA is not loaded. Please wait a moment and try again.'))
      return
    }

    if (!GOOGLE_RECAPTCHA_KEY) {
      reject(new Error('Google reCAPTCHA key is not configured.'))
      return
    }

    // Debug logging
    console.log('=== reCAPTCHA Debug ===')
    console.log('Key being used:', GOOGLE_RECAPTCHA_KEY)
    console.log('Key type:', typeof GOOGLE_RECAPTCHA_KEY)
    console.log('Key length:', GOOGLE_RECAPTCHA_KEY?.length)
    console.log('grecaptcha object:', grecaptcha)
    console.log('======================')

    // Add additional safety: wait a bit longer before executing
    grecaptcha.ready(() => {
      console.log('grecaptcha.ready() callback executed')

      // Double-check the key is valid before executing
      try {
        grecaptcha
          .execute(GOOGLE_RECAPTCHA_KEY, {
            action: 'submit'
          })
          .then(token => {
            console.log('reCAPTCHA token received successfully')
            resolve(token)
          })
          .catch(error => {
            console.error('reCAPTCHA execute error:', error)
            reject(error)
          })
      } catch (error) {
        console.error('reCAPTCHA execute exception:', error)
        reject(error)
      }
    })
  })
}

export function geeTestToken(instance: Any): Promise<Any> {
  return new Promise((resolve, reject) => {
    instance.onSuccess(() => {
      const values = instance.getValidate()
      const data = pickObject(values, [
        ['lot_number', 'lotNumber'],
        ['captcha_output', 'captchaOutput'],
        ['pass_token', 'passToken'],
        ['gen_time', 'genTime']
      ])

      instance.reset()
      resolve(data)
    })

    instance.onClose((err: Any) => {
      reject(err)
    })

    instance.onError((err: Any) => {
      console.error(err)
      reject(new Error(err.msg))
    })
  })
}
