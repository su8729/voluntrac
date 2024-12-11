import { vi, describe, it, beforeEach, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TaskFilter from '../TaskFilter.vue';

describe('TaskFilter.vue', () => {
    let wrapper;

    beforeEach(() => {
        global.navigator.geolocation = {
            getCurrentPosition: vi.fn((success) => {
                success({
                    coords: {
                        latitude: 1.3521,
                        longitude: 103.8198,
                    },
                });
            }),
        };

        wrapper = mount(TaskFilter);
        vi.spyOn(wrapper.vm, '$emit');
    });

    it('Renders the dropdown button and dropdown items', async () => {
        expect(wrapper.find('#dropdown-toggle').exists()).toBe(true);
        expect(wrapper.find('#task-filter').exists()).toBe(false);

        await wrapper.find('#dropdown-toggle').trigger('click');
        expect(wrapper.find('#task-filter').exists()).toBe(true);
    });

    it('Fetches and sets location on button click', async () => {
        await wrapper.find('#dropdown-toggle').trigger('click');
        await wrapper.find('#radius').setValue('10');

        await wrapper.find('#get-location').trigger('click');
        expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    });

    it('Toggles dropdown visibility on click', async () => {
        const dropdownToggle = wrapper.find('#dropdown-toggle');
        await dropdownToggle.trigger('click');
        expect(wrapper.find('#task-filter').isVisible()).toBe(true);

        document.body.click();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('#task-filter').exists()).toBe(false);
    });
});