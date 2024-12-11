import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import SessionCards from '../SessionCards.vue';

describe('SessionCards.vue', () => {
    it('Renders session date and time correctly', () => {
        const session = {
            date: '2024-11-09',
            start_time: '10:00 AM',
            end_time: '12:00 PM'
        };

        const wrapper = mount(SessionCards, {
        props: {
            session
        }
        });

        expect(wrapper.find('.session-date').text()).toBe('2024-11-09');

        const timeElements = wrapper.findAll('.session-time span');
        expect(timeElements[0].text()).toBe('10:00 AM');
        expect(timeElements[1].text()).toBe('to');
        expect(timeElements[2].text()).toBe('12:00 PM');
    });
});
