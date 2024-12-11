import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import LastLoginDate from '../LastLoginDate.vue';
import { onAuthStateChanged } from 'firebase/auth';

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        onAuthStateChanged: vi.fn(),
    };
});

describe('LastLoginDate.vue', () => {
    it('Displays the last login date when the user is authenticated', async () => {
        const mockLastLoginDateTime = new Date('2024-12-31T12:00:00Z');
        const mockUser = {
            metadata: {
                lastSignInTime: mockLastLoginDateTime,
            },
        };

        onAuthStateChanged.mockImplementationOnce((auth, callback) => {
            callback(mockUser);
        });

        const wrapper = mount(LastLoginDate);

        await flushPromises();

        const formattedDate = mockLastLoginDateTime.toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        expect(wrapper.text()).toContain(`Last login: ${formattedDate}`);
    });

    it('Displays "No login record" if no user is authenticated', async () => {
        onAuthStateChanged.mockImplementationOnce((auth, callback) => {
            callback(null);
        });

        const wrapper = mount(LastLoginDate);

        await flushPromises();

        expect(wrapper.text()).toContain('Last login: No login record');
    });
});