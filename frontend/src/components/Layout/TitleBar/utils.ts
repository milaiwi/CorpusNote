import React from 'react';

type TAURI_WINDOW_ACTIONS = 'minimize' | 'maximize' | 'close';

/**
 * 
 * @param title: the name of the file
 * @returns removes any extension applied to a file ('Test File 1.md' -> 'Test File 1')
 */
export const getDisplayTitle = (title: string | undefined) => {
    if (title)
        return title.split('.')[0]
    return 'Untitled'
}

export const handleWindowControl = (action: TAURI_WINDOW_ACTIONS) => {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const { appWindow } = (window as any).__TAURI__.window;
        switch (action) {
            case 'minimize':
                appWindow.minimize();
                break;
            case 'maximize':
                appWindow.maximize();
                break;
            case 'close':
                appWindow.close();
                break;
        }
    } else {
        throw new Error(`handleWindowControl has incorrect parameter ${action}`)
    }
}

