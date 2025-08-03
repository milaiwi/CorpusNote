// frontend/app/page.tsx
'use client';

import React from 'react';
import MainPageLayout from '../frontend/src/components/Layout/MainLayout';
import '../frontend/globals.css'

export default function HomePage() {
    return (
        <html>
            <body>
                <MainPageLayout />
            </body>
        </html>
    )
}