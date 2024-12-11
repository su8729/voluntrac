import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import HomePageUsername from '../HomePageUsername.vue';
import { getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

vi.mock('../firebase_setup', () => ({
    auth: {
        currentUser: { uid: '123' },
    },
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const original = await vi.importActual('firebase/firestore');
    return {
        ...original,
        getDoc: vi.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({ username: 'TestUser' }),
        }),
    };
});

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        onAuthStateChanged: vi.fn().mockImplementation((auth, callback) => callback({ uid: '123' })),
        getAuth: vi.fn(() => ({ currentUser: { uid: '123' } })),
    };
});

describe('HomePageUsername', () => {
    it('Fetches user data and displays the username when user is authenticated', async () => {
        const mockUserData = { uid: '123', data: { username: 'TestUser' } };

        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockUserData.data,
        });

        onAuthStateChanged.mockImplementationOnce((auth, callback) => {
            callback({ uid: '123' });
        });

        const wrapper = mount(HomePageUsername);

        await flushPromises();

        expect(wrapper.text()).toContain(mockUserData.data.username);
        expect(wrapper.vm.username).toBe(mockUserData.data.username);
    });

    it('Displays "Loading..." if no user is authenticated', async () => {
        onAuthStateChanged.mockImplementationOnce((auth, callback) => {
            callback(null);
        });

        const wrapper = mount(HomePageUsername);

        await flushPromises();

        expect(wrapper.text()).toContain('Welcome, Loading...');
    });
});