import { vi, describe, it, beforeEach, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import AdminTaskbar from '../AdminTaskbar.vue';

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
        { path: '/Admin/Dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/Admin/TakeAttendance', component: { template: '<div>Take Attendance</div>' } },
        { path: '/AdminProfileView', component: { template: '<div>Admin Profile</div>' } },
        { path: '/', component: { template: '<div>Logout</div>' } }
    ]
});

describe('AdminTaskbar.vue', () => {
    let mockPush;

    beforeEach(async () => {
        router.push({ path: '/' });
        await router.isReady();

        mockPush = vi.spyOn(router, 'push');
    });

    it('Renders the taskbar properly', () => {
        const wrapper = mount(AdminTaskbar, {
            global: {
                plugins: [router]
            }
        });
        const logo = wrapper.find('img');

        expect(wrapper.html()).toContain('VOLUNTRAC');
        expect(logo.exists()).toBe(true);
        expect(logo.attributes('src')).toBe('/app%20logo.png');

        expect(wrapper.html()).toContain('MANAGE TASKS');
        expect(wrapper.html()).toContain('TAKE ATTENDANCE');
        expect(wrapper.html()).toContain('MY PROFILE ▼');
        expect(wrapper.html()).toContain('LOG OUT');
    });

    it('Logout is called correctly', async () => {
        const wrapper = mount(AdminTaskbar, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.find('#admin-logout').trigger('click');

        const { signOut } = await import('firebase/auth');
        expect(signOut).toHaveBeenCalled();

        await wrapper.vm.$nextTick();

        expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('Redirect links are correctly called', async () => {
        const wrapper = mount(AdminTaskbar, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.find('#admin-manage-task').trigger('click');
        await wrapper.vm.$nextTick();
        expect(mockPush).toHaveBeenCalledWith('/Admin/ManageTasks');

        await wrapper.find('#admin-take-attendance').trigger('click');
        await wrapper.vm.$nextTick();
        expect(mockPush).toHaveBeenCalledWith('/Admin/TakeAttendance');

        await wrapper.find('#admin-profile-link').trigger('click');
        await wrapper.vm.$nextTick();
        expect(mockPush).toHaveBeenCalledWith('/AdminProfileView');
    });
});