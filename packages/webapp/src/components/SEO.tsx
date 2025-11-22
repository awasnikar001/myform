import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

interface SEOProps {
    title?: string
    description?: string
    image?: string
    url?: string
}

export const SEO = ({ title, description, image, url }: SEOProps) => {
    const { t } = useTranslation()

    const siteTitle = 'LyticsForm'
    const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle
    const metaDescription = description || t('meta.description', 'Build beautiful forms in minutes.')
    const metaImage = image || '/static/og-image.png'
    const metaUrl = url || window.location.href

    return (
        <Helmet>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* Open Graph */}
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:type" content="website" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    )
}
