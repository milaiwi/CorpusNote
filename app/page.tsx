// frontend/app/page.tsx
'use client';

import React from 'react';
import '../frontend/globals.css'
import App from '../frontend/src/components/Layout/App';

// CSS files for blocknote
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

export default function HomePage() {
    return (
        <html>
            <body>
                <App />
            </body>
        </html>
    )
}