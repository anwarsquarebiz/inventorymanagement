import { createInertiaApp } from '@inertiajs/react'
import { renderToString } from 'react-dom/server'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'

const appName = import.meta.env.VITE_APP_NAME || 'Inventory Management'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup: ({ App, props }) => <App {...props} />,
  })
}
