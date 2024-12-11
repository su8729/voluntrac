import { vi, describe, it, beforeEach, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import VolunteerTaskbar from '../VolunteerTaskbar.vue';

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getAuth: vi.fn(() => ({ currentUser: { uid: '123' } })),
        signOut: vi.fn(() => Promise.resolve())
    };
});

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/ViewTasks', component: { template: '<div>View Tasks</div>' } },
        { path: '/SearchTasks', component: { template: '<div>Search Tasks</div>' } },
        { path: '/Profile', component: { template: '<div>Profile</div>' } },
    ]
});

describe('VolunteerTaskbar.vue', () => {
    let mockPush;

    beforeEach(async () => {
        router.push({ path: '/' });
        await router.isReady();

        mockPush = vi.spyOn(router, 'push');
    });

    it('Renders the VolunteerTaskbar properly', () => {
        const wrapper = mount(VolunteerTaskbar, {
            global: {
                plugins: [router]
            }
        });
        const logo = wrapper.find('img');

        expect(wrapper.html()).toContain('VOLUNTRAC');
        expect(logo.exists()).toBe(true);
        expect(logo.attributes('src')).toBe('/app%20logo.png');

        expect(wrapper.html()).toContain('VIEW MY TASKS');
        expect(wrapper.html()).toContain('SEARCH OPPORTUNITIES');
        expect(wrapper.html()).toContain('MY PROFILE ▼');
        expect(wrapper.html()).toContain('LOG OUT');
    });

    it('Logout is called correctly', async () => {
        const wrapper = mount(VolunteerTaskbar, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.find('a[href="/"]').trigger('click.prevent');

        const { signOut } = await import('firebase/auth');
        expect(signOut).toHaveBeenCalled();

        await wrapper.vm.$nextTick();

        expect(mockPush).toHaveBeenCalledWith({ path: '/' });
    });

    it('Redirect links are correctly called', async () => {
        const wrapper = mount(VolunteerTaskbar, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.find('a[href="/ViewTasks"]').trigger('click');
        await wrapper.vm.$nextTick();
        expect(mockPush).toHaveBeenCalledWith('/ViewTasks');

        await wrapper.find('a[href="/SearchTasks"]').trigger('click');
        await wrapper.vm.$nextTick();
        expect(mockPush).toHaveBeenCalledWith('/SearchTasks');

        await wrapper.find('a[href="/Profile"]').trigger('click');
        await wrapper.vm.$nextTick();
        expect(mockPush).toHaveBeenCalledWith('/Profile');
    });
});
