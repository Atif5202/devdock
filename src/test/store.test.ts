import { describe, it, expect, beforeEach } from 'vitest';
import { useDevDockStore } from '../store/devdockStore';

describe('DevDockStore', () => {
  beforeEach(() => {
    useDevDockStore.setState({
      activeTool: 'readme',
      user: null,
      notifications: [],
      regexPattern: '',
      regexTestInput: '',
      jsonInput: '',
      sqlInput: '',
      envEntries: [],
      iconSearchQuery: '',
    });
  });

  it('should set active tool', () => {
    const store = useDevDockStore.getState();
    store.setActiveTool('regex');
    expect(useDevDockStore.getState().activeTool).toBe('regex');
  });

  it('should add and remove notifications', () => {
    const store = useDevDockStore.getState();
    store.addNotification('Test message', 'success');
    const state = useDevDockStore.getState();
    expect(state.notifications.length).toBeGreaterThanOrEqual(1);
    expect(state.notifications[0].message).toBe('Test message');

    const id = state.notifications[0].id;
    store.removeNotification(id);
    expect(useDevDockStore.getState().notifications.find(n => n.id === id)).toBeUndefined();
  });

  it('should login and logout user', () => {
    const store = useDevDockStore.getState();
    store.login('test@devdock.io');
    const stateAfterLogin = useDevDockStore.getState();
    expect(stateAfterLogin.user).not.toBeNull();
    expect(stateAfterLogin.user?.email).toBe('test@devdock.io');

    store.logout();
    expect(useDevDockStore.getState().user).toBeNull();
  });

  it('should run regex test', () => {
    const store = useDevDockStore.getState();
    store.setRegexPattern('hello');
    store.setRegexFlags('g');
    store.setRegexTestInput('hello world hello');
    store.runRegexTest();
    const state = useDevDockStore.getState();
    expect(state.regexTestResults.length).toBe(2);
    expect(state.regexTestResults[0].match).toBe('hello');
  });

  it('should format JSON', () => {
    const store = useDevDockStore.getState();
    store.setJsonInput('{"a":1,"b":2}');
    store.formatJson();
    const state = useDevDockStore.getState();
    expect(state.jsonOutput).toContain('"a"');
    expect(state.jsonOutput).toContain('  ');
    expect(state.jsonError).toBeNull();
  });

  it('should detect invalid JSON', () => {
    const store = useDevDockStore.getState();
    store.setJsonInput('{invalid json}');
    store.formatJson();
    expect(useDevDockStore.getState().jsonError).not.toBeNull();
  });

  it('should add and remove env entries', () => {
    const store = useDevDockStore.getState();
    store.addEnvEntry('MY_KEY', 'my_value');
    expect(useDevDockStore.getState().envEntries.length).toBeGreaterThan(0);
    const entry = useDevDockStore.getState().envEntries.find(e => e.key === 'MY_KEY');
    expect(entry).toBeDefined();
    expect(entry?.value).toBe('my_value');

    if (entry) {
      store.removeEnvEntry(entry.id);
      expect(useDevDockStore.getState().envEntries.find(e => e.id === entry.id)).toBeUndefined();
    }
  });
});
