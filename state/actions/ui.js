import state from '../state.js';

export const toggleUI = mobx.action((force = null) => state.ui.shown = force ?? !state.ui.shown);

export const toggleTab = mobx.action((tab, force = null) => state.ui.tabs[tab] = force ?? !state.ui.tabs[tab]);

