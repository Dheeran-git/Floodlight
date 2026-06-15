import { create } from 'zustand'

import type { ConnectionStatus } from '@/types'

interface UiStore {
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  connection: ConnectionStatus
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  setConnection: (status: ConnectionStatus) => void
}

/** Store for UI layout state (panel collapse, connection status). */
export const useUiStore = create<UiStore>((set) => ({
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  connection: 'connecting',
  toggleLeftPanel: () =>
    set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),
  setConnection: (status) => set({ connection: status }),
}))
