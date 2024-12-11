import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import SessionSelection from '../SessionSelection.vue';

describe('SessionSelection', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(SessionSelection, {
            props: {
                sessions: [
                    { date: 'January 1, 2023', start_time: '9:00 AM', end_time: '10:00 AM' },
                    { date: 'January 2, 2023', start_time: '2:00 PM', end_time: '3:00 PM' },
                ],
                taskId: 'task-123',
                volunteerId: 'volunteer-456',
            },
        });
    });

    it('Render the session cards', () => {
        expect(wrapper.findAll('.session-card')).toHaveLength(2);
    });

    it('Toggles the selected sessions', async () => {
        const sessionCards = wrapper.findAll('.session-card');
        await sessionCards[0].find('input[type="checkbox"]').trigger('change');
        await flushPromises();
        
        expect(wrapper.vm.selectedSessions).toEqual([0]);

        await sessionCards[1].find('input[type="checkbox"]').trigger('change');
        await flushPromises();

        expect(wrapper.vm.selectedSessions).toEqual([0, 1]);

        await sessionCards[0].find('input[type="checkbox"]').trigger('change');
        await flushPromises();
        
        expect(wrapper.vm.selectedSessions).toEqual([1]);
    });

    it('Handle form submission', async () => {
        const sessionCards = wrapper.findAll('.session-card');
        await sessionCards[0].find('input[type="checkbox"]').trigger('change');
        await sessionCards[1].find('input[type="checkbox"]').trigger('change');

        await wrapper.find('.session-confirm').trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Confirming');
    });

    it('Fetch existing assignments', async () => {
        vi.spyOn(wrapper.vm, 'fetchExistingAssignments').mockImplementation(async () => {
            wrapper.vm.confirmedSessions = [0];
            wrapper.vm.hasExistingAssignments = true;
        });

        await wrapper.vm.fetchExistingAssignments();
        expect(wrapper.vm.confirmedSessions).toEqual([0]);
        expect(wrapper.vm.hasExistingAssignments).toBe(true);
    });
});