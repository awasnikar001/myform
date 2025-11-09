import got from 'got'

export default {
  id: 'webhook',
  name: 'Webhook',
  description:
    "With webhooks integration, you can send every submission straight to any URL as soon as it's submitted.",
  icon: '/static/webhook.png',
  settings: [
    {
      type: 'url',
      name: 'endpointUrl',
      label: 'Endpoint URL',
      placeholder: 'https://webhook.example.com',
      required: true
    }
  ],
  run: async ({ config, submission, form }) => {
    // Validate endpointUrl exists
    if (!config?.endpointUrl) {
      throw new Error('Webhook endpoint URL is required')
    }

    try {
      const response = await got
        .post(config.endpointUrl, {
          json: {
            id: submission.id,
            formId: form.id,
            formName: form.name,
            fields: form.fields,
            answers: submission.answers,
            hiddenFields: submission.hiddenFields,
            variables: submission.variables
          },
          timeout: {
            request: 30000 // 30 second timeout
          }
        })
        .text()

      return response
    } catch (error: any) {
      // Re-throw with more context
      const errorMessage = error.response
        ? `Webhook failed: ${error.response.statusCode} ${error.response.statusMessage}`
        : `Webhook failed: ${error.message || 'Unknown error'}`

      throw new Error(`${errorMessage} (endpoint: ${config.endpointUrl})`)
    }
  }
}
