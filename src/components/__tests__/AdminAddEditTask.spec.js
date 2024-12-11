import { vi, describe, it, beforeEach, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import AdminAddEditTask from '../AdminAddEditTask.vue';

// mock firebase
vi.mock('firebase/firestore', async () => {
    const original = await vi.importActual('firebase/firestore');
    return {
        ...original,
        getFirestore: vi.fn(() => ({
            collection: vi.fn(() => ({})),
            doc: vi.fn(),
            getDoc: vi.fn(),
            addDoc: vi.fn(),
            setDoc: vi.fn(),
        })),
        Timestamp: {
            fromDate: vi.fn(date => date) 
        }
    };
});

vi.mock('../src/firebase_setup.js', () => ({
    db: vi.fn()
}));

// mock router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/Admin/Dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/Admin/AddEditTask/:taskID?', component: AdminAddEditTask }
    ]
});

describe('AdminAddEditTask.vue', () => {
    beforeEach(async () => {
        router.push({ path: '/Admin/AddEditTask/testTaskID' });
        await router.isReady();
    });

    it('Renders and handles form submission', async () => {
        const wrapper = mount(AdminAddEditTask, {
            global: {
                plugins: [router]
            }
        });

        const taskNameInput = wrapper.find('#taskName');
        const startDateInput = wrapper.find('#startDateTime');
        const endDateInput = wrapper.find('#endDateTime');
        const locationInput = wrapper.find('#autocomplete');
        
        expect(taskNameInput.exists()).toBe(true);
        expect(startDateInput.exists()).toBe(true);
        expect(endDateInput.exists()).toBe(true);
        expect(locationInput.exists()).toBe(true);

        await taskNameInput.setValue('Test Task');
        await startDateInput.setValue('2024-11-08T10:00');
        await endDateInput.setValue('2024-11-08T12:00');
        await locationInput.setValue('Sample Location');

        await wrapper.find('form').trigger('submit.prevent');

        expect(wrapper.find('#taskName').element.value).toBe('Test Task');
    });

    it('Calls addSession method and renders the add session section correctly', async () => {
        const wrapper = mount(AdminAddEditTask, {
            global: {
                plugins: [router]
            }
        });

        const addSessionMock = vi.fn();
        wrapper.vm.addSession = addSessionMock;

        const addSessionButton = wrapper.find('.add-session-btn');
        expect(addSessionButton.text()).toContain('Add Session');

        await addSessionButton.trigger('click');
        const sessionSectionLabels = wrapper.findAll('label');
    
        const hasDateLabel = sessionSectionLabels.some(label => label.text().includes('Date'));
        const hasStartTimeLabel = sessionSectionLabels.some(label => label.text().includes('Start Time'));
        const hasEndTimeLabel = sessionSectionLabels.some(label => label.text().includes('End Time'));

        expect(hasDateLabel).toBe(true);
        expect(hasStartTimeLabel).toBe(true);
        expect(hasEndTimeLabel).toBe(true);
    });
})
