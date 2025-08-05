// frontend/src/components/dialogs/VaultSelectorDialog.tsx
import React, { useEffect, useState } from 'react'

import { DialogDescription, DialogHeader, DialogTitle } from '../../../shadcn/ui/dialog'
import { Button } from '../../../shadcn/ui/button'
import { Folder, FolderOpen, Plus, History, Vault, CircleSlash2 } from 'lucide-react'
import { GenericDialog } from '../ui/GenericDialog'
import { open } from '@tauri-apps/api/dialog'
import { useAppSettings } from '../../contexts/AppContext'
import { useDialog } from '../../contexts/DialogContext'


export const VaultSelectorDialog: React.FC = () => {
  const [showRecentVaults, setShowRecentVaults] = useState<boolean>(false)
  // const [vaultPath, setVaultPathFn] = useState<string | null>(null)
  const { vaultPath, setVaultPath } = useAppSettings()
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const { closeDialog } = useDialog()

  useEffect(() => {
    console.log('vaultPath', vaultPath)
  }, [vaultPath])

  const handleSelectNewVault = async () => {
    // TODO: Implement Tauri file dialog
    const selected = await open({
      directory: true,
      multiple: false,
    })    

    if (selected) {
      if (typeof selected === 'string') {
        setVaultPath(selected)
        closeDialog()
      }
    }
  }

  const handleRecentVaults = async () => {
    setShowRecentVaults(true)
  }

  const mockRecentVaults = [
    {
      "title": "vault 1",
      "absPath": "/memo/documents/vault1"
    },
    {
      "title": "vault 2",
      "absPath": "/memo/documents/vault2"
    },
    {
      "title": "vault 3",
      "absPath": "/memo/documents/vault3"
    },
    {
      "title": "vault 4",
      "absPath": "/memo/documents/vault4"
    },
    {
      "title": "vault 5",
      "absPath": "/memo/documents/vault5"
    },
    {
      "title": "vault 6",
      "absPath": "/memo/documents/vault6"
    },
    {
      "title": "vault 7",
      "absPath": "/memo/documents/vault7"
    },
    {
      "title": "vault 8",
      "absPath": "/memo/documents/vault8"
    }
  ]
  // const mockRecentVaults: any[] = []

  return (
    <GenericDialog isOpen={isOpen} onOpenChange={(open) => {
      if (!open) {
        closeDialog()
      }
    }}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Select Vault
        </DialogTitle>
        <DialogDescription>
          Choose a folder to use as your knowledge vault, or select from recent vaults.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <Button 
          onClick={handleSelectNewVault}
          className="w-full justify-start h-12"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-3" />
          Select New Vault Folder
        </Button>
        <Button
          onClick={handleRecentVaults}
          className="w-full justify-start h-12"
          variant="outline"
        >
          <GenericDialog isOpen={showRecentVaults} onOpenChange={(open) => {
            if (!open) {
              setShowRecentVaults(false)
              closeDialog()
            }
          }} 
          className="min-h-80 max-h-96 overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <p className="text-sm">Recent Vaults</p>
              </DialogTitle>
            </DialogHeader>
            <div className='flex flex-col gap-2'>
              {mockRecentVaults.length > 0 ? (
                mockRecentVaults.map((item) => {
                  return (
                    <div key={item.absPath} onClick={() => {
                      setVaultPath(item.absPath)
                      closeDialog()
                    }} className="flex p-2 bg-tertiary items-center gap-5 rounded-sm cursor-pointer">
                      <Vault className="h-5 w-5" />
                      <div className="flex flex-col h-full">
                        <p className="text-sm">{item.title}</p>
                        <p className="text-xs text-tertiary-foreground truncate">{item.absPath}</p>
                      </div>
                    </div> 
                  )
                })
              ) : (
                <div className="items-center flex flex-col gap-4 mb-10">
                  <CircleSlash2 size={64}/>
                  There are no vaults to display
                </div>
              )}
            </div>
          </GenericDialog>
          <FolderOpen className="h-4 w-4 mr-3" />
          Open Recent Vaults
        </Button>
      </div>
    </GenericDialog>
  )
}